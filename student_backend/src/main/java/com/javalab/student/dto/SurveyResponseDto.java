package com.javalab.student.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

/**
 * 설문 응답 데이터를 담는 DTO
 */
@Getter
@Setter
public class SurveyResponseDto {
    private Long questionId;
    private String responseType;
    private String responseText;
    private List<Long> selectedOptions;
}
