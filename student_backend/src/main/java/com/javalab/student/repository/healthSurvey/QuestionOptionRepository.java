package com.javalab.student.repository.healthSurvey;

import com.javalab.student.entity.healthSurvey.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {
}
