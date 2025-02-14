package com.javalab.student.service.healthSurvey;

import com.javalab.student.entity.healthSurvey.MemberResponse;
import com.javalab.student.entity.healthSurvey.MemberResponseOption;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 건강 위험도 계산 서비스
 * 사용자의 응답을 바탕으로 각 건강 영역별 위험도를 계산합니다.
 */
@Service
public class RiskCalculationService {

    /**
     * 모든 건강 영역에 대한 위험도를 계산합니다.
     *
     * @param age 사용자의 나이
     * @param bmi 사용자의 BMI
     * @param responses 사용자의 설문 응답 목록
     * @return 각 건강 영역별 위험 수준을 포함하는 Map
     */
    public Map<String, String> calculateAllRisks(int age, double bmi, List<MemberResponseOption> responses) {
        Map<String, String> riskLevels = new HashMap<>();

        riskLevels.put("혈관·혈액순환", calculateCardiovascularRisk(age, bmi, responses));
        riskLevels.put("소화·장", calculateDigestiveRisk(responses));
        riskLevels.put("피부", calculateSkinRisk(responses));
        riskLevels.put("눈", calculateEyeRisk(age, responses));
        riskLevels.put("두뇌", calculateBrainRisk(age, responses));
        riskLevels.put("피로감", calculateFatigueRisk(responses));
        riskLevels.put("뼈·관절", calculateBoneJointRisk(age, bmi, responses));
        riskLevels.put("면역", calculateImmuneRisk(responses));
        riskLevels.put("모발", calculateHairRisk(age, responses));

        return riskLevels;
    }

    /**
     * 혈관·혈액순환 위험도를 계산합니다.
     *
     * @param age 사용자의 나이
     * @param bmi 사용자의 BMI
     * @param responses 사용자의 설문 응답 목록
     * @return 위험도 ("높음", "중간", "낮음" 중 하나)
     */
    private String calculateCardiovascularRisk(int age, double bmi, List<MemberResponseOption> responses) {
        int riskScore = 0;

        if (age > 50) riskScore += 2;
        if (bmi > 25) riskScore += 2;

        for (MemberResponseOption response : responses) {
            if (response.getOption().getQuestion().getSubCategory().getName().equals("혈관·혈액순환") && response.isSelected()) {
                switch (response.getOption().getOptionText()) {
                    case "상처가 잘 낫지 않아요":
                        riskScore += 1;
                        break;
                    case "손발 끝이 자주 저려요":
                        riskScore += 2;
                        break;
                    case "잇몸이 붓고 피가 나요":
                        riskScore += 1;
                        break;
                    case "얼굴이 자주 창백해져요":
                        riskScore += 2;
                        break;
                    case "선택할 것은 없지만 혈관·혈액순환이 걱정돼요":
                        riskScore += 1;
                        break;
                }
            }
        }

        if (riskScore >= 5) return "높음";
        if (riskScore >= 3) return "중간";
        return "낮음";
    }

    /**
     * 소화·장 건강 위험도를 계산합니다.
     *
     * @param responses 사용자의 설문 응답 목록
     * @return 위험도 ("높음", "중간", "낮음" 중 하나)
     */
    private String calculateDigestiveRisk(List<MemberResponseOption> responses) {
        int riskScore = 0;

        for (MemberResponseOption response : responses) {
            if (response.getOption().getQuestion().getSubCategory().getName().equals("소화·장") && response.isSelected()) {
                switch (response.getOption().getOptionText()) {
                    case "복통이나 속 쓰림이 자주 발생해요":
                        riskScore += 2;
                        break;
                    case "변비가 있어요":
                        riskScore += 2;
                        break;
                    case "변이 묽은 편이에요":
                        riskScore += 1;
                        break;
                    case "술을 마시면 얼굴이나 몸이 붉어지고 소화가 안 돼요":
                        riskScore += 1;
                        break;
                    case "잔뇨감이 있어요":
                        riskScore += 1;
                        break;
                    case "선택할 것은 없지만 소화력 개선이 필요해요":
                        riskScore += 1;
                        break;
                }
            }
        }

        if (riskScore >= 4) return "높음";
        if (riskScore >= 2) return "중간";
        return "낮음";
    }

