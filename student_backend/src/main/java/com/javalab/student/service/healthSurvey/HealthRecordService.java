package com.javalab.student.service.healthSurvey;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javalab.student.dto.healthSurvey.HealthAnalysisDTO;
import com.javalab.student.dto.healthSurvey.RecommendedProductDTO;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.healthSurvey.HealthRecord;
import com.javalab.student.repository.healthSurvey.HealthRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

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
     * @param analysisDTO          건강 분석 결과 DTO
     * @param recommendedIngredients 추천된 영양 성분 리스트
     * @param recommendedProducts  추천된 제품 리스트
     * @param name                 사용자 이름
     * @param gender               사용자 성별
     * @param age                  사용자 나이
     */
    public void saveHealthRecord(Member member, HealthAnalysisDTO analysisDTO,
                                 List<String> recommendedIngredients,
                                 List<RecommendedProductDTO> recommendedProducts,
                                 String name, String gender, int age) {
        try {
            // HealthRecord 객체 생성 및 데이터 설정
            HealthRecord record = HealthRecord.builder()
                    .member(member)
                    .recordDate(LocalDateTime.now())
                    .name(name)
                    .gender(gender)
                    .age(age)
                    .bmi(analysisDTO.getBmi())
                    .riskLevels(objectMapper.writeValueAsString(analysisDTO.getRiskLevels()))
                    .overallAssessment(analysisDTO.getOverallAssessment())
                    .recommendedIngredients(String.join(", ", recommendedIngredients))
                    .recommendedProducts(convertToJson(recommendedProducts))
                    .build();

            // HealthRecord 저장
            healthRecordRepository.save(record);
            log.info("건강 기록이 성공적으로 저장되었습니다. 회원 ID: {}, 이름: {}", member.getId(), name);
        } catch (Exception e) {
            log.error("건강 기록 저장 중 오류 발생. 회원 ID: {}, 이름: {}", member.getId(), name, e);
            throw new RuntimeException("건강 기록 저장 중 오류 발생", e);
        }
    }

    /**
     * 추천된 제품 리스트를 JSON 문자열로 변환합니다.
     *
     * @param products 추천된 제품 리스트
     * @return JSON 문자열로 변환된 추천 제품 리스트
     */
    private String convertToJson(List<RecommendedProductDTO> products) {
        try {
            return objectMapper.writeValueAsString(products); // ObjectMapper를 사용해 JSON 변환
        } catch (Exception e) {
            log.error("추천 제품을 JSON으로 변환 중 오류 발생", e);
            return "[]"; // 오류 발생 시 빈 배열 반환
        }
    }

    /**
     * RecommendedProductDTO 객체를 JSON 형식의 문자열로 변환합니다.
     *
     * @param dto RecommendedProductDTO 객체
     * @return JSON 형식의 문자열
     */
    private String convertToJsonMap(RecommendedProductDTO dto) {
        return String.format(
                "{\"id\":%d, \"name\":\"%s\", \"description\":\"%s\", \"price\":%.2f, \"score\":%.2f, \"mainIngredient\":\"%s\"}",
                dto.getId(),
                escapeJsonString(dto.getName()),
                escapeJsonString(dto.getDescription()),
                dto.getPrice(),
                dto.getScore(),
                escapeJsonString(dto.getMainIngredient())
        );
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
