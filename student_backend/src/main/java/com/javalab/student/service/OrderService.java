package com.javalab.student.service;

import com.javalab.student.entity.Order;
import com.javalab.student.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;

    public List<Order> getOrdersByMemberId(Long memberId) {
        return orderRepository.findByMemberId(memberId);
    }

    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }
}
