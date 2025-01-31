package com.javalab.student.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.util.List;

/**
 * 설문 제출 요청 DTO
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SurveySubmissionDto {
    private List<SurveyResponseDto> responses; // 설문 응답 리스트
}
