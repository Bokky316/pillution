package com.javalab.student.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

/**
 * SubscriptionNextItem (다음 회차 예정 상품) 엔티티
 * - 사용자가 다음 회차 결제 시 추가/수정한 상품을 저장
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"subscription"}) // 순환 참조 방지
public class SubscriptionNextItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    @JsonIgnoreProperties({"nextItems"})
    private Subscription subscription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"subscriptionNextItems"})
    private Product product;

    private int nextMonthQuantity; // 다음 회차 반영할 수량
    private double nextMonthPrice; // 다음 회차 반영할 가격
}
