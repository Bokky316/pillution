package com.javalab.student.service.recommendation;

import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javalab.student.dto.HealthAnalysisDTO;
import com.javalab.student.dto.ProductRecommendationDTO;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.MemberResponse;
import com.javalab.student.entity.HealthRecord;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.MemberResponseRepository;
import com.javalab.student.repository.HealthRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 사용자의 건강 상태를 분석하고 제품을 추천하는 서비스 클래스입니다.
 * 이 서비스는 사용자의 응답을 기반으로 건강 위험도를 계산하고,
 * 적절한 제품과 영양 성분을 추천합니다.
 */
@Service
public class RecommendationService {
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private MemberResponseRepository memberResponseRepository;
    @Autowired
    private HealthRecordRepository healthRecordRepository;
    @Autowired
    private RiskCalculationService riskCalculationService;
    @Autowired
    private ProductRecommendationService productRecommendationService;
    @Autowired
    private NutrientScoreService nutrientScoreService;
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * 사용자의 건강 상태를 분석하고 제품을 추천합니다.
     *
     * @param email 사용자의 이메일
     * @return 건강 분석 결과, 추천 제품, 추천 영양 성분을 포함하는 Map
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    public Map<String, Object> getHealthAnalysisAndRecommendations(String email) {
        Map<String, Object> result = new HashMap<>();

        // 사용자 조회
        Member member = memberRepository.findByEmail(email);
        if (member == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다: " + email);
        }

        // 사용자의 최신 응답 조회
        List<MemberResponse> responses = memberResponseRepository.findLatestResponsesByMemberId(member.getId());

        // 사용자 정보 추출
        int age = getAge(responses);
        double height = getHeight(responses);
        double weight = getWeight(responses);
        double bmi = calculateBMI(height, weight);

        // 건강 분석 수행
        HealthAnalysisDTO healthAnalysis = analyzeHealth(member.getId(), age, bmi, responses);
        result.put("healthAnalysis", healthAnalysis);

        // 제품 추천
        Map<String, List<ProductRecommendationDTO>> recommendations =
                productRecommendationService.recommendProducts(member.getId(), age, bmi, responses);
        result.put("recommendations", recommendations);

        // 영양 성분 추천
        Map<String, Integer> ingredientScores = nutrientScoreService.calculateIngredientScores(responses, age, bmi);
        List<String> recommendedIngredients = nutrientScoreService.getRecommendedIngredients(healthAnalysis, ingredientScores, age, bmi);

        // 건강 기록 저장
        saveHealthRecord(member, healthAnalysis, recommendedIngredients, recommendations.get("essential"));

        return result;
    }

    /**
     * 사용자의 건강 상태를 분석합니다.
     *
     * @param memberId 사용자의 ID
     * @param age 사용자의 나이
     * @param bmi 사용자의 BMI
     * @param responses 사용자의 설문 응답 목록
     * @return HealthAnalysisDTO 객체
     */
    private HealthAnalysisDTO analyzeHealth(Long memberId, int age, double bmi, List<MemberResponse> responses) {
        // RiskCalculationService를 사용하여 위험도 계산
        Map<String, String> riskLevels = riskCalculationService.calculateAllRisks(age, bmi, responses);

        // 전반적인 건강 평가 생성
        String overallAssessment = generateOverallAssessment(bmi, riskLevels);

        return new HealthAnalysisDTO(bmi, riskLevels, overallAssessment);
    }

    /**
     * 회원 응답에서 나이를 추출합니다.
     *
     * @param responses 회원 응답 목록
     * @return 회원의 나이
     * @throws IllegalStateException 나이 정보를 찾을 수 없는 경우
     */
    private int getAge(List<MemberResponse> responses) {
        return responses.stream()
                .filter(r -> r.getQuestion().getId() == 3L)
                .findFirst()
                .map(r -> Integer.parseInt(r.getResponseText()))
                .orElseThrow(() -> new IllegalStateException("나이 정보를 찾을 수 없습니다."));
    }

