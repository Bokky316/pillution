package com.javalab.student.repository.cartOrder;

import com.javalab.student.dto.cartOrder.CartDetailDto;
import com.javalab.student.entity.cartOrder.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /**
     * 장바구니 ID와 상품 ID로 장바구니 아이템을 조회합니다.
     * @param cartId 장바구니 ID
     * @param productId 상품 ID
     * @return 조회된 장바구니 아이템
     */
    CartItem findByCartIdAndProductId(Long cartId, Long productId);

    /**
     * 장바구니 ID로 해당 장바구니의 모든 아이템을 조회합니다.
     * @param cartId 장바구니 ID
     * @return 장바구니에 담긴 모든 아이템 리스트
     */
    List<CartItem> findByCartId(Long cartId);

    /**
     * 장바구니 ID로 해당 장바구니의 상세 정보를 DTO 리스트로 조회합니다.
     * @param cartId 장바구니 ID
     * @return 장바구니 상세 정보 DTO 리스트
     */
    @Query("select new com.javalab.student.dto.cartOrder.CartDetailDto(ci.id, p.name, ci.quantity, p.price, p.mainImageUrl) " +
            "from CartItem ci join ci.product p where ci.cart.id = :cartId")
    List<CartDetailDto> findCartDetailDtoList(@Param("cartId") Long cartId);

    /**
     * 장바구니 아이템 ID로 해당 아이템의 상세 정보를 DTO로 조회합니다.
     * @param cartItemId 장바구니 아이템 ID
     * @return 장바구니 아이템 상세 정보 DTO (Optional로 래핑됨)
     */
    @Query("SELECT new com.javalab.student.dto.cartOrder.CartDetailDto(ci.id, p.name, ci.quantity, p.price, p.mainImageUrl)"
            + "  FROM CartItem ci "
            + "   JOIN ci.product p"
            + "  WHERE ci.id = :cartItemId")
    Optional<CartDetailDto> findCartDetailDto(@Param("cartItemId") Long cartItemId);
}
