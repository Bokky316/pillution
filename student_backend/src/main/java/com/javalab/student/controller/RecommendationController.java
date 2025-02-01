package com.javalab.student.controller;

import com.javalab.student.entity.Product;
import com.javalab.student.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * 사용자에 대한 전체 제품 추천을 제공합니다.
     * @param memberId 사용자 ID
     * @return 필수 추천 및 추가 추천으로 구분된 제품 리스트
     */
    @GetMapping("/{memberId}")
    public ResponseEntity<Map<String, List<Product>>> getRecommendations(@PathVariable Long memberId) {
        Map<String, List<Product>> recommendations = recommendationService.recommendProducts(memberId);
        return ResponseEntity.ok(recommendations);
    }

    /**
     * 특정 카테고리 내에서 사용자에 대한 제품 추천을 제공합니다.
     * @param categoryId 카테고리 ID
     * @param memberId 사용자 ID
     * @return 해당 카테고리 내에서 필수 추천 및 추가 추천으로 구분된 제품 리스트
     */
    @GetMapping("/category/{categoryId}/member/{memberId}")
    public ResponseEntity<Map<String, List<Product>>> getRecommendationsByCategory(
            @PathVariable Long categoryId,
            @PathVariable Long memberId) {
        Map<String, List<Product>> recommendations = recommendationService.recommendProductsByCategory(categoryId, memberId);
        return ResponseEntity.ok(recommendations);
    }
}
