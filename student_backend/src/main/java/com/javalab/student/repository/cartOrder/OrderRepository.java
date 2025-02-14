package com.javalab.student.repository.cartOrder;

import com.javalab.student.entity.cartOrder.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 주문(Order) 엔티티에 대한 데이터 접근 인터페이스입니다.
 * JpaRepository를 상속받아 기본적인 CRUD 기능을 제공합니다.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // 기본 CRUD 메서드들이 JpaRepository에 의해 자동으로 제공됩니다.
}
