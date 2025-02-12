package com.javalab.student.service.healthSurvey;

import com.javalab.student.dto.healthSurvey.HealthAnalysisDTO;
import com.javalab.student.dto.healthSurvey.ProductRecommendationDTO;
import com.javalab.student.dto.healthSurvey.RecommendationDTO;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.healthSurvey.MemberResponse;
import com.javalab.student.entity.healthSurvey.Recommendation;
import com.javalab.student.entity.healthSurvey.RecommendedIngredient;
import com.javalab.student.entity.healthSurvey.RecommendedProduct;
import com.javalab.student.repository.healthSurvey.MemberResponseRepository;
import com.javalab.student.repository.healthSurvey.RecommendationRepository;
import com.javalab.student.repository.healthSurvey.RecommendedIngredientRepository;
import com.javalab.student.repository.healthSurvey.RecommendedProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final NutrientScoreService nutrientScoreService;
    private final HealthRecordService healthRecordService;
    private final ProductRecommendationService productRecommendationService;
    private final RiskCalculationService riskCalculationService;
    private final AuthenticationService authenticationService;
    private final MemberInfoService memberInfoService;
    private final BmiCalculator bmiCalculator;
    private final HealthAnalysisService healthAnalysisService;

    private final RecommendationRepository recommendationRepository;
    private final RecommendedIngredientRepository recommendedIngredientRepository;
    private final RecommendedProductRepository recommendedProductRepository;
    private final MemberResponseRepository memberResponseRepository;

    /**
     * 현재 로그인한 사용자의 건강 분석 및 추천 정보를 제공합니다.
     *
     * @return 건강 분석 및 추천 정보를 포함한 Map
     */
    @Transactional(rollbackFor = Exception.class)
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
            Map<String, Integer> ingredientScores =
                    nutrientScoreService.calculateIngredientScores(responses, age, bmi);

            // 6. 추천 엔티티 생성 및 저장
            Recommendation recommendation = new Recommendation();
            recommendation.setMemberId(member.getId());
            recommendation.setCreatedAt(LocalDateTime.now());

            // 영양 성분 및 제품 리스트 초기화 (연관 관계 설정용)
            recommendation.setRecommendedIngredients(new ArrayList<>());
            recommendation.setRecommendedProducts(new ArrayList<>());

            recommendationRepository.save(recommendation); // 저장 후 ID 생성

            // 7. 추천 영양 성분 저장 (객체 참조 사용)
            for (Map.Entry<String, Integer> entry : ingredientScores.entrySet()) {
                RecommendedIngredient ingredient = new RecommendedIngredient();
                ingredient.setRecommendation(recommendation); // 객체 참조로 설정
                ingredient.setIngredientName(entry.getKey());
                ingredient.setScore(entry.getValue());
                recommendedIngredientRepository.save(ingredient);

                // Recommendation의 영양 성분 리스트에 추가 (양방향 연관 관계 유지)
                recommendation.getRecommendedIngredients().add(ingredient);
            }

            // 8. 추천 제품 생성 및 저장 (객체 참조 사용)
            List<ProductRecommendationDTO> recommendations =
                    productRecommendationService.recommendProductsByIngredients(
                            ingredientScores.keySet().stream().toList(), ingredientScores);

            for (ProductRecommendationDTO product : recommendations) {
                RecommendedProduct recommendedProduct = new RecommendedProduct();
                recommendedProduct.setRecommendation(recommendation); // 객체 참조로 설정
                recommendedProduct.setProductId(product.getId());
                recommendedProduct.setReason(product.getDescription());
                recommendedProductRepository.save(recommendedProduct);

                // Recommendation의 제품 리스트에 추가 (양방향 연관 관계 유지)
                recommendation.getRecommendedProducts().add(recommendedProduct);
            }

            // 9. 건강 기록 저장 (필요 시 구현)

            // 10. 결과 반환
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
     * 현재 로그인한 사용자의 건강 기록 히스토리를 조회합니다.
     *
     * @return 사용자의 모든 건강 기록 리스트를 반환
     */
    @Transactional(readOnly = true)
    public List<RecommendationDTO> getHealthHistory() {
        Member member = authenticationService.getAuthenticatedMember();

        // 사용자의 모든 Recommendation 기록 조회
        List<Recommendation> recommendations = recommendationRepository.findByMemberId(member.getId());

        // Recommendation -> RecommendationDTO로 변환
        return recommendations.stream().map(recommendation -> {
            RecommendationDTO dto = new RecommendationDTO();
            dto.setId(recommendation.getId());
            dto.setMemberId(recommendation.getMemberId());
            dto.setCreatedAt(recommendation.getCreatedAt());

            // 영양 성분 정보 추가
            List<RecommendedIngredient> ingredients =
                    recommendedIngredientRepository.findByRecommendationId(recommendation.getId());

            List<ProductRecommendationDTO> productRecommendations =
                    recommendedProductRepository.findByRecommendationId(recommendation.getId())
                            .stream()
                            .map(product -> new ProductRecommendationDTO(
                                    product.getId(),
                                    null,
                                    product.getReason(),
                                    null,
                                    0,
                                    null,
                                    null))
                            .toList();


            dto.setProductRecommendations(productRecommendations);

            return dto;
        }).toList();
    }
}
