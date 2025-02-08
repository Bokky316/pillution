package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * 채팅 메시지 엔티티
 * 채팅방에서 주고받는 메시지를 나타냅니다.
 */
@Entity
@Getter @Setter
@Table(name = "chat_message")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private Member sender;

    @Column(nullable = false)
    private String content;

    @ElementCollection
    @CollectionTable(name = "message_read_status", joinColumns = @JoinColumn(name = "message_id"))
    @Column(name = "user_id")
    private List<Long> readByUserIds = new ArrayList<>();

    @Column(nullable = false)
    private boolean isSystemMessage;

    /**
     * 메시지를 읽음 처리합니다.
     * @param userId 메시지를 읽은 사용자의 ID
     */
    public void markAsRead(Long userId) {
        if (!readByUserIds.contains(userId)) {
            readByUserIds.add(userId);
        }
    }

    /**
     * 특정 사용자가 메시지를 읽었는지 확인합니다.
     * @param userId 확인할 사용자의 ID
     * @return 해당 사용자가 메시지를 읽었으면 true, 아니면 false
     */
    public boolean isReadBy(Long userId) {
        return readByUserIds.contains(userId);
    }

    /**
     * 시스템 메시지를 생성합니다.
     * @param chatRoom 채팅방
     * @param content 메시지 내용
     * @return 생성된 시스템 메시지
     */
    public static ChatMessage createSystemMessage(ChatRoom chatRoom, String content) {
        ChatMessage message = new ChatMessage();
        message.setChatRoom(chatRoom);
        message.setContent(content);
        message.setSystemMessage(true); // 시스템 메시지 여부 설정
        return message;
    }
}
