package com.javalab.student.service;

import com.javalab.student.entity.*;
import com.javalab.student.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplementRecommendationService {

    private final MemberResponseRepository memberResponseRepository;
    private final MemberResponseOptionRepository memberResponseOptionRepository;
    private final ProductRepository productRepository;
    private final RecommendationRepository recommendationRepository;
    private final RecommendedProductRepository recommendedProductRepository;

    @Transactional
    public Recommendation recommendSupplements(Member member) {
        Map<String, Integer> supplementScores = new HashMap<>();

        // 텍스트 응답 분석
        List<MemberResponse> textResponses = memberResponseRepository.findAll().stream()
                .filter(response -> response.getMember().getId().equals(member.getId()))
                .collect(Collectors.toList());
        for (MemberResponse response : textResponses) {
            updateSupplementScores(response.getQuestion().getQuestionText(), response.getResponseText(), supplementScores);
        }

        // 선택형 응답 분석
        List<MemberResponseOption> optionResponses = memberResponseOptionRepository.findAll().stream()
                .filter(response -> response.getMember().getId().equals(member.getId()))
                .collect(Collectors.toList());
        for (MemberResponseOption response : optionResponses) {
            updateSupplementScores(response.getQuestion().getQuestionText(), response.getOption().getOptionText(), supplementScores);
        }

        // 상위 5개 영양제 선정
        List<Map.Entry<String, Integer>> topSupplements = supplementScores.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toList());

        // Recommendation 엔티티 생성 및 저장
        Recommendation recommendation = new Recommendation();
        recommendation.setMember(member);
        recommendation.setCreatedAt(LocalDateTime.now());
        recommendationRepository.save(recommendation);

        // RecommendedProduct 엔티티 생성 및 저장
        for (Map.Entry<String, Integer> entry : topSupplements) {
            String supplementName = entry.getKey();
            Product product = productRepository.findAll().stream()
                    .filter(p -> p.getName().equals(supplementName))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Product not found: " + supplementName));

            RecommendedProduct recommendedProduct = new RecommendedProduct();
            recommendedProduct.setRecommendation(recommendation);
            recommendedProduct.setProduct(product);
            recommendedProduct.setReason("Recommended based on " + entry.getValue() + " matching symptoms or conditions");
            recommendedProductRepository.save(recommendedProduct);
        }

        return recommendation;
    }

    private void updateSupplementScores(String questionText, String answerText, Map<String, Integer> supplementScores) {
        // 혈관·혈액순환
        if (questionText.contains("혈관 건강")) {
            if (answerText.contains("상처가 잘 낫지 않아요")) {
                incrementScore(supplementScores, "코엔자임Q10", 1);
            }
            if (answerText.contains("손발 끝이 자주 저려요")) {
                incrementScore(supplementScores, "오메가-3", 1);
            }
            if (answerText.contains("잇몸이 붓고 피가 나요")) {
                incrementScore(supplementScores, "비타민C", 1);
            }
            if (answerText.contains("얼굴이 자주 창백해져요")) {
                incrementScore(supplementScores, "철분", 1);
            }
            if (answerText.contains("선택할 것은 없지만 혈관·혈액순환이 걱정돼요")) {
                incrementScore(supplementScores, "오메가-3", 1);
            }
        }

        // 소화·장 건강
        if (questionText.contains("소화·장 건강")) {
            if (answerText.contains("복통이나 속 쓰림이 자주 발생해요")) {
                incrementScore(supplementScores, "글루타민", 1);
            }
            if (answerText.contains("변비가 있어요") || answerText.contains("변이 묽은 편이에요")) {
                incrementScore(supplementScores, "프로바이오틱스", 1);
            }
            if (answerText.contains("술을 마시면 얼굴이나 몸이 붉어지고 소화가 안 돼요")) {
                incrementScore(supplementScores, "비타민B6", 1);
            }
            if (answerText.contains("잔뇨감이 있어요")) {
                incrementScore(supplementScores, "크랜베리 추출물", 1);
            }
            if (answerText.contains("선택할 것은 없지만 소화력 개선이 필요해요")) {
                incrementScore(supplementScores, "프로바이오틱스", 1);
            }
        }

        // 피부 건강
        if (questionText.contains("피부 건강")) {
            if (answerText.contains("피부가 건조하고 머리에 비듬이 많이 생겨요")) {
                incrementScore(supplementScores, "콜라겐", 1);
            }
            if (answerText.contains("여드름이 많아서 걱정이에요")) {
                incrementScore(supplementScores, "아연", 1);
            }
            if (answerText.contains("피부에 염증이 자주 생겨요")) {
                incrementScore(supplementScores, "비타민B군", 1);
            }
            if (answerText.contains("입안이 헐고 입술이 자주 갈라져요")) {
                incrementScore(supplementScores, "비타민B2", 1);
            }
            if (answerText.contains("선택할 것은 없지만 피부 건강이 걱정돼요")) {
                incrementScore(supplementScores, "콜라겐", 1);
            }
        }

        // 눈 건강
        if (questionText.contains("눈 건강")) {
            if (answerText.contains("눈이 건조해 뻑뻑하고 가려워요") || answerText.contains("핸드폰, 모니터를 본 후 시야가 흐릿해요")) {
                incrementScore(supplementScores, "루테인", 1);
            }
            if (answerText.contains("눈 주변이 떨려요")) {
                incrementScore(supplementScores, "마그네슘", 1);
            }
            if (answerText.contains("어두워지면 시력이 저하돼요")) {
                incrementScore(supplementScores, "비타민A", 1);
            }
            if (answerText.contains("선택할 것은 없지만 눈 건강이 걱정돼요")) {
                incrementScore(supplementScores, "루테인", 1);
            }
        }

        // 두뇌 건강
        if (questionText.contains("두뇌 건강")) {
            if (answerText.contains("기억력이 떨어지는 것 같아요")) {
                incrementScore(supplementScores, "인지질(PS)", 1);
            }
            if (answerText.contains("두통이 자주 생겨요")) {
                incrementScore(supplementScores, "마그네슘", 1);
            }
            if (answerText.contains("불안이나 긴장을 자주 느껴요")) {
                incrementScore(supplementScores, "GABA", 1);
            }
            if (answerText.contains("우울한 감정을 자주 느껴요")) {
                incrementScore(supplementScores, "비타민D", 1);
            }
            if (answerText.contains("귀에서 울리는 소리가 가끔 나요")) {
                incrementScore(supplementScores, "비타민B12", 1);
            }
            if (answerText.contains("선택할 것은 없지만 두뇌 활동이 걱정돼요")) {
                incrementScore(supplementScores, "오메가-3", 1);
            }
        }

        // 피로감
        if (questionText.contains("피로감")) {
            if (answerText.contains("무기력하고 식욕이 없어요")) {
                incrementScore(supplementScores, "철분", 1);
            }
            if (answerText.contains("자고 일어나도 피곤해요")) {
                incrementScore(supplementScores, "코엔자임Q10", 1);
            }
            if (answerText.contains("신경이 예민하고 잠을 잘 이루지 못해요")) {
                incrementScore(supplementScores, "GABA", 1);
            }
            if (answerText.contains("소변을 보기 위해 잠을 깨요")) {
                incrementScore(supplementScores, "크랜베리 추출물", 1);
            }
            if (answerText.contains("선택할 것은 없지만 피로감이 있어요")) {
                incrementScore(supplementScores, "비타민B군", 1);
            }
        }

        // 뼈·관절 건강
        if (questionText.contains("뼈·관절 건강")) {
            if (answerText.contains("뼈가 부러진 경험이 있어요") || answerText.contains("뼈가 약하다고 느껴요")) {
                incrementScore(supplementScores, "칼슘", 1);
            }
            if (answerText.contains("최근 1년 중 스테로이드를 섭취한 기간이 3개월 이상이에요")) {
                incrementScore(supplementScores, "비타민D", 1);
            }
            if (answerText.contains("선택할 것은 없지만 뼈·관절이 걱정돼요")) {
                incrementScore(supplementScores, "칼슘", 1);
            }
        }

        // 면역 건강
        if (questionText.contains("면역 건강")) {
            if (answerText.contains("스트레스가 매우 많아요")) {
                incrementScore(supplementScores, "비타민C", 1);
            }
            if (answerText.contains("감염성 질환에 자주 걸려요")) {
                incrementScore(supplementScores, "아연", 1);
            }
            if (answerText.contains("선택할 것은 없지만 면역이 걱정돼요")) {
                incrementScore(supplementScores, "비타민C", 1);
            }
        }

        // 모발 건강
        if (questionText.contains("모발 건강")) {
            if (answerText.contains("머리카락에 힘이 없고 잘 빠져요")) {
                incrementScore(supplementScores, "비오틴", 1);
            }
            if (answerText.contains("머리카락이 윤기 없고 갈라지고 끊어져요")) {
                incrementScore(supplementScores, "판토텐산(비타민B5)", 1);
            }
            if (answerText.contains("새치가 많이 나요")) {
                incrementScore(supplementScores, "구리", 1);
            }
            if (answerText.contains("선택할 것은 없지만 모발 건강이 걱정돼요")) {
                incrementScore(supplementScores, "비오틴", 1);
            }
        }
    }


    private void incrementScore(Map<String, Integer> scores, String supplement, int increment) {
        scores.put(supplement, scores.getOrDefault(supplement, 0) + increment);
    }
}
