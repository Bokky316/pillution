package com.javalab.student.controller;

import com.javalab.student.dto.ChatMessageDto;
import com.javalab.student.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * 상담 채팅 관련 컨트롤러
 * - 메시지 전송, 읽음 처리, 읽지 않은 메시지 개수 조회 등을 처리합니다.
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatMessageService chatMessageService;

    /**
     * 🔹 특정 상담 채팅방으로 메시지를 전송하는 API
     */
    @MessageMapping("/chat/send")
    public void sendMessage(@RequestBody ChatMessageDto messageDto) {
        log.info("💬 메시지 수신 - 채팅방 ID: {}, 보낸이: {}, 내용: {}", messageDto.getChatRoomId(), messageDto.getSenderId(), messageDto.getContent());
        chatMessageService.saveAndSendMessage(messageDto);
    }

    /**
     * 🔹 특정 상담 채팅방의 모든 메시지를 읽음 처리하는 API
     *
     * @param roomId   채팅방 ID
     * @param principal 현재 로그인한 사용자 정보 (Spring Security 사용)
     */
    @PostMapping("/messages/{roomId}/read")
    public ResponseEntity<?> markMessagesAsRead(@PathVariable Long roomId, Principal principal) {
        Long memberId = Long.valueOf(principal.getName()); // 현재 로그인한 사용자 ID 가져오기
        chatMessageService.markMessagesAsRead(roomId, memberId);
        return ResponseEntity.ok("모든 메시지가 읽음 처리되었습니다.");
    }

    /**
     * 🔹 특정 상담 채팅방에서 읽지 않은 메시지 개수를 반환하는 API
     *
     * @param roomId   채팅방 ID
     * @param principal 현재 로그인한 사용자 정보 (Spring Security 사용)
     */
    @GetMapping("/messages/{roomId}/unread-count")
    public ResponseEntity<Long> countUnreadMessages(@PathVariable Long roomId, Principal principal) {
        Long memberId = Long.valueOf(principal.getName()); // 현재 로그인한 사용자 ID 가져오기
        long unreadCount = chatMessageService.countUnreadMessages(roomId, memberId);
        return ResponseEntity.ok(unreadCount);
    }

    /**
     * 🔹 특정 상담 채팅방의 이전 메시지를 조회하는 API
     *
     * @param roomId 채팅방 ID
     * @return 해당 채팅방의 모든 메시지 목록
     */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getPreviousMessages(@PathVariable("roomId") Long roomId) {
        List<ChatMessageDto> messages = chatMessageService.getPreviousMessages(roomId);
        return ResponseEntity.ok(messages);
    }

}
