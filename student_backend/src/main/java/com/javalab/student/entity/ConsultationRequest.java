package com.javalab.student.entity;

import com.javalab.student.constant.ConsultationRequestStatus;
import com.javalab.student.constant.ConsultationTopic;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ✅ 상담 요청 엔티티
 * - 고객이 상담을 요청하면 생성되는 엔티티
 * - 상담사가 요청을 수락하기 전까지는 상담이 시작되지 않음
 * - 상담사가 요청을 수락하면 상담 채팅방이 생성됨
 * - 상담 주제, 주문 관련 여부, 사전 메시지 등을 저장
 */
@Entity
@Table(name = "consultation_request")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 상담 요청자 (고객)
     * - 상담 요청을 생성한 사용자 정보
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Member customer;

    /**
     * 상담 대상자 (상담사)
     * - 상담 요청을 수락한 상담사 정보
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cs_agent_id")
    private Member csAgent;

    /**
     * 상담사 배정 시간
     * - 상담사가 배정된 시간을 기록 (nullable: 초기 상태에서는 null)
     */
    private LocalDateTime csAgentAssignedAt;

    /**
     * 상담 주제 (ENUM)
     * - 고객이 선택한 상담 주제 (예: 주문 문제, 환불 요청 등)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConsultationTopic topic;

    /**
     * 주문 ID (선택 사항)
     * - 주문 관련 문의일 경우, 고객이 선택한 주문 ID를 저장
     */
    private Long orderId;

    /**
     * 사전 메시지
     * - 고객이 상담사 연결 전에 작성한 메시지
     */
    @Column(length = 500)
    private String preMessage;

    /**
     * 상담 요청 상태 
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConsultationRequestStatus status;
}
