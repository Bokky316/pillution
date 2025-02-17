package com.javalab.student.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javalab.student.dto.healthSurvey.HealthAnalysisDTO;
import com.javalab.student.dto.healthSurvey.RecommendationDTO;
import com.javalab.student.dto.healthSurvey.RecommendedIngredientDTO;
import com.javalab.student.dto.healthSurvey.RecommendedProductDTO;
import com.javalab.student.dto.healthSurvey.ProductRecommendationDTO;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.product.ProductImg;
import com.javalab.student.entity.product.Product;
import com.javalab.student.entity.healthSurvey.HealthRecord;
import com.javalab.student.entity.healthSurvey.Recommendation;
import com.javalab.student.entity.healthSurvey.RecommendedIngredient;
import com.javalab.student.entity.healthSurvey.RecommendedProduct;
import com.javalab.student.service.healthSurvey.HealthRecordService;
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
import java.util.Arrays;
import java.io.IOException;

/**
 * 추천 관련 API를 제공하는 컨트롤러 클래스
 */
@RestController
@RequestMapping("/api/recommendation")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {

    private final RecommendationService recommendationService; // 추천 서비스
    private final AuthenticationService authenticationService; // 인증 서비스
    private final RecommendationRepository recommendationRepository; // 추천 리포지토리
    private final RecommendedIngredientRepository recommendedIngredientRepository; // 추천 영양 성분 리포지토리
    private final RecommendedProductRepository recommendedProductRepository; // 추천 제품 리포지토리
    private final HealthRecordService healthRecordService; // 건강 기록 서비스

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

    /**
     * 현재 로그인한 사용자의 추천 영양 성분을 조회합니다.
     *
     * @return 추천 영양 성분 리스트를 포함한 ResponseEntity
     */
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

    /**
     * 현재 로그인한 사용자의 추천 제품을 조회합니다.
     *
     * @return 추천 제품 리스트를 포함한 ResponseEntity
     */
    @GetMapping("/products")
    public ResponseEntity<List<RecommendedProductDTO>> getRecommendedProducts() {
        try {
            Member member = authenticationService.getAuthenticatedMember();

            Recommendation latestRecommendation = recommendationRepository
                    .findTopByMemberIdOrderByCreatedAtDesc(member.getId())
                    .orElseThrow(() -> new RuntimeException("추천 데이터가 없습니다."));

            List<RecommendedProduct> recommendedProducts = recommendedProductRepository.findByRecommendationId(latestRecommendation.getId());

            List<RecommendedProductDTO> productDTOs = recommendedProducts.stream()
                    .map(recommendedProduct -> {
                        Product product = recommendedProduct.getProduct();

                        RecommendedProductDTO dto = new RecommendedProductDTO();
                        dto.setId(recommendedProduct.getId());
                        dto.setProductId(product.getId());
                        dto.setProductName(product.getName());
                        dto.setPrice(product.getPrice().doubleValue());
                        String mainImageUrl = product.getProductImgList().stream()
                                .filter(img -> "대표".equals(img.getImageType()))
                                .findFirst()
                                .map(ProductImg::getImageUrl)
                                .orElse(null);
                        dto.setMainImageUrl(mainImageUrl); // 이미지 URL 추가
                        dto.setReason(recommendedProduct.getReason());
                        dto.setRelatedIngredients(recommendedProduct.getRelatedIngredients());
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

    /**
     * 현재 로그인한 사용자의 건강 기록을 조회합니다.
     *
     * @return 건강 기록 리스트를 포함한 ResponseEntity
     */
    @GetMapping("/health-records")
    public ResponseEntity<List<RecommendationDTO>> getHealthRecords() {
        try {
            Member member = authenticationService.getAuthenticatedMember(); // 현재 로그인한 사용자 정보 가져오기
            List<HealthRecord> healthRecords = healthRecordService.getHealthHistory(member.getId()); // 건강 기록 조회

            // HealthRecord -> RecommendationDTO 변환
            List<RecommendationDTO> recommendationDTOs = healthRecords.stream()
                    .map(healthRecord -> {
                        RecommendationDTO dto = new RecommendationDTO();
                        dto.setId(healthRecord.getId());
                        dto.setMemberId(member.getId());
                        dto.setCreatedAt(healthRecord.getRecordDate());

                        // HealthAnalysis 정보 추가
                        HealthAnalysisDTO healthAnalysisDTO = new HealthAnalysisDTO();
                        healthAnalysisDTO.setName(healthRecord.getName());
                        healthAnalysisDTO.setGender(healthRecord.getGender());
                        healthAnalysisDTO.setAge(healthRecord.getAge());
                        healthAnalysisDTO.setBmi(healthRecord.getBmi());
                        healthAnalysisDTO.setRiskLevels(healthRecord.getRiskLevels());
                        healthAnalysisDTO.setOverallAssessment(healthRecord.getOverallAssessment());
                        dto.setHealthAnalysis(healthAnalysisDTO);

                        // 추천 제품 정보 추가 (JSON 문자열 -> List<ProductRecommendationDTO>)
                        try {
                            ObjectMapper objectMapper = new ObjectMapper();
                            String recommendedProductsJson = healthRecord.getRecommendedProducts(); // JSON 문자열 가져오기
                            List<ProductRecommendationDTO> productRecommendations = null;

                            if (recommendedProductsJson != null && !recommendedProductsJson.isEmpty()) {
                                productRecommendations = objectMapper.readValue(
                                        recommendedProductsJson,
                                        objectMapper.getTypeFactory().constructCollectionType(List.class, ProductRecommendationDTO.class)
                                );
                            } else {
                                productRecommendations = List.of(); // 빈 문자열인 경우 빈 리스트 반환
                            }
                            dto.setProductRecommendations(productRecommendations);
                        } catch (Exception e) {
                            log.error("추천 제품 변환 중 오류 발생", e);
                            dto.setProductRecommendations(List.of()); // 변환 실패 시 빈 리스트
                        }

                        // 추천 영양 성분 정보 추가 (JSON 문자열 -> List<RecommendedIngredientDTO>)
                        try {
                            ObjectMapper objectMapper = new ObjectMapper();
                            String recommendedIngredientsJson = healthRecord.getRecommendedIngredients(); // JSON 문자열 가져오기
                            List<RecommendedIngredientDTO> recommendedIngredients = null;

                            if (recommendedIngredientsJson != null && !recommendedIngredientsJson.isEmpty()) {
                                recommendedIngredients = objectMapper.readValue(
                                        recommendedIngredientsJson,
                                        objectMapper.getTypeFactory().constructCollectionType(List.class, RecommendedIngredientDTO.class)
                                );
                            } else {
                                recommendedIngredients = List.of(); // 빈 문자열인 경우 빈 리스트 반환
                            }
                            dto.setRecommendedIngredients(recommendedIngredients);
                        } catch (Exception e) {
                            log.error("추천 영양 성분 변환 중 오류 발생", e);
                            dto.setRecommendedIngredients(List.of()); // 변환 실패 시 빈 리스트
                        }

                        return dto; // DTO 반환
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(recommendationDTOs); // 추천 DTO 리스트 반환
        } catch (Exception e) {
            log.error("건강 기록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
