package com.javalab.student.dto.cartOrder;

import com.javalab.student.constant.OrderStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderStatusUpdateDto {
    private OrderStatus status;
}