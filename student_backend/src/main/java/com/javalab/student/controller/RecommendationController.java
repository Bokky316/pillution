package com.javalab.student.controller;

import com.javalab.student.dto.healthSurvey.HealthAnalysisDTO;
import com.javalab.student.dto.healthSurvey.ProductRecommendationDTO;
import com.javalab.student.entity.healthSurvey.HealthRecord;
import com.javalab.student.entity.healthSurvey.MemberResponse;
import com.javalab.student.service.healthSurvey.RecommendationService;
import com.javalab.student.service.healthSurvey.ProductRecommendationService;
import com.javalab.student.service.healthSurvey.RiskCalculationService;
import com.javalab.student.service.healthSurvey.NutrientScoreService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 건강 추천 관련 API를 처리하는 컨트롤러 클래스입니다.
 * 이 클래스는 건강 분석, 제품 추천, 위험도 계산, 영양 점수 계산 등의 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/recommendation")
@Slf4j
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private ProductRecommendationService productRecommendationService;

    @Autowired
    private RiskCalculationService riskCalculationService;

    @Autowired
    private NutrientScoreService nutrientScoreService;

    /**
     * 현재 로그인한 사용자의 건강 분석 및 추천 정보를 제공합니다.
     * @return 건강 분석 및 추천 정보를 포함한 ResponseEntity
     */
    @GetMapping("/analysis")
    public ResponseEntity<Map<String, Object>> getHealthAnalysisAndRecommendations() {
        try {
            Map<String, Object> result = recommendationService.getHealthAnalysisAndRecommendations();
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("건강 분석 및 추천 정보 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "건강 분석 및 추천 정보 조회 중 오류가 발생했습니다."));
        }
    }


    /**
     * 사용자의 나이, BMI, 응답을 기반으로 건강 위험도를 계산합니다.
     * @param data 나이, BMI, 응답 정보를 포함한 Map
     * @return 계산된 위험도 정보를 포함한 ResponseEntity
     */
    @PostMapping("/calculate-risks")
    public ResponseEntity<Map<String, String>> calculateRisks(@RequestBody Map<String, Object> data) {
        int age = (int) data.get("age");
        double bmi = (double) data.get("bmi");
        List<MemberResponse> responses = (List<MemberResponse>) data.get("responses");

        Map<String, String> risks = riskCalculationService.calculateAllRisks(age, bmi, responses);
        return ResponseEntity.ok(risks);
    }

    /**
     * 추천 영양 성분에 따른 제품 추천 API.
     * @param data 나이, BMI, 응답, 추천 영양 성분 정보를 포함한 Map
     * @return 추천된 제품 목록을 포함한 ResponseEntity
     */
    @PostMapping("/recommend-products-by-ingredients")
    public ResponseEntity<Map<String, List<ProductRecommendationDTO>>> recommendProductsByIngredients(@RequestBody Map<String, Object> data) {
        int age = (int) data.get("age");
        double bmi = (double) data.get("bmi");
        List<MemberResponse> responses = (List<MemberResponse>) data.get("responses");

        // 1. 영양 성분 점수 계산
        Map<String, Integer> ingredientScores = nutrientScoreService.calculateIngredientScores(responses, age, bmi);

        // 2. HealthAnalysisDTO 생성 (필요한 정보만 포함)
        HealthAnalysisDTO healthAnalysis = new HealthAnalysisDTO(); // 기본 생성자 사용

        // 3. 추천 영양 성분 목록 가져오기
        Map<String, List<String>> recommendedIngredientsMap = nutrientScoreService.getRecommendedIngredients(healthAnalysis, ingredientScores, age, bmi);

        // 4. essential 과 additional 리스트를 합치기
        List<String> recommendedIngredients = new ArrayList<>();
        recommendedIngredientsMap.values().forEach(recommendedIngredients::addAll);

        // 5. 제품 추천
        Map<String, List<ProductRecommendationDTO>> recommendations =
                productRecommendationService.recommendProductsByIngredients(recommendedIngredients, ingredientScores);

        return ResponseEntity.ok(recommendations);
    }


    /**
     * 사용자의 응답, 나이, BMI를 기반으로 영양 점수를 계산합니다.
     * @param data 응답, 나이, BMI 정보를 포함한 Map
     * @return 계산된 영양 점수를 포함한 ResponseEntity
     */
    @PostMapping("/calculate-nutrient-scores")
    public ResponseEntity<Map<String, Integer>> calculateNutrientScores(@RequestBody Map<String, Object> data) {
        List<MemberResponse> responses = (List<MemberResponse>) data.get("responses");
        int age = (int) data.get("age");
        double bmi = (double) data.get("bmi");

        Map<String, Integer> scores = nutrientScoreService.calculateIngredientScores(responses, age, bmi);
        return ResponseEntity.ok(scores);
    }

    /**
     * 현재 로그인한 사용자의 건강 기록 히스토리를 조회합니다.
     * @return 건강 기록 리스트를 포함한 ResponseEntity
     */
    @GetMapping("/history")
    public ResponseEntity<List<HealthRecord>> getHealthHistory() {
        try {
            List<HealthRecord> history = recommendationService.getHealthHistory();
            return ResponseEntity.ok(history);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
