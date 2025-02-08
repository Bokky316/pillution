package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.*;

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
    @JoinColumn(name = "sender_id", nullable = false)
    private Member sender;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private boolean read;

    /**
     * 메시지를 읽음 처리합니다.
     * @param userId 메시지를 읽은 사용자의 ID
     */
    public void markAsRead(Long userId) {
        if (this.sender.getId().equals(userId)) {
            this.read = true;
        }
    }
}
