package com.javalab.student.controller.cartOrder;

import com.javalab.student.config.portone.PortOneProperties;
import com.javalab.student.dto.cartOrder.CartOrderRequestDto;
import com.javalab.student.dto.cartOrder.PaymentRequestDto;
import com.javalab.student.service.cartOrder.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

/**
 * 결제 관련 API를 처리하는 컨트롤러
 * 결제 요청, 검증, 장바구니 주문 처리 등의 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/payments")
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
    @GetMapping("/merchant-id")
    public ResponseEntity<Map<String, String>> getMerchantId() {
        log.info("가맹점 UID 조회 요청");
        return ResponseEntity.ok(Map.of("merchantId", portOneProperties.getMerchantUid()));
    }

    /**
     * 결제를 처리하고 검증합니다.
     *
     * @param requestDto 결제 요청 정보
     * @return 처리된 결제 정보를 포함한 ResponseEntity
     */
    @PostMapping("/request")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody PaymentRequestDto requestDto) {
        log.info("결제 요청 시작 - 주문 정보: {}", requestDto);
        Map<String, Object> response = paymentService.processPayment(requestDto);
        log.info("결제 처리 완료: {}", response);
        return ResponseEntity.ok(response);
    }

    /**
     * 장바구니 아이템들을 주문으로 처리합니다.
     *
     * @param cartOrderRequestDto 장바구니 주문 요청 정보
     * @param purchaseType 구매 유형 (일회성 또는 구독)
     * @param principal 현재 인증된 사용자 정보
     * @return 생성된 주문 ID를 포함한 ResponseEntity
     */
    @PostMapping("/cart-order")
    public ResponseEntity<Long> orderCartItems(@RequestBody CartOrderRequestDto cartOrderRequestDto,
                                               @RequestParam String purchaseType,
                                               Principal principal) {
        log.info("장바구니 주문 요청 - 구매 유형: {}", purchaseType);
        Long orderId = paymentService.orderCartItem(cartOrderRequestDto, principal.getName(), purchaseType);
        log.info("장바구니 주문 완료 - 주문 ID: {}", orderId);
        return ResponseEntity.ok(orderId);
    }
}
