package com.javalab.student.dto.cartOrder;

import com.javalab.student.constant.OrderStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * 주문 정보를 전달하기 위한 DTO 클래스
 */
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;                // 주문번호
    private Long memberId;          // 주문 회원 ID
    private String name;            // 주문자명
    private LocalDateTime orderDate;// 주문일
    private OrderStatus orderStatus;// 주문상태
    private BigDecimal amount;      // 주문금액
    private String waybillNum;      // 운송장번호
    private String parcelCd;        // 택배사코드

    private Long productId;         // 상품 ID
    private int count;              // 주문 수량
}
