package com.javalab.student.controller.cartOrder;

import com.javalab.student.dto.cartOrder.OrderDto;
import com.javalab.student.dto.cartOrder.OrderHistDto;
import com.javalab.student.service.cartOrder.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

/**
 * 주문 관련 컨트롤러
 * - 주문 생성, 주문 내역 조회, 주문 취소 기능 제공
 */
@Controller
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * 주문 생성
     */
    @PostMapping("/order")
    public @ResponseBody ResponseEntity<Object> order(@RequestBody @Valid OrderDto orderDto,
                                                      BindingResult bindingResult, Principal principal) {
        if (bindingResult.hasErrors()) {
            return new ResponseEntity<>(errorMessage(bindingResult), HttpStatus.BAD_REQUEST);
        }
        try {
            Long orderId = orderService.order(orderDto, principal.getName());
            return new ResponseEntity<>(orderId, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * 주문 내역 조회
     */
    @GetMapping(value = {"/orders", "/orders/{page}"})
    public String orderHist(@PathVariable("page") Optional<Integer> page, Principal principal, Model model){
        Pageable pageable = PageRequest.of(page.orElse(0), 4);
        Page<OrderHistDto> ordersHistDtoList = orderService.getOrderList(principal.getName(), pageable);
        model.addAttribute("orders", ordersHistDtoList);
        model.addAttribute("page", pageable.getPageNumber());
        model.addAttribute("maxPage", 5);
        return "order/orderHist";
    }

    /**
     * 주문 취소
     */
    @PostMapping("/order/{orderId}/cancel")
    public @ResponseBody ResponseEntity<Object> cancelOrder(@PathVariable("orderId") Long orderId, Principal principal){
        if(!orderService.validateOrder(orderId, principal.getName())){
            return new ResponseEntity<>("주문 취소 권한이 없습니다.", HttpStatus.FORBIDDEN);
        }
        orderService.cancelOrder(orderId);
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
