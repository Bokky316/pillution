package com.javalab.student.controller.cartOrder;

import com.javalab.student.dto.cartOrder.*;
import com.javalab.student.service.cartOrder.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * 장바구니 관련 컨트롤러
 * - 장바구니 담기, 목록 조회, 수정, 삭제, 주문 기능 제공
 */
@Controller
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * 장바구니에 상품 추가
     */
    @PostMapping(value = "/cart")
    public @ResponseBody ResponseEntity<Object> addToCart(@RequestBody @Valid CartItemDto cartItemDto,
                                                          BindingResult bindingResult, Principal principal){
        if(bindingResult.hasErrors()){
            return new ResponseEntity<>(errorMessage(bindingResult), HttpStatus.BAD_REQUEST);
        }
        try {
            Long cartItemId = cartService.addCart(cartItemDto, principal.getName());
            return new ResponseEntity<>(cartItemId, HttpStatus.OK);
        } catch(Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * 장바구니 목록 조회
     */
    @GetMapping(value = "/cart")
    public String getCartList(Principal principal, Model model){
        List<CartDetailDto> cartDetailList = cartService.getCartList(principal.getName());
        model.addAttribute("cartItems", cartDetailList);
        return "cart/cartList";
    }

    /**
     * 장바구니 상품 수량 수정
     */
    @PatchMapping("/cartItem/{cartItemId}")
    public @ResponseBody ResponseEntity<Object> updateCartItem(@PathVariable("cartItemId") Long cartItemId,
                                                               @RequestParam("count") int count,
                                                               Principal principal){
        if(count <= 0){
            return new ResponseEntity<>("최소 1개 이상 담아주세요", HttpStatus.BAD_REQUEST);
        } else if(!cartService.validateCartItem(cartItemId, principal.getName())){
            return new ResponseEntity<>("수정 권한이 없습니다.", HttpStatus.FORBIDDEN);
        }
        cartService.updateCartItemCount(cartItemId, count);
        return new ResponseEntity<>(cartItemId, HttpStatus.OK);
    }

    /**
     * 장바구니 상품 삭제
     */
    @DeleteMapping(value = "/cartItem/{cartItemId}")
    public @ResponseBody ResponseEntity<Object> deleteCartItem(@PathVariable("cartItemId") Long cartItemId, Principal principal){
        if(!cartService.validateCartItem(cartItemId, principal.getName())){
            return new ResponseEntity<>("삭제 권한이 없습니다.", HttpStatus.FORBIDDEN);
        }
        cartService.deleteCartItem(cartItemId);
        return new ResponseEntity<>(cartItemId, HttpStatus.OK);
    }

    /**
     * 장바구니 상품 주문
     */
    @PostMapping(value = "/cart/orders")
    public @ResponseBody ResponseEntity<Object> orderCartItem(@RequestBody CartOrderRequestDto cartOrderRequestDto, Principal principal) {
        List<CartOrderRequestDto.CartOrderItem> cartOrderItems = cartOrderRequestDto.getCartOrderItems();
        if (cartOrderItems == null || cartOrderItems.isEmpty()) {
            return new ResponseEntity<>("주문할 상품을 선택해주세요", HttpStatus.BAD_REQUEST);
        }
        for (CartOrderRequestDto.CartOrderItem cartOrderItem : cartOrderItems) {
            if (!cartService.validateCartItem(cartOrderItem.getCartItemId(), principal.getName())) {
                return new ResponseEntity<>("주문 권한이 없습니다.", HttpStatus.FORBIDDEN);
            }
        }
        Long orderId = cartService.orderCartItem(cartOrderRequestDto, principal.getName());
        return new ResponseEntity<>(orderId, HttpStatus.OK);
    }

    private String errorMessage(BindingResult bindingResult) {
        StringBuilder sb = new StringBuilder();
        for (FieldError fieldError : bindingResult.getFieldErrors()) {
            sb.append(fieldError.getDefaultMessage());
        }
        return sb.toString();
    }
}
