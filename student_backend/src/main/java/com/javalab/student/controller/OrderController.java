package com.javalab.student.controller;

import com.javalab.student.entity.cartOrder.Order;
import com.javalab.student.service.cartOrder.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/{memberId}")
    public ResponseEntity<List<Order>> getOrdersByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(orderService.getOrdersByMemberId(memberId));
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return ResponseEntity.ok(orderService.createOrder(order));
    }
}
