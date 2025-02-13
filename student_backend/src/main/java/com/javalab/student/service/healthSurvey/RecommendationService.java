package com.javalab.student.service.healthSurvey;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javalab.student.dto.healthSurvey.HealthAnalysisDTO;
import com.javalab.student.dto.healthSurvey.ProductRecommendationDTO;
import com.javalab.student.dto.healthSurvey.RecommendationDTO;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.Product;
import com.javalab.student.entity.healthSurvey.HealthRecord;
import com.javalab.student.entity.healthSurvey.MemberResponse;
import com.javalab.student.entity.healthSurvey.Recommendation;
import com.javalab.student.entity.healthSurvey.RecommendedIngredient;
import com.javalab.student.entity.healthSurvey.RecommendedProduct;
import com.javalab.student.repository.ProductRepository;
import com.javalab.student.repository.healthSurvey.HealthRecordRepository;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final NutrientScoreService nutrientScoreService;
    private final ProductRecommendationService productRecommendationService;
    private final AuthenticationService authenticationService;
    private final MemberInfoService memberInfoService;
    private final BmiCalculator bmiCalculator;
    private final HealthAnalysisService healthAnalysisService;

    private final RecommendationRepository recommendationRepository;
    private final RecommendedIngredientRepository recommendedIngredientRepository;
    private final RecommendedProductRepository recommendedProductRepository;
    private final MemberResponseRepository memberResponseRepository;
    private final ProductRepository productRepository;
    private final HealthRecordService healthRecordService;
    private final HealthRecordRepository healthRecordRepository; // 추가

    /**
     * 현재 로그인한 사용자의 건강 분석 정보를 제공합니다.
     *
     * @return 건강 분석 정보를 포함한 HealthAnalysisDTO
     */
    @Transactional(rollbackFor = Exception.class)
    public HealthAnalysisDTO getHealthAnalysisAndRecommendations() {
        log.info("getHealthAnalysisAndRecommendations 메서드 시작");

        try {
            // 1. 현재 인증된 사용자 정보 가져오기
            Member member = authenticationService.getAuthenticatedMember();
            log.info("1. 인증된 사용자 ID: {}", member.getId());

            // 2. 사용자 정보 가져오기 (나이, 키, 몸무게 등)
            List<MemberResponse> responses = memberResponseRepository.findAgeHeightAndWeightResponses(member.getId());
            log.info("2. 사용자 응답 데이터 조회 완료. 응답 수: {}", responses.size());

            String name = memberInfoService.getName(member.getId());
            String gender = memberInfoService.getGender(member.getId());
            int age = memberInfoService.getAge(responses);
            double height = memberInfoService.getHeight(responses);
            double weight = memberInfoService.getWeight(responses);

            // BMI 계산
            double bmi = bmiCalculator.calculateBMI(height, weight);
            log.info("2. 사용자 정보 계산 완료. 사용자 정보: [이름: {}, 성별: {}, 나이: {}, 키: {}, 몸무게: {}, BMI: {:.2f}]",
                    name, gender, age, height, weight, bmi);

            // 3. 건강 분석 수행
            log.info("3. 건강 분석 시작");
            HealthAnalysisDTO healthAnalysis = healthAnalysisService.analyzeHealth(member.getId(), age, bmi, responses, gender);
            healthAnalysis.setName(name);
            healthAnalysis.setAge(age);
            healthAnalysis.setGender(gender);
            healthAnalysis.setBmi(bmi);
            log.info("3. 건강 분석 완료: {}", healthAnalysis);

            // 4. 추천 영양 성분 점수 계산
            log.info("4. 추천 영양 성분 점수 계산 시작");
            Map<String, Integer> ingredientScores = nutrientScoreService.calculateIngredientScores(responses, age, bmi);
            log.info("4. 추천 영양 성분 점수 계산 완료. 점수 수: {}", ingredientScores.size());

            // 5. 추천 엔티티 생성 및 저장
            log.info("5. 추천 엔티티 생성 시작");
            Recommendation recommendation = new Recommendation();
            recommendation.setMemberId(member.getId());
            recommendation.setCreatedAt(LocalDateTime.now());
            recommendation = recommendationRepository.saveAndFlush(recommendation); // saveAndFlush 사용
            log.info("5. 추천 엔티티 저장 완료. ID: {}", recommendation.getId());

            // 6. 추천 영양 성분 저장
            log.info("6. 추천 영양 성분 저장 시작");
            List<RecommendedIngredient> recommendedIngredients = new ArrayList<>();
            for (Map.Entry<String, Integer> entry : ingredientScores.entrySet()) {
                RecommendedIngredient ingredient = new RecommendedIngredient();
                ingredient.setRecommendation(recommendation);
                ingredient.setIngredientName(entry.getKey());
                ingredient.setScore(entry.getValue());
                recommendedIngredients.add(ingredient);
            }
            recommendedIngredients = recommendedIngredientRepository.saveAll(recommendedIngredients);
            recommendedIngredientRepository.flush();
            log.info("6. 추천 영양 성분 저장 완료. 저장된 개수: {}", recommendedIngredients.size());

            // 7. 추천 제품 생성 및 저장
            log.info("7. 추천 제품 생성 시작");
            List<ProductRecommendationDTO> productRecommendations = productRecommendationService.recommendProductsByIngredients(
                    new ArrayList<>(ingredientScores.keySet()), ingredientScores);
            List<RecommendedProduct> recommendedProducts = new ArrayList<>();

            for (ProductRecommendationDTO productDTO : productRecommendations) {
                Product product = productRepository.findById(productDTO.getId())
                        .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다. ID: " + productDTO.getId()));

                RecommendedProduct recommendedProduct = RecommendedProduct.builder()
                        .reason(productDTO.getDescription())
                        .build();

                // 연관 관계 설정
                recommendedProduct.setRecommendation(recommendation);
                recommendedProduct.setProduct(product);

                recommendedProducts.add(recommendedProduct);
            }
            recommendedProducts = recommendedProductRepository.saveAll(recommendedProducts);
            recommendedProductRepository.flush();
            log.info("7. 추천 제품 저장 완료. 저장된 개수: {}", recommendedProducts.size());

            // 8. HealthRecord 저장
            healthRecordService.saveHealthRecord(member, healthAnalysis,
                    ingredientScores.keySet().stream().collect(Collectors.toList()),
                    productRecommendations, name, gender, age);

            log.info("8. HealthRecord 저장 완료");

            log.info("getHealthAnalysisAndRecommendations 메서드 종료");
            return healthAnalysis;

        } catch (Exception e) {
            log.error("getHealthAnalysisAndRecommendations 메서드 실행 중 오류 발생: {}", e.getMessage(), e);
            throw e; // 예외 다시 던지기
        }
    }

    /**
     * 현재 로그인한 사용자의 건강 기록 히스토리를 조회합니다.
     *
     * @return 건강 기록 리스트를 포함한 ResponseEntity
     */
    public List<RecommendationDTO> getHealthHistory() {
        Member member = authenticationService.getAuthenticatedMember();
        List<HealthRecord> healthRecords = healthRecordRepository.findByMemberIdOrderByRecordDateDesc(member.getId());

        return healthRecords.stream()
                .map(record -> RecommendationDTO.builder()
                        .id(record.getId())
                        .memberId(member.getId())
                        .createdAt(record.getRecordDate())
                        .recordDate(record.getRecordDate())
                        .name(record.getName())
                        .gender(record.getGender())
                        .age(record.getAge())
                        .bmi(record.getBmi())
                        .riskLevels(record.getRiskLevels())
                        .overallAssessment(record.getOverallAssessment())
                        .recommendedIngredients(record.getRecommendedIngredients())
                        .recommendedProducts(record.getRecommendedProducts())
                        .build())
                .collect(Collectors.toList());
    }
}
