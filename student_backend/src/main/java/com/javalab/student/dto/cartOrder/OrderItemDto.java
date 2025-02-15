package com.javalab.student.dto.cartOrder;

import com.javalab.student.entity.cartOrder.OrderItem;
import lombok.*;

import java.math.BigDecimal;

/**
 * 한 건의 주문 Item(상품) 정보를 화면에 보내는 역할
 */
@Getter @Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderItemDto {
    private Long orderItemId;       // 주문아이템 id
    private Long productId;         // 상품ID
    private String productName;     // 상품명
    private Integer count;          // 주문 수량
    private BigDecimal orderPrice;  // 주문 금액
    private String imgUrl;          // 상품 이미지 경로

    /**
     * 생성자
     * - 엔티티를 받아서 엔티티의 값을 자신(Dto)의 멤버 변수에 할당함.
     *   즉, Entity -> Dto 변환
     */
    public OrderItemDto(OrderItem orderItem, String imgUrl){
        this.orderItemId = orderItem.getId();
        this.productId = orderItem.getProduct().getId();
        this.productName = orderItem.getProduct().getName();
        this.count = orderItem.getCount();
        this.orderPrice = orderItem.getOrderPrice();
        this.imgUrl = imgUrl;
    }
}
