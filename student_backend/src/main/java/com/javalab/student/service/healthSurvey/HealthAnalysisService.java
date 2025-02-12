package com.javalab.student.service.healthSurvey;

import com.javalab.student.dto.healthSurvey.HealthAnalysisDTO;
import com.javalab.student.entity.healthSurvey.MemberResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

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
     * @param memberId  사용자의 ID
     * @param age       사용자의 나이
     * @param bmi       사용자의 BMI
     * @param responses 사용자의 설문 응답 목록
     * @param gender    사용자의 성별
     * @return HealthAnalysisDTO 객체
     */
    public HealthAnalysisDTO analyzeHealth(Long memberId, int age, double bmi, List<MemberResponse> responses, String gender) {
        log.info("Analyzing health for memberId: {}, age: {}, bmi: {}, gender: {}", memberId, age, bmi, gender);

        // RiskCalculationService를 사용하여 위험도 계산
        Map<String, String> riskLevels = riskCalculationService.calculateAllRisks(age, bmi, responses);
        log.info("Calculated risk levels: {}", riskLevels);

        // 전반적인 건강 평가 생성
        String overallAssessment = generateOverallAssessment(bmi, riskLevels);
        log.info("Generated overall assessment: {}", overallAssessment);

        // HealthAnalysisDTO 생성 및 반환
        HealthAnalysisDTO healthAnalysisDTO = new HealthAnalysisDTO();
        healthAnalysisDTO.setBmi(bmi);
        healthAnalysisDTO.setRiskLevels(riskLevels);
        healthAnalysisDTO.setOverallAssessment(overallAssessment);
        healthAnalysisDTO.setResponses(responses);
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
}
