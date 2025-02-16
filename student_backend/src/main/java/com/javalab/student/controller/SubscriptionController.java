package com.javalab.student.controller;

import com.javalab.student.dto.SubscriptionResponseDto;
import com.javalab.student.dto.SubscriptionUpdateNextItemDto;
import com.javalab.student.dto.SubscriptionUpdateNextItemRequestDto;
import com.javalab.student.dto.SubscriptionUpdateNextItemRequestDto;
import com.javalab.student.entity.Subscription;
import com.javalab.student.entity.SubscriptionNextItem;
import com.javalab.student.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 구독 관련 API 컨트롤러
 * - 사용자의 정기구독 정보를 조회, 생성, 수정, 취소하는 기능 제공
 */
@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private static final Logger log = LoggerFactory.getLogger(SubscriptionController.class);


    /**
     * 사용자의 최신 활성화된 구독 정보 조회
     */
    @GetMapping
    public ResponseEntity<?> getSubscription(@RequestParam(value = "memberId", required = false) Long memberId) {
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "memberId가 필요합니다."));
        }
        try {
            SubscriptionResponseDto subscriptionResponse = subscriptionService.getSubscription(memberId);
            log.info("📡 [API 응답] 구독 정보 조회 - 구독 ID: {}, 배송 요청사항: {}",
                    subscriptionResponse.getId(),
                    subscriptionResponse.getDeliveryRequest() != null ? subscriptionResponse.getDeliveryRequest() : "없음");

            return ResponseEntity.ok(subscriptionResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }


    /**
     * 새로운 구독 생성 API
     */
    @PostMapping("/create")
    public ResponseEntity<Subscription> createSubscription(
            @RequestParam Long memberId,
            @RequestParam String paymentMethod,
            @RequestParam String postalCode,
            @RequestParam String roadAddress,
            @RequestParam String detailAddress) {
        return ResponseEntity.ok(subscriptionService.createSubscription(memberId, paymentMethod, postalCode, roadAddress, detailAddress));
    }

    /**
     * 배송 요청사항 업데이트 API
     */
    @PutMapping("/{subscriptionId}/delivery-request")
    public ResponseEntity<?> updateDeliveryRequest(
            @PathVariable Long subscriptionId,
            @RequestBody Map<String, String> requestBody) {

        log.info("📡 [DEBUG] 배송 요청사항 업데이트 요청 - 구독 ID: {}, 요청 데이터: {}", subscriptionId, requestBody);

        if (!requestBody.containsKey("deliveryRequest")) {
            log.error("❌ [ERROR] requestBody에 'deliveryRequest' 키가 없음: {}", requestBody);
            return ResponseEntity.badRequest().body(Map.of("message", "deliveryRequest 값이 필요합니다."));
        }

        String deliveryRequest = requestBody.get("deliveryRequest");
        log.info("📦 [INFO] 저장할 배송 요청사항: {}", deliveryRequest);

        subscriptionService.updateDeliveryRequest(subscriptionId, deliveryRequest);

        log.info("✅ [SUCCESS] 배송 요청 업데이트 완료 - 구독 ID: {}", subscriptionId);

        return ResponseEntity.ok(Map.of("message", "배송 요청사항이 업데이트되었습니다.", "deliveryRequest", deliveryRequest));
    }






    /**
     * 결제일 업데이트 API
     */
    @PutMapping("/update-billing-date")
    public ResponseEntity<?> updateBillingDate(@RequestBody Map<String, String> request) {
        try {
            Long subscriptionId = Long.parseLong(request.get("subscriptionId"));
            String newBillingDate = request.get("newBillingDate");

            boolean updated = subscriptionService.updateBillingDate(subscriptionId, LocalDate.parse(newBillingDate));

            if (updated) {
                return ResponseEntity.ok(Map.of("message", "success"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "failed"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }





    /**
     * 결제수단 변경 API
     */
    @PutMapping("/update-next-payment-method")
    public ResponseEntity<?> updateNextPaymentMethod(@RequestBody Map<String, Object> request) {
        Long subscriptionId = ((Number) request.get("subscriptionId")).longValue();
        String nextPaymentMethod = (String) request.get("nextPaymentMethod");

        if (subscriptionId == null || nextPaymentMethod == null) {
            return ResponseEntity.badRequest().body("❌ [ERROR] subscriptionId 또는 nextPaymentMethod가 없습니다!");
        }

        boolean updated = subscriptionService.updateNextPaymentMethod(subscriptionId, nextPaymentMethod);

        if (updated) {
            return ResponseEntity.ok(Map.of("nextPaymentMethod", nextPaymentMethod));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("❌ 결제수단 업데이트 실패");
        }
    }



    /**
     * 배송정보 변경 API
     */
    @PutMapping("/update-delivery-request")
    public ResponseEntity<?> updateDeliveryRequest(@RequestBody Map<String, String> request) {
        log.info("📡 [DEBUG] 배송 요청사항 업데이트 요청: {}", request);

        if (!request.containsKey("subscriptionId") || !request.containsKey("deliveryRequest")) {
            log.error("❌ [ERROR] requestBody에 필요한 데이터 없음: {}", request);
            return ResponseEntity.badRequest().body(Map.of("message", "subscriptionId 및 deliveryRequest 값이 필요합니다."));
        }

        Long subscriptionId = Long.parseLong(request.get("subscriptionId"));
        String deliveryRequest = request.get("deliveryRequest");

        log.info("📦 [INFO] 구독 ID: {}, 저장할 배송 요청사항: {}", subscriptionId, deliveryRequest);
        subscriptionService.updateDeliveryRequest(subscriptionId, deliveryRequest);

        log.info("✅ [SUCCESS] 배송 요청 업데이트 완료 - 구독 ID: {}", subscriptionId);

        return ResponseEntity.ok(Map.of(
                "message", "배송 요청사항이 업데이트되었습니다.",
                "deliveryRequest", deliveryRequest
        ));
    }




    /**
     * 구독 취소 API
     */
    @PutMapping("/cancel")
    public ResponseEntity<?> cancelSubscription(@RequestBody Map<String, String> request) {
        try {
            Long subscriptionId = Long.parseLong(request.get("subscriptionId"));

            boolean canceled = subscriptionService.cancelSubscription(subscriptionId);

            if (canceled) {
                return ResponseEntity.ok(Map.of(
                        "message", "✅ 구독이 성공적으로 취소되었습니다.",
                        "subscriptionId", subscriptionId
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "❌ 구독 취소 실패"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "서버 오류 발생: " + e.getMessage()));
        }
    }

    /**
     * 구독 정보 전체 수정 API
     */
    @PutMapping("/update")
    public ResponseEntity<Void> updateSubscriptionInfo(
            @RequestParam Long subscriptionId,
            @RequestParam(required = false) String newBillingDate,
            @RequestParam(required = false) String newPaymentMethod,
            @RequestParam(required = false) String postalCode,
            @RequestParam(required = false) String roadAddress,
            @RequestParam(required = false) String detailAddress) {

        subscriptionService.updateSubscriptionInfo(subscriptionId,
                newBillingDate != null ? LocalDate.parse(newBillingDate) : null,
                newPaymentMethod,
                postalCode,
                roadAddress,
                detailAddress);

        return ResponseEntity.ok().build();
    }

    /**
     * 다음 회차 결제 상품 업데이트
     * - 기존 상품 수량 변경 또는 삭제 기능
     */
    @PostMapping("/update-next-items")
    public ResponseEntity<Map<String, Object>> updateNextSubscriptionItems(
            @RequestBody SubscriptionUpdateNextItemRequestDto requestDto) {

        Long subscriptionId = requestDto.getSubscriptionId();
        List<SubscriptionUpdateNextItemDto> updatedItems = requestDto.getUpdatedItems();

        boolean updateSuccess = subscriptionService.updateNextSubscriptionItems(subscriptionId, updatedItems);

        if (updateSuccess) {
            // ✅ JSON 형식 응답 + 프론트엔드에서 Redux 업데이트에 필요한 데이터 반환
            Map<String, Object> response = new HashMap<>();
            response.put("message", "success");
            response.put("subscriptionId", subscriptionId);
            response.put("updatedItems", updatedItems);  // ✅ 변경된 아이템을 포함하여 응답

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "failed"));
        }
    }


    /**
     * 자동 결제 처리 API
     * - 정기결제 날짜가 되면 자동으로 구독 상품을 결제하고, 회차 정보를 업데이트
     */
    @PostMapping("/process-billing")
    public ResponseEntity<Void> processSubscriptionBilling(@RequestParam Long subscriptionId) {
        subscriptionService.processSubscriptionBilling(subscriptionId);
        return ResponseEntity.ok().build();
    }

    /**
     * 다음 회차에 반영할 상품 추가
     * - 사용자가 다음 회차 결제 시 구매할 상품을 추가하는 기능
     * 이미 있는 상품이면 수량만 증가하는 코드 추가 필요
     * @param newItemDto
     * @return
     */
    @PostMapping("/add-next-item")
    public ResponseEntity<SubscriptionNextItem> addNextSubscriptionItem(
            @RequestBody SubscriptionUpdateNextItemDto newItemDto
    ) {
        // ✅ 서비스에서 추가된 `SubscriptionNextItem`을 반환받음
        SubscriptionNextItem addedItem = subscriptionService.addNextSubscriptionItem(newItemDto.getSubscriptionId(), newItemDto);

        return ResponseEntity.ok(addedItem); // ✅ 추가된 상품 정보를 응답으로 반환
    }


    @DeleteMapping("/delete-next-item")
    public ResponseEntity<?> deleteNextSubscriptionItem(@RequestBody Map<String, Long> request) {
        Long subscriptionId = request.get("subscriptionId");
        Long productId = request.get("productId");

        if (subscriptionId == null || productId == null) {
            return ResponseEntity.badRequest().body("❌ [ERROR] subscriptionId 또는 productId가 없음!");
        }

        boolean deleted = subscriptionService.deleteNextSubscriptionItem(subscriptionId, productId);

        if (deleted) {
            // ✅ JSON 형태로 응답 변경
            return ResponseEntity.ok(Map.of("message", "삭제성공"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "❌ 삭제 실패: 항목을 찾을 수 없음"));
        }
    }


}
