package com.javalab.student.service;

import com.javalab.student.entity.Member;
import com.javalab.student.entity.Product;
import com.javalab.student.entity.MemberResponse;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.ProductRepository;
import com.javalab.student.repository.MemberResponseRepository;
import com.javalab.student.repository.QuestionOptionIngredientRepository;
import com.javalab.student.dto.ProductRecommendationDTO;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.persistence.EntityNotFoundException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 제품 추천 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
public class RecommendationService {

    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private MemberResponseRepository memberResponseRepository;
    @Autowired
    private QuestionOptionIngredientRepository questionOptionIngredientRepository;

    /**
     * 사용자 이메일을 기반으로 제품을 추천합니다.
     * @param userEmail 사용자 이메일
     * @return 추천 제품 목록 (필수 추천 및 추가 추천으로 분류)
     * @throws EntityNotFoundException 사용자를 찾을 수 없는 경우
     */
    public Map<String, List<ProductRecommendationDTO>> recommendProducts(String userEmail) {
        // 이메일을 사용하여 사용자 정보를 조회합니다.
        Member member = memberRepository.findByEmail(userEmail);
        if (member == null) {
            throw new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userEmail);
        }

        Long memberId = member.getId();

        // 사용자 응답을 기반으로 성분 점수를 계산합니다.
        Map<String, Integer> ingredientScores = calculateIngredientScores(memberId);
        // 모든 제품에 대해 점수를 계산합니다.
        List<Product> scoredProducts = calculateProductScores(productRepository.findAll(), ingredientScores);
        // 점수를 기준으로 제품을 분류합니다.
        return classifyRecommendations(scoredProducts);
    }

    /**
     * 특정 카테고리 내에서 사용자에 대한 제품을 추천합니다.
     * @param categoryId 카테고리 ID
     * @param userEmail 사용자 이메일
     * @return 추천 제품 목록 (필수 추천 및 추가 추천으로 분류)
     * @throws EntityNotFoundException 사용자를 찾을 수 없는 경우
     */
    public Map<String, List<ProductRecommendationDTO>> recommendProductsByCategory(Long categoryId, String userEmail) {
        // 이메일을 사용하여 사용자 정보를 조회합니다.
        Member member = memberRepository.findByEmail(userEmail);
        if (member == null) {
            throw new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userEmail);
        }

        Long memberId = member.getId();

        // 사용자 응답을 기반으로 성분 점수를 계산합니다.
        Map<String, Integer> ingredientScores = calculateIngredientScores(memberId);
        // 특정 카테고리의 제품만 조회합니다.
        List<Product> categoryProducts = productRepository.findByCategoryId(categoryId);
        // 카테고리 제품에 대해 점수를 계산합니다.
        List<Product> scoredProducts = calculateProductScores(categoryProducts, ingredientScores);
        // 점수를 기준으로 제품을 분류합니다.
        return classifyRecommendations(scoredProducts);
    }

    /**
     * 사용자 응답을 기반으로 각 성분의 점수를 계산합니다.
     * @param memberId 회원 ID
     * @return 성분별 점수 맵
     */
    private Map<String, Integer> calculateIngredientScores(Long memberId) {
        // "PERSONAL" 타입이 아닌 질문에 대한 응답만 가져옵니다.
        List<MemberResponse> responses = memberResponseRepository.findByMember_IdAndQuestionQuestionTypeNot(memberId, "PERSONAL");
        Map<String, Integer> ingredientScores = new HashMap<>();

        for (MemberResponse response : responses) {
            // 각 응답에 대한 성분 목록을 조회합니다.
            List<String> ingredients = questionOptionIngredientRepository.findIngredientsByQuestionIdAndResponseText(
                    response.getQuestion().getId(), response.getResponseText());
            // 각 성분의 점수를 증가시킵니다.
            for (String ingredient : ingredients) {
                ingredientScores.put(ingredient, ingredientScores.getOrDefault(ingredient, 0) + 1);
            }
        }

        return ingredientScores;
    }

    /**
     * 주어진 제품 목록에 대해 성분 점수를 기반으로 제품 점수를 계산합니다.
     * @param products 제품 목록
     * @param ingredientScores 성분별 점수 맵
     * @return 점수가 계산된 제품 목록 (점수 내림차순 정렬)
     */
    private List<Product> calculateProductScores(List<Product> products, Map<String, Integer> ingredientScores) {
        for (Product product : products) {
            int score = 0;
            // 제품의 주 성분을 조회합니다.
            String mainIngredient = productRepository.findMainIngredientByProductId(product.getId());
            if (mainIngredient != null) {
                // 주 성분의 점수를 제품 점수에 추가합니다.
                score += ingredientScores.getOrDefault(mainIngredient, 0);
            }
            product.setScore(score);
        }

        // 점수를 기준으로 제품을 내림차순 정렬합니다.
        return products.stream()
                .sorted((p1, p2) -> Integer.compare(p2.getScore(), p1.getScore()))
                .collect(Collectors.toList());
    }

    /**
     * 점수가 계산된 제품 목록을 필수 추천과 추가 추천으로 분류합니다.
     * @param scoredProducts 점수가 계산된 제품 목록
     * @return 분류된 추천 제품 목록
     */
    private Map<String, List<ProductRecommendationDTO>> classifyRecommendations(List<Product> scoredProducts) {
        Map<String, List<ProductRecommendationDTO>> recommendations = new HashMap<>();
        List<ProductRecommendationDTO> essentialRecommendations = new ArrayList<>();
        List<ProductRecommendationDTO> additionalRecommendations = new ArrayList<>();

        int totalRecommendations = Math.min(scoredProducts.size(), 8);

        for (int i = 0; i < totalRecommendations; i++) {
            Product product = scoredProducts.get(i);
            ProductRecommendationDTO dto = convertToDTO(product);

            if (i < 3) {
                // 상위 3개 제품을 필수 추천으로 분류 (3개 미만일 수 있음)
                essentialRecommendations.add(dto);
            } else {
                // 나머지 제품을 추가 추천으로 분류
                additionalRecommendations.add(dto);
            }
        }

        recommendations.put("essential", essentialRecommendations);
        recommendations.put("additional", additionalRecommendations);
        return recommendations;
    }


    /**
     * Product 엔티티를 ProductRecommendationDTO로 변환합니다.
     * @param product 변환할 Product 엔티티
     * @return 변환된 ProductRecommendationDTO 객체
     */
    private ProductRecommendationDTO convertToDTO(Product product) {
        ProductRecommendationDTO dto = new ProductRecommendationDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setScore(product.getScore());
        return dto;
    }
}
