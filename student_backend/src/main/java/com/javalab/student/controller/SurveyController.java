package com.javalab.student.controller;

import com.javalab.student.dto.SurveySubmissionDto;
import com.javalab.student.entity.Member;
import com.javalab.student.service.SurveyService;
import com.javalab.student.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
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
                                          @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 현재 로그인한 사용자 조회
            Member member = memberService.findByEmail(userDetails.getUsername());
            if (member == null) {
                return ResponseEntity.badRequest().body("사용자를 찾을 수 없습니다.");
            }

            // 설문 응답 처리
            surveyService.processSurveySubmission(member, submissionDto);

            return ResponseEntity.ok().body("설문 응답이 성공적으로 제출되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("설문 제출 중 오류가 발생했습니다.");
        }
    }
}
