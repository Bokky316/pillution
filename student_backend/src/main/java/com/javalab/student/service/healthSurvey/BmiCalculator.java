package com.javalab.student.service.healthSurvey;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * BMI 계산 서비스
 */
@Service
@Slf4j
public class BmiCalculator {

    /**
     * BMI를 계산합니다.
     *
     * @param height 키(m)
     * @param weight 몸무게(kg)
     * @return 계산된 BMI 값 (키 또는 몸무게가 유효하지 않은 경우 0.0 반환)
     */
    public double calculateBMI(double height, double weight) {
        log.debug("Calculating BMI - height: {}, weight: {}", height, weight);
        if (height <= 0 || weight <= 0) {
            log.warn("Invalid height or weight: height={}, weight={}", height, weight);
            return 0.0;
        }
        double bmi = weight / ((height / 100) * (height / 100));
        log.debug("Calculated BMI: {}", bmi);
        return bmi;
    }
}
