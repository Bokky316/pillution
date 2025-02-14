package com.javalab.student.repository.healthSurvey;

import com.javalab.student.entity.healthSurvey.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByMemberId(Long memberId);

    // 가장 최근의 Recommendation을 찾는 메서드
    Optional<Recommendation> findTopByMemberIdOrderByCreatedAtDesc(Long memberId);
}