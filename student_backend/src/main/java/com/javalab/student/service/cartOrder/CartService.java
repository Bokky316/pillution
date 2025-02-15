package com.javalab.student.service.cartOrder;

import com.javalab.student.dto.cartOrder.CartDetailDto;
import com.javalab.student.dto.cartOrder.CartItemDto;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.Product;
import com.javalab.student.entity.cartOrder.Cart;
import com.javalab.student.entity.cartOrder.CartItem;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.ProductRepository;
import com.javalab.student.repository.cartOrder.CartItemRepository;
import com.javalab.student.repository.cartOrder.CartRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final ProductRepository productRepository;
    private final MemberRepository memberRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    // 장바구니에 상품을 추가하는 메서드
    @Transactional
    public Long addCart(CartItemDto cartItemDto, String email) {
        // 상품과 회원 정보를 조회
        Product product = productRepository.findById(cartItemDto.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("상품을 찾을 수 없습니다. ID: " + cartItemDto.getProductId()));
        Member member = memberRepository.findByEmail(email);
        if (member == null) {
            throw new EntityNotFoundException("회원을 찾을 수 없습니다. Email: " + email);
        }

        // 회원의 장바구니를 조회하거나 새로 생성
        Cart cart = cartRepository.findByMemberId(member.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.createCart(member);
                    return cartRepository.save(newCart);
                });

        // 장바구니에 이미 같은 상품이 있는지 확인
        CartItem savedCartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (savedCartItem != null) {
            // 이미 있다면 수량만 증가
            savedCartItem.addQuantity(cartItemDto.getQuantity());
            return savedCartItem.getId();
        } else {
            // 없다면 새로운 CartItem 생성
            CartItem cartItem = CartItem.createCartItem(cart, product, cartItemDto.getQuantity());
            cartItemRepository.save(cartItem);
            return cartItem.getId();
        }
    }

    // 장바구니 목록을 조회하는 메서드
    @Transactional(readOnly = true)
    public List<CartDetailDto> getCartList(String email) {
        Member member = memberRepository.findByEmail(email);
        Cart cart = cartRepository.findByMemberId(member.getId()).orElse(null);
        if (cart == null) {
            return new ArrayList<>();
        }
        return cartItemRepository.findCartDetailDtoList(cart.getId());
    }

    // 장바구니 아이템의 소유자를 확인하는 메서드
    @Transactional(readOnly = true)
    public boolean validateCartItem(Long cartItemId, String email) {
        Member curMember = memberRepository.findByEmail(email);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 찾을 수 없습니다."));
        Member savedMember = cartItem.getCart().getMember();
        return curMember.getEmail().equals(savedMember.getEmail());
    }

    // 장바구니 아이템의 수량을 업데이트하는 메서드
    @Transactional
    public void updateCartItemCount(Long cartItemId, int quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 찾을 수 없습니다."));
        cartItem.updateQuantity(quantity);
        cartItemRepository.save(cartItem);
    }

    // 장바구니 아이템을 삭제하는 메서드
    public void deleteCartItem(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 찾을 수 없습니다."));
        cartItemRepository.delete(cartItem);
    }

    // 상품의 재고를 확인하는 메서드
    @Transactional(readOnly = true)
    public boolean checkStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("상품을 찾을 수 없습니다. ID: " + productId));
        return product.getStock() >= quantity;
    }

    // 장바구니 아이템 ID로 상품 ID를 조회하는 메서드
    @Transactional(readOnly = true)
    public Long getItemIdByCartItemId(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 찾을 수 없습니다."));
        return cartItem.getProduct().getId();
    }

    // 장바구니 아이템의 상세 정보를 조회하는 메서드
    @Transactional(readOnly = true)
    public CartDetailDto getCartItemDetail(Long cartItemId) {
        return cartItemRepository.findCartDetailDto(cartItemId)
                .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 찾을 수 없습니다. ID: " + cartItemId));
    }

    // 장바구니를 비우는 메서드
    public void clearCart(Long memberId) {
        Optional<Cart> optionalCart = cartRepository.findByMemberId(memberId);
        if (optionalCart.isPresent()) {
            Cart cart = optionalCart.get();
            List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
            cartItemRepository.deleteAll(cartItems);
        } else {
            log.warn("clearCart - 해당 memberId {} 에 대한 장바구니가 존재하지 않습니다.", memberId);
        }
    }
}
