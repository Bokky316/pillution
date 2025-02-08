package com.javalab.student.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRecommendationDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private int score;
    private String mainIngredient;
    private Map<String, Integer> ingredientScores;
}
