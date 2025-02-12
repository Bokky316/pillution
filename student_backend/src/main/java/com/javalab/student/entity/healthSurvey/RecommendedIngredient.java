package com.javalab.student.entity.healthSurvey;

import jakarta.persistence.*;
import lombok.*;

/**
 * 추천된 영양 성분 정보를 나타내는 엔티티
 */
@Entity
@Table(name = "recommended_ingredient")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recommendation_id", nullable = false)
    private Long recommendationId; // 이 필드를 확인하거나 추가

    @Column(name = "ingredient_name", nullable = false)
    private String ingredientName;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "score", nullable = false)
    private double score;
}
