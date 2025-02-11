package com.javalab.student.repository.healthSurvey;

import com.javalab.student.entity.healthSurvey.RecommendedProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecommendedProductRepository extends JpaRepository<RecommendedProduct, Long> {
}