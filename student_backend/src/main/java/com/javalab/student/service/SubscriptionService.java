package com.javalab.student.service;

import com.javalab.student.dto.SubscriptionResponseDto;
import com.javalab.student.dto.SubscriptionUpdateNextItemDto;
import com.javalab.student.dto.SubscriptionUpdateNextItemRequestDto;
import com.javalab.student.entity.Subscription;
import com.javalab.student.entity.SubscriptionItem;
import com.javalab.student.entity.SubscriptionNextItem;
import com.javalab.student.repository.ProductRepository;
import com.javalab.student.repository.SubscriptionItemRepository;
import com.javalab.student.repository.SubscriptionNextItemRepository;
import com.javalab.student.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 구독 관련 서비스 클래스
 * - 구독 정보 조회, 생성, 수정, 취소 등의 비즈니스 로직을 처리
 */
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionItemRepository subscriptionItemRepository;
    private final SubscriptionNextItemRepository subscriptionNextItemRepository;
    private final ProductRepository productRepository;

    /**
     * 사용자의 최신 구독 정보 조회
     */
    /**
     * 사용자의 최신 활성화된 구독 정보 조회
     */
    @Transactional(readOnly = true)
    public SubscriptionResponseDto getSubscription(Long memberId) {
        Subscription subscription = subscriptionRepository
                .findFirstByMemberIdAndStatusOrderByCurrentCycleDesc(memberId, "ACTIVE")
                .orElseThrow(() -> new RuntimeException("활성화된 구독 정보가 없습니다."));

        return new SubscriptionResponseDto(subscription);
    }

    /**
     * 새로운 구독 생성
     */
    @Transactional
    public Subscription createSubscription(Long memberId, String paymentMethod, String deliveryAddress) {
        Optional<Subscription> latestActiveSubscription = subscriptionRepository
                .findFirstByMemberIdAndStatusOrderByCurrentCycleDesc(memberId, "active");

        if (latestActiveSubscription.isPresent()) {
            throw new RuntimeException("이미 활성화된 구독이 있습니다.");
        }

        Subscription subscription = Subscription.builder()
                .startDate(LocalDate.now())
                .lastBillingDate(LocalDate.now())
                .nextBillingDate(LocalDate.now().plusMonths(1))
                .status("active")
                .paymentMethod(paymentMethod)
                .deliveryAddress(deliveryAddress)
                .currentCycle(1)
                .build();

        return subscriptionRepository.save(subscription);
    }

    /**
     * 결제일 업데이트
     */
    @Transactional
    public void updateBillingDate(Long subscriptionId, LocalDate newBillingDate) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
        subscription.setLastBillingDate(newBillingDate);
        subscription.setNextBillingDate(newBillingDate.plusMonths(1));
        subscription.setCurrentCycle(subscription.getCurrentCycle() + 1);
        subscriptionRepository.save(subscription);
    }

    /**
     * 결제수단 변경
     */
    @Transactional
    public void updatePaymentMethod(Long subscriptionId, String newMethod) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
        subscription.setPaymentMethod(newMethod);
        subscriptionRepository.save(subscription);
    }

    /**
     * 배송정보 변경
     */
    @Transactional
    public void updateDeliveryAddress(Long subscriptionId, String newAddress) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
        subscription.setDeliveryAddress(newAddress);
        subscriptionRepository.save(subscription);
    }

    /**
     * 구독 취소
     */
    @Transactional
    public void cancelSubscription(Long subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));
        subscription.setStatus("cancelled");
        subscription.setEndDate(LocalDate.now());
        subscriptionRepository.save(subscription);
    }

    /**
     * 구독 정보 업데이트 (결제일, 결제수단, 배송정보)
     */
    @Transactional
    public void updateSubscriptionInfo(Long subscriptionId, LocalDate newBillingDate, String newPaymentMethod, String newDeliveryAddress) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));

        if (newBillingDate != null) {
            subscription.setNextBillingDate(newBillingDate);
        }
        if (newPaymentMethod != null) {
            subscription.setPaymentMethod(newPaymentMethod);
        }
        if (newDeliveryAddress != null) {
            subscription.setDeliveryAddress(newDeliveryAddress);
        }

        subscriptionRepository.save(subscription);
    }

    /**
     * 다음 회차에 반영할 상품 추가/삭제
     * - 사용자가 직접 다음 회차에 반영될 상품을 관리할 수 있도록 지원
     * - 기존 SubscriptionNextItem을 삭제하고 새롭게 저장
     */
    @Transactional
    public void updateNextSubscriptionItems(Long subscriptionId, List<SubscriptionUpdateNextItemDto> updatedItems) {
        if (updatedItems == null || updatedItems.isEmpty()) {
            throw new RuntimeException("업데이트할 상품 목록이 비어 있습니다.");
        }

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));

        // 기존 예정 상품 삭제
        subscriptionNextItemRepository.deleteBySubscriptionId(subscriptionId);

        // 새로운 상품 추가
        List<SubscriptionNextItem> nextItems = updatedItems.stream().map(dto -> {
            SubscriptionNextItem item = new SubscriptionNextItem();
            item.setSubscription(subscription);
            item.setProduct(productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new RuntimeException("상품 정보를 찾을 수 없습니다.")));
            item.setNextMonthQuantity(dto.getNextMonthQuantity());
            item.setNextMonthPrice(dto.getNextMonthPrice());
            return item;
        }).collect(Collectors.toList());

        subscriptionNextItemRepository.saveAll(nextItems);
    }



    /**
     * 자동 결제 처리 (매월 결제일에 호출)
     * - 다음 결제일이 되면 자동으로 결제를 처리하고 구독 정보를 갱신
     */
    @Transactional
    public void processSubscriptionBilling(Long subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));

        if (!subscription.getStatus().equals("active")) {
            throw new RuntimeException("활성화된 구독이 아닙니다.");
        }

        // 기존 SubscriptionItem 삭제
        subscriptionItemRepository.deleteAll(subscription.getItems());

        // SubscriptionNextItem → SubscriptionItem으로 복사
        List<SubscriptionItem> newItems = subscription.getNextItems().stream()
                .map(nextItem -> SubscriptionItem.builder()
                        .subscription(subscription)
                        .product(nextItem.getProduct())
                        .quantity(nextItem.getNextMonthQuantity())
                        .price(nextItem.getNextMonthPrice())
                        .build())
                .collect(Collectors.toList());

        subscriptionItemRepository.saveAll(newItems);

        // SubscriptionNextItem 삭제
        subscriptionNextItemRepository.deleteAll(subscription.getNextItems());

        // 회차 증가 및 결제일 갱신
        subscription.setCurrentCycle(subscription.getCurrentCycle() + 1);
        subscription.setLastBillingDate(subscription.getNextBillingDate());
        subscription.setNextBillingDate(subscription.getNextBillingDate().plusMonths(1));

        subscriptionRepository.save(subscription);
    }

    /**
     * 다음 결제일이 가장 최근인 구독을 가져오는 메서드(추 후 결제로직에 사용가능성 있어서 만듬
     * 예를들어 구독아이템 즉시결제 등
     * @param memberId
     * @return
     */
    @Transactional(readOnly = true)
    public Subscription getNextBillingSubscription(Long memberId) {
        return subscriptionRepository.findFirstByMemberIdAndStatusOrderByNextBillingDateDesc(memberId, "active")
                .orElseThrow(() -> new RuntimeException("다음 결제일이 예정된 활성화된 구독이 없습니다."));
    }

}

//그리고 일단 api 테스트만 해볼라고 지금 수정중이었는데
//궁극적으로는 저 로직은 최종적으로
//다음결제 상품을 현재 들어 가 있는 상품중 선택해서 삭제하거나  프로덕트 디비에서 조회해와서 (나중에 기능구현 끝나고 모달로예정- 지금은 아님) 상품을 추가할 수 있게 할거야
//지금은 구현단계니까 프로덕트 아이디 1~10번 불러와서 선택해서 추가할 수 있게 하면 될 듯?
//나중에는 모달창으로 상품 카테고리별로 또 이름검색으로 검색해서 추가할 수있게 할 예정임
//그다음에 수량 선택하고 그러면 개당가격하고 수량에따른 가격나오고
//완전 합계 나오고
//이렇게 된 다음 다음결제 상품 업데이트 누르면 디비에 현재 구독 아이디로 서브스크립션 넥스트 아이템에 추가되는거지 거기에 들어갈 넥스트 먼스 프라이스는 프로덕트에서 조회해서 방금 설정한 수량대로 계산되어 넣고 넥스트 먼스 퀀티티는 방금 추가나 수정할때 선택한걸로 들어가고 프로덕트아이디도 넣고
//일단 지금은 모달없이 구현해보자 이해됐어?