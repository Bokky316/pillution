package com.javalab.student.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
//import me.shinsunyoung.springbootdeveloper.config.jwt.JwtFactory;
//import me.shinsunyoung.springbootdeveloper.config.jwt.JwtProperties;
//import me.shinsunyoung.springbootdeveloper.domain.RefreshToken;
//import me.shinsunyoung.springbootdeveloper.domain.User;
//import me.shinsunyoung.springbootdeveloper.dto.CreateAccessTokenRequest;
//import me.shinsunyoung.springbootdeveloper.repository.RefreshTokenRepository;
//import me.shinsunyoung.springbootdeveloper.repository.UserRepository;
import com.javalab.student.config.jwt.JwtFactory;
import com.javalab.student.config.jwt.JwtProperties;
import com.javalab.student.dto.CreateAccessTokenRequest;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.RefreshToken;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 토큰 API 컨트롤러 테스트
 * - 새로운 액세스 토큰을 발급하는 API 테스트
 */
@SpringBootTest
@AutoConfigureMockMvc
class TokenApiControllerTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    JwtProperties jwtProperties;

    @Autowired
    MemberRepository memberRepository;

    @Autowired
    RefreshTokenRepository refreshTokenRepository;

    @BeforeEach
    public void mockMvcSetUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .build();
        memberRepository.deleteAll();
    }

    @DisplayName("createNewAccessToken: 새로운 액세스 토큰을 발급한다.")
    @Test
    public void createNewAccessToken() throws Exception {
        // given
        // 테스트 멤버를 생성하고
        // 이 멤버를 기반으로 리프레시 토큰을 생성해서 데이터베이스 저장
        // 토큰 생성 API의 요청 본문에 리프레시 토큰을 포함하여 요청 객체를 생성한다.
        final String url = "/api/token";
        // 테스트용 유저 생성, 이 사용자를 기반으로 리프레시 토큰을 생성
        Member testUser = memberRepository.save(Member.builder()
                .email("test@test.com")
                .password("1234")
                .build());
        // 위에서 만든 테스트 사용자의 id를 기반으로 리프레시 토큰 생성
        String refreshToekn = JwtFactory.builder()
                .claims(Map.of("id", testUser.getId())) // 토큰에 담을 클레임 정보 설정
                .build()    // JwtFactory 객체 생성
                .createToken(jwtProperties);    // jwtProperties를 사용하여 토큰 생성

        // 리프레시 토큰 저장
        // 테스트 사용자의 id와 위에서 만든 리프레시 토큰을 만들어서 저장
        refreshTokenRepository.save(new RefreshToken(testUser.getId(), refreshToekn));

        // 리프레시 토큰을 요청 바디에 담아서 요청
        CreateAccessTokenRequest request = new CreateAccessTokenRequest();  // CreateAccessTokenRequest 객체 생성
        request.setRefreshToken(refreshToekn);  // 액세스 토큰에 담을 리프레시 토큰 설정
        final String requestBody = objectMapper.writeValueAsString(request); // 요청 바디를 JSON 문자열로 변환

        // when, 토큰 추가 API에 요청, given절에 미리 만들어놓은 리프레시 토큰을 요청 바디에 담아서 요청
        ResultActions resultActions = mockMvc.perform(post(url) // POST 요청
                .contentType(MediaType.APPLICATION_JSON_VALUE)  // 요청 바디 타입 설정
                .content(requestBody)); // 요청 바디 설정

        // then, 응답코드가 201(CREATED)이고, 응답 바디에 액세스 토큰이 포함되어 있는지 확인
        // jsonPath("$.accessToken").isNotEmpty() : 응답 바디에 accessToken이 포함되어 있는지 확인
        resultActions
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

}
