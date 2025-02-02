package com.javalab.student.config;


import com.javalab.student.config.jwt.TokenProvider;
import com.javalab.student.security.CustomUserDetailsService;
import com.javalab.student.security.handler.CustomAuthenticationSuccessHandler;
import com.javalab.student.security.oauth.CustomOAuth2UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security 설정 파일
 * - 인증, 권한 설정
 * @Configuration :
 * - 이 클래스가 Spring의 설정 파일임을 명시, 여기에는 하나 이상의 @Bean이 있음.
 * - Spring 컨테이너가 이 클래스를 읽어들여 Bean으로 등록
 * @EnableWebSecurity :
 * - Spring Security 설정을 활성화하며 내부적으로 시큐리티 필터 체인을 생성,
 *   이를 통해서 애플리케이션이 요청을 처리할 때 필터 체인을 거쳐 (인증) 및 (인가)를 수행하게 된다.
 * - 시큐리티 필터 체인은 여러 개의 필터로 구성되면 디스패처 서블릿 앞에 위치하게 된다.
 * - CSRF, 세션 관리, 로그인, 로그아웃, 권한, XSS방지 등을 처리하는 기능들이 활성화 된다.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService; // 사용자 정보를 가져오는 역할
    private final CustomOAuth2UserService customOAuth2UserService;  // 소셜 로그인
    private final CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler; // 로그인 성공 핸들러
    private final TokenAuthenticationFilter tokenAuthenticationFilter; // 토큰을 검증하고 인증 객체를 SecurityContext에 저장하는 역할
    private final TokenProvider tokenProvider;  // 토큰 생성 및 검증


    /**
     * Spring Security 필터 체인 구성을 정의하는 빈입니다.
     * 이 설정은 애플리케이션의 보안 정책을 정의합니다.
     *
     * @param http HttpSecurity 객체, 보안 설정을 구성하는 데 사용됩니다.
     * @return 구성된 SecurityFilterChain 객체
     * @throws Exception 보안 구성 중 발생할 수 있는 예외
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // 폼 로그인 설정
        http.formLogin(form -> form
                .loginPage("/api/auth/login")  // 커스텀 로그인 페이지 URL
                .loginProcessingUrl("/api/auth/login")  // 로그인 처리 URL
                .successHandler(customAuthenticationSuccessHandler)  // 로그인 성공 핸들러
                .failureHandler((request, response, exception) -> {  // 로그인 실패 핸들러
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"login failure!\"}");
                })
                .permitAll()  // 로그인 관련 URL은 모든 사용자에게 접근 허용
        );

        /*
            * [수정] 로그아웃 설정
            * logout() : 스프링의 기본 로그아웃 관련 설정
            * - /logout 을 기본 로그아웃 요청을 처리하는 URL로 하겠다.
            * - 로그아웃 성공 시 / 경로로 리디렉트
         */
        http.logout(logout -> logout
                .logoutUrl("/api/auth/logout")  // 로그아웃 URL
                .logoutSuccessHandler((request, response, authentication) -> {  // 로그아웃 성공 핸들러
                    response.setStatus(HttpServletResponse.SC_OK);
                })
                .permitAll()  // 로그아웃 URL은 모든 사용자에게 접근 허용
        );

        /*
            * 정적 자원 및 URL에 대한 접근 제어 설정(인가) 로드맵
            * authorizeRequests() : 애플리케이션의 접근 제어(Authorization) 정책을 정의
            * requestMatchers() : 요청에 대한 보안 검사를 설정
            * permitAll() : 모든 사용자에게 접근을 허용
            * hasRole() : 특정 권한을 가진 사용자만 접근을 허용
            * anyRequest() : 모든 요청에 대해 접근을 허용
            * authenticated() : 인증된 사용자만 접근을 허용
            * favicon.ico : 파비콘 요청은 인증 없이 접근 가능, 이코드 누락시키면 계속 서버에 요청을 보내서 서버에 부하를 줄 수 있다.
         */
        // URL 별 접근 권한 설정
        http.authorizeHttpRequests(request -> request
                .requestMatchers("/", "/api/auth/login", "/api/auth/logout").permitAll()  // 홈, 로그인, 로그아웃 URL 접근 허용
                .requestMatchers("/api/auth/userInfo", "/api/auth/login/error").permitAll()  // 사용자 정보, 로그인 에러 URL 접근 허용
                .requestMatchers("/api/members/register").permitAll() // 회원가입 요청 허용
                .requestMatchers("/api/members/checkEmail").permitAll() // 이메일 중복 체크 요청 허용
                .requestMatchers("/api/email/send", "/api/email/verify").permitAll() // 이메일 인증 관련 API 허용
                .requestMatchers("/api/students/**").permitAll()  // 학생 관련 API 접근 허용
                .requestMatchers("/api/students/add").hasRole("ADMIN")  // 학생 추가는 관리자만 가능
                .requestMatchers("/images/**", "/static-images/**", "/css/**", "/favicon.ico", "/error", "/img/**").permitAll()  // 정적 리소스 접근 허용
                .requestMatchers("/admin/**").hasRole("ADMIN")  // 관리자 페이지는 관리자만 접근 가능
                .requestMatchers("/api/survey/**").permitAll()  // 설문 관련 API 접근 허용
                // 게시판 관련 권한 설정
                .requestMatchers("/api/posts/**", "/api/faq/**").permitAll()    // 게시물 조회: 모든 사용자 허용
                .requestMatchers("/api/posts/create").hasRole("ADMIN")  // 게시물 작성: 관리자만 허용
                .requestMatchers("/api/posts/*/update").hasRole("ADMIN")  // 게시물 수정: 관리자만 허용
                .requestMatchers("/api/posts/*/delete").hasRole("ADMIN")  // 게시물 삭제

                .anyRequest().authenticated()  // 그 외 모든 요청은 인증 필요
        );


        // 원본
        // UsernamePasswordAuthenticationFilter 앞에 TokenAuthenticationFilter를 추가
        // 사용자가 입력한 username과 password를 이용하여 UsernamePasswordAuthenticationFilter가 인증을 시도하기 전에
        // TokenAuthenticationFilter를 통해 토큰을 검증하도록 설정
        //http.addFilterBefore(tokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // UsernamePasswordAuthenticationFilter 이후에 TokenAuthenticationFilter 추가
        // 토큰 인증 필터 추가
        http.addFilterAfter(new TokenAuthenticationFilter(tokenProvider), UsernamePasswordAuthenticationFilter.class);

        // 인증 실패 시 처리할 핸들러를 설정
        // 권한이 없는 페이지에 접근 시 처리할 핸들러를 설정
        //http.addFilterBefore(new TokenAuthenticationFilter(tokenProvider), UsernamePasswordAuthenticationFilter.class);
        // 예외 처리 설정
        http.exceptionHandling(exception -> exception
                .authenticationEntryPoint(new CustomAuthenticationEntryPoint())
        );

        // http.csrf(csrf -> csrf.disable()); // CSRF 보안 설정을 비활성화
        // 시큐리티를 통해서 최초로 테스트 할 때는 이 코드를 사용하고
        // 회원가입 폼이 정상적으로 오픈된 후에는 이 코드를 주석처리해야 한다.
        // 그렇지 않으면 memberForm.html에서 csrf 토큰을 받지 못해 403 에러가 발생한다.
        http.csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults()
       ); // CORS 설정 적용); // CSRF 보안 설정을 비활성화

        /*
         * 소셜 로그인 설정
         *  - oauth2Login() 메소드 : 소셜(OAuth2) 로그인을 활성화하는 설정의 시작점.
         *  - 이 메서드를 호출함으로써, 애플리케이션은 OAuth2 공급자(Google, Kakao 등)를
         *    통해 사용자 인증을 수행할 수 있게 된다.
         *  - loginPage() : 사용자가 인증되지 않은 상태에서 보호된 리소스에 접근시 여기로 리디렉트
         *    loginPage()를 설정하지 않으면 스프링 시큐리티는 기본 로그인 페이지(/login)를 사용.
         *  - userInfoEndpoint() : OAuth2 공급자로부터 사용자 정보를 가져오는 엔드포인트를 구성
         *  - userService() : 사용자 정보를 가져오는 서비스를 구현한 객체를 지정
         * - customOAuth2UserService : OAuth2 공급자로부터 사용자 정보를 가져오는 엔드포인트를 구성하는 실제 서비스 클래스
         */
        http.oauth2Login(oauth2 -> oauth2
                .loginPage("/members/login")
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
        );

        // 지금까지 설정한 내용을 빌드하여 반환, 반환 객체는 SecurityFilterChain 객체
        return http.build();
    }



//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
//        return authenticationConfiguration.getAuthenticationManager();
//    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .userDetailsService(customUserDetailsService)
                .passwordEncoder(passwordEncoder())
                .and()
                .build();
    }


    /**
     * 비밀번호 암호화를 위한 PasswordEncoder 빈 등록
     * - BCryptPasswordEncoder : BCrypt 해시 함수를 사용하여 비밀번호를 암호화
     * @return
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

//    @Bean
//    public TokenAuthenticationFilter tokenAuthenticationFilter() {
//        return new TokenAuthenticationFilter(tokenProvider);
//    }



}

