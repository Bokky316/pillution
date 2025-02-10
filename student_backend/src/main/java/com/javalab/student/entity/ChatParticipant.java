package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * ✅ 상담 채팅방 참가자 엔티티
 * - 고객과 상담사가 상담 채팅방에 참여하는 정보를 저장
 * - 1:1 채팅에서 고객과 상담사를 각각 하나씩 매핑
 * - 향후 그룹 채팅으로 확장 가능
 */
@Entity
@Table(name = "chat_participant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatParticipant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 참가자가 속한 상담 채팅방 정보 (다대일 관계)
     * - 하나의 채팅방에 여러 참가자가 있을 수 있음.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    /**
     * 참가자 정보 (고객 또는 상담사)
     * - 하나의 사용자가 여러 채팅방에 참여할 수 있음.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    /**
     * 참가한 시간 정보
     * - 사용자가 해당 채팅방에 언제 입장했는지 기록.
     */
    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    /**
     * 🔹 채팅방 나가기 여부
     * - true: 채팅방을 나간 상태, false: 채팅방에 참여 중인 상태
     */
    @Column(name = "is_left", nullable = false)
    private boolean isLeft = false;

    public ChatParticipant(ChatRoom chatRoom, Member member) {
        super();
        this.chatRoom = chatRoom;
        this.member = member;
        this.joinedAt = LocalDateTime.now();
    }

    /**
     * 🔹 채팅방 나가기 메서드
     * - 참가자가 채팅방을 나갈 때 호출
     */
    public void leaveRoom() {
        this.isLeft = true;
    }
}
