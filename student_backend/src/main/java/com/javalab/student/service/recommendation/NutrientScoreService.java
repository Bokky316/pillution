package com.javalab.student.service.recommendation;

import com.javalab.student.dto.HealthAnalysisDTO;
import com.javalab.student.entity.MemberResponse;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 영양 성분 점수 계산을 위한 서비스 클래스
 */
@Service
public class NutrientScoreService {

    /**
     * 회원의 응답, 나이, BMI를 기반으로 영양 성분 점수를 계산합니다.
     *
     * @param responses 회원의 설문 응답 목록
     * @param age 회원의 나이
     * @param bmi 회원의 BMI
     * @return 각 영양 성분의 점수를 포함하는 Map
     */
    public Map<String, Integer> calculateIngredientScores(List<MemberResponse> responses, int age, double bmi) {
        Map<String, Integer> ingredientScores = new HashMap<>();

        calculateBloodCirculationScores(responses, ingredientScores);
        calculateDigestionScores(responses, ingredientScores);
        calculateSkinScores(responses, ingredientScores);
        calculateEyeScores(responses, ingredientScores);
        calculateBrainScores(responses, ingredientScores);
        calculateFatigueScores(responses, ingredientScores);
        calculateBoneJointScores(responses, ingredientScores);
        calculateImmuneScores(responses, ingredientScores);
        calculateHairScores(responses, ingredientScores);

        adjustScoresByAgeAndBMI(ingredientScores, age, bmi);

        return ingredientScores;
    }