    /**
     * 회원 응답에서 키를 추출합니다.
     *
     * @param responses 회원 응답 목록
     * @return 회원의 키(미터 단위)
     * @throws IllegalStateException 키 정보를 찾을 수 없는 경우
     */
    private double getHeight(List<MemberResponse> responses) {
        return responses.stream()
                .filter(r -> r.getQuestion().getId() == 4L)
                .findFirst()
                .map(r -> Double.parseDouble(r.getResponseText()) / 100) // cm를 m로 변환
                .orElseThrow(() -> new IllegalStateException("키 정보를 찾을 수 없습니다."));
    }

    /**
     * 회원 응답에서 몸무게를 추출합니다.
     *
     * @param responses 회원 응답 목록
     * @return 회원의 몸무게(킬로그램 단위)
     * @throws IllegalStateException 몸무게 정보를 찾을 수 없는 경우
     */
    private double getWeight(List<MemberResponse> responses) {
        return responses.stream()
                .filter(r -> r.getQuestion().getId() == 5L)
                .findFirst()
                .map(r -> Double.parseDouble(r.getResponseText()))
                .orElseThrow(() -> new IllegalStateException("몸무게 정보를 찾을 수 없습니다."));
    }

    /**
     * BMI를 계산합니다.
     *
     * @param height 키(m)
     * @param weight 몸무게(kg)
     * @return 계산된 BMI 값
     */
    private double calculateBMI(double height, double weight) {
        return weight / (height * height);
    }

    /**
     * BMI와 위험 수준을 기반으로 전반적인 건강 평가를 생성합니다.
     *
     * @param bmi BMI 값
     * @param riskLevels 각 건강 영역별 위험 수준
     * @return 전반적인 건강 평가 문자열
     */
    private String generateOverallAssessment(double bmi, Map<String, String> riskLevels) {
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
     * 건강 분석 결과를 저장합니다.
     *
     * @param member 회원 엔티티
     * @param analysisDTO 건강 분석 결과 DTO
     * @param recommendedIngredients 추천된 영양 성분 리스트
     * @param recommendedProducts 추천된 제품 리스트
     */
    private void saveHealthRecord(Member member, HealthAnalysisDTO analysisDTO,
                                  List<String> recommendedIngredients,
                                  List<ProductRecommendationDTO> recommendedProducts) {
        try {
            HealthRecord record = HealthRecord.builder()
                    .member(member)
                    .recordDate(LocalDateTime.now())
                    .bmi(analysisDTO.getBmi())
                    .riskLevels(objectMapper.writeValueAsString(analysisDTO.getRiskLevels()))
                    .overallAssessment(analysisDTO.getOverallAssessment())
                    .recommendedIngredients(String.join(", ", recommendedIngredients))
                    .recommendedProducts(objectMapper.writeValueAsString(
                            recommendedProducts.stream()
                                    .map(dto -> Map.of(
                                            "id", dto.getId(),
                                            "name", dto.getName(),
                                            "description", dto.getDescription(),
                                            "price", dto.getPrice(),
                                            "score", dto.getScore(),
                                            "mainIngredient", dto.getMainIngredient()
                                    ))
                                    .collect(Collectors.toList())
                    ))
                    .build();

            healthRecordRepository.save(record);
        } catch (Exception e) {
            throw new RuntimeException("건강 기록 저장 중 오류 발생", e);
        }
    }


    /**
     * 사용자의 건강 기록 히스토리를 조회합니다.
     *
     * @param email 사용자의 이메일
     * @return 사용자의 건강 기록 리스트
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    public List<HealthRecord> getHealthHistory(String email) {
        Member member = memberRepository.findByEmail(email);
        if (member == null) {
            throw new IllegalArgumentException("회원을 찾을 수 없습니다: " + email);
        }

        return healthRecordRepository.findByMemberIdOrderByRecordDateDesc(member.getId());
    }
}
