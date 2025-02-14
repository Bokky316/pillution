package com.javalab.student.controller;

import com.javalab.student.dto.CartItemDto;
import com.javalab.student.dto.CartItemQuantityDto;
import com.javalab.student.entity.Cart;
import com.javalab.student.entity.CartItem;
import com.javalab.student.entity.Member;
import com.javalab.student.repository.CartItemRepository;
import com.javalab.student.repository.CartRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public CartController(CartRepository cartRepository, CartItemRepository cartItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    // 장바구니 조회
    @GetMapping
    public ResponseEntity<List<CartItem>> getCartItems() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof Member)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Member member = (Member) authentication.getPrincipal();
        Long memberId = member.getId();

        Optional<Cart> cart = cartRepository.findByMemberId(memberId);
        if (cart.isPresent()) {
            return ResponseEntity.ok(cart.get().getCartItems());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 장바구니 추가
    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@RequestBody CartItemDto cartItemDto) {
        Optional<Cart> cart = cartRepository.findByMemberId(cartItemDto.getMemberId());
        if (cart.isPresent()) {
            Cart existingCart = cart.get();
            CartItem newItem = new CartItem();
            newItem.setCart(existingCart);
            newItem.setProduct(cartItemDto.getProduct());
            newItem.setQuantity(cartItemDto.getQuantity());
            cartItemRepository.save(newItem);
            return ResponseEntity.ok("장바구니에 추가되었습니다.");
        } else {
            return ResponseEntity.badRequest().body("장바구니를 찾을 수 없습니다.");
        }
    }

    // 장바구니 상품 수량 수정
    @PutMapping("/item/{itemId}")
    public ResponseEntity<String> updateCartItemQuantity(
            @PathVariable Long itemId,
            @RequestBody CartItemQuantityDto quantityDto) {
        Optional<CartItem> cartItem = cartItemRepository.findById(itemId);
        if (cartItem.isPresent()) {
            CartItem item = cartItem.get();
            item.setQuantity(quantityDto.getQuantity());
            cartItemRepository.save(item);
            return ResponseEntity.ok("수량이 변경되었습니다.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 장바구니 상품 삭제
    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<String> removeCartItem(@PathVariable Long itemId) {
        Optional<CartItem> cartItem = cartItemRepository.findById(itemId);
        if (cartItem.isPresent()) {
            cartItemRepository.deleteById(itemId);
            return ResponseEntity.ok("상품이 삭제되었습니다.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
