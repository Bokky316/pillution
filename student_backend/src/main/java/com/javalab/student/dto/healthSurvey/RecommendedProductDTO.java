package com.javalab.student.dto.healthSurvey;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedProductDTO {
    private Long id; // RecommendedProduct ID
    private Long productId; // Product ID
    private String productName; // Product 이름
    private Double price; // Product 가격
    private String mainImageUrl; // Product 이미지 URL
    private String reason; // 추천 이유
}
