package com.javalab.student.repository.healthSurvey;

import com.javalab.student.entity.healthSurvey.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByMemberId(Long memberId);
}
