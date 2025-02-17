package com.javalab.student.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.javalab.student.entity.product.Product;
import jakarta.persistence.*;
import lombok.*;

/**
 * SubscriptionItem (구독 상품) 엔티티
 * - 현재 구독에 포함된 상품 목록 저장
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"subscription"}) // 순환참조 방지
public class SubscriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    @JsonIgnoreProperties({"items"})
    private Subscription subscription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"subscriptionItems"})
    private Product product;

    @Column(name = "product_id", insertable = false, updatable = false)
    private Long productId;

    private int quantity;
    private double price;

    /**
     * ✅ 상품 대표 이미지 URL 반환 (없으면 기본 이미지)
     */
    public String getImageUrl() {
        if (this.product == null) {
            return "https://via.placeholder.com/100"; // 기본 이미지 URL
        }
        return this.product.getMainImageUrl() != null ? this.product.getMainImageUrl() : "https://via.placeholder.com/100";
    }

    @Override
    public String toString() {
        return "SubscriptionItem{" +
                "id=" + id +
                ", productId=" + productId +
                ", productName=" + (product != null ? product.getName() : "N/A") +
                ", quantity=" + quantity +
                ", price=" + price +
                '}';
    }
}
