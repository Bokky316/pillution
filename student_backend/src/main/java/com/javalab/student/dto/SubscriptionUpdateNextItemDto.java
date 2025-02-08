package com.javalab.student.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 다음 회차 개별 상품 DTO
 */
@Getter
@Setter
public class SubscriptionUpdateNextItemDto {
    private Long productId;  // ✅ 기존 productName 대신 productId 사용
    private int nextMonthQuantity;
    private double nextMonthPrice;
}
