package com.javalab.student.dto.healthSurvey;

import lombok.Data;

@Data
public class RecommendedProductDTO {
    private Long id;
    private Long productId;
    private String reason;
}
