package com.javalab.student.dto.healthSurvey;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.util.ArrayList;
import java.util.List;

/**
 * 설문 질문 DTO
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SurveyQuestionDTO {
    private Long id;
    private String questionText;
    private String questionType;
    private int questionOrder;
    private Long categoryId;
    @Builder.Default
    private List<QuestionOptionDTO> options = new ArrayList<>();
}
