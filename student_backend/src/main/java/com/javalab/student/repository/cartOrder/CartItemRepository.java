package com.javalab.student.repository.cartOrder;

import com.javalab.student.dto.cartOrder.CartDetailDto;
import com.javalab.student.entity.cartOrder.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    CartItem findByCartIdAndProductId(Long cartId, Long productId);

    @Query("select new com.javalab.student.dto.cartOrder.CartDetailDto(ci.id, p.name, ci.quantity, p.price, p.mainImageUrl) " +
            "from CartItem ci join ci.product p where ci.cart.id = :cartId")
    List<CartDetailDto> findCartDetailDtoList(@Param("cartId") Long cartId);
}