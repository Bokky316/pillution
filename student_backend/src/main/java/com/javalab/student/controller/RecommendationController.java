package com.javalab.student.controller;

import com.javalab.student.dto.healthSurvey.RecommendedProductDTO;
import com.javalab.student.entity.healthSurvey.HealthRecord;
import com.javalab.student.entity.healthSurvey.MemberResponse;
import com.javalab.student.service.healthSurvey.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 건강 추천 관련 API를 처리하는 컨트롤러 클래스입니다.
 * 이 클래스는 건강 분석, 제품 추천, 위험도 계산, 영양 점수 계산 등의 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/recommendation")
@Slf4j
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * 현재 로그인한 사용자의 건강 분석 및 추천 정보를 제공합니다.
     *
     * @return 건강 분석 및 추천 정보를 포함한 ResponseEntity
     */
    @GetMapping("/analysis")
    public ResponseEntity<Map<String, Object>> getHealthAnalysisAndRecommendations() {
        try {
            Map<String, Object> result = recommendationService.getHealthAnalysisAndRecommendations();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("건강 분석 및 추천 정보 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "건강 분석 및 추천 정보 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 사용자의 나이, BMI, 응답을 기반으로 건강 위험도를 계산합니다.
     *
     * @param data 나이, BMI, 응답 정보를 포함한 Map
     * @return 계산된 위험도 정보를 포함한 ResponseEntity
     */
    @PostMapping("/calculate-risks")
    public ResponseEntity<Map<String, String>> calculateRisks(@RequestBody Map<String, Object> data) {
        try {
            int age = (int) data.get("age");
            double bmi = (double) data.get("bmi");
            List<MemberResponse> responses = (List<MemberResponse>) data.get("responses");

            Map<String, String> risks = recommendationService.calculateRisks(age, bmi, responses);
            return ResponseEntity.ok(risks);
        } catch (Exception e) {
            log.error("건강 위험도 계산 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "건강 위험도 계산 중 오류가 발생했습니다."));
        }
    }

    /**
     * 추천 영양 성분에 따른 제품 추천 API.
     *
     * @param data 나이, BMI, 응답 정보를 포함한 Map
     * @return 추천된 제품 목록을 포함한 ResponseEntity
     */
    @PostMapping("/recommend-products-by-ingredients")
    public ResponseEntity<?> recommendProductsByIngredients(@RequestBody Map<String, Object> data) {
        try {
            int age = ((Number) data.get("age")).intValue();
            double bmi = ((Number) data.get("bmi")).doubleValue();
            List<MemberResponse> responses = (List<MemberResponse>) data.get("responses");

            Map<String, List<RecommendedProductDTO>> resultMap = recommendationService.recommendProductsByIngredients(age, bmi, responses);
            return ResponseEntity.ok(resultMap);
        } catch (Exception e) {
            log.error("추천 제품 목록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "추천 제품 목록 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 사용자의 응답, 나이, BMI를 기반으로 영양 점수를 계산합니다.
     *
     * @param data 응답, 나이, BMI 정보를 포함한 Map
     * @return 계산된 영양 점수를 포함한 ResponseEntity
     */
    @PostMapping("/calculate-nutrient-scores")
    public ResponseEntity<?> calculateNutrientScores(@RequestBody Map<String, Object> data) {
        try {
            List<MemberResponse> responses = (List<MemberResponse>) data.get("responses");
            int age = ((Number) data.get("age")).intValue();
            double bmi = ((Number) data.get("bmi")).doubleValue();

            Map<String, Integer> scores = recommendationService.calculateNutrientScores(responses, age, bmi);
            return ResponseEntity.ok(scores);
        } catch (Exception e) {
            log.error("영양 점수 계산 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "영양 점수 계산 중 오류가 발생했습니다."));
        }
    }

    /**
     * 현재 로그인한 사용자의 건강 기록 히스토리를 조회합니다.
     *
     * @return 건강 기록 리스트를 포함한 ResponseEntity
     */
    @GetMapping("/history")
    public ResponseEntity<List<HealthRecord>> getHealthHistory() {
        try {
            List<HealthRecord> history = recommendationService.getHealthHistory();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("건강 기록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
