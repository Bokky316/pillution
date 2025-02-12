package com.javalab.student.repository.healthSurvey;

import com.javalab.student.entity.healthSurvey.RecommendedProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendedProductRepository extends JpaRepository<RecommendedProduct, Long> {
    /**
     * 특정 recommendationId에 해당하는 모든 RecommendedProduct를 조회합니다.
     *
     * @param recommendationId 조회할 Recommendation의 ID
     * @return 해당 recommendationId와 연관된 RecommendedProduct 리스트
     */
    List<RecommendedProduct> findByRecommendationId(Long recommendationId);
}
