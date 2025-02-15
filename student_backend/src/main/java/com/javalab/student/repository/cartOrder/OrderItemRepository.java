package com.javalab.student.repository.cartOrder;

import com.javalab.student.entity.cartOrder.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
