package com.javalab.student.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * 인증 실패 시 처리할 핸들러
 * - 인증 실패 시 401 Unauthorized 에러를 리턴
 * - 인증 실패 시 응답에 에러 메시지를 사용자에게 전달
 */
@Log4j2
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException)
            throws IOException, ServletException {

        log.info("CustomAuthenticationEntryPoint commence() 호출, 권한 없는 요청");

        // 현재 요청이 이미 /members/login인 경우 추가 리다이렉트를 방지
        if ("/members/login".equals(request.getRequestURI())) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("로그인이 필요합니다.");
            return;
        }

        // OAuth2 관련 요청인지 확인
        if (request.getRequestURI().startsWith("/oauth2") || request.getRequestURI().startsWith("/login/oauth2/code/")) {
            // OAuth2 요청의 경우 기본 동작을 수행 (리다이렉트 등)
            response.sendRedirect("/oauth2/authorization/kakao");
            return;
        }

        // 요청이 AJAX 요청인지 확인
        String ajaxHeader = request.getHeader("X-Requested-With");
        boolean isAjax = "XMLHttpRequest".equals(ajaxHeader);

        // JSON 응답 생성 (AJAX 요청일 경우)
        if (isAjax) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");

            Map<String, Object> errorDetails = new HashMap<>();
            errorDetails.put("status", HttpServletResponse.SC_UNAUTHORIZED);
            errorDetails.put("error", "Unauthorized");
            errorDetails.put("message", "접근 권한이 없습니다. 관리자에게 문의하세요.");
            errorDetails.put("path", request.getRequestURI());
            errorDetails.put("timestamp", System.currentTimeMillis());

            response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
        } else {
            log.info("일반 브라우저 요청: 로그인 페이지로 리다이렉트");
            // 일반 브라우저 요청인 경우 로그인 페이지로 리다이렉트
            response.sendRedirect("/members/login");
        }
    }
}
