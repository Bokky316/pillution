package com.javalab.student.dto.cartOrder;

import com.javalab.student.entity.cartOrder.CartItem;
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

    /**
     * CartItem 엔티티로부터 CartDetailDto 객체를 생성하는 정적 팩토리 메서드
     *
     * @param cartItem CartItem 엔티티
     * @return CartDetailDto 객체
     */
    public static CartDetailDto of(CartItem cartItem) {
        return new CartDetailDto(
                cartItem.getId(),
                cartItem.getProduct().getProductName(),
                cartItem.getQuantity(),
                cartItem.getProduct().getPrice(),
                cartItem.getProduct().getImageUrl()
        );
    }
}
