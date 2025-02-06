package com.javalab.student.controller;

import com.javalab.student.dto.HealthAnalysisDTO;
import com.javalab.student.dto.ProductRecommendationDTO;
import com.javalab.student.entity.HealthRecord;
import com.javalab.student.entity.MemberResponse;
import com.javalab.student.service.recommendation.RecommendationService;
import com.javalab.student.service.recommendation.ProductRecommendationService;
import com.javalab.student.service.recommendation.RiskCalculationService;
import com.javalab.student.service.recommendation.NutrientScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 건강 추천 관련 API를 처리하는 컨트롤러 클래스입니다.
 * 이 클래스는 건강 분석, 제품 추천, 위험도 계산, 영양 점수 계산 등의 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/health")
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
     * 사용자의 이메일을 기반으로 건강 분석 및 추천 정보를 제공합니다.
     * @param email 사용자 이메일
     * @return 건강 분석 및 추천 정보를 포함한 ResponseEntity
     */
    @GetMapping("/analysis")
    public ResponseEntity<Map<String, Object>> getHealthAnalysisAndRecommendations(@RequestParam String email) {
        try {
            Map<String, Object> result = recommendationService.getHealthAnalysisAndRecommendations(email);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 사용자의 건강 기록 히스토리를 조회합니다.
     * @param email 사용자 이메일
     * @return 건강 기록 리스트를 포함한 ResponseEntity
     */
    @GetMapping("/history")
    public ResponseEntity<List<HealthRecord>> getHealthHistory(@RequestParam String email) {
        try {
            List<HealthRecord> history = recommendationService.getHealthHistory(email);
            return ResponseEntity.ok(history);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
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
     * 사용자 정보를 기반으로 제품을 추천합니다.
     * @param data 회원 ID, 나이, BMI, 응답 정보를 포함한 Map
     * @return 추천된 제품 목록을 포함한 ResponseEntity
     */
    @PostMapping("/recommend-products")
    public ResponseEntity<Map<String, List<ProductRecommendationDTO>>> recommendProducts(@RequestBody Map<String, Object> data) {
        Long memberId = (Long) data.get("memberId");
        int age = (int) data.get("age");
        double bmi = (double) data.get("bmi");
        List<MemberResponse> responses = (List<MemberResponse>) data.get("responses");

        Map<String, List<ProductRecommendationDTO>> recommendations =
                productRecommendationService.recommendProducts(memberId, age, bmi, responses);
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
}
