package com.javalab.student.repository.cartOrder;

import com.javalab.student.entity.cartOrder.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 장바구니(Cart) 엔티티에 대한 데이터 접근 인터페이스입니다.
 * JpaRepository를 상속받아 기본적인 CRUD 기능을 제공하며, 추가적인 조회 메서드를 정의합니다.
 */
@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    /**
     * 회원 ID로 장바구니를 조회합니다.
     *
     * @param memberId 회원 ID
     * @return 해당 회원의 장바구니 (Optional)
     */
    Optional<Cart> findByMemberId(Long memberId);
}
