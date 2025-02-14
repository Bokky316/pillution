package com.javalab.student.repository.healthSurvey;

import com.javalab.student.entity.healthSurvey.RecommendedIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendedIngredientRepository extends JpaRepository<RecommendedIngredient, Long> {
    List<RecommendedIngredient> findByRecommendationId(Long recommendationId);
}
