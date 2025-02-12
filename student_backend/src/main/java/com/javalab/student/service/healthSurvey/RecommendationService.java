package com.javalab.student.service.healthSurvey;

import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javalab.student.dto.healthSurvey.HealthAnalysisDTO;
import com.javalab.student.dto.healthSurvey.ProductRecommendationDTO;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.healthSurvey.MemberResponse;
import com.javalab.student.entity.healthSurvey.HealthRecord;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.healthSurvey.MemberResponseRepository;
import com.javalab.student.repository.healthSurvey.HealthRecordRepository;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 사용자의 건강 상태를 분석하고 제품을 추천하는 서비스 클래스입니다.
 * 이 서비스는 사용자의 응답을 기반으로 건강 위험도를 계산하고,
 * 적절한 제품과 영양 성분을 추천합니다.
 */
@Service
@Slf4j
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
     * 현재 로그인한 사용자의 건강 상태를 분석하고 제품을 추천합니다.
     *
     * @return 건강 분석 결과, 추천 제품, 추천 영양 성분을 포함하는 Map
     * @throws IllegalStateException 인증된 사용자 정보를 찾을 수 없는 경우
     */
    @Transactional
    @SneakyThrows(Exception.class)
    public Map<String, Object> getHealthAnalysisAndRecommendations() {
        Map<String, Object> result = new HashMap<>();

        // 현재 인증된 사용자 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("인증된 사용자 정보를 찾을 수 없습니다.");
        }

        String email = authentication.getName();
        Member member = memberRepository.findByEmail(email);
        if (member == null) {
            throw new IllegalStateException("회원 정보를 찾을 수 없습니다: " + email);
        }

        // 사용자 이름, 성별, 나이 응답 조회
        String name = member.getName();
        String gender = member.getGender();

        // 사용자의 나이, 키, 몸무게 응답 조회
        List<MemberResponse> ageHeightWeightResponses = memberResponseRepository.findAgeHeightAndWeightResponses(member.getId());

        // 사용자 정보 추출
        int age = 0;
        double height = 0;
        double weight = 0;

        for (MemberResponse response : ageHeightWeightResponses) {
            log.debug("Processing response: questionId={}, responseText={}", response.getQuestion().getId(), response.getResponseText());
            switch (response.getQuestion().getId().intValue()) {
                case 3:
                    age = Integer.parseInt(response.getResponseText());
                    log.debug("Age set to: {}", age);
                    break;
                case 4:
                    height = Double.parseDouble(response.getResponseText());
                    log.debug("Height set to: {}", height);
                    break;
                case 5:
                    weight = Double.parseDouble(response.getResponseText());
                    log.debug("Weight set to: {}", weight);
                    break;
            }
        }

        if (age == 0 || height == 0 || weight == 0) {
            throw new IllegalStateException("나이, 키, 몸무게 정보 중 누락된 정보가 있습니다.");
        }
        log.debug("Final values - age: {}, height: {}, weight: {}", age, height, weight);

        double bmi = calculateBMI(height, weight);
        log.debug("Calculated BMI: {}", bmi);

        // 건강 분석 수행
        HealthAnalysisDTO healthAnalysis = analyzeHealth(member.getId(), age, bmi, ageHeightWeightResponses);
        healthAnalysis.setName(member.getName()); // 이름 설정
        healthAnalysis.setGender(member.getGender()); // 성별 설정
        healthAnalysis.setAge(age);       // 나이 설정
        log.debug("HealthAnalysisDTO: {}", healthAnalysis);
        result.put("healthAnalysis", healthAnalysis);

        // 영양 성분 점수 계산
        Map<String, Integer> ingredientScores = nutrientScoreService.calculateIngredientScores(ageHeightWeightResponses, age, bmi);

        // 추천 영양 성분 목록 가져오기 (최대 5개, 이름과 점수 포함)
        List<Map<String, Object>> recommendedIngredients = nutrientScoreService.getRecommendedIngredients(healthAnalysis, ingredientScores, age, bmi);

        // 제품 추천
        List<ProductRecommendationDTO> recommendations =
                productRecommendationService.recommendProductsByIngredients(
                        recommendedIngredients.stream().map(x -> (String) x.get("name")).collect(Collectors.toList()),
                        ingredientScores
                );

        // 추천 결과 저장
        result.put("recommendations", recommendations);

        // 영양 성분 추천 결과 저장 (이름과 점수 포함)
        result.put("recommendedIngredients", recommendedIngredients);

        // 추천된 영양 성분 저장 (DB에 저장)
        nutrientScoreService.saveRecommendedIngredients(member.getId(), ingredientScores, healthAnalysis, age, bmi);

        // 건강 기록 저장
        List<ProductRecommendationDTO> essentialProducts = recommendations.stream()
                .limit(5) // 최대 5개 제품만 선택
                .collect(Collectors.toList());
        saveHealthRecord(member, healthAnalysis, recommendedIngredients.stream().map(x -> (String) x.get("name")).collect(Collectors.toList()), essentialProducts);

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

        // 성별 추출
        String gender = getGender(responses);

        // HealthAnalysisDTO 생성 및 반환
        HealthAnalysisDTO healthAnalysisDTO = new HealthAnalysisDTO();
        healthAnalysisDTO.setBmi(bmi);
        healthAnalysisDTO.setRiskLevels(riskLevels);
        healthAnalysisDTO.setOverallAssessment(overallAssessment);
        healthAnalysisDTO.setResponses(responses);
        healthAnalysisDTO.setGender(gender); // 성별 설정
        return healthAnalysisDTO;
    }

    /**
     * 사용자 응답에서 성별을 추출하는 메서드
     * @param responses 사용자 응답 목록
     * @return 성별 ("여성" 또는 "남성")
     */
    private String getGender(List<MemberResponse> responses) {
        return responses.stream()
                .filter(response -> response.getQuestion().getId() == 2L) // 질문 ID가 2번인 응답 찾기
                .findFirst()
                .map(response -> {
                    if ("1".equals(response.getResponseText())) {
                        return "여성";
                    } else if ("2".equals(response.getResponseText())) {
                        return "남성";
                    } else {
                        return "알 수 없음"; // 예외적인 경우 처리
                    }
                })
                .orElse("알 수 없음"); // 성별 응답이 없는 경우 기본값 설정
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
    // BMI 계산 메서드 수정
    private double calculateBMI(double height, double weight) {
        log.debug("Calculating BMI - height: {}, weight: {}", height, weight);
        if (height <= 0 || weight <= 0) {
            log.warn("Invalid height or weight: height={}, weight={}", height, weight);
            return 0.0;
        }
        double bmi = weight / ((height / 100) * (height / 100));
        log.debug("Calculated BMI: {}", bmi);
        return bmi;
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
            // recommendedIngredients가 null이면 빈 리스트로 초기화
            List<String> safeRecommendedIngredients = Optional.ofNullable(recommendedIngredients).orElse(Collections.emptyList());

            // recommendedProducts가 null이면 빈 리스트로 초기화
            List<ProductRecommendationDTO> safeRecommendedProducts = Optional.ofNullable(recommendedProducts).orElse(Collections.emptyList());

            HealthRecord record = HealthRecord.builder()
                    .member(member)
                    .recordDate(LocalDateTime.now())
                    .bmi(analysisDTO.getBmi())
                    .riskLevels(objectMapper.writeValueAsString(analysisDTO.getRiskLevels()))
                    .overallAssessment(analysisDTO.getOverallAssessment())
                    .recommendedIngredients(String.join(", ", safeRecommendedIngredients))
                    .recommendedProducts(objectMapper.writeValueAsString(
                            safeRecommendedProducts.stream()
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
            log.info("건강 기록이 성공적으로 저장되었습니다. 회원 ID: {}", member.getId());
        } catch (Exception e) {
            log.error("건강 기록 저장 중 오류 발생. 회원 ID: {}", member.getId(), e);
            throw new RuntimeException("건강 기록 저장 중 오류 발생", e);
        }
    }

    /**
     * 현재 로그인한 사용자의 건강 기록 히스토리를 조회합니다.
     *
     * @return 현재 로그인한 사용자의 건강 기록 리스트
     * @throws IllegalStateException 인증된 사용자 정보를 찾을 수 없는 경우
     */
    public List<HealthRecord> getHealthHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("인증된 사용자 정보를 찾을 수 없습니다.");
        }

        String email = authentication.getName();
        Member member = memberRepository.findByEmail(email);
        if (member == null) {
            throw new IllegalStateException("회원 정보를 찾을 수 없습니다: " + email);
        }

        return healthRecordRepository.findByMemberIdOrderByRecordDateDesc(member.getId());
    }
}
