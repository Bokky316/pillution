package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;  // 주문한 회원

    private LocalDateTime orderDate;  // 주문 날짜
    private String status;  // 주문 상태 (예: "PENDING", "COMPLETED", "CANCELLED")
    private String paymentMethod;  // 결제 방식 (카드, 계좌이체 등)
    private String deliveryAddress;  // 배송지

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;  // 주문 아이템 리스트
}
