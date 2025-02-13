package com.javalab.student.service.healthSurvey;

import com.javalab.student.dto.healthSurvey.HealthAnalysisDTO;
import com.javalab.student.entity.healthSurvey.MemberResponseOption;
import com.javalab.student.entity.healthSurvey.Recommendation;
import com.javalab.student.entity.healthSurvey.RecommendedIngredient;
import com.javalab.student.repository.healthSurvey.RecommendedIngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 영양 성분 점수 계산을 위한 서비스 클래스
 */
@Service
@Transactional
public class NutrientScoreService {

    @Autowired
    private RecommendedIngredientRepository recommendedIngredientRepository;

    /**
     * 회원의 응답, 나이, BMI, 성별을 기반으로 영양 성분 점수를 계산합니다.
     *
     * @param responses 회원의 설문 응답 목록
     * @param age       회원의 나이
     * @param bmi       회원의 BMI
     * @param gender    회원의 성별
     * @return 각 영양 성분의 점수를 포함하는 Map
     */
    public Map<String, Integer> calculateIngredientScores(List<MemberResponseOption> responses, int age, double bmi, String gender) {
        Map<String, Integer> ingredientScores = new HashMap<>();

        Set<String> mainSymptoms = getMainSymptoms(responses);
        calculateMainSymptomScores(responses, ingredientScores, mainSymptoms);
        calculateAdditionalHealthScores(responses, ingredientScores);
        calculateLifestyleScores(responses, ingredientScores);
        calculateGenderSpecificScores(responses, ingredientScores, gender);
        adjustScoresByAgeAndBMI(ingredientScores, age, bmi);

        return ingredientScores;
    }

    /**
     * 계산된 영양 성분 점수를 기반으로 추천 영양 성분을 결정합니다.
     *
     * @param healthAnalysis   건강 분석 결과
     * @param ingredientScores 계산된 영양 성분 점수
     * @param age              회원의 나이
     * @param bmi              회원의 BMI
     * @return 추천 영양 성분 목록 (최대 5개, 이름과 점수 포함)
     */
    public List<Map<String, Object>> getRecommendedIngredients(HealthAnalysisDTO healthAnalysis, Map<String, Integer> ingredientScores, int age, double bmi) {
        // 기본 성분 (칼슘, 마그네슘, 비타민D) 기본 점수 1점 부여
        Set<String> baseIngredients = new HashSet<>(Arrays.asList("칼슘", "마그네슘", "비타민D"));
        baseIngredients.forEach(ingredient -> ingredientScores.putIfAbsent(ingredient, 1));

        // 총점이 1점 이상인 성분만 필터링하고 점수 내림차순 정렬
        List<Map.Entry<String, Integer>> sortedIngredients = ingredientScores.entrySet().stream()
                .filter(entry -> entry.getValue() >= 1) // 총점이 1점 이상인 것만 포함
                .sorted(Comparator.comparing(Map.Entry::getValue, Comparator.reverseOrder())) // 점수 내림차순 정렬
                .collect(Collectors.toList());

        // 상위 5개만 선택하여 이름과 점수를 Map에 담아 List로 반환
        return sortedIngredients.stream()
                .limit(5)
                .map(entry -> {
                    Map<String, Object> ingredient = new HashMap<>();
                    ingredient.put("name", entry.getKey());
                    ingredient.put("score", entry.getValue());
                    return ingredient;
                })
                .collect(Collectors.toList());
    }

