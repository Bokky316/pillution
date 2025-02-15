package com.javalab.student.controller.cartOrder;

import com.fasterxml.jackson.annotation.JsonView;
import com.javalab.student.config.portone.PortOneProperties;
import com.javalab.student.dto.cartOrder.PaymentRequestDto;
import com.javalab.student.service.cartOrder.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

import com.javalab.student.entity.cartOrder.Order;
import jakarta.persistence.EntityNotFoundException;
import com.javalab.student.dto.cartOrder.OrderDto;
import java.util.stream.Collectors;
import java.util.List;

/**
 * 결제 관련 API를 처리하는 컨트롤러
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final PortOneProperties portOneProperties;

    /**
     * 가맹점 UID를 조회합니다.
     *
     * @return 가맹점 UID를 포함한 ResponseEntity
     */
    @GetMapping("/payments/merchant-id")
    public ResponseEntity<Map<String, String>> getMerchantId() {
        log.info("가맹점 UID 조회 요청");
        return ResponseEntity.ok(Map.of("merchantId", portOneProperties.getMerchantUid()));
    }

    /**
     * 결제를 요청하고 검증합니다.
     *
     * @param requestDto   결제 요청 정보
     * @param purchaseType 구매 유형 (일회성 또는 구독)
     * @param principal    현재 인증된 사용자 정보
     * @return 처리된 결제 정보를 포함한 ResponseEntity
     */
    @PostMapping("/payments/request")
    public ResponseEntity<Map<String, Object>> processPayment(
            @RequestBody PaymentRequestDto requestDto,
            @RequestParam("purchaseType") String purchaseType,
            Principal principal) {
        log.info("결제 요청 시작 - 주문 정보: {}, 구매 유형: {}", requestDto, purchaseType);
        Map<String, Object> response = paymentService.processPayment(requestDto, principal.getName(), purchaseType);
        log.info("결제 처리 완료: {}", response);
        return ResponseEntity.ok(response);
    }

    /**
     * 주문 생성 API
     *
     * @param requestDto   결제 요청 정보
     * @param purchaseType 구매 유형 (일회성 또는 구독)
     * @param principal    현재 인증된 사용자 정보
     * @return 생성된 주문 정보를 포함한 ResponseEntity
     */
    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(
            @RequestBody PaymentRequestDto requestDto,
            @RequestParam("purchaseType") String purchaseType,
            Principal principal) {
        log.info("주문 생성 요청 - 사용자: {}, 요청 정보: {}, 구매 유형: {}", principal.getName(), requestDto, purchaseType);
        try {
            // PaymentService를 사용하여 주문 생성
            Order order = paymentService.createOrder(requestDto, principal.getName(), purchaseType);
            log.info("주문 생성 성공 - 주문 ID: {}", order.getId());

            // Order 엔티티를 OrderDto로 변환
            OrderDto orderDto = convertToDto(order);

            return ResponseEntity.ok(orderDto); // 주문 성공 시 200 OK와 함께 OrderDto 반환
        } catch (EntityNotFoundException e) {
            // 멤버 또는 장바구니를 찾을 수 없는 경우
            log.error("주문 생성 실패 - 멤버 또는 장바구니를 찾을 수 없음: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); // 404 Not Found 반환
        } catch (IllegalStateException e) {
            // 상품 가격이 유효하지 않은 경우
            log.error("주문 생성 실패 - 상품 가격이 유효하지 않음: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); // 400 Bad Request 반환
        } catch (Exception e) {
            // 기타 예외 발생 시
            log.error("주문 생성 실패 - 예기치 않은 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("주문 생성에 실패했습니다: " + e.getMessage()); // 500 Internal Server Error 반환
        }
    }

    // Order 엔티티를 OrderDto로 변환하는 메서드
    private OrderDto convertToDto(Order order) {
        List<OrderDto.OrderItemDto> orderItemDtos = order.getOrderItems().stream()
                .map(orderItem -> OrderDto.OrderItemDto.builder()
                        .id(orderItem.getId())  // orderItemId를 id로 변경
                        .productId(orderItem.getProduct().getId())
                        .productName(orderItem.getProduct().getName())
                        .count(orderItem.getCount())
                        .orderPrice(orderItem.getOrderPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())  // orderId를 id로 변경
                .memberId(order.getMember().getId())
                .orderDate(order.getOrderDate())
                .orderStatus(order.getOrderStatus())
                .amount(order.getAmount())
                .waybillNum(order.getWaybillNum())
                .parcelCd(order.getParcelCd())
                .orderItems(orderItemDtos)
                .build();
    }
}
