package com.javalab.student.dto.healthSurvey;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RecommendationDTO {
    private Long id;
    private Long memberId;
    private LocalDateTime createdAt;
    private LocalDateTime recordDate;
    private String name;
    private String gender;
    private int age;
    private double bmi;
    private String riskLevels;
    private String overallAssessment;
    private String recommendedIngredients;
    private String recommendedProducts;
    private List<ProductRecommendationDTO> productRecommendations;
}