    /**
     * 피부 건강 위험도를 계산합니다.
     *
     * @param responses 사용자의 설문 응답 목록
     * @return 위험도 ("높음", "중간", "낮음" 중 하나)
     */
    private String calculateSkinRisk(List<MemberResponseOption> responses) {
        int riskScore = 0;

        for (MemberResponseOption response : responses) {
            if (response.getOption().getQuestion().getSubCategory().getName().equals("피부") && response.isSelected()) {
                switch (response.getOption().getOptionText()) {
                    case "피부가 건조하고 머리에 비듬이 많이 생겨요":
                        riskScore += 2;
                        break;
                    case "여드름이 많아서 걱정이에요":
                        riskScore += 2;
                        break;
                    case "피부에 염증이 자주 생겨요":
                        riskScore += 2;
                        break;
                    case "입안이 헐고 입술이 자주 갈라져요":
                        riskScore += 1;
                        break;
                    case "선택할 것은 없지만 피부건강이 걱정돼요":
                        riskScore += 1;
                        break;
                }
            }
        }

        if (riskScore >= 4) return "높음";
        if (riskScore >= 2) return "중간";
        return "낮음";
    }

    /**
     * 눈 건강 위험도를 계산합니다.
     *
     * @param age 사용자의 나이
     * @param responses 사용자의 설문 응답 목록
     * @return 위험도 ("높음", "중간", "낮음" 중 하나)
     */
    private String calculateEyeRisk(int age, List<MemberResponseOption> responses) {
        int riskScore = 0;

        if (age > 40) riskScore += 1;
        if (age > 60) riskScore += 1;

        for (MemberResponseOption response : responses) {
            if (response.getOption().getQuestion().getSubCategory().getName().equals("눈") && response.isSelected()) {
                switch (response.getOption().getOptionText()) {
                    case "눈이 건조해 뻑뻑하고 가려워요":
                        riskScore += 2;
                        break;
                    case "눈 주변이 떨려요":
                        riskScore += 1;
                        break;
                    case "핸드폰, 모니터를 본 후 시야가 흐릿해요":
                        riskScore += 2;
                        break;
                    case "어두워지면 시력이 저하돼요":
                        riskScore += 2;
                        break;
                    case "선택할 것은 없지만 눈 건강이 걱정돼요":
                        riskScore += 1;
                        break;
                }
            }
        }

        if (riskScore >= 4) return "높음";
        if (riskScore >= 2) return "중간";
        return "낮음";
    }

    /**
     * 두뇌 건강 위험도를 계산합니다.
     *
     * @param age 사용자의 나이
     * @param responses 사용자의 설문 응답 목록
     * @return 위험도 ("높음", "중간", "낮음" 중 하나)
     */
    private String calculateBrainRisk(int age, List<MemberResponseOption> responses) {
        int riskScore = 0;

        if (age > 50) riskScore += 1;
        if (age > 70) riskScore += 1;

        for (MemberResponseOption response : responses) {
            if (response.getOption().getQuestion().getSubCategory().getName().equals("두뇌 활동") && response.isSelected()) {
                switch (response.getOption().getOptionText()) {
                    case "기억력이 떨어지는 것 같아요":
                        riskScore += 2;
                        break;
                    case "두통이 자주 생겨요":
                        riskScore += 1;
                        break;
                    case "불안이나 긴장을 자주 느껴요":
                        riskScore += 2;
                        break;
                    case "우울한 감정을 자주 느껴요":
                        riskScore += 2;
                        break;
                    case "귀에서 울리는 소리가 가끔 나요":
                        riskScore += 1;
                        break;
                    case "선택할 것은 없지만 두뇌 활동이 걱정돼요":
                        riskScore += 1;
                        break;
                }
            }
        }

        if (riskScore >= 4) return "높음";
        if (riskScore >= 2) return "중간";
        return "낮음";
    }

