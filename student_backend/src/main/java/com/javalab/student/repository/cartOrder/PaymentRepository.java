package com.javalab.student.repository.cartOrder;

import com.javalab.student.entity.cartOrder.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 결제(Payment) 엔티티에 대한 데이터 접근 인터페이스입니다.
 * JpaRepository를 상속받아 기본적인 CRUD 기능을 제공하며, 추가적인 조회 메서드를 정의합니다.
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * 주문 ID로 결제 내역을 조회합니다.
     *
     * @param orderId 주문 ID
     * @return 해당 주문의 결제 내역 (Optional)
     */
    Optional<Payment> findByOrderId(Long orderId);

    /**
     * PG사 결제 고유번호(IMP UID)로 결제 내역을 조회합니다.
     *
     * @param impUid PG사 결제 고유번호
     * @return 해당 IMP UID의 결제 내역 (Optional)
     */
    Optional<Payment> findByImpUid(String impUid);
}
