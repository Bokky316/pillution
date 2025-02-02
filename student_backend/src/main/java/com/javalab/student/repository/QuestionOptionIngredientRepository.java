package com.javalab.student.repository;

import com.javalab.student.entity.QuestionOptionIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionOptionIngredientRepository extends JpaRepository<QuestionOptionIngredient, Long> {

    @Query("SELECT qoi.ingredientName FROM QuestionOptionIngredient qoi " +
            "JOIN qoi.questionOption qo " +
            "JOIN qo.question q " +
            "WHERE q.id = :questionId " +
            "AND qo.optionText = :responseText")
    List<String> findIngredientsByQuestionIdAndResponseText(@Param("questionId") Long questionId,
                                                            @Param("responseText") String responseText);
}