    /**
     * 추천 영양 성분을 저장합니다.
     *
     * @param ingredientScores 계산된 영양 성분 점수
     * @param healthAnalysis   건강 분석 결과
     * @param age              회원의 나이
     * @param bmi              회원의 BMI
     */
    @Transactional
    public void saveRecommendedIngredients(Recommendation recommendation, Map<String, Integer> ingredientScores, HealthAnalysisDTO healthAnalysis, int age, double bmi) {
        // 추천 영양 성분 결정 (최대 5개, 이름과 점수 포함)
        List<Map<String, Object>> recommendedIngredients = getRecommendedIngredients(healthAnalysis, ingredientScores, age, bmi);

        // 점수의 최대값을 구해 5점 만점으로 환산하기 위한 기준 설정
        double maxScore = ingredientScores.values().stream().max(Integer::compareTo).orElse(1);

        for (Map<String, Object> ingredientMap : recommendedIngredients) {
            String ingredientName = (String) ingredientMap.get("name");
            Integer originalScore = (Integer) ingredientMap.get("score");

            RecommendedIngredient ingredient = new RecommendedIngredient();
            ingredient.setRecommendation(recommendation); // Recommendation 객체 참조로 설정
            ingredient.setIngredientName(ingredientName);

            // 점수 계산 및 저장 (0점 ~ 5점 사이로 정규화)
            double normalizedScore = Math.min(5.0, Math.max(0.0, (originalScore / maxScore) * 5));
            double roundedScore = Math.round(normalizedScore * 10.0) / 10.0;
            ingredient.setScore(roundedScore);

            recommendedIngredientRepository.save(ingredient);
            recommendation.getRecommendedIngredients().add(ingredient);
        }
    }


    /**
     * 주요 증상을 추출합니다.
     *
     * @param responses 회원의 설문 응답 목록
     * @return 주요 증상 집합
     */
    private Set<String> getMainSymptoms(List<MemberResponseOption> responses) {
        return responses.stream()
                .filter(r -> r.getOption().getQuestion().getSubCategory().getName().equals("주요 증상"))
                .map(r -> r.getOption().getOptionText())
                .collect(Collectors.toSet());
    }

    /**
     * 주요 증상에 대한 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     * @param mainSymptoms     주요 증상 집합
     */
    private void calculateMainSymptomScores(List<MemberResponseOption> responses, Map<String, Integer> ingredientScores,
                                            Set<String> mainSymptoms) {
        for (MemberResponseOption response : responses) {
            String subCategory = response.getOption().getQuestion().getSubCategory().getName();
            if (mainSymptoms.contains(subCategory) && response.isSelected()) {
                switch (subCategory) {
                    case "혈관·혈액순환":
                        calculateBloodCirculationScores(response, ingredientScores);
                        break;
                    case "소화·장":
                        calculateDigestionScores(response, ingredientScores);
                        break;
                    case "피부":
                        calculateSkinScores(response, ingredientScores);
                        break;
                    case "눈":
                        calculateEyeScores(response, ingredientScores);
                        break;
                    case "두뇌 활동":
                        calculateBrainScores(response, ingredientScores);
                        break;
                    case "피로감":
                        calculateFatigueScores(response, ingredientScores);
                        break;
                    case "뼈·관절":
                        calculateBoneJointScores(response, ingredientScores);
                        break;
                    case "면역":
                        calculateImmuneScores(response, ingredientScores);
                        break;
                    case "모발":
                        calculateHairScores(response, ingredientScores);
                        break;
                }
            }
        }
    }

