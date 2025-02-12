package com.javalab.student.controller;

import com.javalab.student.dto.healthSurvey.RecommendationDTO;
import com.javalab.student.dto.healthSurvey.RecommendedIngredientDTO;
import com.javalab.student.dto.healthSurvey.RecommendedProductDTO;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.healthSurvey.Recommendation;
import com.javalab.student.entity.healthSurvey.RecommendedIngredient;
import com.javalab.student.entity.healthSurvey.RecommendedProduct;
import com.javalab.student.service.healthSurvey.RecommendationService;
import com.javalab.student.service.healthSurvey.AuthenticationService;
import com.javalab.student.repository.healthSurvey.RecommendationRepository;
import com.javalab.student.repository.healthSurvey.RecommendedIngredientRepository;
import com.javalab.student.repository.healthSurvey.RecommendedProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendation")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final AuthenticationService authenticationService;
    private final RecommendationRepository recommendationRepository;
    private final RecommendedIngredientRepository recommendedIngredientRepository;
    private final RecommendedProductRepository recommendedProductRepository;
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
     * 현재 로그인한 사용자의 건강 기록 히스토리를 조회합니다.
     *
     * @return 건강 기록 리스트를 포함한 ResponseEntity
     */
    @GetMapping("/history")
    public ResponseEntity<List<RecommendationDTO>> getHealthHistory() {
        try {
            List<RecommendationDTO> history = recommendationService.getHealthHistory();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("건강 기록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/ingredients")
    public ResponseEntity<List<RecommendedIngredientDTO>> getRecommendedIngredients() {
        try {
            Member member = authenticationService.getAuthenticatedMember();

            Recommendation latestRecommendation = recommendationRepository
                    .findTopByMemberIdOrderByCreatedAtDesc(member.getId())
                    .orElseThrow(() -> new RuntimeException("추천 데이터가 없습니다."));

            List<RecommendedIngredient> ingredients = recommendedIngredientRepository.findByRecommendationId(latestRecommendation.getId());

            List<RecommendedIngredientDTO> ingredientDTOs = ingredients.stream()
                    .map(ingredient -> {
                        RecommendedIngredientDTO dto = new RecommendedIngredientDTO();
                        dto.setId(ingredient.getId());
                        dto.setIngredientName(ingredient.getIngredientName());
                        dto.setScore(ingredient.getScore());
                        return dto;
                    })
                    .collect(Collectors.toList());

            log.info("Recommended Ingredients: {}", ingredientDTOs);

            return ResponseEntity.ok(ingredientDTOs);
        } catch (Exception e) {
            log.error("추천 영양 성분 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/products")
    public ResponseEntity<List<RecommendedProductDTO>> getRecommendedProducts() {
        try {
            Member member = authenticationService.getAuthenticatedMember();

            Recommendation latestRecommendation = recommendationRepository
                    .findTopByMemberIdOrderByCreatedAtDesc(member.getId())
                    .orElseThrow(() -> new RuntimeException("추천 데이터가 없습니다."));

            List<RecommendedProduct> products = recommendedProductRepository.findByRecommendationId(latestRecommendation.getId());

            List<RecommendedProductDTO> productDTOs = products.stream()
                    .map(product -> {
                        RecommendedProductDTO dto = new RecommendedProductDTO();
                        dto.setId(product.getId());
                        dto.setProductId(product.getProductId());
                        dto.setReason(product.getReason());
                        return dto;
                    })
                    .collect(Collectors.toList());

            log.info("Recommended Products: {}", productDTOs);

            return ResponseEntity.ok(productDTOs);
        } catch (Exception e) {
            log.error("추천 상품 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}


