package com.javalab.student.service;

import com.javalab.student.dto.ProductRecommendationDTO;
import com.javalab.student.entity.*;
import com.javalab.student.repository.ProductIngredientRepository;
import com.javalab.student.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 제품 추천 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
public class RecommendationService {

    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private MemberResponseRepository memberResponseRepository;
    @Autowired
    private MemberResponseOptionRepository memberResponseOptionRepository;
    @Autowired
    private QuestionOptionIngredientRepository questionOptionIngredientRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductIngredientRepository productIngredientRepository;
    /**
     * 사용자 이메일을 기반으로 제품을 추천합니다.
     *
     * @param userEmail 사용자 이메일
     * @return 추천 제품 목록 (필수 추천 및 추가 추천으로 분류)
     * @throws EntityNotFoundException 사용자를 찾을 수 없는 경우
     */
    public Map<String, List<ProductRecommendationDTO>> recommendProducts(String userEmail) {
        // 이메일을 사용하여 사용자 정보를 조회합니다.
        Member member = Optional.ofNullable(memberRepository.findByEmail(userEmail))
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userEmail));

        Long memberId = member.getId();

        // BMI를 계산합니다.
        double bmi = calculateBMI(memberId);

        // 나이를 가져옵니다.
        int age = getAge(memberId);

        // 성분 점수를 계산합니다.
        Map<String, Integer> ingredientScores = calculateIngredientScores(memberId);

        // 연령대와 BMI를 고려하여 성분 점수를 조정합니다.
        adjustIngredientScores(ingredientScores, age, bmi);

        // 모든 제품에 대해 점수를 계산합니다.
        List<Product> scoredProducts = calculateProductScores(productRepository.findAll(), ingredientScores);

        // 점수를 기준으로 제품을 분류합니다.
        return classifyRecommendations(scoredProducts);
    }


    /**
     * 사용자 응답을 기반으로 BMI를 계산합니다.
     *
     * @param memberId 회원 ID
     * @return 계산된 BMI 값
     * @throws IllegalStateException 키 또는 몸무게 정보가 없거나 유효하지 않은 경우
     */
    private double calculateBMI(Long memberId) {
        List<MemberResponse> responses = memberResponseRepository.findLatestResponsesByMemberId(memberId);
        double height = 0;
        double weight = 0;

        for (MemberResponse response : responses) {
            if (response.getQuestion().getQuestionText().equals("키를 알려주세요")) {
                try {
                    height = Double.parseDouble(response.getResponseText());
                } catch (NumberFormatException e) {
                    throw new IllegalStateException("키 정보가 유효하지 않습니다.");
                }
            } else if (response.getQuestion().getQuestionText().equals("몸무게를 알려주세요")) {
                try {
                    weight = Double.parseDouble(response.getResponseText());
                } catch (NumberFormatException e) {
                    throw new IllegalStateException("몸무게 정보가 유효하지 않습니다.");
                }
            }
        }

        if (height == 0 || weight == 0) {
            throw new IllegalStateException("키 또는 몸무게 정보가 없습니다.");
        }

        double heightInMeter = height / 100;
        return weight / (heightInMeter * heightInMeter);
    }

    /**
     * 사용자 응답을 기반으로 나이를 가져옵니다.
     *
     * @param memberId 회원 ID
     * @return 사용자 나이
     * @throws IllegalStateException 나이 정보가 없거나 유효하지 않은 경우
     */
    private int getAge(Long memberId) {
        List<MemberResponse> responses = memberResponseRepository.findLatestResponsesByMemberId(memberId);
        for (MemberResponse response : responses) {
            if (response.getQuestion().getQuestionText().equals("나이를 알려주세요")) {
                try {
                    return Integer.parseInt(response.getResponseText());
                } catch (NumberFormatException e) {
                    throw new IllegalStateException("나이 정보가 유효하지 않습니다.");
                }
            }
        }
        throw new IllegalStateException("나이 정보가 없습니다.");
    }

    /**
     * 사용자 응답을 기반으로 각 성분의 점수를 계산합니다.
     *
     * @param memberId 회원 ID
     * @return 성분별 점수 맵
     */
    private Map<String, Integer> calculateIngredientScores(Long memberId) {
        List<MemberResponse> latestTextResponses = memberResponseRepository.findLatestResponsesByMemberId(memberId);
        List<MemberResponseOption> latestOptionResponses = memberResponseOptionRepository.findLatestResponsesByMemberId(memberId);
        Map<String, Integer> ingredientScores = new HashMap<>();

        // 텍스트 응답 처리
        for (MemberResponse response : latestTextResponses) {
            if (!response.getQuestion().getQuestionType().equals("PERSONAL")) {
                List<String> ingredients = questionOptionIngredientRepository.findIngredientsByQuestionIdAndResponseText(
                        response.getQuestion().getId(), response.getResponseText());
                for (String ingredient : ingredients) {
                    ingredientScores.put(ingredient, ingredientScores.getOrDefault(ingredient, 0) + 1);
                }
            }
        }

        // 선택형 응답 처리
        for (MemberResponseOption response : latestOptionResponses) {
            List<String> ingredients = questionOptionIngredientRepository.findIngredientsByQuestionIdAndResponseText(
                    response.getQuestion().getId(), response.getOption().getOptionText());
            for (String ingredient : ingredients) {
                ingredientScores.put(ingredient, ingredientScores.getOrDefault(ingredient, 0) + 1);
            }
        }

        return ingredientScores;
    }


    /**
     * 연령대와 BMI를 고려하여 성분 점수를 조정합니다.
     *
     * @param ingredientScores 성분별 점수 맵
     * @param age              사용자 나이
     * @param bmi              사용자 BMI
     */
    private void adjustIngredientScores(Map<String, Integer> ingredientScores, int age, double bmi) {
        String ageGroup = determineAgeGroup(age);
        String bmiCategory = determineBMICategory(bmi);

        for (Map.Entry<String, Integer> entry : ingredientScores.entrySet()) {
            String ingredient = entry.getKey();
            int score = entry.getValue();

            // 연령대별 중요도 적용
            int ageImportance = getAgeImportance(ingredient, ageGroup);
            score *= ageImportance;

            // BMI에 따른 조정
            int bmiAdjustment = getBMIAdjustment(ingredient, bmiCategory);
            score += bmiAdjustment;

            ingredientScores.put(ingredient, score);
        }
    }

    /**
     * 주어진 제품 목록에 대해 성분 점수를 기반으로 제품 점수를 계산합니다.
     *
     * @param products         제품 목록
     * @param ingredientScores 성분별 점수 맵
     * @return 점수가 계산된 제품 목록 (점수 내림차순 정렬)
     */
    private List<Product> calculateProductScores(List<Product> products, Map<String, Integer> ingredientScores) {
        for (Product product : products) {
            int score = 0;
            // 제품의 성분 목록을 조회합니다.
            List<ProductIngredient> productIngredients = product.getIngredients(); // 변경된 부분
            for (ProductIngredient productIngredient : productIngredients) {
                // 각 성분의 점수를 합산합니다.
                score += ingredientScores.getOrDefault(productIngredient.getIngredientName(), 0);
            }
            product.setScore(score);
        }

        // 점수를 기준으로 제품을 내림차순 정렬합니다.
        return products.stream()
                .sorted((p1, p2) -> Integer.compare(p2.getScore(), p1.getScore()))
                .collect(Collectors.toList());
    }


    /**
     * 점수가 계산된 제품 목록을 필수 추천과 추가 추천으로 분류합니다.
     *
     * @param scoredProducts 점수가 계산된 제품 목록
     * @return 분류된 추천 제품 목록
     */
    private Map<String, List<ProductRecommendationDTO>> classifyRecommendations(List<Product> scoredProducts) {
        Map<String, List<ProductRecommendationDTO>> recommendations = new HashMap<>();
        List<ProductRecommendationDTO> essentialRecommendations = new ArrayList<>();
        List<ProductRecommendationDTO> additionalRecommendations = new ArrayList<>();

        int totalRecommendations = Math.min(scoredProducts.size(), 8);

        for (int i = 0; i < totalRecommendations; i++) {
            Product product = scoredProducts.get(i);
            ProductRecommendationDTO dto = convertToDTO(product);

            if (i < 3) {
                // 상위 3개 제품을 필수 추천으로 분류 (3개 미만일 수 있음)
                essentialRecommendations.add(dto);
            } else {
                // 나머지 제품을 추가 추천으로 분류
                additionalRecommendations.add(dto);
            }
        }

        recommendations.put("essential", essentialRecommendations);
        recommendations.put("additional", additionalRecommendations);
        return recommendations;
    }

    /**
     * Product 엔티티를 ProductRecommendationDTO로 변환합니다.
     *
     * @param product 변환할 Product 엔티티
     * @return 변환된 ProductRecommendationDTO 객체
     */
    private ProductRecommendationDTO convertToDTO(Product product) {
        return new ProductRecommendationDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                0, // 초기 점수는 0으로 설정
                product.getMainIngredientName()
        );
    }


    /**
     * 나이를 기반으로 연령대를 결정합니다.
     *
     * @param age 나이
     * @return 연령대 문자열
     */
    private String determineAgeGroup(int age) {
        if (age < 19) return "청소년";
        else if (age < 30) return "청년";
        else if (age < 50) return "중년";
        else if (age < 65) return "장년";
        else return "노년";
    }

    /**
     * BMI를 기반으로 비만도 카테고리를 결정합니다.
     *
     * @param bmi BMI 값
     * @return 비만도 카테고리 문자열
     */
    private String determineBMICategory(double bmi) {
        if (bmi < 18.5) return "저체중";
        else if (bmi < 23) return "정상";
        else if (bmi < 25) return "과체중";
        else return "비만";
    }

    /**
     * 연령대별 영양소 중요도를 반환합니다.
     *
     * @param ingredient 영양소 이름
     * @param ageGroup   연령대
     * @return 중요도 점수 (1-5)
     */
    private int getAgeImportance(String ingredient, String ageGroup) {
        // 여기에 연령대별 영양소 중요도를 정의하는 로직을 구현합니다.
        // 예: 칼슘은 청소년과 노년층에서 더 중요할 수 있습니다.
        return 3; // 기본값으로 3을 반환
    }

    /**
     * BMI 카테고리에 따른 영양소 점수 조정값을 반환합니다.
     *
     * @param ingredient  영양소 이름
     * @param bmiCategory BMI 카테고리
     * @return 점수 조정값
     */
    private int getBMIAdjustment(String ingredient, String bmiCategory) {
        // 여기에 BMI 카테고리에 따른 영양소 점수 조정 로직을 구현합니다.
        // 예: 비만인 경우 식이섬유의 중요도를 높일 수 있습니다.
        return 0; // 기본값으로 0을 반환
    }

    public List<ProductRecommendationDTO> recommendProductsByIngredients(Map<String, Integer> ingredientScores) {
        List<ProductRecommendationDTO> recommendations = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : ingredientScores.entrySet()) {
            String ingredient = entry.getKey();
            int score = entry.getValue();

            // 해당 성분을 주성분으로 가진 제품들을 조회
            List<Product> products = productRepository.findByMainIngredientName(ingredient);

            // 제품 점수 계산 및 정렬
            products.sort((p1, p2) -> Integer.compare(calculateProductScore(p2, score), calculateProductScore(p1, score)));

            // 상위 2개 제품 추천 목록에 추가
            for (int i = 0; i < Math.min(2, products.size()); i++) {
                Product product = products.get(i);
                ProductRecommendationDTO dto = convertToDTO(product);
                dto.setScore(calculateProductScore(product, score));
                recommendations.add(dto);
            }
        }

        // 전체 점수 기준으로 정렬
        recommendations.sort((r1, r2) -> Integer.compare(r2.getScore(), r1.getScore()));

        return recommendations;
    }



    private int calculateProductScore(Product product, int ingredientScore) {
        // 제품 점수 계산 로직 (예: 기본 점수 + 성분 점수)
        return 3 + ingredientScore; // 기본 점수를 3으로 설정
    }
}


