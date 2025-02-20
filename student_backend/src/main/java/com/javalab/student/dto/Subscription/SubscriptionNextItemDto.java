package com.javalab.student.dto.Subscription;

import com.javalab.student.entity.subscription.SubscriptionNextItem;
import lombok.Getter;

/**
 * SubscriptionNextItem DTO
 * - 다음 회차 결제에 반영될 상품 정보를 반환하는 DTO
 */
@Getter
public class SubscriptionNextItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private int nextMonthQuantity; // 다음 회차 반영할 수량
    private double nextMonthPrice; // 다음 회차 반영할 가격

    public SubscriptionNextItemDto(SubscriptionNextItem item) {
        this.id = item.getId();
        this.productId = (item.getProduct() != null) ? item.getProduct().getId() : item.getProductId(); // ✅ productId 유지
        this.productName = (item.getProduct() != null) ? item.getProduct().getName() : null;
        this.nextMonthQuantity = item.getNextMonthQuantity();
        this.nextMonthPrice = item.getNextMonthPrice();
    }
}
