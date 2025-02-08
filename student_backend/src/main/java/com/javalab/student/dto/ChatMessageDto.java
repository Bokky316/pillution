package com.javalab.student.dto;

import com.javalab.student.entity.ChatMessage;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 채팅 메시지 DTO (Data Transfer Object)
 * 클라이언트와 서버 간 채팅 메시지 데이터를 전송하는 데 사용됩니다.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessageDto {
    private Long id;
    private Long roomId;
    private Long senderId;
    private String senderName; // 추가된 필드
    private String content;
    private LocalDateTime timestamp;
    private boolean isRead;

    public static ChatMessageDto fromEntity(ChatMessage chatMessage) {
        return ChatMessageDto.builder()
                .id(chatMessage.getId())
                .roomId(chatMessage.getRoomId())
                .senderId(chatMessage.getSenderId())
                .senderName(chatMessage.getSenderName()) // 추가된 필드 매핑
                .content(chatMessage.getContent())
                .timestamp(chatMessage.getTimestamp())
                .isRead(chatMessage.isRead())
                .build();
    }
}
