//package com.javalab.student.service;
//
//import com.javalab.student.dto.SubscriptionResponseDto;
//import com.javalab.student.entity.*;
//import com.javalab.student.repository.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDate;
//import java.util.List;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
///**
// * 구독 조회 수정 해지 등의 기능의 비즈니스 로직 구현
// *  구독 로직 정리 후 전체적으로 사용하는 api만 놔두고 정리해야함!!!!!
// */
//@Service
//@RequiredArgsConstructor
//public class SubscriptionService {
//
//    private final SubscriptionRepository subscriptionRepository;
//    private final SubscriptionItemRepository subscriptionItemRepository;
//    private final ProductRepository productRepository;
//    private final MemberRepository memberRepository;
//
//    //  사용자의 정기구독 정보 조회
////    @Transactional(readOnly = true) // 🔥 트랜잭션 범위 내에서 Lazy Loading 허용
////    public Subscription getSubscription(Long memberId) {
////        List<Subscription> subscriptions = subscriptionRepository.findByMemberId(memberId);
////        System.out.println("🔍 [DEBUG] Found Subscriptions: " + subscriptions);
////
////        if (subscriptions.isEmpty()) {
////            throw new RuntimeException("구독 정보가 없습니다."); // 예외 처리 추가
////        }
////
////        Subscription subscription = subscriptions.get(0);
////
////        // 🔥 Lazy Loading 문제 방지: 연관 엔티티 강제 초기화
////        subscription.getMember().getEmail();
////        subscription.getItems().size();
////
////        return subscription;
////    }
//
////    @Transactional(readOnly = true)
////    public SubscriptionResponseDto getSubscription(Long memberId) {
////        List<Subscription> subscriptions = subscriptionRepository.findByMemberId(memberId);
////
////        if (subscriptions.isEmpty()) {
////            throw new RuntimeException("구독 정보가 없습니다.");
////        }
////
////        return new SubscriptionResponseDto(subscriptions.get(0));
////    }
////    @Transactional(readOnly = true)
////    public Subscription getSubscription(Long memberId) {
////    List<Subscription> subscriptions = subscriptionRepository.findByMemberIdOrderByNextBillingDateDesc(memberId);
////
////    if (subscriptions.isEmpty()) {
////        throw new RuntimeException("구독 정보가 없습니다.");
////    }
////
////    return subscriptions.get(0); // 가장 최신 nextBillingDate를 가진 구독 반환
////}
//    /**
//     * 사용자의 가장 최근 결제된 정기구독 정보 조회
//     */
//    @Transactional(readOnly = true)
//    public SubscriptionResponseDto getSubscription(Long memberId) {
//    List<Subscription> subscriptions = subscriptionRepository.findByMemberIdOrderByNextBillingDateDesc(memberId);
//
//    if (subscriptions.isEmpty()) {
//        throw new RuntimeException("구독 정보가 없습니다.");
//    }
//
//    // 🔥 가장 최신 구독 정보를 SubscriptionResponseDto로 변환하여 반환
//    return new SubscriptionResponseDto(subscriptions.get(0));
//    }
//
//    /**
//     * 가장 최신 구독 불러오기
//     * @param memberId
//     * @return
//     */
////    @Transactional(readOnly = true)
////    public Subscription getLatestSubscription(Long memberId) {
////        List<Subscription> subscriptions = subscriptionRepository.findByMemberIdAndStatusOrderByCurrentCycleDesc(memberId, "active");
////
////        if (subscriptions.isEmpty()) {
////            throw new RuntimeException("구독 정보가 없습니다.");
////        }
////
////        return subscriptions.get(0);
////    }
//    @Transactional(readOnly = true)
//    public Subscription getLatestActiveSubscription(Long memberId) {
//        return subscriptionRepository.findFirstByMemberIdAndStatusOrderByCurrentCycleDesc(memberId, "active")
//                .orElseThrow(() -> new RuntimeException("활성화된 구독이 없습니다."));
//    }
//
//
//
//
//    /**
//     * 새로운 구독 생성(최초 구독)
//     */
//    @Transactional
//    public Subscription createSubscription(Member member, List<SubscriptionNextItem> items, String paymentMethod, String deliveryAddress) {
//        Optional<Subscription> latestActiveSubscription = subscriptionRepository.findFirstByMemberIdAndStatusOrderByCurrentCycleDesc(member.getId(), "active");
//
//        if (latestActiveSubscription.isPresent()) {
//            throw new RuntimeException("이미 활성화된 구독이 있습니다.");
//        }
//
//        Subscription subscription = Subscription.builder()
//                .member(member)
//                .startDate(LocalDate.now())
//                .lastBillingDate(LocalDate.now())
//                .nextBillingDate(LocalDate.now().plusMonths(1))
//                .status("active")
//                .paymentMethod(paymentMethod)
//                .deliveryAddress(deliveryAddress)
//                .currentCycle(1)
//                .build();
//
//        subscriptionRepository.save(subscription);
//        subscriptionNextItemRepository.saveAll(items);
//
//        return subscription;
//    }
//
//
//    //  정기구독 제품 추가/수정
//    @Transactional
//    public void updateSubscriptionItems(Long subscriptionId, List<SubscriptionItem> updatedItems) {
//        Subscription subscription = subscriptionRepository.findById(subscriptionId)
//                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
//
//        // 기존 제품 삭제 후 새로운 제품 추가
//        subscriptionItemRepository.deleteAll(subscription.getItems());
//        subscriptionItemRepository.saveAll(updatedItems);
//    }
//
//
//    /**
//     * 결제 완료 시 호출    (최근 결제일 업데이트 & 회차 증가)
//     * @param subscriptionId
//     * @param newBillingDate
//     */
//    @Transactional
//    public void updateBillingDate(Long subscriptionId, LocalDate newBillingDate) {
//        Subscription subscription = subscriptionRepository.findById(subscriptionId)
//                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
//
//        subscription.setLastBillingDate(newBillingDate); // 최근 결제일 업데이트
//        subscription.setNextBillingDate(newBillingDate.plusMonths(1)); // 다음 결제일 자동 계산
//        subscription.setCurrentCycle(subscription.getCurrentCycle() + 1); // 🔥 결제 시 회차 증가
//
//        subscriptionRepository.save(subscription);
//    }
//
//    //  결제수단 변경
//    @Transactional
//    public void updatePaymentMethod(Long subscriptionId, String newMethod) {
//        Subscription subscription = subscriptionRepository.findById(subscriptionId)
//                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
//        subscription.setPaymentMethod(newMethod);
//        subscriptionRepository.save(subscription);
//    }
//
//    //  정기구독 해지
////    @Transactional
////    public void cancelSubscription(Long subscriptionId, boolean immediately) {
////        Subscription subscription = subscriptionRepository.findById(subscriptionId)
////                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
////
////        if (immediately) {
////            subscription.setStatus("cancelled");
////            subscription.setEndDate(LocalDate.now());
////        } else {
////            subscription.setStatus("paused");
////        }
////
////        subscriptionRepository.save(subscription);
////    }
//
//    /**
//     *
//     * @param subscriptionId
//     */
//    @Transactional
//    public void cancelSubscription(Long subscriptionId) {
//        Subscription subscription = subscriptionRepository.findById(subscriptionId)
//                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
//
//        subscription.setStatus("cancelled");
//        subscription.setEndDate(LocalDate.now());
//
//        // 예정된 결제 상품 삭제
//        subscriptionNextItemRepository.deleteAll(subscription.getNextItems());
//
//        subscriptionRepository.save(subscription);
//    }
//
//    /**
//     * 자동 갱신 관련(자동결제)
//     * @param subscriptionId
//     */
//    @Transactional
//    public void processSubscriptionBilling(Long subscriptionId) {
//        Subscription subscription = subscriptionRepository.findById(subscriptionId)
//                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
//
//        if (!subscription.getStatus().equals("active")) {
//            throw new RuntimeException("활성화된 구독이 아닙니다.");
//        }
//
//        // 기존 SubscriptionItem 삭제
//        subscriptionItemRepository.deleteAll(subscription.getItems());
//
//        // SubscriptionNextItem → SubscriptionItem으로 복사
//        List<SubscriptionItem> newItems = subscription.getNextItems().stream()
//                .map(nextItem -> SubscriptionItem.builder()
//                        .subscription(subscription)
//                        .product(nextItem.getProduct())
//                        .quantity(nextItem.getQuantity())
//                        .price(nextItem.getPrice())
//                        .build())
//                .collect(Collectors.toList());
//
//        subscriptionItemRepository.saveAll(newItems);
//
//        // SubscriptionNextItem 삭제
//        subscriptionNextItemRepository.deleteAll(subscription.getNextItems());
//
//        // 회차 증가 및 결제일 갱신
//        subscription.setCurrentCycle(subscription.getCurrentCycle() + 1);
//        subscription.setLastBillingDate(subscription.getNextBillingDate());
//        subscription.setNextBillingDate(subscription.getNextBillingDate().plusMonths(1));
//
//        subscriptionRepository.save(subscription);
//    }
//
//    /**
//     * 다음결제 추가항 상품 추가 / 삭제
//     * @param subscriptionId
//     * @param updatedItems
//     */
//    @Transactional
//    public void updateNextSubscriptionItems(Long subscriptionId, List<SubscriptionNextItem> updatedItems) {
//        Subscription subscription = subscriptionRepository.findById(subscriptionId)
//                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
//
//        // 기존 예정 상품 삭제 후 새로운 상품 추가
//        subscriptionNextItemRepository.deleteAll(subscription.getNextItems());
//        subscriptionNextItemRepository.saveAll(updatedItems);
//    }
//
////    /**
////     * 구독 재시작 (1회차부터 새로 시작) 근데 구독 재 시작 기능이 필요한가? 그냥 create 할때 active인게 있는지 확인하면 되는거 아닌가?
////     * 좀더 판단해 보고 삭제 예정
////     */
////    @Transactional
////    public Subscription restartSubscription(Long memberId) {
////        if (!canRestartSubscription(memberId)) {
////            throw new RuntimeException("재시작할 수 있는 구독이 없습니다.");
////        }
////
////        return createSubscription(memberId, "카드결제", "기본 배송지"); // 기본값 사용
////    }
////    /**
////     * 사용자가 구독을 재시작할 수 있는지 확인
////     */
////    @Transactional(readOnly = true)
////    public boolean canRestartSubscription(Long memberId) {
////        return subscriptionRepository.existsByMemberIdAndStatus(memberId, "cancelled");
////    }
//
////    /**
////     * 기존 구독이 없거나, 종료된 경우 새 구독 생성 또는 재시작
////     */
////    @Transactional
////    public Subscription startOrRestartSubscription(Long memberId, String paymentMethod, String deliveryAddress) {
////        // 기존 활성화된 구독이 있는지 확인
////        List<Subscription> activeSubscriptions = subscriptionRepository.findByMemberIdAndStatus(memberId, "active");
////
////        if (!activeSubscriptions.isEmpty()) {
////            throw new RuntimeException("이미 활성화된 구독이 존재합니다.");
////        }
////
////        // 재시작할 구독이 있는지 확인
////        if (canRestartSubscription(memberId)) {
////            return restartSubscription(memberId);
////        }
////
////        // 새 구독 생성
////        return createSubscription(memberId, paymentMethod, deliveryAddress);
////    }
//
//    /**
//     *  구독 정보 수정 (상품 추가/삭제, 결제일 변경, 결제수단 변경, 배송정보 변경)
//     * @param subscriptionId
//     * @param newBillingDate
//     * @param newPaymentMethod
//     * @param newDeliveryAddress
//     */
//    @Transactional
//    public void updateSubscriptionInfo(Long subscriptionId, LocalDate newBillingDate, String newPaymentMethod, String newDeliveryAddress) {
//        Subscription subscription = subscriptionRepository.findById(subscriptionId)
//                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
//
//        if (newBillingDate != null) {
//            subscription.setNextBillingDate(newBillingDate);
//        }
//        if (newPaymentMethod != null) {
//            subscription.setPaymentMethod(newPaymentMethod);
//        }
//        if (newDeliveryAddress != null) {
//            subscription.setDeliveryAddress(newDeliveryAddress);
//        }
//
//        subscriptionRepository.save(subscription);
//    }
//
//}