    /**
     * 피로감 위험도를 계산합니다.
     *
     * @param responses 사용자의 설문 응답 목록
     * @return 위험도 ("높음", "중간", "낮음" 중 하나)
     */
    private String calculateFatigueRisk(List<MemberResponseOption> responses) {
        int riskScore = 0;

        for (MemberResponseOption response : responses) {
            if (response.getOption().getQuestion().getSubCategory().getName().equals("피로감") && response.isSelected()) {
                switch (response.getOption().getOptionText()) {
                    case "무기력하고 식욕이 없어요":
                        riskScore += 2;
                        break;
                    case "자고 일어나도 피곤해요":
                        riskScore += 2;
                        break;
                    case "신경이 예민하고 잠을 잘 이루지 못해요":
                        riskScore += 2;
                        break;
                    case "소변을 보기 위해 잠을 깨요":
                        riskScore += 1;
                        break;
                    case "선택할 것은 없지만 피로감이 있어요":
                        riskScore += 1;
                        break;
                }
            }
        }

        if (riskScore >= 4) return "높음";
        if (riskScore >= 2) return "중간";
        return "낮음";
    }

    /**
     * 뼈·관절 건강 위험도를 계산합니다.
     *
     * @param age 사용자의 나이
     * @param bmi 사용자의 BMI
     * @param responses 사용자의 설문 응답 목록
     * @return 위험도 ("높음", "중간", "낮음" 중 하나)
     */
    private String calculateBoneJointRisk(int age, double bmi, List<MemberResponseOption> responses) {
        int riskScore = 0;

        if (age > 50) riskScore += 1;
        if (age > 65) riskScore += 1;
        if (bmi > 25) riskScore += 1;

        for (MemberResponseOption response : responses) {
            if (response.getOption().getQuestion().getSubCategory().getName().equals("뼈·관절") && response.isSelected()) {
                switch (response.getOption().getOptionText()) {
                    case "뼈가 부러진 경험이 있어요":
                        riskScore += 2;
                        break;
                    case "뼈가 약하다고 느껴요":
                        riskScore += 2;
                        break;
                    case "최근 1년 중 스테로이드를 섭취한 기간이 3개월 이상이에요":
                        riskScore += 2;
                        break;
                    case "선택할 것은 없지만 뼈·관절이 걱정돼요":
                        riskScore += 1;
                        break;
                }
            }
        }

        if (riskScore >= 4) return "높음";
        if (riskScore >= 2) return "중간";
        return "낮음";
    }

    /**
     * 면역 건강 위험도를 계산합니다.
     *
     * @param responses 사용자의 설문 응답 목록
     * @return 위험도 ("높음", "중간", "낮음" 중 하나)
     */
    private String calculateImmuneRisk(List<MemberResponseOption> responses) {
        int riskScore = 0;

        for (MemberResponseOption response : responses) {
            if (response.getOption().getQuestion().getSubCategory().getName().equals("면역") && response.isSelected()) {
                switch (response.getOption().getOptionText()) {
                    case "스트레스가 매우 많아요":
                        riskScore += 2;
                        break;
                    case "감염성 질환에 자주 걸려요":
                        riskScore += 2;
                        break;
                    case "선택할 것은 없지만 면역이 걱정돼요":
                        riskScore += 1;
                        break;
                }
            }
        }

        if (riskScore >= 3) return "높음";
        if (riskScore >= 2) return "중간";
        return "낮음";
    }


    /**
     * 모발 건강 위험도를 계산합니다.
     *
     * @param age 사용자의 나이
     * @param responses 사용자의 설문 응답 목록
     * @return 위험도 ("높음", "중간", "낮음" 중 하나)
     */
    private String calculateHairRisk(int age, List<MemberResponseOption> responses) {
        int riskScore = 0;

        // 나이에 따른 기본 위험도 계산
        if (age > 40) riskScore += 1;

        for (MemberResponseOption response : responses) {
            if (response.getOption().getQuestion().getSubCategory().getName().equals("모발") && response.isSelected()) {
                switch (response.getOption().getOptionText()) {
                    case "머리카락에 힘이 없고 잘 빠져요":
                        riskScore += 2;
                        break;
                    case "머리카락이 윤기 없고 갈라지고 끊어져요":
                        riskScore += 2;
                        break;
                    case "새치가 많이 나요":
                        riskScore += 1;
                        break;
                    case "선택할 것은 없지만 모발 건강이 걱정돼요":
                        riskScore += 1;
                        break;
                }
            }
        }

        if (riskScore >= 3) return "높음";
        if (riskScore >= 2) return "중간";
        return "낮음";
    }
}




