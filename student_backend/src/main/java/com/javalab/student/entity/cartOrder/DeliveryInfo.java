package com.javalab.student.entity.cartOrder;

import com.javalab.student.entity.Member;
import jakarta.persistence.*;
import lombok.*;

/**
 * 배송 정보 엔티티
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "delivery_info")
public class DeliveryInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "delivery_info_id")
    private Long id;

    /**
     * 회원
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    /**
     * 배송 정보 이름 (사용자가 지정)
     */
    @Column(name = "delivery_name")
    private String deliveryName;

    /**
     * 수령인 이름
     */
    @Column(name = "recipient_name")
    private String recipientName;

    /**
     * 수령인 전화번호
     */
    @Column(name = "recipient_phone")
    private String recipientPhone;

    /**
     * 우편번호
     */
    @Column(name = "postal_code")
    private String postalCode;

    /**
     * 도로명 주소
     */
    @Column(name = "road_address")
    private String roadAddress;

    /**
     * 상세 주소
     */
    @Column(name = "detail_address")
    private String detailAddress;

    /**
     * 배송 메모
     */
    @Column(name = "delivery_memo")
    private String deliveryMemo;

    /**
     * 대표 배송 정보 여부
     */
    @Column(name = "is_default")
    private boolean isDefault;
}
