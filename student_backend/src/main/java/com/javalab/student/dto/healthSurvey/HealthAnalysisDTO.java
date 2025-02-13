package com.javalab.student.dto.healthSurvey;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.javalab.student.entity.healthSurvey.MemberResponse;
import com.javalab.student.entity.healthSurvey.MemberResponseOption;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HealthAnalysisDTO {
    private String name;
    private String gender;
    private int age;
    private double bmi;
    private Map<String, String> riskLevels;
    private String overallAssessment;
    private List<MemberResponse> textResponses;
    private List<MemberResponseOption> optionResponses;
}
