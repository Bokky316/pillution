package com.javalab.student.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * 6자리 인증 코드 생성
     */
    public String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 100000 ~ 999999
        return String.valueOf(code);
    }

    /**
     * 이메일로 인증 코드 전송
     */
    public void sendVerificationCode(String email, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(email);
            helper.setSubject("회원가입 이메일 인증 코드");
            helper.setText("회원가입을 위한 인증 코드: " + code);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("이메일 전송 실패: " + e.getMessage()); // 로그 출력
            throw new RuntimeException("이메일 전송 중 오류 발생: " + e.getMessage());
        }
    }
}
