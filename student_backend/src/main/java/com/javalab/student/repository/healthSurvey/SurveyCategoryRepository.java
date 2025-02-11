package com.javalab.student.repository.healthSurvey;

import com.javalab.student.entity.healthSurvey.SurveyCategory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyCategoryRepository extends JpaRepository<SurveyCategory, Long> {

    @EntityGraph(attributePaths = {"subCategories"})
    List<SurveyCategory> findAll(); // 서브카테고리를 함께 로드
}
