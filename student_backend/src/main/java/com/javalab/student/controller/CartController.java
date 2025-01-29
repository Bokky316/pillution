package com.javalab.student.controller;

import com.javalab.student.dto.CartItemDto;
import com.javalab.student.entity.Cart;
import com.javalab.student.entity.CartItem;
import com.javalab.student.repository.CartItemRepository;
import com.javalab.student.repository.CartRepository;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/{memberId}")
    public ResponseEntity<List<CartItem>> getCartItems(@PathVariable Long memberId) {
        Optional<Cart> cart = cartRepository.findByMemberId(memberId);
        if (cart.isPresent()) {
            return ResponseEntity.ok(cart.get().getCartItems());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

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
}
