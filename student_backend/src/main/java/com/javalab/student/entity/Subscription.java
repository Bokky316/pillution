package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    private LocalDate startDate;  // 구독 시작일
    private LocalDate endDate;  // 구독 종료일 (해지 시 설정)
    private LocalDate nextBillingDate; // 다음 결제일
    private String status; // active, paused, cancelled
    private String paymentMethod; // 네이버페이, 계좌입금, 카드결제
    private String deliveryAddress; // 배송지

    @OneToMany(mappedBy = "subscription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubscriptionItem> items;
}