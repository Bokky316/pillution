package com.javalab.student.service.healthSurvey;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javalab.student.dto.healthSurvey.HealthAnalysisDTO;
import com.javalab.student.dto.healthSurvey.ProductRecommendationDTO;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.healthSurvey.HealthRecord;
import com.javalab.student.repository.healthSurvey.HealthRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 건강 기록 저장 및 조회 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
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
    @SneakyThrows
    public void saveHealthRecord(Member member, HealthAnalysisDTO analysisDTO,
                                 List<String> recommendedIngredients,
                                 List<ProductRecommendationDTO> recommendedProducts,
                                 String name, String gender, int age) {
        try {
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

            healthRecordRepository.save(record);
            log.info("건강 기록이 성공적으로 저장되었습니다. 회원 ID: {}, 이름: {}", member.getId(), name);
        } catch (Exception e) {
            log.error("건강 기록 저장 중 오류 발생. 회원 ID: {}, 이름: {}", member.getId(), name, e);
            throw new RuntimeException("건강 기록 저장 중 오류 발생", e);
        }
    }

    private String convertToJson(List<ProductRecommendationDTO> products) {
        return products.stream()
                .map(this::convertToJsonMap)
                .collect(Collectors.toList())
                .toString();
    }

    private String convertToJsonMap(ProductRecommendationDTO dto) {
        return String.format("{\"id\":%d, \"name\":\"%s\", \"description\":\"%s\", \"price\":%.2f, \"score\":%.2f, \"mainIngredient\":\"%s\"}",
                dto.getId(), dto.getName(), dto.getDescription(), dto.getPrice(), dto.getScore(), dto.getMainIngredient());
    }

    /**
     * 현재 로그인한 사용자의 건강 기록 히스토리를 조회합니다.
     *
     * @return 현재 로그인한 사용자의 건강 기록 리스트
     */
    public List<HealthRecord> getHealthHistory(Long memberId) {
        return healthRecordRepository.findByMemberIdOrderByRecordDateDesc(memberId);
    }
}
