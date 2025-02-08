package com.javalab.student.repository.healthSurvey;

import com.javalab.student.entity.healthSurvey.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyQuestionRepository extends JpaRepository<SurveyQuestion, Long> {
    List<SurveyQuestion> findBySubCategoryId(Long subCategoryId);
}
