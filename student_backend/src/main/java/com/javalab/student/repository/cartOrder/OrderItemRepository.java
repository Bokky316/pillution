package com.javalab.student.repository.cartOrder;

import com.javalab.student.entity.cartOrder.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // 주문 ID로 해당 주문의 모든 주문 아이템을 조회
    List<OrderItem> findByOrderId(Long orderId);

    // 상품 ID로 해당 상품의 모든 주문 아이템을 조회
    List<OrderItem> findByProductId(Long productId);

    // 주문 ID와 상품 ID로 특정 주문 아이템을 조회
    OrderItem findByOrderIdAndProductId(Long orderId, Long productId);

    // 주문 ID로 해당 주문의 총 금액을 계산
    @Query("SELECT SUM(oi.orderPrice * oi.count) FROM OrderItem oi WHERE oi.order.id = :orderId")
    Double calculateTotalAmountByOrderId(@Param("orderId") Long orderId);

    // 특정 주문의 주문 아이템 개수를 조회
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.order.id = :orderId")
    Long countByOrderId(@Param("orderId") Long orderId);
}
