package com.javalab.student.dto;

import com.javalab.student.entity.ChatMessage;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 채팅 메시지 DTO (Data Transfer Object)
 * 클라이언트와 서버 간 채팅 메시지 데이터를 전송하는 데 사용됩니다.
 */
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDto {
    private Long id;                    // 메시지 ID
    private Long roomId;                // 채팅방 ID
    private Long senderId;              // 발신자 ID
    private String senderName;          // 발신자 이름
    private String content;             // 메시지 내용
    private LocalDateTime timestamp;    // 메시지 전송 시간
    private List<Long> readByUserIds;   // 메시지를 읽은 사용자 ID 목록
    private boolean isSystemMessage;    // 시스템 메시지 여부
    private boolean isTyping;           // 타이핑 중 여부
    private Long typingUserId;          // 타이핑 중인 사용자 ID

    /**
     * ChatMessage 엔티티로부터 DTO를 생성합니다.
     * @param chatMessage ChatMessage 엔티티
     */
    public ChatMessageDto(ChatMessage chatMessage) {
        this.id = chatMessage.getId();
        this.roomId = chatMessage.getChatRoom().getId();
        this.senderId = chatMessage.getSender() != null ? chatMessage.getSender().getId() : null;
        this.senderName = chatMessage.getSender() != null ? chatMessage.getSender().getName() : "System";
        this.content = chatMessage.getContent();
        this.timestamp = chatMessage.getRegTime();
        this.readByUserIds = chatMessage.getReadByUserIds();
        this.isSystemMessage = chatMessage.isSystemMessage();
    }
}
