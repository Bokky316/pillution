package com.javalab.student.controller.cartOrder;

import com.javalab.student.config.portone.PortOneProperties;
import com.javalab.student.dto.cartOrder.PaymentRequestDto;

import com.javalab.student.service.PaymentService;
import com.javalab.student.service.SubscriptionService;
import com.javalab.student.service.cartOrder.CartService;
import com.javalab.student.service.cartOrder.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

/**
 * 결제 관련 API를 처리하는 컨트롤러
 * 결제 요청, 검증 등의 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final CartService cartService;
    private final OrderService orderService;
    private final SubscriptionService subscriptionService; // 구독 서비스 추가
    private final PortOneProperties portOneProperties;

    /**
     * 가맹점 UID를 조회합니다.
     * @return 가맹점 UID를 포함한 ResponseEntity
     */
    @GetMapping("/merchant-id")
    public ResponseEntity<Map<String, String>> getMerchantId() {
        log.info("가맹점 UID 조회 요청");
        return ResponseEntity.ok(Map.of("merchantId", portOneProperties.getMerchantUid()));
    }

    /**
     * 결제를 요청하고 검증합니다.
     * @param requestDto 결제 요청 정보
     * @param purchaseType 구매 유형 (일회성 또는 구독)
     * @param principal 현재 인증된 사용자 정보
     * @return 처리된 결제 정보를 포함한 ResponseEntity
     */
    @PostMapping("/request")
    public ResponseEntity<Map<String, Object>> processPayment(
            @RequestBody PaymentRequestDto requestDto,
            @RequestParam String purchaseType,
            Principal principal) {
        log.info("결제 요청 시작 - 주문 정보: {}, 구매 유형: {}", requestDto, purchaseType);
        Map<String, Object> response = paymentService.processPayment(requestDto, principal.getName(), purchaseType);
        log.info("결제 처리 완료: {}", response);

        // 장바구니 비우기 로직 추가
        if (response.containsKey("paymentId")) {
            clearCart(principal.getName());
        }

        return ResponseEntity.ok(response);
    }

    /**
     * 장바구니를 비웁니다.
     * @param email 사용자 이메일
     */
    private void clearCart(String email) {
        // 장바구니에 있는 모든 상품 삭제
    }
}
