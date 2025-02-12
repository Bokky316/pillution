package com.javalab.student.dto.healthSurvey;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class RecommendationDTO {
    private Long id;
    private Long memberId;
    private LocalDateTime createdAt;
    private List<ProductRecommendationDTO> productRecommendations;
}
