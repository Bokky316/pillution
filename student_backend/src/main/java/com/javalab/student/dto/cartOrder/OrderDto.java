package com.javalab.student.dto.cartOrder;

import com.javalab.student.constant.OrderStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;  // orderId 대신 id 사용
    private Long memberId;
    private LocalDateTime orderDate;
    private OrderStatus orderStatus;
    private BigDecimal amount;
    private String waybillNum;
    private String parcelCd;
    private List<OrderItemDto> orderItems;

    @Getter @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private Long id;  // orderItemId 대신 id 사용
        private Long productId;
        private String productName;
        private Integer count;
        private BigDecimal orderPrice;
    }
}
