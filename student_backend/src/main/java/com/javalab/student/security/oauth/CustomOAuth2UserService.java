package com.javalab.student.security.oauth;

import com.javalab.student.entity.Member;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.security.dto.MemberSecurityDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

/**
 * 소셜 로그인을 통해서 인증을 진행하는 클래스
 * - 소셜 로그인 제공자로부터 사용자 정보를 가져옵니다.
 * - 사용자 정보를 사용하여 데이터베이스에서 회원 정보를 조회하거나, 없으면 새로운 회원을 생성합니다.
 * - 스프링 시큐리티의 인증 객체를 생성하고 반환합니다.
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;

    /**
     * 소셜 로그인 인증 진행 메소드
     *  - 일반 인증에서는 loadUserByUsername 메소드가 진행.
     * 파라미터인 OAuth2UserRequest 에 포함된 정보
     *   1. Registration ID : 여러 소셜 로그인 업체 중에서 어떤 업체를 사용할지 정보
     *   2. Client ID & Client Secret, Redirect URI 정보등
     *   3. 이 모든 정보는 application.properties 에 설정 해놓을것.
     */
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        log.info("OAuth2 Login Start: Provider = {}", userRequest.getClientRegistration().getRegistrationId());

        OAuth2User oAuth2User = super.loadUser(userRequest);

        log.info("OAuth2User loaded. Attributes: {}", oAuth2User.getAttributes());

        Map<String, Object> attributes = oAuth2User.getAttributes();
        String provider = userRequest.getClientRegistration().getRegistrationId();
        String email = extractEmail(attributes, provider);
        String name = extractName(attributes, provider);

        log.info("Extracted info: email = {}, name = {}", email, name);

        Member member = saveOrUpdateMember(email, name, provider);
        log.info("Member saved/updated: {}", member);

        return createSecurityDto(member, attributes);
    }

    /**
     * 시큐리티 객체 생성
     * - 스프링 시큐리티 인증 객체 생성
     */
    private MemberSecurityDto createSecurityDto(Member member, Map<String, Object> attributes) {
        return new MemberSecurityDto(
                member.getId(),
                member.getEmail(),
                member.getPassword() == null ? "N/A" : member.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + member.getRole().toString())),
                member.getName(),
                member.isSocial(),
                member.getProvider(),
                attributes
        );
    }

    private String extractEmail(Map<String, Object> attributes, String provider) {
        if ("kakao".equals(provider)) {
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            return (String) kakaoAccount.get("email");
        }
        // Other providers...
        return (String) attributes.get("email");
    }

    /**
     * 카카오 닉네임 추출
     */
    private String extractName(Map<String, Object> attributes, String provider) {
        if ("kakao".equals(provider)) {
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            String name = (String) profile.get("nickname");
            // 기본 사용자 이름 설정
            return (name != null && !name.isEmpty()) ? name : "기본사용자";
        }
        // Other providers can be handled here if needed
        return "Unknown User"; // 기본값
    }


    /**
     * 사용자 저장 또는 업데이트
     */
    private Member saveOrUpdateMember(String email, String name, String provider) {
        Member member = memberRepository.findByEmail(email);
        if (member == null) {   // 최초로 소셜 로그인하는 사용자
            member = Member.createSocialMember(email, provider);    // 소셜 로그인 사용자 생성
            member.setName(name);   // 이름 설정
            member = memberRepository.save(member);     // 저장
        } else {    // 이미 소셜 로그인으로 데이터베이스에 관련 정보가 있는 사용자
            // 사용자가 소셜 로그인 카카오, 구글에서 이름 또는 이메일과 같은 정보를 변경했을 수 있기 때문에 업데이트
            member.setProvider(provider);               // 소셜 로그인 제공자 업데이트
            member.setName(name);                       // 이름 업데이트
            member = memberRepository.save(member);     // 업데이트(영속화)
        }
        return member;  // 사용자 반환
    }
}
