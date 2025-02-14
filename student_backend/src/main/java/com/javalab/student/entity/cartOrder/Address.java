package com.javalab.student.entity.cartOrder;

import com.javalab.student.entity.cartOrder.Order;
import lombok.*;

import jakarta.persistence.*;

/**
 * 주문시 배송 주소 엔티티
 */
@Entity
@Table(name = "address")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    @Id
    @Column(name = "address_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 주문 엔티티와 연관관계 매핑
     *  - 하나의 배송 주소 데이터는 하나의 주문번호와 연결되야 함.
     *  - 배송 주소 테이블에 주문번호(order_id)가 외래키 제약 + 유니크 제약으로 들어옴.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", unique = true)
    private Order order;

    // 추가된 배송 정보 필드
    @Column(name = "deli_name")
    private String name;

    @Column(name = "deli_phone")
    private String phone;

    @Column(name = "deli_addr")
    private String addr;

    @Column(name = "deli_addr_detail")
    private String addrDetail;

    @Column(name = "deli_zip_code")
    private String zipcode;

    @Column(name = "deli_memo")
    private String memo;
}
