package com.javalab.student.controller;

import com.javalab.student.entity.VerificationCode;
import com.javalab.student.repository.VerificationCodeRepository;
import com.javalab.student.service.EmailService;

import com.javalab.student.service.EmailVerificationService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;
    private final VerificationCodeRepository verificationCodeRepository;
    // ✅ 이메일 인증 상태를 저장할 캐시 추가
    private final EmailVerificationService emailVerificationService;

    /**
     * 이메일 인증 코드 요청 API
     * 기존 인증 코드가 있으면 (UPDATE OR DELETE 후 INSERT 하는 방식)
     */
//    @PostMapping("/send")
//    public ResponseEntity<Map<String, String>> sendVerificationCode(@RequestBody Map<String, String> request) {
//        String email = request.get("email");
//
//        if (email == null || email.isEmpty()) {
//            return ResponseEntity.badRequest().body(Map.of("error", "이메일이 제공되지 않았습니다."));
//        }
//
//        try {
//            String code = emailService.generateVerificationCode();
//
//            // 1. 기존에 같은 이메일이 있는지 확인
//            Optional<VerificationCode> existingCode = verificationCodeRepository.findByEmail(email);
//
//            if (existingCode.isPresent()) {
//                // 기존 코드 삭제 후 새로운 코드 삽입
//                verificationCodeRepository.delete(existingCode.get());
//            }
//
//            // 2. 새로운 코드 저장
//            VerificationCode verificationCode = new VerificationCode();
//            verificationCode.setEmail(email);
//            verificationCode.setCode(code);
//            verificationCode.setExpirationTime(LocalDateTime.now().plusMinutes(5));
//            verificationCodeRepository.save(verificationCode);
//
//            // 3. 이메일 발송
//            emailService.sendVerificationCode(email, code);
//
//            return ResponseEntity.ok(Map.of("message", "인증 코드가 이메일로 전송되었습니다."));
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body(Map.of("error", "서버 오류 발생", "details", e.getMessage()));
//        }
//    }

    /**
     * 이메일 인증 코드 요청 API
     * 기존 인증 코드가 있으면 (DELETE 하지 않고 UPDATE 하는 방식) : DB 부하가 줄어들음
     * @param request
     * @return
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendVerificationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "이메일이 제공되지 않았습니다."));
        }

        try {
            String code = emailService.generateVerificationCode();

            // 기존 코드가 있으면 업데이트, 없으면 새로 저장
            VerificationCode verificationCode = verificationCodeRepository.findByEmail(email)
                    .orElse(new VerificationCode());

            verificationCode.setEmail(email);
            verificationCode.setCode(code);
            verificationCode.setExpirationTime(LocalDateTime.now().plusMinutes(5));
            verificationCodeRepository.save(verificationCode);

            emailService.sendVerificationCode(email, code);

            return ResponseEntity.ok(Map.of("message", "인증 코드가 이메일로 전송되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "서버 오류 발생", "details", e.getMessage()));
        }
    }



    /**
     * 인증 코드 확인 API
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyCode(@RequestBody Map<String, String> requestBody) {
        String email = requestBody.get("email");
        String code = requestBody.get("code");

        Optional<VerificationCode> verificationCode = verificationCodeRepository.findByEmail(email);

        if (verificationCode.isPresent()
                // 인증코드가 일치하는지 여부
                && verificationCode.get().getCode().equals(code)
                // 인증만료시간 체크 (생성 후 5분이내)
                && verificationCode.get().getExpirationTime().isAfter(LocalDateTime.now())
                // 인증코드 중복인증을 방지 하기위해 아직 인증되지 않은 경우에만 인증성공처리조건 추가 ... 어차피 인증 후 코드 삭제되어 의미없음 구현하려면 다른방법으로 구현
            /*&&!emailVerificationService.isVerified(email)*/) {
            // 이메일 인증 성공 시, 인증 여부를 캐시에 저장
            emailVerificationService.setVerified(email);

            // 인증 완료 후 기존 인증 코드 삭제 (유지할 경우, 만료 시간 확인 후 삭제)
            verificationCodeRepository.delete(verificationCode.get());

            Map<String, String> response = new HashMap<>();
            response.put("message", "이메일 인증 성공");
            return ResponseEntity.ok(response);
        } else {
            // 인증코드가 틀렸을 경우 삭제됨 다시 받아야 함
            //verificationCodeRepository.delete(verificationCode.get());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "인증 코드가 올바르지 않거나 만료되었습니다."));
        }
    }
}
