package com.javalab.student.dto.cartOrder;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 장바구니 주문 요청 DTO
 */
@Getter
@Setter
public class CartOrderRequestDto {
    private List<CartOrderItem> cartOrderItems;

    @Getter
    @Setter
    public static class CartOrderItem {
        private Long cartItemId;  // 장바구니 아이템 ID
        private int quantity;     // 수량
    }
}
