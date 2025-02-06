package com.javalab.student.service.recommendation;

import com.javalab.student.dto.ProductRecommendationDTO;
import com.javalab.student.entity.MemberResponse;
import com.javalab.student.entity.Product;
import com.javalab.student.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 제품 추천 서비스
 * 사용자의 정보와 응답을 기반으로 제품을 추천합니다.
 */
@Service
public class ProductRecommendationService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NutrientScoreService nutrientScoreService;

    /**
     * 사용자에게 제품을 추천합니다.
     *
     * @param memberId 회원 ID
     * @param age 회원의 나이
     * @param bmi 회원의 BMI
     * @param responses 회원의 응답 목록
     * @return 추천된 제품 목록 (필수 추천 및 추가 추천)
     */
    public Map<String, List<ProductRecommendationDTO>> recommendProducts(Long memberId, int age, double bmi, List<MemberResponse> responses) {
        // 영양 성분 점수 계산
        Map<String, Integer> ingredientScores = nutrientScoreService.calculateIngredientScores(responses, age, bmi);

        // 모든 제품에 대해 점수 계산
        List<Product> scoredProducts = calculateProductScores(productRepository.findAll(), ingredientScores);

        // 추천 제품 분류
        return classifyRecommendations(scoredProducts);
    }

    /**
     * 각 제품의 점수를 계산합니다.
     *
     * @param products 모든 제품 목록
     * @param ingredientScores 영양 성분 점수
     * @return 점수가 계산된 제품 목록
     */
    private List<Product> calculateProductScores(List<Product> products, Map<String, Integer> ingredientScores) {
        return products.stream()
                .map(product -> {
                    int score = product.getIngredients().stream()
                            .mapToInt(ingredient -> {
                                Integer ingredientScore = ingredientScores.get(ingredient.getIngredientName());
                                return (ingredientScore != null) ? ingredientScore : 0;
                            })
                            .sum();
                    product.setScore(score);
                    return product;
                })
                .sorted(Comparator.comparingInt(Product::getScore).reversed())
                .collect(Collectors.toList());
    }

    /**
     * 점수가 계산된 제품을 필수 추천과 추가 추천으로 분류합니다.
     *
     * @param scoredProducts 점수가 계산된 제품 목록
     * @return 분류된 추천 제품 목록
     */
    private Map<String, List<ProductRecommendationDTO>> classifyRecommendations(List<Product> scoredProducts) {
        Map<String, List<ProductRecommendationDTO>> recommendations = new HashMap<>();

        List<ProductRecommendationDTO> essentialRecommendations = scoredProducts.stream()
                .limit(3)
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        List<ProductRecommendationDTO> additionalRecommendations = scoredProducts.stream()
                .skip(3)
                .limit(5)
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        recommendations.put("essential", essentialRecommendations);
        recommendations.put("additional", additionalRecommendations);

        return recommendations;
    }

    /**
     * Product 엔티티를 ProductRecommendationDTO로 변환합니다.
     *
     * @param product 변환할 Product 엔티티
     * @return 변환된 ProductRecommendationDTO
     */
    private ProductRecommendationDTO convertToDTO(Product product) {
        return new ProductRecommendationDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getScore(),
                product.getIngredients().isEmpty() ? null : product.getIngredients().get(0).getIngredientName()
        );
    }
}
