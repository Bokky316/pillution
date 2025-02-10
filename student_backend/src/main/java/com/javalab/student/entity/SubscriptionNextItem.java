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

    // ✅ productId를 직접 저장하여 JPA가 가져오도록 수정
    @Column(name = "product_id", insertable = false, updatable = false)
    private Long productId;

    private int nextMonthQuantity; // 다음 회차 반영할 수량
    private double nextMonthPrice; // 다음 회차 반영할 가격



    /** ✅ @Transient 추가 -> DB에는 저장되지 않지만, DTO 변환 시 사용 */

    public Long getProductId() {
        return (product != null) ? product.getId() : null;
    }
}