    /**
     * 추가 건강 관련 질문들(혈압, 더위, 약물 복용 등)에 대한 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateAdditionalHealthScores(List<MemberResponseOption> responses, Map<String, Integer> ingredientScores) {
        for (MemberResponseOption response : responses) {
            if (response.isSelected()) {
                String optionText = response.getOption().getOptionText();
                switch (optionText) {
                    case "혈압이 높아요 140 / 90 이상":
                        ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 4 : v + 4);
                        ingredientScores.compute("마그네슘", (k, v) -> (v == null) ? 3 : v + 3);
                        break;
                    case "혈압이 낮아요 90 / 60 이하":
                        ingredientScores.compute("비타민B12", (k, v) -> (v == null) ? 3 : v + 3);
                        break;
                    case "평소 더위를 타고, 땀을 많이 흘려요":
                        ingredientScores.compute("전해질", (k, v) -> (v == null) ? 3 : v + 3);
                        break;
                    case "항응고제(와파린 등)와 항혈절제(아스피린 등)을 복용하고 있어요":
                        // 이 경우 특정 영양제 섭취에 주의가 필요할 수 있으므로, 점수를 부여하지 않고 별도 처리가 필요할 수 있습니다.
                        break;
                    case "꿀, 프로폴리스에 알레르기가 있어요":
                        // 이 경우도 특정 영양제 섭취에 주의가 필요하므로, 별도 처리가 필요할 수 있습니다.
                        break;
                }
            }
        }
    }

    /**
     * 생활 습관 관련 질문들에 대한 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateLifestyleScores(List<MemberResponseOption> responses, Map<String, Integer> ingredientScores) {
        for (MemberResponseOption response : responses) {
            if (response.isSelected()) {
                String questionText = response.getOption().getQuestion().getQuestionText();
                String optionText = response.getOption().getOptionText();

                switch (questionText) {
                    case "운동은 얼마나 자주 하시나요?":
                        calculateExerciseScores(optionText, ingredientScores);
                        break;
                    case "햇빛을 쬐는 야외활동을 하루에 얼마나 하나요?":
                        calculateSunExposureScores(optionText, ingredientScores);
                        break;
                    case "해당하는 식습관을 모두 선택하세요":
                        calculateDietHabitScores(optionText, ingredientScores);
                        break;
                    case "해당하는 기호식품 섭취 습관을 모두 선택하세요":
                        calculateConsumptionHabitScores(optionText, ingredientScores);
                        break;
                    case "해당하는 것을 모두 선택하세요":
                        calculateDailyHabitScores(optionText, ingredientScores);
                        break;
                    case "가족력을 모두 선택하세요":
                        calculateFamilyHistoryScores(optionText, ingredientScores);
                        break;
                }
            }
        }
    }

    /**
     * 혈관·혈액순환 관련 영양 성분 점수를 계산합니다.
     *
     * @param response         회원의 응답
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateBloodCirculationScores(MemberResponseOption response, Map<String, Integer> ingredientScores) {
        String symptom = response.getOption().getOptionText();
        switch (symptom.trim()) {
            case "손발 끝이 자주 저려요":
                ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "상처가 잘 낫지 않아요":
                ingredientScores.compute("코엔자임Q10", (k, v) -> (v == null) ? 4 : v + 4);
                ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 5 : v + 5);
                break;
            case "잇몸이 붓고 피가 나요":
                ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 3 : v + 3);
                break;
            case "얼굴이 자주 창백해져요":
                ingredientScores.compute("철분", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("비타민B12", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "선택할 것은 없지만 혈관·혈액순환이 걱정돼요":
                ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 4 : v + 4);
                break;
        }
    }

    /**
     * 소화·장 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param response         회원의 응답
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateDigestionScores(MemberResponseOption response, Map<String, Integer> ingredientScores) {
        String symptom = response.getOption().getOptionText();
        switch (symptom.trim()) {
            case "복통이나 속 쓰림이 자주 발생해요":
                ingredientScores.compute("글루타민", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("프로바이오틱스", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "변비가 있어요":
                ingredientScores.compute("프로바이오틱스", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("식이섬유", (k, v) -> (v == null) ? 5 : v + 5);
                break;
            case "변이 묽은 편이에요":
                ingredientScores.compute("프로바이오틱스", (k, v) -> (v == null) ? 5 : v + 5);
                break;
            case "술을 마시면 얼굴이나 몸이 붉어지고 소화가 안 돼요":
                ingredientScores.compute("비타민B6", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "잔뇨감이 있어요":
                ingredientScores.compute("크랜베리 추출물", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "선택할 것은 없지만 소화력 개선이 필요해요":
                ingredientScores.compute("프로바이오틱스", (k, v) -> (v == null) ? 4 : v + 4);
                break;
        }
    }

    /**
     * 피부 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param response         회원의 응답
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateSkinScores(MemberResponseOption response, Map<String, Integer> ingredientScores) {
        switch (response.getOption().getOptionText().trim()) {
            case "피부가 건조하고 머리에 비듬이 많이 생겨요":
                ingredientScores.compute("콜라겐", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("비오틴", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "여드름이 많아서 걱정이에요":
                ingredientScores.compute("아연", (k, v) -> (v == null) ? 4 : v + 4);
                ingredientScores.compute("비타민A", (k, v) -> (v == null) ? 3 : v + 3);
                break;

            case "피부에 염증이 자주 생겨요":
                ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 4 : v + 4);
                ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 3 : v + 3);
                break;
            case "입안이 헐고 입술이 자주 갈라져요":
                ingredientScores.compute("비타민B2", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "선택할 것은 없지만 피부건강이 걱정돼요":
                ingredientScores.compute("콜라겐", (k, v) -> (v == null) ? 4 : v + 4);
                break;
        }
    }

    /**
     * 눈 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param response         회원의 응답
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateEyeScores(MemberResponseOption response, Map<String, Integer> ingredientScores) {
        switch (response.getOption().getOptionText().trim()) {
            case "눈이 건조해 뻑뻑하고 가려워요":
                ingredientScores.compute("루테인", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "눈 주변이 떨려요":
                ingredientScores.compute("마그네슘", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "핸드폰, 모니터를 본 후 시야가 흐릿해요":
                ingredientScores.compute("루테인", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("비타민A", (k, v) -> (v == null) ? 3 : v + 3);
                break;
            case "어두워지면 시력이 저하돼요":
                ingredientScores.compute("비타민A", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("루테인", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "선택할 것은 없지만 눈 건강이 걱정돼요":
                ingredientScores.compute("루테인", (k, v) -> (v == null) ? 4 : v + 4);
                break;
        }
    }

    /**
     * 두뇌 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param response         회원의 응답
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateBrainScores(MemberResponseOption response, Map<String, Integer> ingredientScores) {
        switch (response.getOption().getOptionText().trim()) {
            case "기억력이 떨어지는 것 같아요":
                ingredientScores.compute("인지질(PS)", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "두통이 자주 생겨요":
                ingredientScores.compute("마그네슘", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("비타민B2", (k, v) -> (v == null) ? 3 : v + 3);
                break;
            case "불안이나 긴장을 자주 느껴요":
                ingredientScores.compute("GABA", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("마그네슘", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "우울한 감정을 자주 느껴요":
                ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 4 : v + 4);
                ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 3 : v + 3);
                break;
            case "귀에서 울리는 소리가 가끔 나요":
                ingredientScores.compute("비타민B12", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "선택할 것은 없지만 두뇌 활동이 걱정돼요":
                ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 4 : v + 4);
                break;
        }
    }

    /**
     * 피로감 관련 영양 성분 점수를 계산합니다.
     *
     * @param response         회원의 응답
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateFatigueScores(MemberResponseOption response, Map<String, Integer> ingredientScores) {
        switch (response.getOption().getOptionText().trim()) {
            case "무기력하고 식욕이 없어요":
                ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("철분", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "자고 일어나도 피곤해요":
                ingredientScores.compute("코엔자임Q10", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "신경이 예민하고 잠을 잘 이루지 못해요":
                ingredientScores.compute("GABA", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("마그네슘", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "소변을 보기 위해 잠을 깨요":
                ingredientScores.compute("쏘팔메토", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "선택할 것은 없지만 피로감이 있어요":
                ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 4 : v + 4);
                break;
        }
    }

    /**
     * 뼈·관절 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param response         회원의 응답
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateBoneJointScores(MemberResponseOption response, Map<String, Integer> ingredientScores) {
        switch (response.getOption().getOptionText().trim()) {
            case "뼈가 부러진 경험이 있어요":
                ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 5 : v + 5);
                break;
            case "뼈가 약하다고 느껴요":
                ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "최근 1년 중 스테로이드를 섭취한 기간이 3개월 이상이에요":
                ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 5 : v + 5);
                break;
            case "선택할 것은 없지만 뼈 · 관절이 걱정돼요":
                ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 4 : v + 4);
                ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 4 : v + 4);
                break;
        }
    }

    /**
     * 면역 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param response         회원의 응답
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateImmuneScores(MemberResponseOption response, Map<String, Integer> ingredientScores) {
        switch (response.getOption().getOptionText().trim()) {
            case "스트레스가 매우 많아요":
                ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("아연", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "알레르기 질환이 있어요 (아토피, 비염 등)":
                ingredientScores.compute("프로바이오틱스", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "감염성 질환에 자주 걸려요 (감기, 독감 등)":
                ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("아연", (k, v) -> (v == null) ? 5 : v + 5);
                break;
            case "선택할 것은 없지만 면역이 걱정돼요":
                ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 4 : v + 4);
                ingredientScores.compute("아연", (k, v) -> (v == null) ? 4 : v + 4);
                break;
        }
    }

    /**
     * 모발 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param response         회원의 응답
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateHairScores(MemberResponseOption response, Map<String, Integer> ingredientScores) {
        switch (response.getOption().getOptionText().trim()) {
            case "머리카락에 힘이 없고 잘 빠져요":
                ingredientScores.compute("비오틴", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("아미노산", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "머리카락이 윤기 없고 갈라지고 끊어져요":
                ingredientScores.compute("비오틴", (k, v) -> (v == null) ? 5 : v + 5);
                ingredientScores.compute("비타민E", (k, v) -> (v == null) ? 4 : v + 4);
                break;
            case "새치가 많이 나요":
                ingredientScores.compute("구리", (k, v) -> (v == null) ? 4 : v + 4);
                ingredientScores.compute("비타민B5", (k, v) -> (v == null) ? 3 : v + 3);
                break;
            case "선택할 것은 없지만 모발 건강이 걱정돼요":
                ingredientScores.compute("비오틴", (k, v) -> (v == null) ? 4 : v + 4);
                break;
        }
    }

    /**
     * 운동 빈도에 따른 점수를 계산합니다.
     * 운동을 많이 할수록 낮은 점수를 부여합니다.
     *
     * @param optionText       선택된 운동 빈도 옵션
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateExerciseScores(String optionText, Map<String, Integer> ingredientScores) {
        switch (optionText) {
            case "주 4회 이상 (많이 해요.)":
                ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 1 : v + 1);
                ingredientScores.compute("마그네슘", (k, v) -> (v == null) ? 1 : v + 1);
                break;
            case "주 2~3회 (적당히 해요.)":
                ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 2 : v + 2);
                ingredientScores.compute("마그네슘", (k, v) -> (v == null) ? 2 : v + 2);
                break;
            case "주 1회 이하 (거의 하지 않아요.)":
                ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 4 : v + 4);
                ingredientScores.compute("마그네슘", (k, v) -> (v == null) ? 4 : v + 4);
                break;
        }
    }

    /**
     * 햇빛 노출 정도에 따른 점수를 계산합니다.
     * 햇빛 노출이 적을수록 높은 점수를 부여합니다.
     *
     * @param optionText       선택된 햇빛 노출 옵션
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateSunExposureScores(String optionText, Map<String, Integer> ingredientScores) {
        switch (optionText) {
            case "4시간 이상 (많이 해요.)":
                ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 1 : v + 1);
                break;
            case "1~4시간 (적당히 해요.)":
                ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 2 : v + 2);
                break;
            case "1시간 이하 (거의 하지 않아요.)":
                ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 4 : v + 4);
                break;
        }
    }

    /**
     * 식습관에 따른 점수를 계산합니다.
     * 건강한 식습관은 낮은 점수를, 불건강한 식습관은 높은 점수를 부여합니다.
     *
     * @param optionText       선택된 식습관 옵션들
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateDietHabitScores(String optionText, Map<String, Integer> ingredientScores) {
        if (optionText.contains("생선을 자주 먹어요")) {
            ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 1 : v + 1);
        }
        if (optionText.contains("채소를 자주 먹어요")) {
            ingredientScores.compute("식이섬유", (k, v) -> (v == null) ? 1 : v + 1);
            ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 1 : v + 1);
        }
        if (optionText.contains("과일을 자주 먹어요")) {
            ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 1 : v + 1);
        }
        if (optionText.contains("고기를 자주 먹어요")) {
            ingredientScores.compute("철분", (k, v) -> (v == null) ? 1 : v + 1);
            ingredientScores.compute("비타민B12", (k, v) -> (v == null) ? 1 : v + 1);
        }
        if (optionText.contains("단 음식을 자주 먹어요")) {
            ingredientScores.compute("크롬", (k, v) -> (v == null) ? 3 : v + 3);
        }
        if (optionText.contains("식사를 자주 걸러요")) {
            ingredientScores.compute("종합비타민", (k, v) -> (v == null) ? 4 : v + 4);
        }
    }

    /**
     * 기호식품 섭취 습관에 따른 점수를 계산합니다.
     * 불건강한 습관일수록 높은 점수를 부여합니다.
     *
     * @param optionText       선택된 기호식품 섭취 습관 옵션들
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateConsumptionHabitScores(String optionText, Map<String, Integer> ingredientScores) {
        if (optionText.contains("담배를 피워요")) {
            ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 5 : v + 5);
            ingredientScores.compute("비타민E", (k, v) -> (v == null) ? 4 : v + 4);
        }
        if (optionText.contains("커피를 마셔요")) {
            ingredientScores.compute("마그네슘", (k, v) -> (v == null) ? 3 : v + 3);
        }
        if (optionText.contains("물을 잘 안 마셔요")) {
            ingredientScores.compute("전해질", (k, v) -> (v == null) ? 3 : v + 3);
        }
        if (optionText.contains("인스턴트 음식을 자주 먹어요")) {
            ingredientScores.compute("종합비타민", (k, v) -> (v == null) ? 3 : v + 3);
            ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 3 : v + 3);
        }
    }

    /**
     * 일상 생활 패턴에 따른 점수를 계산합니다.
     *
     * @param optionText       선택된 일상 생활 패턴 옵션들
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateDailyHabitScores(String optionText, Map<String, Integer> ingredientScores) {
        if (optionText.contains("업무, 학업 강도가 높아요")) {
            ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 4 : v + 4);
            ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 3 : v + 3);
        }
        if (optionText.contains("핸드폰, 모니터를 오래 봐요")) {
            ingredientScores.compute("루테인", (k, v) -> (v == null) ? 4 : v + 4);
            ingredientScores.compute("비타민A", (k, v) -> (v == null) ? 3 : v + 3);
        }
        if (optionText.contains("목이 자주 건조하거나 칼칼해요")) {
            ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 3 : v + 3);
        }
        if (optionText.contains("집중력이 필요한 시기예요")) {
            ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 4 : v + 4);
            ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 3 : v + 3);
        }
        if (optionText.contains("식사량을 줄이는 다이어트 중이에요")) {
            ingredientScores.compute("종합비타민", (k, v) -> (v == null) ? 4 : v + 4);
        }
        if (optionText.contains("구내염이 자주 생겨요")) {
            ingredientScores.compute("비타민B2", (k, v) -> (v == null) ? 4 : v + 4);
            ingredientScores.compute("아연", (k, v) -> (v == null) ? 3 : v + 3);
        }
    }

    /**
     * 가족력에 따른 점수를 계산합니다.
     *
     * @param optionText       선택된 가족력 옵션들
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateFamilyHistoryScores(String optionText, Map<String, Integer> ingredientScores) {
        if (optionText.contains("간 질환이 있어요")) {
            ingredientScores.compute("밀크씨슬", (k, v) -> (v == null) ? 4 : v + 4);
        }
        if (optionText.contains("혈관 질환이 있어요")) {
            ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 4 : v + 4);
            ingredientScores.compute("코엔자임Q10", (k, v) -> (v == null) ? 3 : v + 3);
        }
        if (optionText.contains("뼈 · 관절 질환이 있어요")) {
            ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 4 : v + 4);
            ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 4 : v + 4);
        }
        if (optionText.contains("당뇨가 있어요")) {
            ingredientScores.compute("크롬", (k, v) -> (v == null) ? 4 : v + 4);
            ingredientScores.compute("마그네슘", (k, v) -> (v == null) ? 3 : v + 3);
        }
    }

    /**
     * 성별에 따른 특정 건강 문제에 대한 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     * @param gender           회원의 성별
     */
    private void calculateGenderSpecificScores(List<MemberResponseOption> responses, Map<String, Integer> ingredientScores, String gender) {
        if ("여성".equals(gender)) {
            calculateWomenHealthScores(responses, ingredientScores);
        } else if ("남성".equals(gender)) {
            calculateMenHealthScores(responses, ingredientScores);
        }
    }

