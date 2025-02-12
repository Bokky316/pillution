package com.javalab.student.dto.healthSurvey;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.javalab.student.entity.healthSurvey.MemberResponse;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HealthAnalysisDTO {
    private String name;       // 이름 추가
    private String gender;     // 성별 추가
    private int age;           // 나이 추가
    private double bmi;
    private Map<String, String> riskLevels;
    private String overallAssessment;
    private List<MemberResponse> responses;

    /**
     * 모든 필드를 매개변수로 받는 생성자
     * @param bmi BMI
     * @param riskLevels 위험 수준 맵
     * @param overallAssessment 전체 평가
     * @param responses 회원 응답 목록
     */
    public HealthAnalysisDTO(double bmi, Map<String, String> riskLevels, String overallAssessment, List<MemberResponse> responses) {
        this.bmi = bmi;
        this.riskLevels = riskLevels;
        this.overallAssessment = overallAssessment;
        this.responses = responses;
    }
}
