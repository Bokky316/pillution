package com.javalab.student.service;

import com.javalab.student.entity.Product;
import com.javalab.student.entity.MemberResponse;
import com.javalab.student.entity.MemberResponseOption;
import com.javalab.student.repository.ProductRepository;
import com.javalab.student.repository.MemberResponseRepository;
import com.javalab.student.repository.MemberResponseOptionRepository;
import com.javalab.student.repository.QuestionOptionIngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ProductRepository productRepository;
    private final MemberResponseRepository memberResponseRepository;
    private final MemberResponseOptionRepository memberResponseOptionRepository;
    private final QuestionOptionIngredientRepository ingredientRepository;

    /**
     * 사용자 ID를 기반으로 추천 제품을 반환합니다.
     * @param memberId 사용자 ID
     * @return 필수 추천 및 추가 추천으로 분류된 제품 목록
     */
    public Map<String, List<Product>> recommendProducts(Long memberId) {
        // Step 1: 사용자 응답에서 추천된 영양성분과 중요도 계산
        Map<String, Integer> ingredientScores = calculateIngredientScores(memberId);

        // Step 2: 상품별 중요도 점수 계산
        List<Product> scoredProducts = calculateProductScores(ingredientScores);

        // Step 3: 점수 기준으로 정렬 후 필수/추가 추천으로 분류
        return classifyRecommendations(scoredProducts);
    }

    /**
     * 사용자의 응답을 분석하여 각 영양성분의 점수를 계산합니다.
     * @param memberId 사용자 ID
     * @return 영양성분별 점수 맵
     */
    private Map<String, Integer> calculateIngredientScores(Long memberId) {
        // 싱글초이스와 멀티플초이스 응답을 가져옵니다.
        List<MemberResponse> singleChoiceResponses = memberResponseRepository.findByMember_IdAndQuestionQuestionTypeNot(memberId, "TEXT");
        List<MemberResponseOption> multipleChoiceResponses = memberResponseOptionRepository.findByMember_Id(memberId);

        Map<String, Integer> ingredientScores = new HashMap<>();

        // 싱글초이스 응답 처리
        for (MemberResponse response : singleChoiceResponses) {
            updateIngredientScores(ingredientScores, response.getQuestion().getId(), response.getResponseText());
        }

        // 멀티플초이스 응답 처리
        for (MemberResponseOption response : multipleChoiceResponses) {
            updateIngredientScores(ingredientScores, response.getQuestion().getId(), response.getOption().getOptionText());
        }

        return ingredientScores;
    }

    /**
     * 주어진 질문과 응답에 대한 영양성분 점수를 업데이트합니다.
     * @param ingredientScores 현재까지의 영양성분 점수 맵
     * @param questionId 질문 ID
     * @param responseText 응답 텍스트
     */
    private void updateIngredientScores(Map<String, Integer> ingredientScores, Long questionId, String responseText) {
        List<String> ingredients = ingredientRepository.findIngredientsByQuestionIdAndResponseText(questionId, responseText);
        for (String ingredient : ingredients) {
            ingredientScores.put(ingredient, ingredientScores.getOrDefault(ingredient, 0) + 1);
        }
    }

    /**
     * 영양성분 점수를 기반으로 각 제품의 점수를 계산합니다.
     * @param ingredientScores 영양성분별 점수 맵
     * @return 점수가 계산된 제품 리스트 (점수 내림차순 정렬)
     */
    private List<Product> calculateProductScores(Map<String, Integer> ingredientScores) {
        List<Product> allProducts = productRepository.findAll();

        for (Product product : allProducts) {
            int score = 0;
            String mainIngredient = productRepository.findMainIngredientByProductId(product.getId());
            if (mainIngredient != null) {
                score += ingredientScores.getOrDefault(mainIngredient, 0);
            }
            product.setScore(score);
        }

        return allProducts.stream()
                .sorted(Comparator.comparingInt(Product::getScore).reversed())
                .collect(Collectors.toList());
    }


    /**
     * 점수가 계산된 제품들을 필수 추천과 추가 추천으로 분류합니다.
     * @param scoredProducts 점수가 계산된 제품 리스트
     * @return 필수 추천 및 추가 추천으로 분류된 제품 맵
     */
    private Map<String, List<Product>> classifyRecommendations(List<Product> scoredProducts) {
        Map<String, List<Product>> classifiedRecommendations = new HashMap<>();

        // 점수가 3 이상인 상위 5개 제품을 필수 추천으로 분류
        List<Product> essentialRecommendations = scoredProducts.stream()
                .filter(p -> p.getScore() >= 3)
                .limit(5)
                .collect(Collectors.toList());

        // 점수가 1-2인 상위 5개 제품을 추가 추천으로 분류
        List<Product> additionalRecommendations = scoredProducts.stream()
                .filter(p -> p.getScore() < 3 && p.getScore() > 0)
                .limit(5)
                .collect(Collectors.toList());

        classifiedRecommendations.put("essential", essentialRecommendations);
        classifiedRecommendations.put("additional", additionalRecommendations);

        return classifiedRecommendations;
    }

    /**
     * 특정 카테고리 내에서 사용자에게 추천할 제품을 반환합니다.
     * @param categoryId 카테고리 ID
     * @param memberId 사용자 ID
     * @return 해당 카테고리 내에서 필수 추천 및 추가 추천으로 분류된 제품 맵
     */
    public Map<String, List<Product>> recommendProductsByCategory(Long categoryId, Long memberId) {
        // 전체 추천 제품을 가져옵니다.
        Map<String, List<Product>> allRecommendations = recommendProducts(memberId);

        // 해당 카테고리의 제품들을 가져옵니다.
        List<Product> categoryProducts = productRepository.findByCategoryId(categoryId);

        Map<String, List<Product>> categoryRecommendations = new HashMap<>();

        // 필수 추천 제품 중 해당 카테고리에 속하는 제품만 필터링합니다.
        categoryRecommendations.put("essential", allRecommendations.get("essential").stream()
                .filter(categoryProducts::contains)
                .collect(Collectors.toList()));

        // 추가 추천 제품 중 해당 카테고리에 속하는 제품만 필터링합니다.
        categoryRecommendations.put("additional", allRecommendations.get("additional").stream()
                .filter(categoryProducts::contains)
                .collect(Collectors.toList()));

        return categoryRecommendations;
    }
}