    /**
     * 여성 건강 관련 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateWomenHealthScores(List<MemberResponseOption> responses, Map<String, Integer> ingredientScores) {
        for (MemberResponseOption response : responses) {
            if (response.getOption().getQuestion().getSubCategory().getName().equals("여성건강") && response.isSelected()) {
                String optionText = response.getOption().getOptionText();
                switch (optionText) {
                    case "임신, 수유 중이에요":
                        ingredientScores.compute("엽산", (k, v) -> (v == null) ? 5 : v + 5);
                        ingredientScores.compute("철분", (k, v) -> (v == null) ? 4 : v + 4);
                        ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 4 : v + 4);
                        break;
                    case "생리전 증후군, 유방 통증이 있어요":
                        ingredientScores.compute("감마리놀렌산", (k, v) -> (v == null) ? 4 : v + 4);
                        ingredientScores.compute("비타민B6", (k, v) -> (v == null) ? 3 : v + 3);
                        break;
                    case "요로감염, 잔뇨감과 같은 비뇨기계 질환이 있거나 걱정돼요":
                        ingredientScores.compute("크랜베리 추출물", (k, v) -> (v == null) ? 4 : v + 4);
                        break;
                    case "생리 전후로 우울하거나 예민해요":
                        ingredientScores.compute("비타민B6", (k, v) -> (v == null) ? 4 : v + 4);
                        ingredientScores.compute("마그네슘", (k, v) -> (v == null) ? 3 : v + 3);
                        break;
                    case "부정 출혈이 월 1회 이상 나타나요":
                        ingredientScores.compute("철분", (k, v) -> (v == null) ? 4 : v + 4);
                        break;
                }
            }
        }
    }

    /**
     * 남성 건강 관련 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateMenHealthScores(List<MemberResponseOption> responses, Map<String, Integer> ingredientScores) {
        for (MemberResponseOption response : responses) {
            if (response.getOption().getQuestion().getSubCategory().getName().equals("남성건강") && response.isSelected()) {
                String optionText = response.getOption().getOptionText();
                switch (optionText) {
                    case "남성 가족 중 비뇨기계 질환이 있어요":
                        ingredientScores.compute("쏘팔메토", (k, v) -> (v == null) ? 4 : v + 4);
                        ingredientScores.compute("아연", (k, v) -> (v == null) ? 3 : v + 3);
                        break;
                    case "이유 불문 머리가 빠지고 머리숱이 적어졌어요":
                        ingredientScores.compute("비오틴", (k, v) -> (v == null) ? 4 : v + 4);
                        ingredientScores.compute("아연", (k, v) -> (v == null) ? 3 : v + 3);
                        break;
                    case "남성 불임에 대한 불안감이 있거나 2세 계획이 지연되고 있어요":
                        ingredientScores.compute("아연", (k, v) -> (v == null) ? 4 : v + 4);
                        ingredientScores.compute("코엔자임Q10", (k, v) -> (v == null) ? 3 : v + 3);
                        break;
                }
            }
        }
    }

    /**
     * 나이와 BMI에 따라 영양 성분 점수를 조정합니다.
     *
     * @param ingredientScores 영양 성분 점수 Map
     * @param age 회원의 나이
     * @param bmi 회원의 BMI
     */
    private void adjustScoresByAgeAndBMI(Map<String, Integer> ingredientScores, int age, double bmi) {
        // 나이에 따른 조정
        if (age > 50) {
            ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 3 : v + 3);
            ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 3 : v + 3);
            ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 2 : v + 2);
        } else if (age > 30) {
            ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 2 : v + 2);
            ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 2 : v + 2);
        }

        // BMI에 따른 조정
        if (bmi > 25) {
            ingredientScores.compute("식이섬유", (k, v) -> (v == null) ? 3 : v + 3);
            ingredientScores.compute("크롬", (k, v) -> (v == null) ? 2 : v + 2);
        } else if (bmi < 18.5) {
            ingredientScores.compute("단백질", (k, v) -> (v == null) ? 3 : v + 3);
            ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 2 : v + 2);
        }
    }
}