package com.javalab.student.service;

import com.javalab.student.entity.Product;
import com.javalab.student.entity.Recommendation;
import com.javalab.student.repository.ProductRepository;
import com.javalab.student.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RecommendationService {
    private final RecommendationRepository recommendationRepository;
    private final ProductRepository productRepository;

    public List<Product> generateRecommendations(Long memberId) {
        List<Recommendation> recommendations = recommendationRepository.findByMemberId(memberId);

        List<String> requiredNutrients = calculateRequiredNutrients(recommendations);
        return productRepository.findByMainIngredientIn(requiredNutrients);
    }

    private List<String> calculateRequiredNutrients(List<Recommendation> recommendations) {
        List<String> nutrients = new ArrayList<>();
        for (Recommendation rec : recommendations) {
            if ("피로감".equals(rec.getQuestion()) && "예".equals(rec.getAnswer())) {
                nutrients.add("오메가3");
            }
            // 추가 조건들...
        }
        return nutrients;
    }
}
