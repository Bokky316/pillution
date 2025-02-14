package com.javalab.student.controller;

import com.javalab.student.dto.healthSurvey.SurveySubmissionDto;
import com.javalab.student.entity.Member;
import com.javalab.student.service.healthSurvey.SurveyService;
import com.javalab.student.service.MemberService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/api/survey")
public class SurveyController {

    private final SurveyService surveyService;
    private final MemberService memberService;

    @Autowired
    public SurveyController(SurveyService surveyService, MemberService memberService) {
        this.surveyService = surveyService;
        this.memberService = memberService;
    }

    /**
     * 설문 카테고리 목록 조회 (서브카테고리 포함)
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> getCategoriesWithSubCategories() {
        return ResponseEntity.ok(surveyService.getAllCategoriesWithSubCategories());
    }

    /**
     * 특정 서브카테고리의 질문 목록 조회
     */
    @GetMapping("/subcategories/{subCategoryId}/questions")
    public ResponseEntity<List<Map<String, Object>>> getQuestionsBySubCategory(@PathVariable("subCategoryId") Long subCategoryId) {
        return ResponseEntity.ok(surveyService.getQuestionsBySubCategory(subCategoryId));
    }

    /**
     * 설문 응답 제출
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitSurvey(@RequestBody SurveySubmissionDto submissionDto,
                                          Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증되지 않은 사용자입니다.");
            }

            String email = authentication.getName();
            Member member = memberService.findByEmail(email);
            if (member == null) {
                return ResponseEntity.badRequest().body("사용자를 찾을 수 없습니다.");
            }

            log.info("Processing survey submission for user: {}", email);
            surveyService.processSurveySubmission(member, submissionDto);

            return ResponseEntity.ok().body("{\"message\": \"설문 응답이 성공적으로 제출되었습니다.\"}");

        } catch (Exception e) {
            log.error("Error processing survey submission", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("설문 제출 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}

