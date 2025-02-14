package com.javalab.student.dto.cartOrder;

import lombok.Getter;
import lombok.Setter;

/**
 * 장바구니 상품 DTO
 * - 장바구니 상품과 1:1 매핑
 */
@Getter
@Setter
public class CartOrderItemDto {
    private Long cartItemId;  // 장바구니 아이템 ID
    private int quantity;     // 수량
}
