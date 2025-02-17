package com.javalab.student.controller.message;

import com.javalab.student.dto.MessageRequestDto;
import com.javalab.student.dto.MessageResponseDto;
import com.javalab.student.entity.message.Message;
import com.javalab.student.service.webSoket.MessagePublisherService;
import com.javalab.student.service.webSoket.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 메시지 관련 API 요청을 처리하는 컨트롤러 (메시지 CRUD)
 * - 사용자가 보낸 메시지 조회
 * - 사용자가 받은 메시지 조회
 * - 사용자의 읽지 않은 메시지 개수 조회
 * - 메시지를 읽음 처리
 * - 메시지 전송 (DB 저장 + Redis Pub/Sub 발행)
 */
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;
    private final MessagePublisherService messagePublisherService;

    /**
     * ✅ 사용자가 보낸 메시지 조회
     */
    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<Message>> getSentMessages(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(messageService.getSentMessages(userId));
    }

    /**
     * ✅ 사용자가 받은 메시지 조회
     */
    @GetMapping("/received/{userId}")
    public ResponseEntity<List<Message>> getReceivedMessages(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(messageService.getReceivedMessages(userId));
    }

    /**
     * ✅ 사용자의 읽지 않은 메시지 개수 조회
     */
    @GetMapping("/unread/{userId}")
    public ResponseEntity<Integer> getUnreadMessageCount(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(messageService.getUnreadMessageCount(userId));
    }

    /**
     * ✅ 메시지를 읽음 처리
     */
    @PostMapping("/read/{messageId}")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable("messageId") Long messageId) {
        messageService.markMessageAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    /**
     * ✅ 메시지 전송 (DB 저장 + Redis Pub/Sub 발행)
     */
    @PostMapping("/send")
    public ResponseEntity<Void> sendMessage(@RequestBody MessageRequestDto requestDto) {
        try {
            // ✅ 1. 메시지를 DB에 저장
            messageService.saveMessage(requestDto);

            // ✅ 2. 메시지를 Redis Pub/Sub으로 발행
            messagePublisherService.publishMessage(requestDto);

            log.info("✅ 메시지 전송 요청 완료: senderId={}, receiverId={}, content={}",
                    requestDto.getSenderId(), requestDto.getReceiverId(), requestDto.getContent());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ 메시지 전송 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * ✅ 사용자가 받은 모든 메시지 조회 (MessageResponseDto 반환)
     */
    @GetMapping("/{userId}")
    public ResponseEntity<List<MessageResponseDto>> getMessages(@PathVariable("userId") Long userId) {
        List<MessageResponseDto> messages = messageService.getMessagesByUserId(userId);
        return ResponseEntity.ok(messages);
    }


}
