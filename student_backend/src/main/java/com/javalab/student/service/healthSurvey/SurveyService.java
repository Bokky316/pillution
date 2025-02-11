package com.javalab.student.service.healthSurvey;

import com.javalab.student.dto.healthSurvey.SurveyResponseDto;
import com.javalab.student.dto.healthSurvey.SurveySubmissionDto;
import com.javalab.student.entity.*;
import com.javalab.student.entity.healthSurvey.MemberResponse;
import com.javalab.student.entity.healthSurvey.MemberResponseOption;
import com.javalab.student.entity.healthSurvey.QuestionOption;
import com.javalab.student.entity.healthSurvey.SurveyQuestion;
import com.javalab.student.repository.healthSurvey.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 설문 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
public class SurveyService {
    private final SurveyCategoryRepository categoryRepository;
    private final SurveySubCategoryRepository subCategoryRepository;
    private final SurveyQuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final MemberResponseRepository memberResponseRepository;
    private final MemberResponseOptionRepository memberResponseOptionRepository;

    /**
     * 모든 설문 카테고리와 서브카테고리를 조회합니다.
     * @return 카테고리 및 서브카테고리 목록
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllCategoriesWithSubCategories() {
        return categoryRepository.findAll().stream()
                .map(category -> {
                    Map<String, Object> categoryMap = new HashMap<>();
                    categoryMap.put("id", category.getId());
                    categoryMap.put("name", category.getName());

                    // 서브카테고리 매핑
                    List<Map<String, Object>> subCategories = category.getSubCategories().stream()
                            .map(subCategory -> {
                                Map<String, Object> subCategoryMap = new HashMap<>();
                                subCategoryMap.put("id", subCategory.getId());
                                subCategoryMap.put("name", subCategory.getName());
                                return subCategoryMap;
                            })
                            .collect(Collectors.toList());

                    categoryMap.put("subCategories", subCategories);
                    return categoryMap;
                })
                .collect(Collectors.toList());
    }

    /**
     * 특정 서브카테고리에 해당하는 질문 목록을 조회합니다.
     * @param subCategoryId 서브카테고리 ID
     * @return 질문 목록
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getQuestionsBySubCategory(Long subCategoryId) {
        return questionRepository.findBySubCategoryId(subCategoryId).stream()
                .map(question -> {
                    Map<String, Object> questionMap = new HashMap<>();
                    questionMap.put("id", question.getId());
                    questionMap.put("questionText", question.getQuestionText());
                    questionMap.put("questionType", question.getQuestionType());
                    questionMap.put("questionOrder", question.getQuestionOrder());

                    // 옵션 매핑
                    List<Map<String, Object>> options = question.getOptions().stream()
                            .map(option -> {
                                Map<String, Object> optionMap = new HashMap<>();
                                optionMap.put("id", option.getId());
                                optionMap.put("optionText", option.getOptionText());
                                optionMap.put("optionOrder", option.getOptionOrder());
                                return optionMap;
                            })
                            .collect(Collectors.toList());

                    questionMap.put("options", options);
                    return questionMap;
                })
                .collect(Collectors.toList());
    }

    /**
     * 텍스트 형식의 설문 응답을 저장합니다.
     * @param member 응답한 회원
     * @param questionId 질문 ID
     * @param responseText 응답 텍스트
     */
    @Transactional
    public void saveMemberResponse(Member member, Long questionId, String responseText) {
        SurveyQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 질문입니다."));

        MemberResponse response = MemberResponse.builder()
                .member(member)
                .question(question)
                .responseText(responseText)
                .build();

        memberResponseRepository.save(response);
    }

    /**
     * 선택형 설문 응답을 저장합니다.
     * @param member 응답한 회원
     * @param questionId 질문 ID
     * @param optionId 선택한 옵션 ID
     */
    @Transactional
    public void saveMemberResponseOption(Member member, Long questionId, Long optionId) {
        SurveyQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 질문입니다."));
        QuestionOption option = optionRepository.findById(optionId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 옵션입니다."));

        MemberResponseOption responseOption = MemberResponseOption.builder()
                .member(member)
                .question(question)
                .option(option)
                .build();

        memberResponseOptionRepository.save(responseOption);
    }

    /**
     * 설문 제출을 처리합니다.
     * @param member 응답한 회원
     * @param submissionDto 설문 제출 데이터
     */
    @Transactional
    public void processSurveySubmission(Member member, SurveySubmissionDto submissionDto) {
        for (SurveyResponseDto responseDto : submissionDto.getResponses()) {
            SurveyQuestion question = questionRepository.findById(responseDto.getQuestionId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 질문입니다."));

            if ("TEXT".equals(responseDto.getResponseType())) {
                saveMemberResponse(member, question.getId(), responseDto.getResponseText());
            } else if ("MULTIPLE_CHOICE".equals(responseDto.getResponseType()) || "SINGLE_CHOICE".equals(responseDto.getResponseType())) {
                for (Long optionId : responseDto.getSelectedOptions()) {
                    saveMemberResponseOption(member, question.getId(), optionId);
                }
            }
        }
    }
}
