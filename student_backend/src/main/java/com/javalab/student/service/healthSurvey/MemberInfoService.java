package com.javalab.student.service.healthSurvey;

import com.javalab.student.entity.healthSurvey.MemberResponse;
import com.javalab.student.entity.healthSurvey.MemberResponseOption;
import com.javalab.student.repository.healthSurvey.MemberResponseOptionRepository;
import com.javalab.student.repository.healthSurvey.MemberResponseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 사용자 정보 조회 및 추출 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MemberInfoService {

    private final MemberResponseRepository memberResponseRepository;
    private final MemberResponseOptionRepository memberResponseOptionRepository;

    private static final Map<Integer, String> GENDER_MAP = Map.of(
            1, "여성",
            2, "남성"
    );

    /**
     * 사용자 응답에서 이름을 추출하는 메서드
     *
     * @param memberId 사용자의 ID
     * @return 이름 (사용자가 입력한 값)
     */
    public String getName(Long memberId) {
        return memberResponseRepository.findLatestNameResponseByMemberId(memberId)
                .map(MemberResponse::getResponseText)
                .orElse("알 수 없음");
    }

    /**
     * 사용자의 성별을 조회합니다.
     *
     * @param memberId 사용자의 ID
     * @return 사용자의 성별 ("여성", "남성", "기타" 중 하나)
     */
    public String getGender(Long memberId) {
        List<MemberResponseOption> genderResponses = memberResponseOptionRepository.findLatestGenderResponseByMemberId(memberId);

        return genderResponses.stream()
                .findFirst()
                .map(MemberResponseOption::getOption)
                .map(option -> GENDER_MAP.getOrDefault(option.getId().intValue(), "기타"))
                .orElse("알 수 없음");
    }

    /**
     * 회원 응답에서 나이를 추출합니다.
     *
     * @param responses 회원 응답 목록
     * @return 회원의 나이 (나이 정보를 찾을 수 없는 경우 0 반환)
     */
    public int getAge(List<MemberResponse> responses) {
        return responses.stream()
                .filter(r -> r.getQuestion().getId() == 3L)
                .findFirst()
                .map(r -> {
                    try {
                        return Integer.parseInt(r.getResponseText());
                    } catch (NumberFormatException e) {
                        log.warn("Invalid age format: {}", r.getResponseText());
                        return 0;
                    }
                })
                .orElse(0);
    }

    /**
     * 회원 응답에서 키를 추출합니다.
     *
     * @param responses 회원 응답 목록
     * @return 회원의 키(미터 단위) (키 정보를 찾을 수 없는 경우 0.0 반환)
     */
    public double getHeight(List<MemberResponse> responses) {
        return responses.stream()
                .filter(r -> r.getQuestion().getId() == 4L)
                .findFirst()
                .map(r -> {
                    try {
                        return Double.parseDouble(r.getResponseText());
                    } catch (NumberFormatException e) {
                        log.warn("Invalid height format: {}", r.getResponseText());
                        return 0.0;
                    }
                })
                .orElse(0.0);
    }

    /**
     * 회원 응답에서 몸무게를 추출합니다.
     *
     * @param responses 회원 응답 목록
     * @return 회원의 몸무게(킬로그램 단위) (몸무게 정보를 찾을 수 없는 경우 0.0 반환)
     */
    public double getWeight(List<MemberResponse> responses) {
        return responses.stream()
                .filter(r -> r.getQuestion().getId() == 5L)
                .findFirst()
                .map(r -> {
                    try {
                        return Double.parseDouble(r.getResponseText());
                    } catch (NumberFormatException e) {
                        log.warn("Invalid weight format: {}", r.getResponseText());
                        return 0.0;
                    }
                })
                .orElse(0.0);
    }
}
