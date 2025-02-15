package com.javalab.student.entity.cartOrder;

import com.javalab.student.constant.OrderStatus;
import com.javalab.student.constant.PayStatus;
import com.javalab.student.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * 결제 정보를 담는 엔티티 클래스.
 * PG사 결제 정보, 결제 상태, 금액 등을 관리합니다.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "order")
public class Payment extends BaseEntity {

    /** 결제 ID, Primary Key */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long id;

    /** 주문, OneToOne 관계 */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /** 포트원 결제 고유 번호 */
    @Column(name = "imp_uid", unique = true, length = 100)
    private String impUid;

    /** 상품 이름 */
    @Column(name = "item_nm")
    private String itemNm;

    /** 주문 상태 */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OrderStatus orderStatus = OrderStatus.PAYMENT_PENDING;  // 주문 상태

    /** 결제 금액 */
    private BigDecimal amount;

    /** 결제 수단 */
    private String paymentMethod;

    /** 구매자 이메일 */
    private String buyerEmail;

    /** 구매자 이름 */
    private String buyerName;

    /** 구매자 연락처 */
    private String buyerTel;

    /** 배송지 주소 */
    private String buyerAddr;

    /** 우편번호 */
    private String buyerPostcode;

    /** 결제 시각 */
    private Long paidAt;

    /** 결제 상태 */
    @Enumerated(EnumType.STRING)
    @Column(name = "pay_status")
    private PayStatus payStatus;    // 결제 / 취소
}
