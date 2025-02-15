package com.javalab.student.service.cartOrder;

import com.javalab.student.constant.OrderStatus;
import com.javalab.student.dto.cartOrder.CartDetailDto;
import com.javalab.student.dto.cartOrder.OrderDto;
import com.javalab.student.dto.cartOrder.PaymentRequestDto;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.Product;
import com.javalab.student.entity.cartOrder.*;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.ProductRepository;
import com.javalab.student.repository.cartOrder.CartItemRepository;
import com.javalab.student.repository.cartOrder.CartRepository;
import com.javalab.student.repository.cartOrder.OrderRepository;
import com.javalab.student.repository.cartOrder.PaymentRepository;
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
    private final CartRepository cartRepository;
    private final MemberRepository memberRepository;

    /**
     * 결제를 처리하고 검증합니다.
     *
     * @param requestDto  결제 요청 정보
     * @param email       사용자 이메일
     * @param purchaseType 구매 유형 ('oneTime' 또는 'subscription')
     * @return 처리된 결제 정보
     */
    @Transactional
    public Map<String, Object> processPayment(PaymentRequestDto requestDto, String email, String purchaseType) {
        log.info("🔹 결제 검증 시작: {}", requestDto);

        // 1. 주문 생성 및 정보 조회
        Order order = createOrder(requestDto, email, purchaseType);

        // 2. 포트원 API를 사용하여 결제 정보 조회 및 검증
        verifyPayment(requestDto, order);

        // 3. Payment 엔티티 생성 및 저장
        Payment payment = createAndSavePayment(requestDto, order);

        // 4. 주문 상태 업데이트
        order.setOrderStatus(OrderStatus.PAYMENT_COMPLETED);
        orderRepository.save(order);

        // 5. 장바구니 비우기
        clearCart(email);

        // 6. 응답 데이터 구성
        return createResponseData(payment);
    }

    /**
     * 장바구니 상품들을 주문으로 변환하고 처리합니다.
     * @param requestDto 결제 요청 정보
     * @param email 사용자 이메일
     * @param purchaseType 구매 유형 ('oneTime' 또는 'subscription')
     * @return 주문 객체
     */
    @Transactional
    public Order createOrder(PaymentRequestDto requestDto, String email, String purchaseType) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        Cart cart = cartRepository.findByMemberMemberId(member.getMemberId())
                .orElseThrow(() -> new EntityNotFoundException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCartCartId(cart.getCartId());
        BigDecimal totalOrderAmount = BigDecimal.ZERO;

        List<OrderDto> orderDtoList = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            OrderDto orderDto = OrderDto.builder()
                    .productId(cartItem.getProduct().getId())
                    .count(cartItem.getQuantity())
                    .build();
            orderDtoList.add(orderDto);
            totalOrderAmount = totalOrderAmount.add(cartItem.getProduct().getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        Order order = Order.builder()
                .member(member)
                .orderDate(java.time.LocalDateTime.now())
                .orderStatus(OrderStatus.ORDERED)
                .orderAmount(totalOrderAmount)
                .build();

        return orderRepository.save(order);
    }

    /**
     * 포트원 API를 사용하여 결제 정보를 조회하고 검증합니다.
     */
    private void verifyPayment(PaymentRequestDto requestDto, Order order) {
        try {
            IamportResponse<com.siot.IamportRestClient.response.Payment> paymentResponse =
                    iamportClient.paymentByImpUid(requestDto.getImpUid());

            if (paymentResponse.getResponse() == null) {
                throw new IllegalArgumentException("❌ 결제 정보 없음: imp_uid=" + requestDto.getImpUid());
            }

            BigDecimal paidAmount = paymentResponse.getResponse().getAmount();
            if (paidAmount.compareTo(requestDto.getPaidAmount()) != 0) {
                throw new IllegalArgumentException("❌ 결제 금액 불일치: 요청 금액=" + requestDto.getPaidAmount() + ", 실제 결제 금액=" + paidAmount);
            }
        } catch (IamportResponseException | IOException e) {
            throw new IllegalArgumentException("❌ 포트원 결제 검증 실패: " + e.getMessage());
        }
    }

    /**
     * 결제 정보를 저장합니다.
     */
    private Payment createAndSavePayment(PaymentRequestDto requestDto, Order order) {
        Payment payment = Payment.builder()
                .order(order)
                .impUid(requestDto.getImpUid())
                .itemNm(requestDto.getName())
                .orderStatus(OrderStatus.PAYMENT_COMPLETED)
                .amount(requestDto.getPaidAmount())
                .paymentMethod(requestDto.getPayMethod())
                .buyerEmail(requestDto.getBuyerEmail())
                .buyerName(requestDto.getBuyerName())
                .buyerTel(requestDto.getBuyerTel())
                .buyerAddr(requestDto.getBuyerAddr())
                .buyerPostcode(requestDto.getBuyerPostcode())
                .paidAt(requestDto.getPaidAt())
                .build();
        return paymentRepository.save(payment);
    }

    /**
     * 응답 데이터를 생성합니다.
     */
    private Map<String, Object> createResponseData(Payment payment) {
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
     * 장바구니를 비웁니다.
     */
    private void clearCart(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("해당 이메일로 멤버를 찾을 수 없습니다: " + email));
        Cart cart = cartRepository.findByMemberMemberId(member.getMemberId())
                .orElseThrow(() -> new EntityNotFoundException("Cart not found"));
        List<CartItem> cartItems = cartItemRepository.findByCartCartId(cart.getCartId());
        cartItemRepository.deleteAll(cartItems);
    }
}
