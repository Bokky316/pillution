package com.javalab.student.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

/**
 * Subscription (구독) 엔티티
 * - 사용자의 정기구독 정보를 저장하는 테이블
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "nextItems", "items"}) // 프록시 직렬화 방지
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    @JsonIgnoreProperties("subscriptions")
    private Member member;

    private LocalDate startDate;  // 구독 시작일
    private LocalDate endDate;  // 구독 종료일 (해지 시 설정)
    private LocalDate lastBillingDate; // 최근 결제일
    private LocalDate nextBillingDate; // 다음 결제일
    private String status; // active, paused, cancelled
    private String paymentMethod; // 현재 회차 결제수단
    //private String deliveryAddress;
    private int currentCycle; // 현재 회차

    private String nextPaymentMethod;     // 다음 회차 결제수단 저장

    // 기존 deliveryAddress → roadAddress로 변경
    private String roadAddress;  // 도로명 주소
    private String postalCode;   // 우편번호
    private String detailAddress; // 상세주소 (사용자가 입력)

    @OneToMany(mappedBy = "subscription", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("subscription")
    private List<SubscriptionItem> items;

    @OneToMany(mappedBy = "subscription", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("subscription")
    private List<SubscriptionNextItem> nextItems; // 다음 회차 결제 예정 상품
}
