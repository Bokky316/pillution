package com.javalab.student.entity;

import com.javalab.student.dto.ChatMessageDto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 채팅 메시지 엔티티
 * 채팅방에서 주고받는 메시지를 나타냅니다.
 */
@Entity
@Table(name = "chat_messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long roomId;
    private Long senderId;
    private String senderName;
    private String content;
    private LocalDateTime timestamp;
    private boolean isRead;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
        isRead = false;
    }

    /**
     * DTO로부터 엔티티를 생성합니다.
     *
     * @param dto 변환할 ChatMessageDto 객체
     * @return 생성된 ChatMessage 엔티티
     */
    public static ChatMessage fromDto(ChatMessageDto dto) {
        return ChatMessage.builder()
                .id(dto.getId())
                .roomId(dto.getRoomId())
                .senderId(dto.getSenderId())
                .senderName(dto.getSenderName())
                .content(dto.getContent())
                .timestamp(dto.getTimestamp())
                .isRead(dto.isRead())
                .build();
    }

    /**
     * DTO의 정보로 엔티티를 업데이트합니다.
     *
     * @param dto 업데이트할 정보가 담긴 ChatMessageDto 객체
     */
    public void updateFromDto(ChatMessageDto dto) {
        this.content = dto.getContent();
        this.isRead = dto.isRead();
        // 필요에 따라 다른 필드들도 업데이트
    }
}
