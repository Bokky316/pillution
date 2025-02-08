package com.javalab.student.dto.healthSurvey;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

/**
 * 질문 옵션 DTO
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuestionOptionDTO {
    private Long id;
    private String optionText;
    private int optionOrder;
}
