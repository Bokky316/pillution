package com.javalab.student.controller;

import com.javalab.student.dto.healthSurvey.RecommendationDTO;
import com.javalab.student.dto.healthSurvey.RecommendedIngredientDTO;
import com.javalab.student.dto.healthSurvey.RecommendedProductDTO;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.Product;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 건강 추천 관련 API를 처리하는 컨트롤러 클래스입니다.
 * 이 클래스는 건강 분석, 제품 추천, 추천 영양 성분 계산 등의 기능을 제공합니다.
 */
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
    private final HealthRecordService healthRecordService;

    /**
     * 현재 로그인한 사용자의 건강 분석 및 추천 정보를 제공합니다.
     *
     * @return 건강 분석 및 추천 정보를 포함한 ResponseEntity
     */
    @GetMapping("/analysis")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getHealthAnalysisAndRecommendations() {
        log.info("getHealthAnalysisAndRecommendations 메서드 시작");
        try {
            Map<String, Object> result = recommendationService.getHealthAnalysisAndRecommendations();
            log.info("getHealthAnalysisAndRecommendations 메서드 반환값: {}", result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("건강 분석 및 추천 정보 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "건강 분석 및 추천 정보 조회 중 오류가 발생했습니다."));
        } finally {
            log.info("getHealthAnalysisAndRecommendations 메서드 종료");
        }
    }

    /**
     * 현재 로그인한 사용자의 건강 기록 히스토리를 조회합니다.
     *
     * @return 건강 기록 리스트를 포함한 ResponseEntity
     */
    @GetMapping("/history")
    @Transactional(readOnly = true)
    public ResponseEntity<List<RecommendationDTO>> getHealthHistory() {
        log.info("getHealthHistory 메서드 시작");
        try {
            List<RecommendationDTO> history = recommendationService.getHealthHistory();
            log.info("getHealthHistory 메서드 반환값: {}", history);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("건강 기록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        } finally {
            log.info("getHealthHistory 메서드 종료");
        }
    }

    /**
     * 추천 영양 성분 목록을 조회합니다.
     *
     * @return 추천 영양 성분 목록을 포함한 ResponseEntity
     */
    @GetMapping("/ingredients")
    @Transactional(readOnly = true)
    public ResponseEntity<List<RecommendedIngredientDTO>> getRecommendedIngredients() {
        log.info("getRecommendedIngredients 메서드 시작");
        try {
            Member member = authenticationService.getAuthenticatedMember();
            log.info("현재 로그인한 사용자 ID: {}", member.getId());

            Recommendation latestRecommendation = recommendationRepository
                    .findTopByMemberIdOrderByCreatedAtDesc(member.getId())
                    .orElseThrow(() -> {
                        String errorMessage = "사용자 ID " + member.getId() + "에 대한 추천 데이터가 없습니다.";
                        log.error(errorMessage);
                        return new RuntimeException(errorMessage);
                    });

            List<RecommendedIngredient> ingredients = recommendedIngredientRepository.findByRecommendationId(latestRecommendation.getId());
            log.info("추천 영양 성분 목록: {}", ingredients);

            List<RecommendedIngredientDTO> ingredientDTOs = ingredients.stream()
                    .map(ingredient -> {
                        RecommendedIngredientDTO dto = new RecommendedIngredientDTO();
                        dto.setId(ingredient.getId());
                        dto.setIngredientName(ingredient.getIngredientName());
                        dto.setScore(ingredient.getScore());
                        return dto;
                    })
                    .collect(Collectors.toList());

            log.info("변환된 추천 영양 성분 DTO 목록: {}", ingredientDTOs);

            return ResponseEntity.ok(ingredientDTOs);
        } catch (Exception e) {
            log.error("추천 영양 성분 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } finally {
            log.info("getRecommendedIngredients 메서드 종료");
        }
    }

    /**
     * 추천 상품 목록을 조회합니다.
     *
     * @return 추천 상품 목록을 포함한 ResponseEntity
     */
    @GetMapping("/products")
    @Transactional(readOnly = true)
    public ResponseEntity<List<RecommendedProductDTO>> getRecommendedProducts() {
        log.info("getRecommendedProducts 메서드 시작");
        try {
            // 현재 인증된 사용자 가져오기
            Member member = authenticationService.getAuthenticatedMember();
            log.info("현재 로그인한 사용자 ID: {}", member.getId());

            // 최신 추천 데이터를 가져오기
            Recommendation latestRecommendation = recommendationRepository
                    .findTopByMemberIdOrderByCreatedAtDesc(member.getId())
                    .orElseThrow(() -> {
                        String errorMessage = "사용자 ID " + member.getId() + "에 대한 추천 데이터가 없습니다.";
                        log.error(errorMessage);
                        return new RuntimeException(errorMessage);
                    });

            // 추천된 상품 리스트 가져오기
            List<RecommendedProduct> recommendedProducts = recommendedProductRepository.findByRecommendationId(latestRecommendation.getId());
            log.info("추천 상품 목록: {}", recommendedProducts);

            // RecommendedProduct -> RecommendedProductDTO 변환
            List<RecommendedProductDTO> productDTOs = recommendedProducts.stream()
                    .map(recommendedProduct -> {
                        Product product = recommendedProduct.getProduct(); // 연관된 Product 엔티티 가져오기
                        log.info("추천 상품: {}", product);

                        RecommendedProductDTO dto = new RecommendedProductDTO();
                        dto.setId(product.getId()); // 제품 ID 설정
                        dto.setName(product.getName()); // 제품 이름 설정
                        //dto.setDescription(product.getDescription()); // 제품 설명 설정
                        //dto.setPrice(product.getPrice()); // 제품 가격 설정
                        //dto.setScore(recommendedProduct.getScore()); // 제품 점수 설정 (해당 필드가 없으므로 주석 처리)
                        //dto.setMainIngredient(product.getMainIngredient()); // 추천 영양 성분 목록 설정 (해당 필드가 없으므로 주석 처리)
                        //dto.setIngredientScores(product.getIngredientScores()); // 영양 성분별 점수 맵 설정 (해당 필드가 없으므로 주석 처리)

                        log.info("변환된 추천 상품 DTO: {}", dto);
                        return dto;
                    })
                    .collect(Collectors.toList());

            log.info("변환된 추천 상품 DTO 목록: {}", productDTOs);

            return ResponseEntity.ok(productDTOs);
        } catch (Exception e) {
            log.error("추천 상품 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } finally {
            log.info("getRecommendedProducts 메서드 종료");
        }
    }

    /**
     * 사용자의 건강 기록 목록을 조회합니다.
     *
     * @return 건강 기록 목록을 포함한 ResponseEntity
     */
    @GetMapping("/health-records")
    public ResponseEntity<List<HealthRecord>> getHealthRecords() {
        log.info("getHealthRecords 메서드 시작");
        try {
            Member member = authenticationService.getAuthenticatedMember();
            log.info("현재 로그인한 사용자 ID: {}", member.getId());
            List<HealthRecord> healthRecords = healthRecordService.getHealthHistory(member.getId());
            log.info("건강 기록 목록: {}", healthRecords);
            return ResponseEntity.ok(healthRecords);
        } catch (Exception e) {
            log.error("건강 기록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } finally {
            log.info("getHealthRecords 메서드 종료");
        }
    }
}
