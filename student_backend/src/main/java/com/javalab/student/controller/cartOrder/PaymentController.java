package com.javalab.student.controller.cartOrder;

import com.javalab.student.config.portone.PortOneProperties;
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
     * @return 가맹점 UID를 포함한 ResponseEntity
     */
    @GetMapping("/merchant-id")
    public ResponseEntity<Map<String, String>> getMerchantId() {
        log.info("가맹점 UID 조회 요청");
        return ResponseEntity.ok(Map.of("merchantId", portOneProperties.getMerchantUid()));
    }

    /**
     * 결제를 요청하고 검증합니다.
     */
    @PostMapping("/request")
    public ResponseEntity<Map<String, Object>> processPayment(
            @RequestBody PaymentRequestDto requestDto,
            @RequestParam String purchaseType,
            Principal principal) {
        log.info("결제 요청 시작 - 주문 정보: {}, 구매 유형: {}", requestDto, purchaseType);
        Map<String, Object> response = paymentService.processPayment(requestDto, principal.getName(), purchaseType);
        log.info("결제 처리 완료: {}", response);
        return ResponseEntity.ok(response);
    }
}
