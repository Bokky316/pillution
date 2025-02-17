package com.javalab.student.service.cartOrder;

import com.javalab.student.dto.cartOrder.CartDetailDto;
import com.javalab.student.dto.cartOrder.CartItemDto;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.cartOrder.Cart;
import com.javalab.student.entity.cartOrder.CartItem;
import com.javalab.student.entity.product.Product;
import com.javalab.student.entity.product.ProductImg;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.cartOrder.CartItemRepository;
import com.javalab.student.repository.cartOrder.CartRepository;
import com.javalab.student.repository.product.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 장바구니 관련 기능을 제공하는 서비스 클래스
 * 장바구니에 상품 추가, 목록 조회, 수정, 삭제 등의 기능을 수행한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final ProductRepository productRepository;
    private final MemberRepository memberRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    /**
     * 장바구니에 상품을 추가하는 메서드
     *
     * @param cartItemDto 장바구니에 추가할 상품 정보 DTO
     * @param email 현재 사용자의 이메일
     * @return 추가된 장바구니 아이템의 ID
     * @throws EntityNotFoundException 상품 또는 회원을 찾을 수 없을 경우 발생
     */
    @Transactional
    public Long addCart(CartItemDto cartItemDto, String email) {
        try {
            // 상품 조회
            Product product = productRepository.findById(cartItemDto.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("상품을 찾을 수 없습니다. ID: " + cartItemDto.getProductId()));

            // 회원 조회
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
        } catch (Exception e) {
            // 로그에 에러 메시지 출력
            log.error("장바구니에 상품을 추가하는 중 오류 발생: " + e.getMessage(), e);
            throw e;  // 예외를 다시 던져서 상위 레벨에서 처리할 수 있게 함
        }
    }

    /**
     * 장바구니 목록을 조회하는 메서드
     *
     * @param email 현재 사용자의 이메일
     * @return 장바구니 상세 정보 DTO 리스트
     */
    @Transactional(readOnly = true)
    public List<CartDetailDto> getCartList(String email) {
        // Member member = memberRepository.findByEmail(email); // 불필요한 DB 조회 제거

        // 이메일로 Member ID를 조회
        // Member member = memberRepository.findByEmail(email); // 불필요한 DB 조회 <-- 삭제!
        // Long memberId = member.getId(); // Member ID 얻기  <-- 삭제!

        // Cart cart = cartRepository.findByMemberId(memberId).orElse(null); // Member ID로 Cart 조회 <-- memberId 관련 코드 삭제!

        Member member = memberRepository.findByEmail(email);

        Cart cart = cartRepository.findByMemberId(member.getId()).orElse(null);

        if (cart == null) {
            return new ArrayList<>();
        }
        return getCartDetailList(cart.getId());
    }

    /**
     * 장바구니 아이템의 소유자를 확인하는 메서드
     *
     * @param cartItemId 확인할 장바구니 아이템 ID
     * @param email 현재 사용자의 이메일
     * @return 현재 사용자가 장바구니 아이템의 소유자인지 여부
     * @throws EntityNotFoundException 장바구니 아이템을 찾을 수 없을 경우 발생
     */
    @Transactional(readOnly = true)
    public boolean validateCartItem(Long cartItemId, String email) {
        Member curMember = memberRepository.findByEmail(email);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 찾을 수 없습니다."));
        Member savedMember = cartItem.getCart().getMember();
        return curMember.getEmail().equals(savedMember.getEmail());
    }

    /**
     * 장바구니 아이템의 수량을 업데이트하는 메서드
     *
     * @param cartItemId 업데이트할 장바구니 아이템 ID
     * @param quantity 새로운 수량
     * @throws EntityNotFoundException 장바구니 아이템을 찾을 수 없을 경우 발생
     */
    @Transactional
    public void updateCartItemCount(Long cartItemId, int quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 찾을 수 없습니다."));
        cartItem.updateQuantity(quantity);
        cartItemRepository.save(cartItem);
    }

    /**
     * 장바구니 아이템을 삭제하는 메서드
     *
     * @param cartItemId 삭제할 장바구니 아이템 ID
     * @throws EntityNotFoundException 장바구니 아이템을 찾을 수 없을 경우 발생
     */
    public void deleteCartItem(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 찾을 수 없습니다."));
        cartItemRepository.delete(cartItem);
    }

    /**
     * 상품의 재고를 확인하는 메서드
     *
     * @param productId 확인할 상품 ID
     * @param quantity 구매 수량
     * @return 재고가 충분한지 여부
     * @throws EntityNotFoundException 상품을 찾을 수 없을 경우 발생
     */
    @Transactional(readOnly = true)
    public boolean checkStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("상품을 찾을 수 없습니다. ID: " + productId));
        return product.getStock() >= quantity;
    }

    /**
     * 장바구니 아이템 ID로 상품 ID를 조회하는 메서드
     *
     * @param cartItemId 조회할 장바구니 아이템 ID
     * @return 상품 ID
     * @throws EntityNotFoundException 장바구니 아이템을 찾을 수 없을 경우 발생
     */
    @Transactional(readOnly = true)
    public Long getItemIdByCartItemId(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 찾을 수 없습니다."));
        return cartItem.getProduct().getId();
    }

    /**
     * 장바구니 아이템의 상세 정보를 조회하는 메서드
     *
     * @param cartItemId 조회할 장바구니 아이템 ID
     * @return 장바구니 상세 정보 DTO
     * @throws EntityNotFoundException 장바구니 아이템을 찾을 수 없을 경우 발생
     */
    @Transactional(readOnly = true)
    public CartDetailDto getCartItemDetail(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 찾을 수 없습니다. ID: " + cartItemId));

        Product product = cartItem.getProduct();
        String imageUrl = product.getProductImgList().stream()
                .filter(img -> "대표".equals(img.getImageType()))
                .findFirst()
                .map(ProductImg::getImageUrl)
                .orElse(null);

        return CartDetailDto.builder()
                .cartItemId(cartItem.getId())
                .name(product.getName())
                .quantity(cartItem.getQuantity())
                .price(product.getPrice())
                .imageUrl(imageUrl)
                .build();
    }


    /**
     * 장바구니를 비우는 메서드
     *
     * @param memberId 비울 장바구니의 회원 ID
     */
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

    /**
     * 장바구니 상세 정보 DTO 리스트를 조회하는 메서드
     *
     * @param cartId 장바구니 ID
     * @return 장바구니 상세 정보 DTO 리스트
     */
    public List<CartDetailDto> getCartDetailList(Long cartId) {
        List<CartItem> cartItems = cartItemRepository.findByCartId(cartId);
        return cartItems.stream()
                .map(cartItem -> {
                    Product product = cartItem.getProduct();
                    String imageUrl = product.getProductImgList().stream()
                            .filter(img -> "대표".equals(img.getImageType()))
                            .findFirst()
                            .map(ProductImg::getImageUrl)
                            .orElse(null);

                    return CartDetailDto.builder()
                            .cartItemId(cartItem.getId())
                            .name(product.getName())
                            .quantity(cartItem.getQuantity())
                            .price(product.getPrice())
                            .imageUrl(imageUrl)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
