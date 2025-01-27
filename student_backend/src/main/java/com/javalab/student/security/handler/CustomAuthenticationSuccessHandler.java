package com.javalab.student.security.handler;

import com.javalab.student.config.jwt.TokenProvider;
import com.javalab.student.security.dto.MemberSecurityDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;

/**
 * 사용자 정의 : 로그인 성공 후처리 담당 클래스
 * 사용자 정의 인증 성공 핸들러 클래스
 * - 클라이언트에게 로그인 성공 여부를 JSON 형식으로 전달
 * - 프론트엔드 애플리케이션(예: React)에서 쉽게 처리할 수 있는 형식으로 전달
 * - "message"와 "status" 필드를 통해 로그인 결과를 명확하게 전달합니다. 이는 클라이언트 측에서 로그인 성공을 확실히 인지하고 적절한 조치를 취할 수 있도록 돕습니다.
 * - 기본 리다이렉션 대신 JSON 응답을 보냄으로써, 클라이언트 측에서 로그인 성공 후의 동작을 더 유연하게 제어할 수 있습니다.
 * - 전통적인 세션 기반 인증 대신 토큰 기반 인증(예: JWT)을 사용할 때 유용
 */
@RequiredArgsConstructor
@Component
@Slf4j
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final TokenProvider tokenProvider;

    /**
     * 로그인 성공 후처리 메서드
     * - 로그인 성공 시 호출되는 메서드
     * @param request : 요청 객체로 사용자가 입력한 아이디나 비밀번호
     * @param response
     * @param authentication : 인증 객체(로그인 성공 시 사용자 정보)
     * @throws IOException
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {

        log.info("여기는 CustomAuthenticationSuccessHandler onAuthenticationSuccess request.getParameter(username) : " + request.getParameter("username"));

        // 1. 사용자 정보를 Authentication 객체에서 추출
        MemberSecurityDto userDetails = (MemberSecurityDto) authentication.getPrincipal();

        // 2. 사용자 권한 목록을 문자열로 변환
        String authorities = userDetails.getAuthorities().toString(); // 권한 목록을 문자열로 변환

        // 3. JWT 토큰 생성
        String token = tokenProvider.generateToken(
                userDetails.getEmail(),
                userDetails.getAuthorities(),
                userDetails.getRealName(), // 리액트에서 사용자 이름을 표시하기 위해 추가
                Duration.ofHours(1) // 만료 시간을 1시간으로 설정
        );

        log.info("여기는 CustomAuthenticationSuccessHandler onAuthenticationSuccess token : " + token);

        // 4. JSON 응답 생성(위에서 만든 토큰과 권한 포함), 응답을 받을 주체는 클라이언트 애플리케이션의 로그인 컴포넌트
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(String.format(
                "{\"message\":\"로그인 성공\",\"status\":\"success\",\"email\":\"%s\",\"name\":\"%s\",\"authorities\":\"%s\",\"token\":\"%s\"}",
                userDetails.getEmail(),
                userDetails.getRealName(),
                authorities,
                token
        ));

        // 반환되는 JSON 결과 예시
    /*
    {
        "message": "로그인 성공",
        "status": "success",
        "email": "사용자 이메일",
        "name": "사용자 이름",
        "authorities": "[ROLE_USER, ROLE_ADMIN]",
        "token": "JWT 토큰 값"
    }
    */

    }

}
