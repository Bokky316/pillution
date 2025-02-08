package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * 채팅방 엔티티
 * 여러 참가자들이 메시지를 주고받는 채팅방을 나타냅니다.
 */
@Entity
@Getter @Setter
@Table(name = "chat_room")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToMany
    @JoinTable(
            name = "chat_room_member",
            joinColumns = @JoinColumn(name = "room_id"),
            inverseJoinColumns = @JoinColumn(name = "member_id")
    )
    private List<Member> participants = new ArrayList<>();

    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();

    /**
     * 채팅방에 참가자를 추가합니다.
     * @param participant 추가할 참가자
     */
    public void addParticipant(Member participant) {
        if (!this.participants.contains(participant)) {
            this.participants.add(participant);
        }
    }
}
