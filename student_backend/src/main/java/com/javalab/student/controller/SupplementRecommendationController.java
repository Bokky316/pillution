package com.javalab.student.controller;

import com.javalab.student.entity.Member;
import com.javalab.student.entity.Recommendation;
import com.javalab.student.service.SupplementRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/supplements")
@RequiredArgsConstructor
public class SupplementRecommendationController {

    private final SupplementRecommendationService recommendationService;

    @PostMapping("/recommend")
    public ResponseEntity<Recommendation> getRecommendedSupplements(@AuthenticationPrincipal Member member) {
        Recommendation recommendation = recommendationService.recommendSupplements(member);
        return ResponseEntity.ok(recommendation);
    }
}
