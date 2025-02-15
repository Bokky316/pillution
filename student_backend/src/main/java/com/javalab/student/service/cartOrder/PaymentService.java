package com.javalab.student.service.cartOrder;

import com.javalab.student.constant.OrderStatus;
import com.javalab.student.dto.cartOrder.OrderDto;
import com.javalab.student.dto.cartOrder.PaymentRequestDto;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.cartOrder.CartItem;
import com.javalab.student.entity.cartOrder.Order;
import com.javalab.student.entity.cartOrder.Payment;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.cartOrder.CartItemRepository;
import com.javalab.student.repository.cartOrder.OrderRepository;
import com.javalab.student.repository.cartOrder.PaymentRepository;
import com.javalab.student.service.SubscriptionService;
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
    private final MemberRepository memberRepository;
    private final SubscriptionService subscriptionService;

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

        // 5. 응답 데이터 구성
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
                .orElseThrow(() -> new EntityNotFoundException("멤버를 찾을 수 없습니다."));
        List<OrderDto> orderDtoList = new ArrayList<>();
        log.info("이메일"+email);
        List<CartItem> cartItems = new ArrayList<>();

        BigDecimal totalOrderAmount = BigDecimal.ZERO; //총 가격
        // 1. CartOrderRequestDto에서 CartOrderItem들을 가져옴
        List<CartItem> cartItem= cartItemRepository.findAll();

        for (CartItem item : cartItem){
            if(item.getCart().getMember().getEmail().equals(email)){
                cartItems.add(item);
            }
        }

        // 2. CartOrderItem들을 OrderDto로 변환
        for (CartItem cartItem1 : cartItems) {
            log.info("cartItem1"+cartItem1.getProduct().getPrice());
            OrderDto orderDto = OrderDto.builder()
                    .productId(cartItem1.getProduct().getId())
                    .count(cartItem1.getQuantity())
                    .build();
            log.info("price"+cartItem1.getProduct().getPrice());
            totalOrderAmount = totalOrderAmount.add(cartItem1.getProduct().getPrice().multiply(new BigDecimal(cartItem1.getQuantity())));
            orderDtoList.add(orderDto);
        }
        log.info("orderDtoList"+orderDtoList);

        Order order = Order.builder()
                .member(member)
                .orderDate(java.time.LocalDateTime.now())
                .orderStatus(OrderStatus.ORDERED)
                .orderAmount(totalOrderAmount)
                .build();
        log.info("토탈 오더"+totalOrderAmount);
        orderRepository.save(order);

        return order;
    }

    /**
     * 포트원 API를 사용하여 결제 정보를 조회하고 검증합니다.
     * @param requestDto 결제 요청 정보
     * @param order 주문 정보
     */
    private void verifyPayment(PaymentRequestDto requestDto, Order order) {
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

        BigDecimal paidAmount = paymentInfo.getAmount();
        if (paidAmount.compareTo(requestDto.getPaidAmount()) != 0) {
            throw new IllegalArgumentException("❌ 결제 금액 불일치: 요청 금액=" + requestDto.getPaidAmount() + ", 실제 결제 금액=" + paidAmount);
        }
    }

    /**
     * 결제 정보를 저장합니다.
     * @param requestDto 결제 요청 정보
     * @param order 주문 정보
     * @return Payment 결제 정보
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
     * @param payment 결제 정보
     * @return 응답 데이터
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
}
