package com.javalab.student.dto.healthSurvey;

import lombok.Data;

@Data
public class RecommendedIngredientDTO {
    private Long id;
    private String ingredientName;
    private double score;
}
