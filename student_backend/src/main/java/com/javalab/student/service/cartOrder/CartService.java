package com.javalab.student.service.cartOrder;

import com.javalab.student.dto.cartOrder.CartDetailDto;
import com.javalab.student.dto.cartOrder.CartItemDto;
import com.javalab.student.dto.cartOrder.CartOrderRequestDto;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.Product;
import com.javalab.student.entity.cartOrder.Cart;
import com.javalab.student.entity.cartOrder.CartItem;
import com.javalab.student.entity.cartOrder.Order;
import com.javalab.student.entity.cartOrder.OrderItem;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.ProductRepository;
import com.javalab.student.repository.cartOrder.CartItemRepository;
import com.javalab.student.repository.cartOrder.CartRepository;
import com.javalab.student.repository.cartOrder.OrderItemRepository;
import com.javalab.student.repository.cartOrder.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * 장바구니 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CartService {

    private final ProductRepository productRepository;
    private final MemberRepository memberRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    /**
     * 장바구니에 상품을 추가하는 메소드
     *
     * @param cartItemDto 장바구니에 추가할 상품 정보
     * @param email       사용자 이메일
     * @return 추가된 장바구니 아이템 ID
     */
    public Long addCart(CartItemDto cartItemDto, String email) {

        Product product = productRepository.findById(cartItemDto.getProductId())
                .orElseThrow(EntityNotFoundException::new);
        Member member = memberRepository.findByEmail(email);

        Cart cart = cartRepository.findByMemberMemberId(member.getMemberId());
        if (cart == null) {
            cart = Cart.createCart(member);
            cartRepository.save(cart);
        }

        CartItem savedCartItem = cartItemRepository.findByCartCartIdAndProductProductId(cart.getCartId(), product.getId());

        if (savedCartItem != null) {
            savedCartItem.addCount(cartItemDto.getQuantity());
            return savedCartItem.getCartItemId();
        } else {
            CartItem cartItem = CartItem.createCartItem(cart, product, cartItemDto.getQuantity());
            cartItemRepository.save(cartItem);
            return cartItem.getCartItemId();
        }
    }

    /**
     * 장바구니 목록을 조회하는 메소드
     *
     * @param email 사용자 이메일
     * @return 장바구니 아이템 목록
     */
    @Transactional(readOnly = true)
    public List<CartDetailDto> getCartList(String email) {

        Member member = memberRepository.findByEmail(email);
        Cart cart = cartRepository.findByMemberMemberId(member.getMemberId());
        if (cart == null) {
            return new ArrayList<>();
        }

        List<CartDetailDto> cartDetailDtoList = cartItemRepository.findCartDetailDtoList(cart.getCartId());
        return cartDetailDtoList;
    }

    /**
     * 장바구니 아이템의 유효성을 검사하는 메소드
     *
     * @param cartItemId 장바구니 아이템 ID
     * @param email      사용자 이메일
     * @return 유효성 검사 결과 (true: 유효, false: 유효하지 않음)
     */
    public boolean validateCartItem(Long cartItemId, String email) {
        Member currentMember = memberRepository.findByEmail(email);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(EntityNotFoundException::new);
        Member savedMember = cartItem.getCart().getMember();

        if (!currentMember.getMemberId().equals(savedMember.getMemberId())) {
            return false;
        }

        return true;
    }

    /**
     * 장바구니 아이템 수량을 수정하는 메소드
     *
     * @param cartItemId 장바구니 아이템 ID
     * @param count      수정할 수량
     */
    public void updateCartItemCount(Long cartItemId, int count) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(EntityNotFoundException::new);

        cartItem.updateCount(count);
    }

    /**
     * 장바구니 아이템을 삭제하는 메소드
     *
     * @param cartItemId 장바구니 아이템 ID
     */
    public void deleteCartItem(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(EntityNotFoundException::new);
        cartItemRepository.delete(cartItem);
    }

    /**
     * 장바구니 아이템 ID로 상품 ID를 조회하는 메소드
     *
     * @param cartItemId 장바구니 아이템 ID
     * @return 상품 ID
     */
    public Long getItemIdByCartItemId(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(EntityNotFoundException::new);
        return cartItem.getProduct().getId();
    }

    /**
     * 상품 재고를 확인하는 메소드
     *
     * @param productId 상품 ID
     * @param quantity  주문 수량
     * @return 재고 확인 결과 (true: 재고 충분, false: 재고 부족)
     */
    public boolean checkStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId).orElseThrow(EntityNotFoundException::new);
        int stock = product.getStock();
        log.debug("상품 재고: {}", stock);
        return stock >= quantity;
    }

    /**
     * 장바구니 아이템 상세 정보를 조회하는 메소드
     *
     * @param cartItemId 장바구니 아이템 ID
     * @return 장바구니 아이템 상세 정보
     */
    public CartDetailDto getCartItemDetail(Long cartItemId) {
        return cartItemRepository.findCartDetailDto(cartItemId);
    }
}
