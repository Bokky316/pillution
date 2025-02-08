package com.javalab.student.controller;

import com.javalab.student.dto.ChatMessageDto;
import com.javalab.student.dto.ChatRoomDto;
import com.javalab.student.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 채팅 관련 API 요청을 처리하는 컨트롤러
 * - 채팅방 생성, 조회, 참가자 추가
 * - 채팅 메시지 전송, 조회, 읽음 처리
 * - WebSocket을 통한 실시간 메시지 전송
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 새로운 채팅방을 생성합니다.
     * @param chatRoomDto 생성할 채팅방 정보
     * @return 생성된 채팅방 정보
     */
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoomDto> createChatRoom(@RequestBody ChatRoomDto chatRoomDto) {
        log.info("✅ 채팅방 생성 요청: name={}, participantIds={}", chatRoomDto.getName(), chatRoomDto.getParticipantIds());
        return ResponseEntity.ok(chatService.createChatRoom(chatRoomDto.getName(), chatRoomDto.getParticipantIds()));
    }

    /**
     * 모든 채팅방 목록을 조회합니다.
     * @return 채팅방 목록
     */
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomDto>> getAllChatRooms() {
        log.info("✅ 전체 채팅방 목록 조회 요청");
        return ResponseEntity.ok(chatService.getAllChatRooms());
    }

    /**
     * 특정 사용자의 채팅방 목록을 조회합니다.
     * @param userId 사용자 ID
     * @return 사용자가 참여중인 채팅방 목록
     */
    @GetMapping("/rooms/user/{userId}")
    public ResponseEntity<List<ChatRoomDto>> getUserChatRooms(@PathVariable("userId") Long userId) {
        log.info("✅ 사용자의 채팅방 목록 조회 요청: userId={}", userId);
        try {
            List<ChatRoomDto> chatRooms = chatService.getUserChatRooms(userId);
            return ResponseEntity.ok(chatRooms);
        } catch (Exception e) {
            log.error("❌ 사용자의 채팅방 목록을 가져오는 중 오류 발생. 사용자 ID: " + userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 채팅방의 메시지 목록을 조회합니다.
     * @param roomId 채팅방 ID
     * @return 채팅 메시지 목록
     */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getChatMessages(@PathVariable("roomId") Long roomId) {
        log.info("✅ 채팅방 메시지 목록 조회 요청: roomId={}", roomId);
        return ResponseEntity.ok(chatService.getChatMessages(roomId));
    }

    /**
     * WebSocket을 통해 채팅 메시지를 전송합니다.
     * @param chatMessageDto 전송할 메시지 정보
     * @return 저장 및 전송된 메시지
     */
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/chat")
    public ChatMessageDto sendMessage(@Payload ChatMessageDto chatMessageDto) {
        log.info("✅ 채팅 메시지 전송 요청: roomId={}, senderId={}, content={}",
                chatMessageDto.getRoomId(), chatMessageDto.getSenderId(), chatMessageDto.getContent());
        return chatService.sendMessage(chatMessageDto.getRoomId(), chatMessageDto.getSenderId(), chatMessageDto.getContent());
    }

    /**
     * 채팅방에 새로운 참가자를 추가합니다.
     * @param roomId 채팅방 ID
     * @param userId 추가할 사용자 ID
     * @return 처리 결과
     */
    @PostMapping("/rooms/{roomId}/participants")
    public ResponseEntity<Void> addParticipantToChatRoom(@PathVariable("roomId") Long roomId, @RequestParam("userId") Long userId) {
        log.info("✅ 채팅방 참가자 추가 요청: roomId={}, userId={}", roomId, userId);
        chatService.addParticipantToChatRoom(roomId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 채팅방의 읽지 않은 메시지 수를 조회합니다.
     * @param roomId 채팅방 ID
     * @param userId 사용자 ID
     * @return 읽지 않은 메시지 수
     */
    @GetMapping("/rooms/{roomId}/unread")
    public ResponseEntity<Integer> getUnreadMessageCount(@PathVariable("roomId") Long roomId, @RequestParam("userId") Long userId) {
        log.info("✅ 읽지 않은 메시지 수 조회 요청: roomId={}, userId={}", roomId, userId);
        return ResponseEntity.ok(chatService.getUnreadMessageCount(roomId, userId));
    }

    /**
     * 채팅 메시지를 읽음 처리합니다.
     * @param messageId 메시지 ID
     * @param userId 사용자 ID
     * @return 처리 결과
     */
    @PostMapping("/messages/{messageId}/read")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable("messageId") Long messageId, @RequestParam("userId") Long userId) {
        log.info("✅ 메시지 읽음 처리 요청: messageId={}, userId={}", messageId, userId);
        chatService.markMessageAsRead(messageId, userId);
        return ResponseEntity.ok().build();
    }
}
