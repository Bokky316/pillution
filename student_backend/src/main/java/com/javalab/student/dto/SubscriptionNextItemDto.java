package com.javalab.student.dto;

import com.javalab.student.entity.SubscriptionNextItem;
import lombok.Getter;

/**
 * SubscriptionNextItem DTO
 * - 다음 회차 결제에 반영될 상품 정보를 반환하는 DTO
 */
@Getter
public class SubscriptionNextItemDto {
    private String productName;
    private int nextMonthQuantity; // 다음 회차 반영할 수량
    private double nextMonthPrice; // 다음 회차 반영할 가격

    public SubscriptionNextItemDto(SubscriptionNextItem item) {
        this.productName = item.getProduct().getName();
        this.nextMonthQuantity = item.getNextMonthQuantity();
        this.nextMonthPrice = item.getNextMonthPrice();
    }
}
