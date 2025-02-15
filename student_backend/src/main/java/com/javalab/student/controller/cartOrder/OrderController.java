package com.javalab.student.controller.cartOrder;

import com.javalab.student.dto.cartOrder.OrderDto;
import com.javalab.student.dto.cartOrder.OrderHistDto;
import com.javalab.student.service.cartOrder.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Optional;

/**
 * 주문 관련 API 컨트롤러
 * - 주문 생성, 주문 내역 조회, 주문 취소 기능 제공
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    /**
     * 주문 생성
     * @param orderDto 주문 정보
     * @param principal 사용자 정보
     * @return 주문 ID
     */
    @PostMapping
    public ResponseEntity<Object> order(@RequestBody @Valid OrderDto orderDto, Principal principal) {
        log.info("주문 생성 요청 - 주문 정보: {}", orderDto);
        try {
            Long orderId = orderService.order(orderDto, principal.getName());
            log.info("주문 생성 완료 - 주문 ID: {}", orderId);
            return ResponseEntity.ok(orderId);
        } catch (Exception e) {
            log.error("주문 생성 실패", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 주문 내역 조회
     * @param page 페이지 번호
     * @param principal 사용자 정보
     * @return 주문 내역 목록
     */
    @GetMapping
    public ResponseEntity<Page<OrderHistDto>> orderHist(@RequestParam(value = "page", defaultValue = "0") int page, Principal principal) {
        log.info("주문 내역 조회 요청 - 사용자: {}, 페이지: {}", principal.getName(), page);
        Pageable pageable = PageRequest.of(page, 4);
        Page<OrderHistDto> ordersHistDtoList = orderService.getOrderList(principal.getName(), pageable);
        return ResponseEntity.ok(ordersHistDtoList);
    }

    /**
     * 주문 취소
     * @param orderId 주문 ID
     * @param principal 사용자 정보
     * @return 취소된 주문 ID
     */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Object> cancelOrder(@PathVariable("orderId") Long orderId, Principal principal) {
        log.info("주문 취소 요청 - 주문 ID: {}", orderId);
        if (!orderService.validateOrder(orderId, principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("주문 취소 권한이 없습니다.");
        }
        orderService.cancelOrder(orderId);
        log.info("주문 취소 완료 - 주문 ID: {}", orderId);
        return ResponseEntity.ok(orderId);
    }
}
