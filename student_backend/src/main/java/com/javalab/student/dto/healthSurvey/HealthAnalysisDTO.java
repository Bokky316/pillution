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


}
