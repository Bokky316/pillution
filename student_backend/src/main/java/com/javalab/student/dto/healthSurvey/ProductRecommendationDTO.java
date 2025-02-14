package com.javalab.student.dto.healthSurvey;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * 제품 추천 DTO 클래스
 * 제품 정보와 추천 영양 성분 정보를 포함합니다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRecommendationDTO {
    private Long id; // 제품 ID
    private String name; // 제품 이름
    private String description; // 제품 설명
    private BigDecimal price; // 제품 가격
    private int score; // 제품 점수
    private String mainIngredient; // 추천 영양 성분 목록 (쉼표로 구분된 문자열)
    private Map<String, Integer> ingredientScores; // 영양 성분별 점수 맵

    /**
     * 추천된 영양 성분 목록을 반환합니다.
     *
     * @return 추천된 영양 성분 목록 (쉼표로 구분된 문자열을 리스트로 변환)
     */
    public List<String> getRecommendedIngredients() {
        if (mainIngredient == null || mainIngredient.isEmpty()) {
            return Collections.emptyList(); // mainIngredient가 비어있을 경우 빈 리스트 반환
        }
        return Arrays.asList(mainIngredient.split(", ")); // 쉼표와 공백으로 분리하여 리스트 반환
    }
}
