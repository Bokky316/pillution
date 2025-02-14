package com.javalab.student.service.healthSurvey;

import com.javalab.student.dto.healthSurvey.HealthAnalysisDTO;
import com.javalab.student.dto.healthSurvey.RecommendationDTO;
import com.javalab.student.dto.healthSurvey.RecommendedProductDTO;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.healthSurvey.*;
import com.javalab.student.repository.ProductRepository;
import com.javalab.student.repository.healthSurvey.MemberResponseRepository;
import com.javalab.student.repository.healthSurvey.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 추천 영양 성분 및 제품 추천 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final AuthenticationService authenticationService;
    private final MemberInfoService memberInfoService;
    private final BmiCalculator bmiCalculator;
    private final HealthAnalysisService healthAnalysisService;
    private final HealthRecordService healthRecordService;
    private final MemberResponseRepository memberResponseRepository;
    private final RiskCalculationService riskCalculationService;
    private final ProductRecommendationService productRecommendationService;
    private final NutrientScoreService nutrientScoreService;
    private final RecommendationRepository recommendationRepository;
    private final ProductRepository productRepository;

    /**
     * 현재 로그인한 사용자의 건강 상태를 분석하고 제품을 추천합니다.
     *
     * @return 건강 분석 결과, 추천 제품, 추천 영양 성분을 포함하는 Map
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> getHealthAnalysisAndRecommendations() {
        Map<String, Object> result = new HashMap<>();

        try {
            // 인증 정보 확인 및 사용자 정보 조회
            Member member = authenticationService.getAuthenticatedMember();
            log.info("Authenticated member: {}", member.getId());

            // 사용자 입력 기반의 응답 목록 가져오기
            List<MemberResponse> ageHeightWeightResponses = memberResponseRepository.findAgeHeightAndWeightResponses(member.getId());
            log.info("User responses: {}", ageHeightWeightResponses);

            if (ageHeightWeightResponses.isEmpty()) {
                throw new IllegalStateException("사용자 응답이 없습니다.");
            }

            // 사용자 정보 추출
            String name = memberInfoService.getName(member.getId());
            String gender = memberInfoService.getGender(member.getId());
            int age = memberInfoService.getAge(ageHeightWeightResponses);
            log.info("Extracted user info - name: {}, gender: {}, age: {}", name, gender, age);

            // 키와 몸무게 추출
            double height = memberInfoService.getHeight(ageHeightWeightResponses);
            double weight = memberInfoService.getWeight(ageHeightWeightResponses);
            log.info("Extracted height: {}, weight: {}", height, weight);

            if (height <= 0 || weight <= 0) {
                throw new IllegalStateException("키 또는 몸무게 데이터가 올바르지 않습니다.");
            }

            // BMI 계산
            double bmi = bmiCalculator.calculateBMI(height, weight);
            log.info("Calculated BMI: {}", bmi);

            // 건강 분석 수행
            HealthAnalysisDTO healthAnalysis = healthAnalysisService.analyzeHealth(member.getId(), age, bmi, ageHeightWeightResponses, gender);
            if (healthAnalysis == null) {
                throw new IllegalStateException("건강 분석 결과가 null입니다.");
            }
            healthAnalysis.setName(name);
            healthAnalysis.setGender(gender);
            healthAnalysis.setAge(age);
            result.put("healthAnalysis", healthAnalysis);

            // 추천 영양 성분 및 제품 추천 추가
            Map<String, Integer> ingredientScores = nutrientScoreService.calculateIngredientScores(ageHeightWeightResponses, age, bmi);
            List<Map<String, Object>> recommendedIngredients = nutrientScoreService.getRecommendedIngredients(healthAnalysis, ingredientScores, age, bmi);

            // recommendedIngredients가 null인 경우 빈 리스트로 초기화
            if (recommendedIngredients == null) {
                recommendedIngredients = new ArrayList<>();
            }

            List<RecommendedProductDTO> recommendations = new ArrayList<>();
            // recommendedIngredients가 비어 있지 않은 경우에만 제품 추천
            if (!recommendedIngredients.isEmpty()) {
                recommendations = productRecommendationService.recommendProductsByIngredients(
                        recommendedIngredients.stream()
                                .map(x -> (String) x.get("name"))
                                .collect(Collectors.toList()),
                        ingredientScores
                );
            }

            result.put("recommendations", recommendations);
            result.put("recommendedIngredients", recommendedIngredients);

            // 건강 기록 저장
            healthRecordService.saveHealthRecord(member, healthAnalysis,
                    recommendedIngredients.stream().map(x -> (String) x.get("name")).collect(Collectors.toList()),
                    recommendations,
                    name, gender, age);

            log.info("Health analysis and recommendations generated successfully");

            // Recommendation 엔티티 생성 및 저장
            Recommendation recommendation = new Recommendation();
            recommendation.setMemberId(member.getId());

            // RecommendedIngredient 생성 및 추가
            for (Map<String, Object> ingredientData : recommendedIngredients) {
                RecommendedIngredient ingredient = new RecommendedIngredient();
                ingredient.setIngredientName((String) ingredientData.get("name"));
                ingredient.setScore(((Number) ingredientData.get("score")).doubleValue());
                recommendation.addRecommendedIngredient(ingredient);
            }

            // RecommendedProduct 생성 및 추가
            for (RecommendedProductDTO productData : recommendations) {
                RecommendedProduct product = new RecommendedProduct();
                product.setProduct(productRepository.findById(productData.getId()).orElseThrow());
                recommendation.addRecommendedProduct(product);
            }

            recommendationRepository.save(recommendation);

            // Recommendation 저장
            recommendationRepository.save(recommendation);

            log.info("건강 분석 결과: {}", healthAnalysis);
            log.info("추천 제품: {}", recommendations);
            log.info("추천 영양 성분: {}", recommendedIngredients);
            return result;
        } catch (Exception e) {
            log.error("건강 분석 및 추천 생성 중 오류 발생", e);
            throw new RuntimeException("건강 분석 및 추천 생성 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 사용자의 나이, BMI, 응답을 기반으로 건강 위험도를 계산합니다.
     *
     * @param age       사용자의 나이
     * @param bmi       사용자의 BMI
     * @param responses 사용자의 설문 응답 목록
     * @return 계산된 위험도 정보를 포함한 Map
     */
    public Map<String, String> calculateRisks(int age, double bmi, List<MemberResponse> responses) {
        return riskCalculationService.calculateAllRisks(age, bmi, responses);
    }

    /**
     * 추천 영양 성분에 따른 제품 추천 API.
     *
     * @param age       사용자의 나이
     * @param bmi       사용자의 BMI
     * @param responses 사용자의 설문 응답 목록
     * @return 추천된 제품 목록을 포함한 ResponseEntity
     */
    public Map<String, List<RecommendedProductDTO>> recommendProductsByIngredients(int age, double bmi, List<MemberResponse> responses) {
        // 1. 영양 성분 점수 계산
        Map<String, Integer> ingredientScores = nutrientScoreService.calculateIngredientScores(responses, age, bmi);

        // 2. HealthAnalysisDTO 생성 (최소한의 정보만 설정)
        HealthAnalysisDTO healthAnalysis = new HealthAnalysisDTO();

        // 3. 추천 영양 성분 목록 가져오기 (이름과 점수 포함)
        List<Map<String, Object>> recommendedIngredients = nutrientScoreService.getRecommendedIngredients(healthAnalysis, ingredientScores, age, bmi);

        // 4. 제품 추천
        List<RecommendedProductDTO> recommendations =
                productRecommendationService.recommendProductsByIngredients(
                        recommendedIngredients.stream().map(x -> (String) x.get("name")).collect(Collectors.toList()),
                        ingredientScores
                );

        // 5. 결과를 Map에 담아서 반환
        Map<String, List<RecommendedProductDTO>> resultMap = new HashMap<>();
        resultMap.put("recommendations", recommendations);

        return resultMap;
    }

    /**
     * 사용자의 응답, 나이, BMI를 기반으로 영양 점수를 계산합니다.
     *
     * @param responses 사용자의 설문 응답 목록
     * @param age       사용자의 나이
     * @param bmi       사용자의 BMI
     * @return 계산된 영양 점수를 포함한 Map
     */
    public Map<String, Integer> calculateNutrientScores(List<MemberResponse> responses, int age, double bmi) {
        return nutrientScoreService.calculateIngredientScores(responses, age, bmi);
    }

    /**
     * 현재 로그인한 사용자의 건강 기록 히스토리를 조회합니다.
     *
     * @return 건강 기록 리스트
     */
    public List<RecommendationDTO> getHealthHistory() {
        Member member = authenticationService.getAuthenticatedMember();
        List<HealthRecord> healthRecords = healthRecordService.getHealthHistory(member.getId());

        return healthRecords.stream()
                .map(healthRecord -> RecommendationDTO.builder()
                        .id(healthRecord.getId())
                        .memberId(member.getId())
                        .createdAt(healthRecord.getCreatedAt())
                        .recordDate(healthRecord.getRecordDate())
                        .name(healthRecord.getName())
                        .gender(healthRecord.getGender())
                        .age(healthRecord.getAge())
                        .bmi(healthRecord.getBmi())
                        .riskLevels(healthRecord.getRiskLevels())
                        .overallAssessment(healthRecord.getOverallAssessment())
                        .recommendedIngredients(healthRecord.getRecommendedIngredients())
                        .recommendedProducts(healthRecord.getRecommendedProducts())
                        .build())
                .collect(Collectors.toList());
    }
}
