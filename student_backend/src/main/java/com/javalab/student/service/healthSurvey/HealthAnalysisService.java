package com.javalab.student.service.healthSurvey;

import com.javalab.student.dto.healthSurvey.HealthAnalysisDTO;
import com.javalab.student.entity.healthSurvey.MemberResponse;
import com.javalab.student.entity.healthSurvey.MemberResponseOption;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 건강 분석 및 평가 생성 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HealthAnalysisService {

    private final RiskCalculationService riskCalculationService;

    /**
     * 사용자의 건강 상태를 분석합니다.
     *
     * @param memberId        사용자의 ID
     * @param age             사용자의 나이
     * @param bmi             사용자의 BMI
     * @param textResponses   사용자의 텍스트 설문 응답 목록
     * @param optionResponses 사용자의 선택 옵션 설문 응답 목록
     * @param gender          사용자의 성별
     * @return HealthAnalysisDTO 객체
     */
    public HealthAnalysisDTO analyzeHealth(Long memberId, int age, double bmi, List<MemberResponse> textResponses, List<MemberResponseOption> optionResponses, String gender) {
        log.info("Analyzing health for memberId: {}, age: {}, bmi: {}, gender: {}", memberId, age, bmi, gender);

        // 텍스트 응답과 선택 옵션 응답을 결합
        List<Object> combinedResponses = Stream.concat(textResponses.stream(), optionResponses.stream())
                .collect(Collectors.toList());

        // RiskCalculationService를 사용하여 위험도 계산
        List<MemberResponseOption> memberResponseOptions = combinedResponses.stream()
                .filter(response -> response instanceof MemberResponseOption)
                .map(response -> (MemberResponseOption) response)
                .collect(Collectors.toList());

        Map<String, String> riskLevels = riskCalculationService.calculateAllRisks(age, bmi, memberResponseOptions);
        log.info("Calculated risk levels: {}", riskLevels);

        // 전반적인 건강 평가 생성
        String overallAssessment = generateOverallAssessment(bmi, riskLevels);
        log.info("Generated overall assessment: {}", overallAssessment);

        // HealthAnalysisDTO 생성 및 반환
        HealthAnalysisDTO healthAnalysisDTO = new HealthAnalysisDTO();
        healthAnalysisDTO.setBmi(bmi);
        healthAnalysisDTO.setRiskLevels(convertRiskLevelsToString(riskLevels));
        healthAnalysisDTO.setOverallAssessment(overallAssessment);
        healthAnalysisDTO.setGender(gender);

        log.info("Health analysis completed: {}", healthAnalysisDTO);
        return healthAnalysisDTO;
    }

    /**
     * BMI와 위험 수준을 기반으로 전반적인 건강 평가를 생성합니다.
     *
     * @param bmi        BMI 값
     * @param riskLevels 각 건강 영역별 위험 수준
     * @return 전반적인 건강 평가 문자열
     */
    public String generateOverallAssessment(double bmi, Map<String, String> riskLevels) {
        StringBuilder assessment = new StringBuilder();
        assessment.append("귀하의 BMI는 ").append(String.format("%.1f", bmi)).append("입니다. ");

        // BMI 범주에 따른 평가
        if (bmi < 18.5) {
            assessment.append("저체중 상태입니다. ");
        } else if (bmi < 23) {
            assessment.append("정상 체중입니다. ");
        } else if (bmi < 25) {
            assessment.append("과체중 상태입니다. ");
        } else {
            assessment.append("비만 상태입니다. ");
        }

        // 고위험 요인 수 계산
        long highRisks = riskLevels.values().stream().filter(level -> level.equals("높음")).count();
        if (highRisks > 0) {
            assessment.append("귀하는 ").append(highRisks).append("개의 고위험 요인을 가지고 있습니다. ");
        } else {
            assessment.append("현재 고위험 요인은 없습니다. ");
        }

        assessment.append("자세한 건강 관리 방법은 전문의와 상담하시기 바랍니다.");

        return assessment.toString();
    }

    /**
     * 위험 수준 맵을 문자열로 변환합니다.
     *
     * @param riskLevels 위험 수준 맵
     * @return 위험 수준을 나타내는 문자열
     */
    private String convertRiskLevelsToString(Map<String, String> riskLevels) {
        return riskLevels.entrySet().stream()
                .map(entry -> entry.getKey() + ":" + entry.getValue())
                .collect(Collectors.joining(","));
    }
}
