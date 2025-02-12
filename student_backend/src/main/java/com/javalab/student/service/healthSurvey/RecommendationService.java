package com.javalab.student.service.healthSurvey;

import com.javalab.student.dto.healthSurvey.HealthAnalysisDTO;
import com.javalab.student.dto.healthSurvey.ProductRecommendationDTO;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.healthSurvey.HealthRecord;
import com.javalab.student.entity.healthSurvey.MemberResponse;
import com.javalab.student.repository.healthSurvey.MemberResponseOptionRepository;
import com.javalab.student.repository.healthSurvey.MemberResponseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * 추천 영양 성분 및 제품 추천 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    // 기존 서비스들
    private final NutrientScoreService nutrientScoreService;
    private final HealthRecordService healthRecordService;
    private final ProductRecommendationService productRecommendationService;
    private final RiskCalculationService riskCalculationService;
    private final AuthenticationService authenticationService;
    private final MemberInfoService memberInfoService;
    private final BmiCalculator bmiCalculator;
    private final HealthAnalysisService healthAnalysisService;
    private final MemberResponseRepository memberResponseRepository;
    private final MemberResponseOptionRepository memberResponseOptionRepository;

    /**
     * 현재 로그인한 사용자의 건강 분석 및 추천 정보를 제공합니다.
     *
     * @return 건강 분석 및 추천 정보를 포함한 Map
     */
    public Map<String, Object> getHealthAnalysisAndRecommendations() {
        try {
            // 1. 현재 인증된 사용자 정보 가져오기
            Member member = authenticationService.getAuthenticatedMember();
            log.info("Authenticated member: {}", member.getId());

            // 2. 나이, 키, 몸무게 데이터 가져오기
            List<MemberResponse> responses = memberResponseRepository.findAgeHeightAndWeightResponses(member.getId());
            int age = memberInfoService.getAge(responses);
            double height = memberInfoService.getHeight(responses);
            double weight = memberInfoService.getWeight(responses);
            double bmi = bmiCalculator.calculateBMI(height, weight);
            log.info("User info - Age: {}, Height: {}, Weight: {}, BMI: {}", age, height, weight, bmi);

            // 3. 성별 데이터 가져오기
            String gender = memberInfoService.getGender(member.getId());
            log.info("User gender: {}", gender);

            // 4. 건강 분석 수행
            HealthAnalysisDTO healthAnalysis = healthAnalysisService.analyzeHealth(
                    member.getId(), age, bmi, responses, gender);
            log.info("Health analysis completed: {}", healthAnalysis);

            // 5. 추천 영양 성분 점수 계산
            Map<String, Integer> ingredientScores = nutrientScoreService.calculateIngredientScores(responses, age, bmi);

            // 6. 추천 제품 생성
            List<ProductRecommendationDTO> recommendations = productRecommendationService.recommendProductsByIngredients(
                    ingredientScores.keySet().stream().toList(), ingredientScores);

            // 7. 건강 기록 저장 (선택 사항)
            healthRecordService.saveHealthRecord(
                    member,
                    healthAnalysis,
                    ingredientScores.keySet().stream().toList(),
                    recommendations,
                    member.getName(),
                    gender,
                    age
            );

            // 8. 결과 반환
            Map<String, Object> result = new HashMap<>();
            result.put("healthAnalysis", healthAnalysis);
            result.put("recommendations", recommendations);

            return result;

        } catch (Exception e) {
            log.error("Error in getHealthAnalysisAndRecommendations", e);
            throw new RuntimeException("건강 분석 및 추천 생성 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 건강 위험도를 계산합니다.
     */
    public Map<String, String> calculateRisks(int age, double bmi, List<MemberResponse> responses) {
        return riskCalculationService.calculateAllRisks(age, bmi, responses);
    }

    /**
     * 추천 영양 성분에 따른 제품 추천을 수행합니다.
     */
    public List<ProductRecommendationDTO> recommendProductsByIngredients(int age, double bmi,
                                                                         List<MemberResponse> responses) {
        Map<String, Integer> ingredientScores = nutrientScoreService.calculateIngredientScores(responses, age, bmi);
        return productRecommendationService.recommendProductsByIngredients(
                ingredientScores.keySet().stream().toList(),
                ingredientScores
        );
    }

    /**
     * 건강 기록 히스토리를 조회합니다.
     */
    public List<HealthRecord> getHealthHistory() {
        Member member = authenticationService.getAuthenticatedMember();
        return healthRecordService.getHealthHistory(member.getId());
    }
}
