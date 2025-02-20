package com.javalab.student.service.subscription;

import com.javalab.student.dto.Subscription.SubscriptionResponseDto;
import com.javalab.student.dto.Subscription.SubscriptionUpdateNextItemDto;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.product.Product;
import com.javalab.student.entity.subscription.Subscription;
import com.javalab.student.entity.subscription.SubscriptionItem;
import com.javalab.student.entity.subscription.SubscriptionNextItem;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.product.ProductRepository;
import com.javalab.student.repository.SubscriptionItemRepository;
import com.javalab.student.repository.SubscriptionNextItemRepository;
import com.javalab.student.repository.SubscriptionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private final MemberRepository memberRepository;
    private static final Logger log = LoggerFactory.getLogger(SubscriptionService.class);

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
                .orElseThrow(() -> new EntityNotFoundException("활성화된 구독 정보가 없습니다."));

        // ✅ nextItems에서 productId가 없는 경우 product에서 가져오기
        subscription.getNextItems().forEach(item -> {
            if (item.getProductId() == null && item.getProduct() != null) {
                item.setProductId(item.getProduct().getId()); // ✅ productId 추가
            }
        });

        // ✅ SubscriptionItem에서 상품 이미지 추가
        subscription.getItems().forEach(item -> {
            if (item.getProduct() != null) {
                item.getProduct().setMainImageUrl(item.getProduct().getMainImageUrl());
            }
        });

        // ✅ SubscriptionNextItem에서 상품 이미지 추가
        subscription.getNextItems().forEach(item -> {
            if (item.getProduct() != null) {
                item.getProduct().setMainImageUrl(item.getProduct().getMainImageUrl());
            }
        });

        return new SubscriptionResponseDto(subscription);
    }

    /**
     * 새로운 구독 생성 (구독, 구독 아이템, 구독 넥스트 아이템 추가)
     */
    @Transactional
    public Subscription createSubscription(Long memberId, String paymentMethod, String postalCode, String roadAddress, String detailAddress, List<SubscriptionUpdateNextItemDto> items) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다: " + memberId));

        // 이미 활성화된 구독이 있는지 확인
        Optional<Subscription> existingSubscription = subscriptionRepository.findFirstByMemberIdAndStatusOrderByCurrentCycleDesc(memberId, "ACTIVE");

        Subscription subscription;
        if (existingSubscription.isPresent()) {
            // 이미 활성화된 구독이 있으면 해당 구독을 업데이트
            subscription = existingSubscription.get();
            subscription.setPaymentMethod(paymentMethod);
            subscription.setPostalCode(postalCode);
            subscription.setRoadAddress(roadAddress);
            subscription.setDetailAddress(detailAddress);
        } else {
            // 활성화된 구독이 없으면 새로 생성
            subscription = Subscription.builder()
                    .member(member)
                    .startDate(LocalDate.now())
                    .lastBillingDate(LocalDate.now())
                    .nextBillingDate(LocalDate.now().plusMonths(1))
                    .status("ACTIVE")
                    .paymentMethod(paymentMethod)
                    .postalCode(postalCode)
                    .roadAddress(roadAddress)
                    .detailAddress(detailAddress)
                    .currentCycle(1)
                    .build();
        }

        subscription = subscriptionRepository.save(subscription);

        // 현재 구독 아이템 추가 또는 업데이트
        for (SubscriptionUpdateNextItemDto item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("상품을 찾을 수 없습니다: " + item.getProductId()));

            // 현재 구독 아이템 추가 또는 업데이트
            Optional<SubscriptionItem> existingItem = subscriptionItemRepository.findBySubscriptionAndProduct(subscription, product);
            if (existingItem.isPresent()) {
                SubscriptionItem subscriptionItem = existingItem.get();
                subscriptionItem.setQuantity(item.getNextMonthQuantity());
                subscriptionItem.setPrice(item.getNextMonthPrice());
                subscriptionItemRepository.save(subscriptionItem);
            } else {
                SubscriptionItem subscriptionItem = SubscriptionItem.builder()
                        .subscription(subscription)
                        .product(product)
                        .quantity(item.getNextMonthQuantity())
                        .price(item.getNextMonthPrice())
                        .build();
                subscriptionItemRepository.save(subscriptionItem);
            }

            // 다음 달 구독 아이템 추가 또는 업데이트
            Optional<SubscriptionNextItem> existingNextItem = subscriptionNextItemRepository.findBySubscriptionAndProduct(subscription, product);
            if (existingNextItem.isPresent()) {
                SubscriptionNextItem subscriptionNextItem = existingNextItem.get();
                subscriptionNextItem.setNextMonthQuantity(item.getNextMonthQuantity());
                subscriptionNextItem.setNextMonthPrice(item.getNextMonthPrice());
                subscriptionNextItemRepository.save(subscriptionNextItem);
            } else {
                SubscriptionNextItem subscriptionNextItem = SubscriptionNextItem.builder()
                        .subscription(subscription)
                        .product(product)
                        .productId(product.getId())
                        .nextMonthQuantity(item.getNextMonthQuantity())
                        .nextMonthPrice(item.getNextMonthPrice())
                        .build();
                subscriptionNextItemRepository.save(subscriptionNextItem);
            }
        }

        return subscription;
    }

    /**
     * 배송 요청사항 업데이트
     */
    @Transactional
    public void updateDeliveryRequest(Long subscriptionId, String deliveryRequest) {
        log.info("📡 [서비스 호출] 배송 요청 업데이트 - 구독 ID: {}", subscriptionId);

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("❌ 존재하지 않는 구독 ID: " + subscriptionId));

        log.info("✅ [DB 조회] 구독 정보 찾음 - 구독 ID: {}", subscription.getId());

        subscription.setDeliveryRequest(deliveryRequest);
        subscriptionRepository.save(subscription);

        log.info("✅ [DB 업데이트 완료] 배송 요청 저장됨 - 구독 ID: {}", subscriptionId);
    }


    /**
     * 결제일 업데이트
     */
    @Transactional
    public boolean updateBillingDate(Long subscriptionId, LocalDate newBillingDate) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));

        // ✅ 기존 결제일 확인
        LocalDate lastBillingDate = subscription.getLastBillingDate();

        // ✅ 다음 결제일 (lastBillingDate 기준으로 한 달 후) 계산
        LocalDate nextBillingDate = lastBillingDate.plusMonths(1);

        // ✅ 결제일 변경 가능 여부 확인 (nextBillingDate 기준으로 -15일 ~ +15일)
        LocalDate minDate = nextBillingDate.minusDays(15);
        LocalDate maxDate = nextBillingDate.plusDays(15);

        if (newBillingDate.isBefore(minDate) || newBillingDate.isAfter(maxDate)) {
            throw new RuntimeException("❌ 변경 가능한 날짜 범위를 초과했습니다!");
        }

        // ✅ 결제일 업데이트
        subscription.setNextBillingDate(newBillingDate);
        subscriptionRepository.save(subscription);
        return true;
    }


    /**
     * 결제수단 변경
     */
    @Transactional
    public boolean updateNextPaymentMethod(Long subscriptionId, String nextPaymentMethod) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));

        subscription.setNextPaymentMethod(nextPaymentMethod);
        subscriptionRepository.save(subscription);
        return true;
    }


    /**
     * 배송정보 변경
     */
    @Transactional
    public boolean updateDeliveryAddress(Long subscriptionId, String postalCode, String roadAddress, String detailAddress) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("❌ 구독 정보를 찾을 수 없습니다."));

        // ✅ 새로운 주소값을 업데이트
        subscription.setPostalCode(postalCode);
        subscription.setRoadAddress(roadAddress);
        subscription.setDetailAddress(detailAddress);

        subscriptionRepository.save(subscription);
        return true;
    }


    /**
     * 구독 취소
     */
    @Transactional
    public boolean cancelSubscription(Long subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));

        if (!subscription.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("진행 중인 구독만 취소할 수 있습니다.");
        }

        subscription.setStatus("CANCELLED"); // ✅ 상태 변경
        subscription.setEndDate(LocalDate.now()); // ✅ 현재 날짜를 종료일로 설정
        subscriptionRepository.save(subscription);
        return true;
    }

    /**
     * 구독 갱신 시 과거 구독 expired 처리
     * @param memberId
     */
    @Transactional
    public void expirePastSubscriptions(Long memberId) {
        List<Subscription> pastSubscriptions = subscriptionRepository.findByMemberIdAndStatus(memberId, "ACTIVE");

        for (Subscription sub : pastSubscriptions) {
            sub.setStatus("EXPIRED");
            subscriptionRepository.save(sub);
        }
    }

    /**
     * 구독 정보 업데이트 (결제일, 결제수단, 배송정보)
     */
    @Transactional
    public void updateSubscriptionInfo(Long subscriptionId, LocalDate newBillingDate, String newPaymentMethod,
                                       String postalCode, String roadAddress, String detailAddress) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));

        if (newBillingDate != null) {
            subscription.setNextBillingDate(newBillingDate);
        }
        if (newPaymentMethod != null) {
            subscription.setNextPaymentMethod(newPaymentMethod);
        }
        if (postalCode != null) {
            subscription.setPostalCode(postalCode);
        }
        if (roadAddress != null) {
            subscription.setRoadAddress(roadAddress);
        }
        if (detailAddress != null) {
            subscription.setDetailAddress(detailAddress);
        }

        subscriptionRepository.save(subscription);
    }

    /**
     * 다음 회차에 반영할 상품 추가/삭제
     * - 사용자가 직접 다음 회차에 반영될 상품을 관리할 수 있도록 지원
     * - 기존 SubscriptionNextItem을 삭제하고 새롭게 저장
     */
    @Transactional
    public boolean updateNextSubscriptionItems(Long subscriptionId, List<SubscriptionUpdateNextItemDto> updatedItems) {
        try {
            // 구독 ID로 구독 정보 조회 (EntityNotFoundException 처리)
            Subscription subscription = subscriptionRepository.findById(subscriptionId)
                    .orElseThrow(() -> new EntityNotFoundException("해당 구독 ID를 찾을 수 없습니다: " + subscriptionId));

            // 기존 SubscriptionNextItem 삭제 (구독 ID로 삭제)
            subscriptionNextItemRepository.deleteBySubscriptionId(subscriptionId);

            // 업데이트된 상품 목록을 기반으로 새로운 SubscriptionNextItem 생성 및 저장
            for (SubscriptionUpdateNextItemDto item : updatedItems) {
                Product product = productRepository.findById(item.getProductId())
                        .orElseThrow(() -> new EntityNotFoundException("해당 productId의 제품을 찾을 수 없습니다: " + item.getProductId()));

                SubscriptionNextItem newNextItem = SubscriptionNextItem.builder()
                        .subscription(subscription) // 연관관계 설정
                        .product(product)
                        .productId(product.getId())
                        .nextMonthQuantity(item.getNextMonthQuantity())
                        .nextMonthPrice(item.getNextMonthPrice())
                        .build();

                subscriptionNextItemRepository.save(newNextItem);
            }

            return true;
        } catch (EntityNotFoundException e) {
            log.error("❌ [ERROR] 구독 상품 업데이트 실패: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("❌ [ERROR] 구독 상품 업데이트 중 오류 발생", e);
            return false;
        }
    }

    /**
     * 담달 정기결제 상품 추가
     * - 이미 있는 상품이면 수량만 증가하도록 추가 구현 필요
     * @param subscriptionId
     * @param newItemDto
     */
    @Transactional
    public SubscriptionNextItem addNextSubscriptionItem(Long subscriptionId, SubscriptionUpdateNextItemDto newItemDto) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("구독 정보를 찾을 수 없습니다."));

        Product product = productRepository.findById(newItemDto.getProductId())
                .orElseThrow(() -> new RuntimeException("상품 정보를 찾을 수 없습니다: " + newItemDto.getProductId()));

        SubscriptionNextItem newItem = SubscriptionNextItem.builder()
                .subscription(subscription)
                .product(product)
                .nextMonthQuantity(newItemDto.getNextMonthQuantity())
                .nextMonthPrice(newItemDto.getNextMonthPrice())
                .build();

        // ✅ 새로운 아이템 저장 후 반환
        return subscriptionNextItemRepository.save(newItem);
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

    @Transactional
    public boolean deleteNextSubscriptionItem(Long subscriptionId, Long productId) {
        try {
            // ✅ productId를 기반으로 Product 객체 조회
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("해당 productId의 제품을 찾을 수 없습니다: " + productId));

            // ✅ SubscriptionNextItem에서 subscriptionId와 product 객체를 기반으로 조회
            Optional<SubscriptionNextItem> existingItem = subscriptionNextItemRepository.findBySubscriptionIdAndProduct(subscriptionId, product);

            if (existingItem.isPresent()) {
                subscriptionNextItemRepository.delete(existingItem.get());
                return true;
            } else {
                log.error("❌ [ERROR] 삭제 실패 - 해당 구독 상품 없음 (subscriptionId: {}, productId: {})", subscriptionId, productId);
                return false;
            }
        } catch (Exception e) {
            log.error("❌ [ERROR] 삭제 중 오류 발생", e);
            return false;
        }
    }
}
