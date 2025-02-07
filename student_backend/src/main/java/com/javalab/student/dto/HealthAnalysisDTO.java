package com.javalab.student.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HealthAnalysisDTO {
    private double bmi;
    private Map<String, String> riskLevels;
    private String overallAssessment;
}
