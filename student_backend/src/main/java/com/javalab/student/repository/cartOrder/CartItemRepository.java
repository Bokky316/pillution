package com.javalab.student.repository.cartOrder;

import com.javalab.student.dto.cartOrder.CartDetailDto;
import com.javalab.student.entity.cartOrder.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    CartItem findByCartIdAndProductId(Long cartId, Long productId);
    CartItem findByCartCartIdAndProductProductId(Long cartId, Long productId);

    @Query("select new com.javalab.student.dto.cartOrder.CartDetailDto(ci.id, p.name, ci.quantity, p.price, p.mainImageUrl) " +
            "from CartItem ci join ci.product p where ci.cart.id = :cartId")
    List<CartDetailDto> findCartDetailDtoList(@Param("cartId") Long cartId);

    /**
     * cartItemId로 CartDetailDto를 조회
     * @param cartItemId
     * @return
     */
    @Query("SELECT new com.javalab.student.dto.cartOrder.CartDetailDto(ci.cartItemId,p.name, ci.quantity, p.price, p.mainImageUrl )"
            + "  FROM CartItem ci "
            + "   JOIN ci.product p"
            + "  WHERE ci.cartItemId = :cartItemId")
    Optional<CartDetailDto> findCartDetailDto(@Param("cartItemId") Long cartItemId);
}
