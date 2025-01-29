package com.javalab.student.service;

import com.javalab.student.entity.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class RecommendationServiceTest {

    @Autowired
    private RecommendationService recommendationService;

    @Test
    public void testGenerateRecommendations() {
        Long memberId = 1L; // 테스트 멤버 ID
        List<Product> recommendations = recommendationService.generateRecommendations(memberId);

        assertNotNull(recommendations);
        assertFalse(recommendations.isEmpty());
    }
}

