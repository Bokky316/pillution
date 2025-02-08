package com.javalab.student.dto;

import com.javalab.student.entity.ChatMessage;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 채팅 메시지 DTO
 * 클라이언트와 서버 간 채팅 메시지 데이터를 전송하는 데 사용됩니다.
 */
@Getter
@Setter
public class ChatMessageDto {
    private Long id;
    private Long roomId;
    private Long senderId;
    private String senderName;
    private String content;
    private LocalDateTime timestamp;
    private boolean read;

    public ChatMessageDto() {}

    /**
     * ChatMessage 엔티티로부터 DTO를 생성합니다.
     * @param chatMessage ChatMessage 엔티티
     */
    public ChatMessageDto(ChatMessage chatMessage) {
        this.id = chatMessage.getId();
        this.roomId = chatMessage.getChatRoom().getId();
        this.senderId = chatMessage.getSender().getId();
        this.senderName = chatMessage.getSender().getName();
        this.content = chatMessage.getContent();
        this.timestamp = chatMessage.getRegTime();
        this.read = chatMessage.isRead();
    }
}