    /**
     * 혈관·혈액순환 관련 영양 성분 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateBloodCirculationScores(List<MemberResponse> responses, Map<String, Integer> ingredientScores) {
        for (MemberResponse response : responses) {
            if (response.getQuestion().getSubCategory().getName().equals("혈관·혈액순환")) {
                switch (response.getResponseText()) {
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
        }
    }

    /**
     * 소화·장 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateDigestionScores(List<MemberResponse> responses, Map<String, Integer> ingredientScores) {
        for (MemberResponse response : responses) {
            if (response.getQuestion().getSubCategory().getName().equals("소화·장")) {
                switch (response.getResponseText()) {
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
        }
    }

    /**
     * 피부 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateSkinScores(List<MemberResponse> responses, Map<String, Integer> ingredientScores) {
        for (MemberResponse response : responses) {
            if (response.getQuestion().getSubCategory().getName().equals("피부")) {
                switch (response.getResponseText()) {
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
        }
    }

    /**
     * 눈 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateEyeScores(List<MemberResponse> responses, Map<String, Integer> ingredientScores) {
        for (MemberResponse response : responses) {
            if (response.getQuestion().getSubCategory().getName().equals("눈")) {
                switch (response.getResponseText()) {
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
        }
    }

    /**
     * 두뇌 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateBrainScores(List<MemberResponse> responses, Map<String, Integer> ingredientScores) {
        for (MemberResponse response : responses) {
            if (response.getQuestion().getSubCategory().getName().equals("두뇌 활동")) {
                switch (response.getResponseText()) {
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
        }
    }

    /**
     * 피로감 관련 영양 성분 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateFatigueScores(List<MemberResponse> responses, Map<String, Integer> ingredientScores) {
        for (MemberResponse response : responses) {
            if (response.getQuestion().getSubCategory().getName().equals("피로감")) {
                switch (response.getResponseText()) {
                    case "무기력하고 식욕이 없어요":
                        ingredientScores.compute("철분", (k, v) -> (v == null) ? 5 : v + 5);
                        ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 4 : v + 4);
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
                        ingredientScores.compute("크랜베리 추출물", (k, v) -> (v == null) ? 3 : v + 3);
                        break;
                    case "선택할 것은 없지만 피로감이 있어요":
                        ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 4 : v + 4);
                        break;
                }
            }
        }
    }
    /**
     * 뼈·관절 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateBoneJointScores(List<MemberResponse> responses, Map<String, Integer> ingredientScores) {
        for (MemberResponse response : responses) {
            if (response.getQuestion().getSubCategory().getName().equals("뼈·관절")) {
                switch (response.getResponseText()) {
                    case "뼈가 부러진 경험이 있어요":
                        ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 5 : v + 5);
                        ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 5 : v + 5);
                        break;
                    case "뼈가 약하다고 느껴요":
                        ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 5 : v + 5);
                        ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 5 : v + 5);
                        ingredientScores.compute("마그네슘", (k, v) -> (v == null) ? 3 : v + 3);
                        break;
                    case "최근 1년 중 스테로이드를 섭취한 기간이 3개월 이상이에요":
                        ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 5 : v + 5);
                        ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 4 : v + 4);
                        break;
                    case "선택할 것은 없지만 뼈·관절이 걱정돼요":
                        ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 4 : v + 4);
                        break;
                }
            }
        }
    }

    /**
     * 면역 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateImmuneScores(List<MemberResponse> responses, Map<String, Integer> ingredientScores) {
        for (MemberResponse response : responses) {
            if (response.getQuestion().getSubCategory().getName().equals("면역")) {
                switch (response.getResponseText()) {
                    case "스트레스가 매우 많아요":
                        ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 5 : v + 5);
                        ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 4 : v + 4);
                        break;
                    case "감염성 질환에 자주 걸려요":
                        ingredientScores.compute("아연", (k, v) -> (v == null) ? 5 : v + 5);
                        ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 5 : v + 5);
                        ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 4 : v + 4);
                        break;
                    case "선택할 것은 없지만 면역이 걱정돼요":
                        ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 4 : v + 4);
                        break;
                }
            }
        }
    }

    /**
     * 모발 건강 관련 영양 성분 점수를 계산합니다.
     *
     * @param responses        회원의 설문 응답 목록
     * @param ingredientScores 영양 성분 점수 Map
     */
    private void calculateHairScores(List<MemberResponse> responses, Map<String, Integer> ingredientScores) {
        for (MemberResponse response : responses) {
            if (response.getQuestion().getSubCategory().getName().equals("모발")) {
                switch (response.getResponseText()) {
                    case "머리카락에 힘이 없고 잘 빠져요":
                        ingredientScores.compute("비오틴", (k, v) -> (v == null) ? 5 : v + 5);
                        ingredientScores.compute("아연", (k, v) -> (v == null) ? 4 : v + 4);
                        break;
                    case "머리카락이 윤기 없고 갈라지고 끊어져요":
                        ingredientScores.compute("판토텐산(비타민B5)", (k, v) -> (v == null) ? 5 : v + 5);
                        ingredientScores.compute("비오틴", (k, v) -> (v == null) ? 4 : v + 4);
                        break;
                    case "새치가 많이 나요":
                        ingredientScores.compute("구리", (k, v) -> (v == null) ? 4 : v + 4);
                        ingredientScores.compute("비오틴", (k, v) -> (v == null) ? 3 : v + 3);
                        break;
                    case "선택할 것은 없지만 모발 건강이 걱정돼요":
                        ingredientScores.compute("비오틴", (k, v) -> (v == null) ? 4 : v + 4);
                        break;
                }
            }
        }
    }

