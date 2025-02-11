package com.javalab.student.service.healthSurvey;

import com.javalab.student.dto.healthSurvey.ProductRecommendationDTO;
import com.javalab.student.entity.ProductIngredient;
import com.javalab.student.entity.Product;
import com.javalab.student.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 제품 추천 서비스
 * 추천 영양 성분을 바탕으로 제품을 추천합니다.
 */
@Service
public class ProductRecommendationService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NutrientScoreService nutrientScoreService;

    /**
     * Product 엔티티를 ProductRecommendationDTO로 변환합니다.
     *
     * @param product           변환할 Product 엔티티
     * @param ingredientScores  영양 성분 점수 맵
     * @return 변환된 ProductRecommendationDTO
     */
    private ProductRecommendationDTO convertToDTO(Product product, Map<String, Integer> ingredientScores) {
        // 제품에 포함된 각 영양 성분의 점수를 매핑합니다.
        Map<String, Integer> productIngredientScores = product.getIngredients().stream()
                .collect(Collectors.toMap(
                        ProductIngredient::getIngredientName, // 영양 성분 이름
                        ingredient -> ingredientScores.getOrDefault(ingredient.getIngredientName(), 0) // 해당 영양 성분의 점수, 없으면 0
                ));

        return new ProductRecommendationDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getScore(),
                product.getIngredients().isEmpty() ? null : product.getIngredients().get(0).getIngredientName(),
                productIngredientScores
        );
    }

    /**
     * 추천된 영양 성분 목록에 따라 제품을 추천합니다.
     *
     * @param recommendedIngredients 추천된 영양 성분 이름 목록
     * @param ingredientScores       영양 성분별 점수 맵
     * @return 추천 결과 맵 (각 카테고리별 추천 제품 목록)
     */
    public Map<String, List<ProductRecommendationDTO>> recommendProductsByIngredients(List<String> recommendedIngredients, Map<String, Integer> ingredientScores) {
        Map<String, List<ProductRecommendationDTO>> recommendations = new HashMap<>();
        List<Product> allProducts = productRepository.findAll();

        // 1. 추천 영양 성분을 2개 이상 포함하는 제품 추천 (추천 영양 성분 많을수록 우선 순위 높음)
        List<ProductRecommendationDTO> multiIngredientProducts = findMultiIngredientProducts(allProducts, recommendedIngredients, ingredientScores);
        if (!multiIngredientProducts.isEmpty()) {
            recommendations.put("multiIngredient", multiIngredientProducts);
        }

        // 2. 추천 영양 성분은 1개이지만 다른 영양 성분도 포함하는 제품 (순위 높임)
        List<ProductRecommendationDTO> singleRecommendedWithOtherProducts = findSingleRecommendedWithOtherProducts(allProducts, recommendedIngredients, ingredientScores);
        if (!singleRecommendedWithOtherProducts.isEmpty()) {
            recommendations.put("singleRecommendedWithOther", singleRecommendedWithOtherProducts);
        }

        // 3. 단일 영양 성분 제품 추천 (각 영양 성분별로 그룹화)
        for (String ingredient : recommendedIngredients) {
            List<ProductRecommendationDTO> singleIngredientProducts = findSingleIngredientProducts(allProducts, ingredient, ingredientScores);
            if (!singleIngredientProducts.isEmpty()) {
                recommendations.put(ingredient, singleIngredientProducts);
            }
        }

        return recommendations;
    }

    /**
     * 추천 영양 성분을 2개 이상 포함하는 제품을 찾고, 포함된 추천 영양 성분 수에 따라 순위를 매깁니다.
     *
     * @param allProducts            전체 제품 목록
     * @param recommendedIngredients 추천된 영양 성분 목록
     * @param ingredientScores       영양 성분 점수
     * @return 추천 제품 DTO 목록
     */
    private List<ProductRecommendationDTO> findMultiIngredientProducts(List<Product> allProducts, List<String> recommendedIngredients, Map<String, Integer> ingredientScores) {
        return allProducts.stream()
                .filter(product -> {
                    // 제품에 포함된 추천 영양 성분 수를 계산
                    if (product.getId() == null) {
                        return false; // product.getId()가 null이면 필터링
                    }
                    long matchedIngredientsCount = product.getIngredients().stream()
                            .map(ProductIngredient::getIngredientName)
                            .filter(recommendedIngredients::contains)
                            .count();
                    return matchedIngredientsCount >= 2; // 추천 영양 성분 2개 이상 포함 필터링
                })
                .map(product -> convertToDTO(product, ingredientScores))
                .sorted((p1, p2) -> {
                    // 추천 영양 성분 수에 따라 내림차순으로 정렬 (많을수록 우선순위 높음)
                    long count1 = p1.getIngredientScores().keySet().stream().filter(recommendedIngredients::contains).count();
                    long count2 = p2.getIngredientScores().keySet().stream().filter(recommendedIngredients::contains).count();
                    return Long.compare(count2, count1); // 내림차순 정렬
                })
                .collect(Collectors.toList());
    }


    /**
     * 추천 영양 성분을 1개 포함하지만 다른 영양 성분도 포함하는 제품을 찾습니다.
     *
     * @param allProducts            전체 제품 목록
     * @param recommendedIngredients 추천된 영양 성분 목록
     * @param ingredientScores       영양 성분 점수
     * @return 추천 제품 DTO 목록
     */
    private List<ProductRecommendationDTO> findSingleRecommendedWithOtherProducts(List<Product> allProducts, List<String> recommendedIngredients, Map<String, Integer> ingredientScores) {
        return allProducts.stream()
                .filter(product -> {
                    // 제품에 추천 영양 성분이 1개만 포함되어 있는지 확인
                    long matchedIngredientsCount = product.getIngredients().stream()
                            .map(ProductIngredient::getIngredientName)
                            .filter(recommendedIngredients::contains)
                            .count();
                    return matchedIngredientsCount == 1 && product.getIngredients().size() > 1; // 추천 성분 1개, 다른 성분도 포함
                })
                .map(product -> convertToDTO(product, ingredientScores))
                .sorted(Comparator.comparingInt(ProductRecommendationDTO::getScore).reversed()) // 점수 순으로 정렬
                .collect(Collectors.toList());
    }

    /**
     * 특정 영양 성분을 *하나 이상* 포함하는 제품을 찾습니다.
     * 이 제품들은 특정 영양 성분에 대한 필요를 충족하기 위해 추천됩니다.
     *
     * @param allProducts      전체 제품 목록
     * @param ingredientName   영양 성분 이름
     * @param ingredientScores 영양 성분 점수
     * @return 추천 제품 DTO 목록
     */
    private List<ProductRecommendationDTO> findSingleIngredientProducts(List<Product> allProducts, String ingredientName, Map<String, Integer> ingredientScores) {
        return allProducts.stream()
                .filter(product -> product.getIngredients().stream()
                        .anyMatch(i -> ingredientName.equals(i.getIngredientName()))) // 영양 성분 포함 여부 확인
                .map(product -> convertToDTO(product, ingredientScores))
                .sorted(Comparator.comparingInt(ProductRecommendationDTO::getScore).reversed()) // 점수 순으로 정렬
                .collect(Collectors.toList());
    }
}
