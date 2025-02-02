package com.javalab.student.controller;

import com.javalab.student.dto.ProductRecommendationDTO;
import com.javalab.student.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

/**
 * 제품 추천 관련 API를 처리하는 컨트롤러
 */
@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @Autowired
    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * 사용자에 대한 전체 제품 추천을 반환합니다.
     * @param userDetails 현재 인증된 사용자의 정보
     * @return 추천 제품 목록 (필수 추천 및 추가 추천으로 분류)
     */
    @GetMapping
    public ResponseEntity<Map<String, List<ProductRecommendationDTO>>> getRecommendations(
            @AuthenticationPrincipal UserDetails userDetails) {
        // UserDetails에서 사용자 이메일을 추출
        String userEmail = userDetails.getUsername();

        // RecommendationService를 통해 추천 제품 목록을 가져옴
        Map<String, List<ProductRecommendationDTO>> recommendations =
                recommendationService.recommendProducts(userEmail);

        // 추천 목록을 HTTP 응답으로 반환
        return ResponseEntity.ok(recommendations);
    }

    /**
     * 특정 카테고리 내에서 사용자에 대한 제품 추천을 반환합니다.
     * @param categoryId 카테고리 ID
     * @param userDetails 현재 인증된 사용자의 정보
     * @return 해당 카테고리 내의 추천 제품 목록
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Map<String, List<ProductRecommendationDTO>>> getRecommendationsByCategory(
            @PathVariable Long categoryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        // UserDetails에서 사용자 이메일을 추출
        String userEmail = userDetails.getUsername();

        // RecommendationService를 통해 특정 카테고리의 추천 제품 목록을 가져옴
        Map<String, List<ProductRecommendationDTO>> recommendations =
                recommendationService.recommendProductsByCategory(categoryId, userEmail);

        // 추천 목록을 HTTP 응답으로 반환
        return ResponseEntity.ok(recommendations);
    }
}