    /**
     * 나이와 BMI에 따라 영양 성분 점수를 조정합니다.
     *
     * @param ingredientScores 초기 영양 성분 점수
     * @param age              회원의 나이
     * @param bmi              회원의 BMI
     */
    private void adjustScoresByAgeAndBMI(Map<String, Integer> ingredientScores, int age, double bmi) {
        // 나이에 따른 조정
        if (age > 50) {
            ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 10 : v + 10);
            ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 10 : v + 10);
        }

        // BMI에 따른 조정
        if (bmi < 18.5) {
            ingredientScores.compute("단백질", (k, v) -> (v == null) ? 10 : v + 10);
            ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 10 : v + 10);
            ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 10 : v + 10);
            ingredientScores.compute("철분", (k, v) -> (v == null) ? 10 : v + 10);
            ingredientScores.compute("비타민B군", (k, v) -> (v == null) ? 8 : v + 8);
        } else if (bmi >= 23 && bmi < 25) {
            ingredientScores.compute("식이섬유", (k, v) -> (v == null) ? 8 : v + 8);
            ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 8 : v + 8);
            ingredientScores.compute("크롬", (k, v) -> (v == null) ? 6 : v + 6);
        } else if (bmi >= 25) {
            ingredientScores.compute("식이섬유", (k, v) -> (v == null) ? 10 : v + 10);
            ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 10 : v + 10);
            ingredientScores.compute("크롬", (k, v) -> (v == null) ? 8 : v + 8);
            ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 8 : v + 8);
        }
    }

    /**
     * 건강 분석 결과를 기반으로 추천 영양 성분을 결정합니다.
     *
     * @param healthAnalysis 건강 분석 결과
     * @return 추천 영양 성분 목록
     */
    /**
     * 건강 분석 결과를 기반으로 추천 영양 성분을 결정합니다.
     *
     * @param healthAnalysis 건강 분석 결과
     * @return 추천 영양 성분 목록
     */
    public List<String> getRecommendedIngredients(HealthAnalysisDTO healthAnalysis) {
        List<String> ingredients = new ArrayList<>();

        // BMI에 따른 영양 성분 추천
        if (healthAnalysis.getBmi() < 18.5) {
            ingredients.add("단백질");
            ingredients.add("칼슘");
        } else if (healthAnalysis.getBmi() > 25) {
            ingredients.add("식이섬유");
            ingredients.add("비타민 B 복합체");
        }

        // 위험 수준에 따른 영양 성분 추천
        Map<String, String> riskLevels = healthAnalysis.getRiskLevels();
        if ("높음".equals(riskLevels.get("혈관·혈액순환"))) {
            ingredients.add("오메가-3");
            ingredients.add("코엔자임 Q10");
        }
        if ("높음".equals(riskLevels.get("소화·장"))) {
            ingredients.add("프로바이오틱스");
            ingredients.add("식이섬유");
        }
        if ("높음".equals(riskLevels.get("피부"))) {
            ingredients.add("비타민 C");
            ingredients.add("비타민 E");
        }
        if ("높음".equals(riskLevels.get("눈"))) {
            ingredients.add("루테인");
            ingredients.add("오메가-3");
        }
        if ("높음".equals(riskLevels.get("두뇌"))) {
            ingredients.add("오메가-3");
            ingredients.add("비타민 B 복합체");
        }
        if ("높음".equals(riskLevels.get("피로"))) {
            ingredients.add("비타민 B 복합체");
            ingredients.add("코엔자임 Q10");
        }
        if ("높음".equals(riskLevels.get("뼈·관절"))) {
            ingredients.add("칼슘");
            ingredients.add("비타민 D");
        }
        if ("높음".equals(riskLevels.get("면역"))) {
            ingredients.add("비타민 C");
            ingredients.add("아연");
        }
        if ("높음".equals(riskLevels.get("모발"))) {
            ingredients.add("비오틴");
            ingredients.add("아연");
        }

        return ingredients;
    }

    /**
     * 나이와 BMI에 따라 영양 성분 점수를 조정합니다.
     *
     * @param ingredientScores 초기 영양 성분 점수
     * @param age 회원의 나이
     * @param bmi 회원의 BMI
     */
    public List<String> getRecommendedIngredients(HealthAnalysisDTO healthAnalysis,
                                     Map<String, Integer> ingredientScores, int age, double bmi) {
        // 나이에 따른 조정
        if (age > 50) {
            ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 10 : v + 10);
            ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 10 : v + 10);
        }

        // BMI에 따른 조정
        if (bmi < 18.5) {
            ingredientScores.compute("단백질", (k, v) -> (v == null) ? 10 : v + 10);
            ingredientScores.compute("칼슘", (k, v) -> (v == null) ? 10 : v + 10);
            ingredientScores.compute("비타민D", (k, v) -> (v == null) ? 10 : v + 10);
            ingredientScores.compute("철분", (k, v) -> (v == null) ? 10 : v + 10);
        } else if (bmi >= 25) {
            ingredientScores.compute("식이섬유", (k, v) -> (v == null) ? 10 : v + 10);
            ingredientScores.compute("비타민C", (k, v) -> (v == null) ? 10 : v + 10);
            ingredientScores.compute("크롬", (k, v) -> (v == null) ? 8 : v + 8);
            ingredientScores.compute("오메가-3", (k, v) -> (v == null) ? 8 : v + 8);
        }
        return new ArrayList<>(ingredientScores.keySet());
    }
}
