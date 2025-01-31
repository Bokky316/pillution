package com.javalab.student.controller;

import com.javalab.student.dto.LoginFormDto;
import com.javalab.student.dto.MemberFormDto;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.VerificationCode;
import com.javalab.student.repository.VerificationCodeRepository;
import com.javalab.student.service.EmailVerificationService;
import com.javalab.student.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 회원 관련 기능을 처리하는 컨트롤러 클래스
 * - 회원가입, 이메일 중복 체크, 로그인 기능을 제공한다.
 * - 이메일 인증이 완료된 사용자만 회원가입이 가능하도록 구현되어 있다.
 */
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService; // 회원 관련 비즈니스 로직을 담당하는 서비스
    private final VerificationCodeRepository verificationCodeRepository; // 이메일 인증 확인을 위한 리포지토리 추가
    private final EmailVerificationService emailVerificationService; // 이메일 인증을 관리하는 클래스

    /**
     * 회원가입 처리
     * - 사용자가 입력한 이메일이 인증되었는지 확인 후, 회원가입을 진행한다.
     * - 회원가입이 성공하면 인증 정보를 삭제하여 재사용을 방지한다.
     * @param memberFormDto - 클라이언트에서 전송한 회원가입 데이터
     * @return 회원가입 성공 또는 실패 메시지
     */
    @PostMapping("/register")
    public ResponseEntity<String> registerMember(@Valid @RequestBody MemberFormDto memberFormDto) {
        //  이메일 인증 여부 확인 (인증되지 않은 경우 회원가입 불가)
        if (!emailVerificationService.isVerified(memberFormDto.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("이메일 인증이 필요합니다.");
        }

        try {
            // 회원가입 진행
            memberService.registerMember(memberFormDto);

            //  회원가입 완료 후 인증 정보 삭제 (재사용 방지)
            emailVerificationService.removeVerified(memberFormDto.getEmail());

            return ResponseEntity.ok("회원가입이 완료되었습니다.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * 이메일 중복 체크
     * - 사용자가 입력한 이메일이 이미 가입된 이메일인지 확인한다.
     * - 중복일 경우 "이미 존재하는 이메일입니다." 메시지를 반환한다.
     * - 사용 가능한 경우 "사용 가능한 이메일입니다." 메시지를 반환한다.
     * @param email - 클라이언트에서 입력받은 이메일
     * @return 이메일 사용 가능 여부 메시지 및 상태
     */
    @GetMapping("/checkEmail")
    public ResponseEntity<Map<String, String>> checkEmail(@RequestParam("email") String email) {
        Map<String, String> response = new HashMap<>();
        if (memberService.isEmailDuplicate(email)) {
            response.put("message", "이미 존재하는 이메일입니다.");
            response.put("status", "duplicate");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        response.put("message", "사용 가능한 이메일입니다.");
        response.put("status", "available");
        return ResponseEntity.ok(response);
    }

    /**
     * 로그인 처리 (현재 미사용 - 일반 Spring Security 로그인 사용)
     * - 사용자가 입력한 이메일과 비밀번호를 확인하여 로그인 성공 여부를 반환한다.
     * - 로그인 성공 시 "로그인 성공" 메시지 반환.
     * - 로그인 실패 시 "로그인 실패" 메시지 반환.
     * @param loginForm - 클라이언트에서 전송한 로그인 데이터
     * @return 로그인 성공 또는 실패 메시지
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginMember(@RequestBody LoginFormDto loginForm) {
        Map<String, String> response = new HashMap<>();

        // 로그인 성공 여부 확인
        boolean isLoginSuccessful = memberService.login(loginForm);

        if (isLoginSuccessful) {
            response.put("message", "로그인 성공");
            response.put("status", "success");
            return ResponseEntity.ok(response); // HTTP 200 OK
        }

        // 로그인 실패 처리
        response.put("message", "로그인 실패");
        response.put("status", "failed");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response); // HTTP 401 Unauthorized
    }


}
