package com.javalab.student.service.cartOrder;

import com.javalab.student.constant.OrderStatus;
import com.javalab.student.dto.cartOrder.CartOrderRequestDto;
import com.javalab.student.dto.cartOrder.PaymentRequestDto;
import com.javalab.student.dto.cartOrder.CartOrderDto;
import com.javalab.student.dto.cartOrder.OrderDto;
import com.javalab.student.entity.cartOrder.Order;
import com.javalab.student.entity.cartOrder.Payment;
import com.javalab.student.entity.cartOrder.CartItem;
import com.javalab.student.repository.cartOrder.OrderRepository;
import com.javalab.student.repository.cartOrder.PaymentRepository;
import com.javalab.student.repository.cartOrder.CartItemRepository;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.response.IamportResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 결제 서비스 (포트원 SDK 적용)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final IamportClient iamportClient;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderService orderService;
    /**
     * 결제를 처리하고 검증합니다.
     *
     * @param requestDto 결제 요청 정보
     * @return 처리된 결제 정보
     */
    @Transactional
    public Map<String, Object> processPayment(PaymentRequestDto requestDto) {
        log.info("🔹 결제 검증 시작: {}", requestDto);

        // 주문 정보 조회
        Order order = orderRepository.findById(requestDto.getMerchantUid())
                .orElseThrow(() -> new IllegalArgumentException("❌ 주문 정보를 찾을 수 없습니다: " + requestDto.getMerchantUid()));

        // 포트원 API를 사용하여 결제 정보 조회 및 검증
        IamportResponse<com.siot.IamportRestClient.response.Payment> paymentResponse;
        try {
            paymentResponse = iamportClient.paymentByImpUid(requestDto.getImpUid());
        } catch (IamportResponseException | IOException e) {
            throw new IllegalArgumentException("❌ 포트원 결제 검증 실패: " + e.getMessage());
        }

        com.siot.IamportRestClient.response.Payment paymentInfo = paymentResponse.getResponse();
        if (paymentInfo == null) {
            throw new IllegalArgumentException("❌ 결제 정보 없음: imp_uid=" + requestDto.getImpUid());
        }

        // 결제 금액 검증
        BigDecimal paidAmount = paymentInfo.getAmount();
        if (paidAmount.compareTo(requestDto.getPaidAmount()) != 0) {
            throw new IllegalArgumentException("❌ 결제 금액 불일치: 요청 금액=" + requestDto.getPaidAmount() + ", 실제 결제 금액=" + paidAmount);
        }

        // Payment 엔티티 생성 및 저장
        Payment payment = Payment.builder()
                .order(order)
                .impUid(requestDto.getImpUid())
                .itemNm(requestDto.getName())
                .orderStatus(OrderStatus.PAYMENT_COMPLETED)
                .amount(paidAmount)
                .paymentMethod(requestDto.getPayMethod())
                .buyerEmail(requestDto.getBuyerEmail())
                .buyerName(requestDto.getBuyerName())
                .buyerTel(requestDto.getBuyerTel())
                .buyerAddr(requestDto.getBuyerAddr())
                .buyerPostcode(requestDto.getBuyerPostcode())
                .paidAt(requestDto.getPaidAt())
                .build();

        paymentRepository.save(payment);
        log.info("✅ 결제 정보 저장 완료: {}", payment);

        // 주문 상태 업데이트
        order.setOrderStatus(OrderStatus.PAYMENT_COMPLETED);
        orderRepository.save(order);

        // 응답 데이터 구성
        Map<String, Object> response = new HashMap<>();
        response.put("paymentId", payment.getId());
        response.put("impUid", payment.getImpUid());
        response.put("merchantUid", payment.getOrder().getId());
        response.put("amount", payment.getAmount());
        response.put("paymentMethod", payment.getPaymentMethod());
        response.put("status", payment.getOrderStatus());
        response.put("paidAt", payment.getPaidAt());

        return response;
    }
    /**
     * 장바구니 상품들을 주문으로 변환하고 처리합니다.
     *
     * @param cartOrderRequestDto 장바구니 주문 요청 DTO
     * @param email 사용자 이메일
     * @return 생성된 주문의 ID
     */
    @Transactional
    public Long orderCartItem(CartOrderRequestDto cartOrderRequestDto, String email) {
        List<OrderDto> orderDtoList = new ArrayList<>();
        for (CartOrderRequestDto.CartOrderItem cartOrderItem : cartOrderRequestDto.getCartOrderItems()) {
            CartItem cartItem = cartItemRepository
                    .findById(cartOrderItem.getCartItemId())
                    .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 찾을 수 없습니다."));
            OrderDto orderDto = new OrderDto();
            orderDto.setProductId(cartItem.getProduct().getId());
            orderDto.setCount(cartOrderItem.getQuantity());
            orderDtoList.add(orderDto);
        }

        Long orderId = orderService.orders(orderDtoList, email);

        for (CartOrderRequestDto.CartOrderItem cartOrderItem : cartOrderRequestDto.getCartOrderItems()) {
            CartItem cartItem = cartItemRepository
                    .findById(cartOrderItem.getCartItemId())
                    .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 찾을 수 없습니다."));
            cartItemRepository.delete(cartItem);
        }

        return orderId;
    }
}
