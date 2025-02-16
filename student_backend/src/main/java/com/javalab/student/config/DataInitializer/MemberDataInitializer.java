/*
package com.javalab.student.config.DataInitializer;

import com.javalab.student.constant.Role;
import com.javalab.student.dto.MemberFormDto;
import com.javalab.student.entity.Member;
import com.javalab.student.repository.MemberRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class MemberDataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(MemberDataInitializer.class);

    @Bean
    public CommandLineRunner initializeTestMembers(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                createMemberIfNotExist(memberRepository, passwordEncoder, "test2@example.com", "일반회원", Role.USER);
                createMemberIfNotExist(memberRepository, passwordEncoder, "test@example.com", "관리자", Role.ADMIN);
                createMemberIfNotExist(memberRepository, passwordEncoder, "test1@example.com", "상담사", Role.CS_AGENT);
            } catch (Exception e) {
                logger.error("Error initializing test members", e);
            }
        };
    }

    @Transactional
    public void createMemberIfNotExist(MemberRepository memberRepository, PasswordEncoder passwordEncoder,
                                       String email, String name, Role role) {
        Member existingMember = memberRepository.findByEmail(email);
        if (existingMember != null) {
            logger.info("Member already exists: {}", email);
            return;
        }

        try {
            MemberFormDto memberFormDto = MemberFormDto.builder()
                    .email(email)
                    .name(name)
                    .address("서울시 강남구")
                    .password("1234")
                    .phone("010-1234-5678")
                    .role(role)
                    .build();

            Member member = Member.createMember(memberFormDto, passwordEncoder);
            memberRepository.save(member);
            logger.info("Test member created: {} (Role: {})", member.getEmail(), role);
        } catch (Exception e) {
            logger.error("Error creating member: {}", email, e);
        }
    }
}
*/
