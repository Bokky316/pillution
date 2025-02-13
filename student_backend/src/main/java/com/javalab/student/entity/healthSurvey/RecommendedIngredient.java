package com.javalab.student.entity.healthSurvey;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.javalab.student.entity.healthSurvey.Recommendation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "recommended_ingredient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Recommendation과 N:1 관계 설정
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommendation_id", nullable = false)
    private Recommendation recommendation;

    @Column(name = "category")
    private String category;

    @Column(name = "ingredient_name", nullable = false)
    private String ingredientName;

    @Column(name = "score", nullable = false)
    private double score;
}
