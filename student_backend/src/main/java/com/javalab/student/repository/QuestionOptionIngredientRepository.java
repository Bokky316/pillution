package com.javalab.student.repository;

import com.javalab.student.entity.QuestionOptionIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionOptionIngredientRepository extends JpaRepository<QuestionOptionIngredient, Long> {

    @Query("SELECT qoi.ingredient FROM QuestionOptionIngredient qoi " +
            "WHERE qoi.questionOption.question.id = :questionId " +
            "AND qoi.questionOption.optionText = :responseText")
    List<String> findIngredientsByQuestionIdAndResponseText(@Param("questionId") Long questionId,
                                                            @Param("responseText") String responseText);
}
