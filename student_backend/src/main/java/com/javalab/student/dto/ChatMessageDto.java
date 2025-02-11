package com.javalab.student.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * ✅ 상담 채팅 메시지 Dto
 * - 상담 채팅 메시지 데이터를 전송하기 위한 Dto 클래스
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
    private Long id;           // 메시지 ID
    private String content;    // 메시지 내용
    private Long chatRoomId;   // 채팅방 ID
    private Long senderId;     // 발신자 ID
    private LocalDateTime sentAt; // 메시지 전송 시간
    private boolean isSystemMessage; // 시스템 메시지 여부 (안내 메시지 등)
    private boolean isRead;         // 읽음 여부 추가 (기본값: false)
}
