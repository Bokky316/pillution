package com.javalab.student.repository;

import com.javalab.student.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByMemberId(Long memberId);
}
