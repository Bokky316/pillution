package com.javalab.student.entity.healthSurvey;

import jakarta.persistence.*;
import lombok.*;

/**
 * 추천된 상품 정보를 나타내는 엔티티
 */
@Entity
@Table(name = "recommended_product")
@Getter @Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recommendation_id")
    private Long recommendationId;

    @Column(name = "product_id")
    private Long productId;

    @Column(columnDefinition = "TEXT")
    private String reason;
}