package com.javalab.student.service.healthSurvey;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javalab.student.dto.healthSurvey.HealthAnalysisDTO;
import com.javalab.student.dto.healthSurvey.ProductRecommendationDTO;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.healthSurvey.HealthRecord;
import com.javalab.student.repository.healthSurvey.HealthRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 건강 기록 저장 및 조회 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class HealthRecordService {

    private final HealthRecordRepository healthRecordRepository;
    private final ObjectMapper objectMapper;

    /**
     * 건강 분석 결과를 저장합니다.
     *
     * @param member               회원 엔티티
     * @param recommendedIngredients 추천된 영양 성분 리스트
     * @param recommendedProducts  추천된 제품 리스트
     * @param name                 사용자 이름
     * @param gender               사용자 성별
     * @param age                  사용자 나이
     */
    @Transactional
    public void saveHealthRecord(Member member, HealthAnalysisDTO healthAnalysis,
                                 List<String> recommendedIngredients,
                                 List<ProductRecommendationDTO> recommendedProducts,
                                 String name, String gender, int age) {
        try {
            HealthRecord healthRecord = HealthRecord.builder()
                    .member(member)
                    .recordDate(LocalDateTime.now())
                    .name(name)
                    .gender(gender)
                    .age(age)
                    .bmi(healthAnalysis.getBmi())
                    .riskLevels(objectMapper.writeValueAsString(healthAnalysis.getRiskLevels()))
                    .overallAssessment(healthAnalysis.getOverallAssessment())
                    .recommendedIngredients(String.join(", ", recommendedIngredients))
                    .recommendedProducts(objectMapper.writeValueAsString(recommendedProducts))
                    .createdAt(LocalDateTime.now())
                    .build();

            log.debug("HealthRecord 객체 생성: {}", healthRecord);
            healthRecordRepository.save(healthRecord);
            log.info("HealthRecord 저장 완료. ID: {}", healthRecord.getId());
        } catch (Exception e) {
            log.error("HealthRecord 저장 중 상세 오류: ", e);
            throw new RuntimeException("HealthRecord 저장 중 오류 발생: " + e.getMessage(), e);
        }
    }

    /**
     * 추천된 제품 리스트를 JSON 문자열로 변환합니다.
     *
     * @param products 추천된 제품 리스트
     * @return JSON 문자열로 변환된 추천 제품 리스트
     */
    private String convertToJson(List<ProductRecommendationDTO> products) {
        try {
            return objectMapper.writeValueAsString(products); // ObjectMapper를 사용해 JSON 변환
        } catch (Exception e) {
            log.error("추천 제품을 JSON으로 변환 중 오류 발생", e);
            return "[]"; // 오류 발생 시 빈 배열 반환
        }
    }

    /**
     * 문자열 내 특수 문자를 이스케이프 처리합니다.
     *
     * @param input 입력 문자열
     * @return 이스케이프 처리된 문자열
     */
    private String escapeJsonString(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }

    /**
     * 현재 로그인한 사용자의 건강 기록 히스토리를 조회합니다.
     *
     * @param memberId 회원 ID
     * @return 현재 로그인한 사용자의 건강 기록 리스트
     */
    public List<HealthRecord> getHealthHistory(Long memberId) {
        return healthRecordRepository.findByMemberIdOrderByRecordDateDesc(memberId);
    }
}
