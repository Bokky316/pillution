package com.javalab.student.dto.cartOrder;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class CartDetailDto {
    private Long cartItemId; //장바구니 상품 아이디
    private String productName; //상품명
    private int quantity; //수량
    private BigDecimal price; //상품 금액
    private String imgUrl; //상품 이미지 경로

    public CartDetailDto(Long cartItemId, String productName, int quantity, BigDecimal price, String imgUrl) {
        this.cartItemId = cartItemId;
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
        this.imgUrl = imgUrl;
    }
}
