package com.javalab.student.controller.cartOrder;

import com.fasterxml.jackson.annotation.JsonView;
import com.javalab.student.config.portone.PortOneProperties;
import com.javalab.student.dto.SubscriptionItemDto;
import com.javalab.student.dto.cartOrder.*;
import com.javalab.student.entity.Subscription;
import com.javalab.student.service.SubscriptionService;
import com.javalab.student.service.cartOrder.PaymentService;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.entity.Member;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.security.Principal;
import java.time.LocalDate;
import java.util.Map;

import com.javalab.student.entity.cartOrder.Order;
import org.springframework.http.HttpStatus;
import jakarta.persistence.EntityNotFoundException;
import com.javalab.student.dto.cartOrder.OrderDto;
import java.util.stream.Collectors;
import java.util.List;
import com.javalab.student.dto.SubscriptionUpdateNextItemDto;
import com.javalab.student.dto.cartOrder.OrderItemDto;
/**
 * 결제 관련 API를 처리하는 컨트롤러
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final SubscriptionService subscriptionService;
    private final MemberRepository memberRepository;
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

        String email = principal.getName();
        Member member = memberRepository.findByEmail(email);
        if (member == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "사용자를 찾을 수 없습니다."));
        }

        try {
            // 1. 결제 처리: PaymentService를 사용하여 결제를 처리하고 결과를 받습니다.
            Map<String, Object> paymentResult = paymentService.processPayment(requestDto, email, purchaseType);

            // 2. 구독 처리 (정기 구독 결제인 경우에만)
            if ("subscription".equals(purchaseType)) {
                log.info("정기 구독 결제 시작");

                // 3. 사용자가 기존 구독자인지 확인합니다.
                boolean isSubscribed = false;
                try {
                    subscriptionService.getSubscription(member.getId());
                    isSubscribed = true;
                } catch (RuntimeException e) {
                    // 활성화된 구독 정보가 없는 경우
                    isSubscribed = false;
                }

                if (isSubscribed) {
                    log.info("기존 구독자입니다. 다음 결제 상품 목록을 업데이트합니다.");
                    // 4. 기존 구독자인 경우: 다음 결제 상품 목록을 업데이트합니다.
                    List<SubscriptionUpdateNextItemDto> updatedItems = requestDto.getCartOrderItems().stream()
                            .map(item -> {
                                SubscriptionUpdateNextItemDto dto = new SubscriptionUpdateNextItemDto();
                                dto.setProductId(item.getCartItemId());
                                dto.setNextMonthQuantity(item.getQuantity());
                                dto.setNextMonthPrice(item.getPrice().doubleValue());
                                return dto;
                            })
                            .collect(Collectors.toList());
                    // SubscriptionService의 updateNextSubscriptionItems 메소드를 호출하여 다음 결제 상품 목록을 업데이트합니다.
                    subscriptionService.updateNextSubscriptionItems(member.getId(), updatedItems);
                } else {
                    log.info("새로운 구독자입니다. 새로운 구독을 생성하고 상품 목록을 업데이트합니다.");
                    // 5. 새로운 구독자인 경우: 새로운 구독을 생성하고 현재 및 다음 결제 상품 목록을 업데이트합니다.
                    List<SubscriptionUpdateNextItemDto> items = requestDto.getCartOrderItems().stream()
                            .map(item -> {
                                SubscriptionUpdateNextItemDto dto = new SubscriptionUpdateNextItemDto();
                                dto.setProductId(item.getCartItemId());
                                dto.setNextMonthQuantity(item.getQuantity());
                                dto.setNextMonthPrice(item.getPrice().doubleValue());
                                return dto;
                            })
                            .collect(Collectors.toList());

                    subscriptionService.createSubscription(
                            member.getId(),
                            requestDto.getPayMethod(),
                            requestDto.getBuyerPostcode(),
                            requestDto.getBuyerAddr(),
                            requestDto.getBuyerAddr(), // 상세 주소가 별도로 없다면 이렇게 사용
                            items
                    );
                }
            }

            log.info("결제 처리 완료: {}", paymentResult);
            return ResponseEntity.ok(paymentResult);

        } catch (EntityNotFoundException e) {
            log.error("결제 처리 중 EntityNotFoundException 발생", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "관련 정보를 찾을 수 없습니다: " + e.getMessage()));
        } catch (Exception e) {
            log.error("결제 처리 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "결제 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
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
        // PaymentRequestDto 내용 로깅
        log.info("PaymentRequestDto 내용: {}", requestDto);
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

    /**
     * Order 엔티티를 OrderDto로 변환하는 메서드
     *
     * @param order 변환할 Order 엔티티
     * @return OrderDto 변환된 OrderDto 객체
     */
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
                .id(order.getId())
                .memberId(order.getMember().getId())
                .orderDate(order.getOrderDate())
                .orderStatus(order.getOrderStatus())
                .amount(order.getAmount())
                .waybillNum(order.getWaybillNum())
                .parcelCd(order.getParcelCd())
                .orderItems(orderItemDtos)
                .build();
    }

    /**
     * 관리자 주문 취소 API
     * @param orderId 취소할 주문 ID
     * @return 성공 메시지 또는 에러 응답
     */
    @PostMapping("/admin/orders/{orderId}/cancel") //
    @PreAuthorize("hasRole('ADMIN')") // Spring Security 설정과 연동, ADMIN 권한만 접근 가능하도록 설정
    public ResponseEntity<?> cancelOrderAdmin(@PathVariable("orderId") Long orderId) {
        log.info("관리자 주문 취소 요청 - 주문 ID: {}", orderId);
        try {
            paymentService.cancelOrderAdmin(orderId); // PaymentService의 주문 취소 메소드 호출
            return ResponseEntity.ok("주문이 성공적으로 취소되었습니다."); // 성공 응답
        } catch (IllegalStateException e) {
            // 이미 취소된 주문, 배송 시작된 주문 등의 비즈니스 로직 예외 처리
            log.warn("주문 취소 실패 - {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); // 400 Bad Request 응답
        } catch (EntityNotFoundException e) {
            // 주문을 찾을 수 없는 경우
            log.error("주문 취소 실패 - 주문 ID {} not found", orderId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); // 404 Not Found 응답
        } catch (Exception e) {
            // 기타 예외 발생
            log.error("주문 취소 실패 - 예기치 않은 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("주문 취소 중 오류가 발생했습니다."); // 500 Internal Server Error 응답
        }
    }

    /**
     * 관리자 주문 목록 조회 API (검색 기능 및 기간 검색 기능 추가)
     * 페이징 네이션 처리가 되어 있으며, DataGrid에 맞춰 AdminOrderDto 리스트와 페이징 정보를 반환합니다.
     *
     * @param page 페이지 번호 (기본값 0)
     * @param size 페이지 크기 (기본값 10)
     * @param memberName 검색할 회원 이름
     * @param startDate 검색할 시작 주문일자
     * @param endDate 검색할 종료 주문일자
     * @return 관리자 주문 목록 및 페이징 정보
     */
    @GetMapping("/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminOrders(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "memberName", required = false) String memberName,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate, // LocalDate 타입으로 변경
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) { // LocalDate 타입으로 변경
        Map<String, Object> orders = paymentService.getAdminOrders(page, size, memberName, startDate, endDate); // Service 호출 시 날짜 파라미터 전달
        return ResponseEntity.ok(orders);
    }

    /**
     * 관리자가 주문 상태를 변경하는 API 엔드포인트
     * @param orderId 상태를 변경할 주문 ID
     * @param updateDto 새로운 주문 상태 정보를 담은 DTO
     * @return 성공/실패 여부 및 메시지
     */
    @PutMapping("/admin/orders/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(@PathVariable("orderId") Long orderId,
                                               @RequestBody OrderStatusUpdateDto updateDto) {
        log.info("주문 상태 변경 요청 - 주문 ID: {}, 새로운 상태: {}", orderId, updateDto.getStatus());
        try {
            paymentService.updateOrderStatus(orderId, updateDto.getStatus());
            return ResponseEntity.ok("주문 상태가 성공적으로 변경되었습니다.");
        } catch (EntityNotFoundException e) {
            log.error("주문 상태 변경 실패 - 주문 ID {} not found", orderId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            log.warn("주문 상태 변경 실패 - {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 상태 변경 실패 - 예기치 않은 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("주문 상태 변경 중 오류가 발생했습니다.");
        }
    }


}

