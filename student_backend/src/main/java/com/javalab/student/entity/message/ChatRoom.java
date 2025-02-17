package com.javalab.student.entity.message;

import com.javalab.student.constant.ConsultationRequestStatus;
import com.javalab.student.entity.BaseEntity;
import com.javalab.student.entity.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * ✅ 채팅방 엔티티
 * - 고객과 상담사 간의 1:1 채팅방 정보를 저장하는 엔티티
 */
@Entity
@Table(name = "chat_room")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 채팅방 이름 (예: 고객 이름 + 상담사 이름 조합으로 생성 가능)
     */
    @Column(nullable = false)
    private String name;

    /**
     * 채팅 메시지 리스트 (1:N 관계)
     * - orphanRemoval = false: 채팅방 삭제 시 메시지는 보존됨
     */
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<ChatMessage> messages = new ArrayList<>();

    /**
     * 채팅방 참여자 리스트 (1:N 관계, 고객과 상담사를 포함)
     */
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ChatParticipant> participants = new ArrayList<>();

    /**
     * 채팅방 생성자 (고객 또는 시스템에 의해 생성됨)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Member owner;

    /**
     * 상담 상태 (PENDING, IN_PROGRESS, CLOSED)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConsultationRequestStatus status;

    /**
     * 🔹 새로운 생성자 추가
     * - 채팅방 이름과 생성자를 초기화하는 생성자
     *
     * @param name  채팅방 이름
     * @param owner 채팅방 생성자 (Member 객체)
     */
    public ChatRoom(String name, Member owner) {
        super();
        this.name = name;
        this.owner = owner;
        this.status = ConsultationRequestStatus.PENDING; // 기본 상태는 PENDING
    }

    /**
     * 🔹 참여자를 추가하는 메서드
     *
     * @param participant 참여자 정보
     */
    public void addParticipant(ChatParticipant participant) {
        participants.add(participant);
        participant.setChatRoom(this);
    }

    /**
     * 🔹 새로운 참여자를 추가하는 메서드 (Member를 직접 추가 가능하게 확장)
     *
     * @param member 참여할 사용자 (고객 또는 상담사)
     */
    public void addParticipant(Member member) {
        ChatParticipant participant = new ChatParticipant(this, member);
        participants.add(participant);
        participant.setChatRoom(this);
    }

    /**
     * 🔹 상담 상태 변경 메서드
     *
     * @param newStatus 새로운 상담 상태
     */
    public void updateStatus(ConsultationRequestStatus newStatus) {
        this.status = newStatus;
    }
}
