package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 추천된 영양 성분 정보를 나타내는 엔티티
 */
@Entity
@Table(name = "recommended_ingredient")
@Getter @Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recommendation_id")
    private Long recommendationId;

    @Column(name = "ingredient_name")
    private String ingredientName;

//    @Column(columnDefinition = "TEXT")
//    private String reason;

    @Column(name = "category")
    private String category;

    @Column(name = "score")
    private Integer score;
}
