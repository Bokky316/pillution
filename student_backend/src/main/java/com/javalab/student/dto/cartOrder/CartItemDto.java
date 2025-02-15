package com.javalab.student.dto.cartOrder;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * 장바구니에 담을 상품 정보를 담는 DTO
 */
@Getter @Setter
public class CartItemDto {

    @NotNull(message = "상품 아이디는 필수 입력 값 입니다.")
    private Long productId;

    @Min(value = 1, message = "최소 1개 이상 담아주세요")
    private int quantity;
}
