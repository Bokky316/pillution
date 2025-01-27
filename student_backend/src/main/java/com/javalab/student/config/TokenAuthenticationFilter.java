package com.javalab.student.config;

import com.javalab.student.config.jwt.TokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * 토큰 인증 필터
 * - Spring Security의 요청 필터로 동작한다.
 * - 토큰을 검증하고 인증 객체를 SecurityContext에 저장하는 역할을 한다.
 * - 요청마다 JWT 토큰을 검증하고 인증 컨텍스트에 사용자 정보를 설정하는 역할
 * - OncePerRequestFilter : 요청 마다 한번씩 실행되는 필터로 설정한다.
 * 1. JWT 토큰 추출: 요청 헤더에서 Authorization 값을 읽고, Bearer 접두사를 제거하여 액세스 토큰을 추출합니다.
 * 2. 토큰 유효성 검사: TokenProvider의 validToken 메서드를 호출하여 토큰의 유효성을 검사합니다.
 * 3. 인증 객체 생성: 유효한 토큰이라면 TokenProvider의 getAuthentication 메서드를 호출하여 Authentication 객체를 생성합니다.
 * 4. Spring Security 인증 컨텍스트에 설정: SecurityContextHolder를 사용하여 생성한 Authentication 객체를 현재 요청의 인증 컨텍스트에 설정합니다.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TokenAuthenticationFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;
    // 헤더에 담긴 토큰을 추출하기 위한 상수
    private final static String HEADER_AUTHORIZATION = "Authorization"; // 토큰 생성 후에 헤더에 담아서 보낼 때 사용하는 키
    // 토큰 앞에 붙는 접두사
    private final static String TOKEN_PREFIX = "Bearer ";

    /**
     * JWT 인증 필터 로직이 들어가는 메서드
     * - 로그인 전이면 필터를 건너뛰고, 토큰이 없으면 필터를 건너뛴다.
     * -
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        log.info("TokenAuthenticationFilter.doFilterInternal() 메서드 실행");

        // 로그인 요청이나 토큰 없는 요청은 건너뛰기
        if (request.getRequestURI().equals("/api/auth/login") || request.getHeader(HEADER_AUTHORIZATION) == null) {
            filterChain.doFilter(request, response);    // 다음 필터로 요청 전달
            return; // 메서드 종료
        }

        // 요청 헤더에서 Authorization 키값으로 전달되오는 값을 추출
        String authorizationHeader = request.getHeader(HEADER_AUTHORIZATION);

        // 헤더에서 토큰 추출(Bearer 토큰 추출)
        String token = extractToken(authorizationHeader);

        // 헤더와 토큰 로그 출력
        log.info("여기는 TokenAuthenticationFilter 요청에서 추출한 header: {}", authorizationHeader);
        log.info("여기는 TokenAuthenticationFilter header에서 추출한 token: {}", token);

        // 토큰 검증 및 인증 객체 설정
        if (token != null && tokenProvider.validToken(token)) { // 토큰이 존재하고 유효하면
            // 토큰에서 인증 객체 추출
            Authentication auth = tokenProvider.getAuthentication(token); // UsernamePasswordAuthenticationToken 객체 반환

            log.info("TokenAuthenticationFilter 인증 객체: {}", auth);
            // 인증 객체를 SecurityContext에 설정
            // 일반적인 시큐리티 로그인을 하게 되면 인증 객체를 SecurityContext에 저장하게 된다.
            // 비록 JWT를 사용해서 인증을 하지만, SecurityContext에 인증 객체를 저장해야만 인증이 완료된 것으로 간주한다.
            // 이렇게 저장한 시큐리티 컨텍스트가 사용자가 접근할 때마다 이용되지는 않는다.
            SecurityContextHolder.getContext().setAuthentication(auth); // 인증 객체 설정, SecurityContext에 인증 객체 저장
        }

        // 다음 필터로 요청 전달, 더이상 필터가 없으면 요청을 처리한다.(컨트롤러로 이동)
        filterChain.doFilter(request, response);
    }

    /**
     * Authorization 헤더에서 토큰 추출
     */
    private String extractToken(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith(TOKEN_PREFIX)) {
            return authorizationHeader.substring(TOKEN_PREFIX.length());    // Bearer 접두사 제거된 순수한 토큰 반환
        }
        return null;
    }
}

