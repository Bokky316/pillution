package com.javalab.student.controller;

import com.javalab.student.entity.Product;
import com.javalab.student.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {
    private final RecommendationService recommendationService;

    @GetMapping("/{memberId}")
    public List<Product> getRecommendations(@PathVariable Long memberId) {
        return recommendationService.generateRecommendations(memberId);
    }
}
