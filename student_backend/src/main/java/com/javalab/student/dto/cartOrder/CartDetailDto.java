package com.javalab.student.dto.cartOrder;

import com.javalab.student.entity.cartOrder.CartItem;
import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDetailDto {
    private Long cartItemId; //장바구니 상품 아이디
    private String name; //상품명
    private int quantity; //수량
    private BigDecimal price; //상품 금액
    private String imageUrl; //상품 이미지 경로
}
