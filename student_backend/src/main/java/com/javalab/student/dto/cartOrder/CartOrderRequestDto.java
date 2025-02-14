package com.javalab.student.dto.cartOrder;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 장바구니 주문 요청 DTO
 * - CartOrderItemDto 리스트를 가지고 있다.
 */
@Getter
@Setter
public class CartOrderRequestDto {
    private List<CartOrderItemDto> cartOrderItems;  // 장바구니 주문 항목 리스트
}
