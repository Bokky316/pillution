package com.javalab.student.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.util.List;

/**
 * 개별 설문 응답 DTO
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SurveyResponseDto {
    private Long questionId; // 질문 ID
    private String responseType; // 응답 유형 (TEXT 또는 MULTIPLE_CHOICE)
    private String responseText; // 텍스트 응답 (TEXT 유형일 때 사용)
    private List<Long> selectedOptions; // 선택된 옵션 ID 리스트 (MULTIPLE_CHOICE 유형일 때 사용)
}
