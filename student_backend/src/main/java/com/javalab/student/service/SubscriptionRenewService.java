package com.javalab.student.service;

import com.javalab.student.entity.Subscription;
import com.javalab.student.entity.SubscriptionItem;
import com.javalab.student.entity.SubscriptionNextItem;
import com.javalab.student.repository.SubscriptionItemRepository;
import com.javalab.student.repository.SubscriptionNextItemRepository;
import com.javalab.student.repository.SubscriptionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionRenewService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionNextItemRepository subscriptionNextItemRepository;
    private final SubscriptionItemRepository subscriptionItemRepository;


    /**
     * ✅ 매매일 자정(00:00)에 실행 → 구독상태가 active이면서 `nextBillingDate`가 오늘인 구독 자동 갱신
     * - @Scheduled(cron = "0 0 3 * * *") 매일 새벽 3시에 실행
     * - "0 0 0 * * ?" 매일 자정 (00:00:00) 실행
     * - "0 30 6 * * ?"	매일 오전 6시 30분 실행
     * - "0 0 12 * * ?"	매일 정오(12:00) 실행
     * - "0 * * * * ?"	매 분 0초에 실행 (1분마다 실행)
     * - "별/30 * * * * ?"	30초마다 실행
     * - "0 0/10 * * * ?"	10분마다 실행
     */
    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정 실행
    @Transactional
    public void processSubscriptionRenewals() {
        LocalDate today = LocalDate.now();
        System.out.println("📅 자동 구독 갱신 실행됨 - 현재 시간: " + today);

        // ✅ 오늘이 nextBillingDate인 ACTIVE 구독 찾기 (자동 갱신 대상)
        List<Subscription> subscriptionsToRenew = subscriptionRepository.findByNextBillingDateAndStatus(today, "ACTIVE");

        // ✅ 오늘 갱신해야 할 총 개수 출력
        System.out.println("🔍 [구독 갱신 대상] 오늘 총 " + subscriptionsToRenew.size() + "건의 구독을 갱신해야 합니다.");

        if (subscriptionsToRenew.isEmpty()) {
            System.out.println("✅ [자동 구독 갱신] 오늘 갱신할 남은 구독이 없습니다.");
            return;
        }

        // ✅ 갱신 대상 ID 목록 출력
        System.out.println("🔄 [구독 갱신 목록] 대상 구독 ID: " +
                subscriptionsToRenew.stream().map(s -> s.getId().toString() + "번").toList());

        int successCount = 0;
        int failCount = 0;
        List<Long> failedSubscriptions = new ArrayList<>();

        for (Subscription subscription : subscriptionsToRenew) {
            try {
                renewSubscription(subscription);
                System.out.println("✅ [구독 갱신 완료] 구독 ID: " + subscription.getId() + "번");
                successCount++;
            } catch (Exception  e) {
                System.err.println("❌ [구독 갱신 실패] 구독 ID: " + subscription.getId() + "번 - 오류: " + e.getMessage());
                failedSubscriptions.add(subscription.getId());
                failCount++;
            }
        }

        // ✅ 최종 결과 출력
        System.out.println("📌 [구독 갱신 결과] 총 " + successCount + "건 성공, " + failCount + "건 실패");

        if (!failedSubscriptions.isEmpty()) {
            System.out.println("⚠️ [구독 갱신 실패 목록] " + failedSubscriptions.stream().map(id -> id + "번").toList());
        }
    }

    /**
     * ✅ 개별 구독 갱신 처리
     */
    @Transactional
    public void renewSubscription(Subscription oldSubscription) {
        // ✅ 새 구독 생성
        Subscription newSubscription = Subscription.builder()
                .member(oldSubscription.getMember()) // 동일한 사용자
                .startDate(oldSubscription.getStartDate()) // 기존 구독의 시작일 유지
                .currentCycle(oldSubscription.getCurrentCycle() + 1) // 회차 증가
                .roadAddress(oldSubscription.getRoadAddress()) // 도로명주소 가져오기(동일한 배송 주소 유지)
                .postalCode(oldSubscription.getPostalCode()) // 우편번호 가져오기(동일한 배송 주소 유지)
                .detailAddress(oldSubscription.getDetailAddress()) // 상세주소 가져오기(동일한 배송 주소 유지)
                .paymentMethod(oldSubscription.getNextPaymentMethod()) // 다음회차 결제수단 정보 가져오기
                .nextPaymentMethod(oldSubscription.getNextPaymentMethod()) // 다음회차 결제수단 정보 가져오기
                .lastBillingDate(oldSubscription.getNextBillingDate()) // 넥스트빌링데이트(다음결제일)=오늘을 최근결제일로 새 구독에 저장
                .nextBillingDate(oldSubscription.getNextBillingDate().plusMonths(1)) // 새로운구독의 다음결제일을 오늘+1달로 저장
                .status("ACTIVE") // 갱신되는 구독의 상태는 active
                .build();

        subscriptionRepository.save(newSubscription);

        // ✅ 이전 구독의 상태를 EXPIRED로 변경
        oldSubscription.setStatus("EXPIRED");
        subscriptionRepository.save(oldSubscription);

        // ✅ SubscriptionNextItem → SubscriptionItem으로 이동
        List<SubscriptionNextItem> nextItems = subscriptionNextItemRepository.findBySubscriptionId(oldSubscription.getId());

        for (SubscriptionNextItem nextItem : nextItems) {
            // ✅ 기존 NextItem을 SubscriptionItem으로 변환하여 저장
            SubscriptionItem newItem = new SubscriptionItem();
            newItem.setSubscription(newSubscription);  // ✅ 새로운 구독 ID로 설정
            newItem.setProduct(nextItem.getProduct());
            newItem.setQuantity(nextItem.getNextMonthQuantity());
            newItem.setPrice(nextItem.getNextMonthPrice());

            subscriptionItemRepository.save(newItem);
        }

//        // ✅ 기존 SubscriptionNextItem을 새로운 Subscription으로 이동
//        for (SubscriptionNextItem nextItem : nextItems) {
//            nextItem.setSubscription(newSubscription); // ✅ 새로운 구독 ID로 변경
//            subscriptionNextItemRepository.save(nextItem);
//        }

        // ✅ 기존 NextItem을 업데이트하지 않고, 새로운 NextItem을 생성하여 저장
        for (SubscriptionNextItem nextItem : nextItems) {
            SubscriptionNextItem newNextItem = new SubscriptionNextItem();
            newNextItem.setSubscription(newSubscription); // ✅ 새로운 구독 ID로 설정
            newNextItem.setProduct(nextItem.getProduct());
            newNextItem.setNextMonthQuantity(nextItem.getNextMonthQuantity());
            newNextItem.setNextMonthPrice(nextItem.getNextMonthPrice());

            subscriptionNextItemRepository.save(newNextItem);
        }
    }
}
