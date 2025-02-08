package com.javalab.student.controller;

import com.javalab.student.dto.ChatMessageDto;
import com.javalab.student.dto.ChatRoomDto;
import com.javalab.student.security.dto.MemberSecurityDto;
import com.javalab.student.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
     * @param memberSecurityDto 현재 인증된 사용자 정보
     * @return 사용자가 참여중인 채팅방 목록
     */
    @GetMapping("/rooms/user")
    public ResponseEntity<List<ChatRoomDto>> getUserChatRooms(@AuthenticationPrincipal MemberSecurityDto memberSecurityDto) {
        Long userId = memberSecurityDto.getId();
        log.info("✅ 사용자의 채팅방 목록 조회 요청: userId={}", userId);
        try {
            List<ChatRoomDto> chatRooms = chatService.getUserChatRooms(userId);
            return ResponseEntity.ok(chatRooms);
        } catch (Exception e) {
            log.error("❌ 사용자의 채팅방 목록을 가져오는 중 오류 발생. 사용자 ID: " + userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
     * @param memberSecurityDto 현재 인증된 사용자 정보
     * @return 처리 결과
     */
    @PostMapping("/rooms/{roomId}/participants")
    public ResponseEntity<Void> addParticipantToChatRoom(@PathVariable("roomId") Long roomId, @AuthenticationPrincipal MemberSecurityDto memberSecurityDto) {
        Long userId = memberSecurityDto.getId();
        log.info("✅ 채팅방 참가자 추가 요청: roomId={}, userId={}", roomId, userId);
        chatService.addParticipantToChatRoom(roomId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 채팅방의 읽지 않은 메시지 수를 조회합니다.
     * @param roomId 채팅방 ID
     * @param memberSecurityDto 현재 인증된 사용자 정보
     * @return 읽지 않은 메시지 수
     */
    @GetMapping("/rooms/{roomId}/unread")
    public ResponseEntity<Integer> getUnreadMessageCount(@PathVariable("roomId") Long roomId, @AuthenticationPrincipal MemberSecurityDto memberSecurityDto) {
        Long userId = memberSecurityDto.getId();
        log.info("✅ 읽지 않은 메시지 수 조회 요청: roomId={}, userId={}", roomId, userId);
        return ResponseEntity.ok(chatService.getUnreadMessageCount(roomId, userId));
    }

    /**
     * 채팅 메시지를 읽음 처리합니다.
     * @param messageId 메시지 ID
     * @param memberSecurityDto 현재 인증된 사용자 정보
     * @return 처리 결과
     */
    @PostMapping("/messages/{messageId}/read")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable("messageId") Long messageId, @AuthenticationPrincipal MemberSecurityDto memberSecurityDto) {
        Long userId = memberSecurityDto.getId();
        log.info("✅ 메시지 읽음 처리 요청: messageId={}, userId={}", messageId, userId);
        chatService.markMessageAsRead(messageId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 사용자가 채팅방을 나갑니다.
     * @param roomId 채팅방 ID
     * @param memberSecurityDto 현재 인증된 사용자 정보
     * @return 처리 결과
     */
    @PostMapping("/rooms/{roomId}/leave")
    public ResponseEntity<Void> leaveChatRoom(@PathVariable("roomId") Long roomId, @AuthenticationPrincipal MemberSecurityDto memberSecurityDto) {
        Long userId = memberSecurityDto.getId();
        log.info("✅ 채팅방 나가기 요청: roomId={}, userId={}", roomId, userId);
        try {
            chatService.leaveChatRoom(roomId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ 채팅방 나가기 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 사용자의 입력 상태를 설정합니다.
     * @param roomId 채팅방 ID
     * @param memberSecurityDto 현재 인증된 사용자 정보
     * @param isTyping 입력 중 여부
     * @return 처리 결과
     */
    @PostMapping("/rooms/{roomId}/typing")
    public ResponseEntity<Void> setUserTypingStatus(
            @PathVariable("roomId") Long roomId,
            @AuthenticationPrincipal MemberSecurityDto memberSecurityDto,
            @RequestParam("isTyping") boolean isTyping) {
        Long userId = memberSecurityDto.getId();
        log.info("✅ 사용자 입력 상태 설정 요청: roomId={}, userId={}, isTyping={}", roomId, userId, isTyping);
        chatService.setUserTypingStatus(roomId, userId, isTyping);
        return ResponseEntity.ok().build();
    }

    /**
     * WebSocket을 통해 사용자의 타이핑 상태를 전송합니다.
     * @param message 타이핑 상태 메시지
     * @return 전송된 타이핑 상태 메시지
     */
    @MessageMapping("/chat.typing")
    @SendTo("/topic/chat.typing")
    public ChatMessageDto typing(@Payload ChatMessageDto message) {
        log.info("✅ 타이핑 메시지 : " + message);
        return message;
    }

    /**
     * WebSocket을 통해 메시지 읽음 상태를 업데이트합니다.
     * @param message 읽음 상태 메시지
     * @return 업데이트된 읽음 상태 메시지
     */
    @MessageMapping("/chat.read")
    @SendTo("/topic/chat.read")
    public ChatMessageDto read(@Payload ChatMessageDto message) {
        log.info("✅ 읽음 메시지 : " + message);
        chatService.updateMessageReadStatus(message.getId(), message.getSenderId());
        return message;
    }
}
