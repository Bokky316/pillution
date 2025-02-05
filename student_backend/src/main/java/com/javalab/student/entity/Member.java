package com.javalab.student.entity;

import com.javalab.student.constant.Role;
import com.javalab.student.dto.MemberFormDto;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.time.LocalDate;

/**
 * 회원 엔티티
 * - 회원 정보를 저장하는 엔티티 클래스
 * - 회원 정보를 저장하는 테이블과 매핑된다.
 * - 주로 서비스 레이어와 리포지토리 레이어에서 사용된다.
 * - 화면에서 데이터를 전달받는 용도로는 사용하지 않는게 관례이다.
 */
@Entity
@Table(name = "member")
@Getter @Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Member extends BaseEntity{

    @Id
    @Column(name = "member_id")
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;

    // 이메일은 중복될 수 없다. unique = true
    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String phone;

    private String address;

    // 생년월일 (DB: birth_date DATE)
    private LocalDate birthDate;

    // 성별 (DB: gender VARCHAR(10))
    private String gender;

    // 계정 활성화 여부 (DB: activate BOOLEAN DEFAULT TRUE true: 활성, false: 탈퇴)
    @Column(nullable = false)
    private boolean activate = true;

    // 사용자 포인트 (DB: points INT DEFAULT 0)
    private int points = 0;

    // 회원의 권한을 나타내는 열거형 상수, 한 사용자가 다수의 권한을 가질 수 있다.
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false) // 기본값 설정을 위해 nullable=false
    private boolean social; // 소셜 로그인 여부, 이값을 사용하는 쪽에서는 e.g member.isSocial()로 사용

    private String provider; // 소셜 로그인 제공자 이름 (예: kakao)

    // 탈퇴 날짜 (회원 비활성화 시 저장)
    private LocalDateTime deletedAt;

    // 마지막 로그인 날짜 (로그인 성공 시 업데이트)
    private LocalDateTime lastLoginAt;



    @Builder
    public Member(String email, String password, String auth) {
        this.email = email;
        this.password = password;
        this.role = Role.valueOf(auth); // 문자열로 받은 auth 값을 Role로 변환 추후 시스템에 관리자를 추가해야하는 기능구현이 추가로 있을 경우 대비
    }

    /*
        * 회원 엔티티 생성 정적 메서드
        * - MemberFormDto의 값들이 -> Member 엔티티로 이동
        * - 회원가입 폼 DTO를 전달받아 회원 엔티티를 생성하는 역할을 한다.
        * - Member 객체 생성 로직을 엔티티 내부에 숨기고, 외부에서는 이 메서드를 통해 객체를 생성하도록 한다.
        * - 이 메소드를 만들어 두면 외부에서 이 엔티티 객체를 생성하고 값을 할당하는 코드를 중복으로 작성할 필요가 없다.
        * - 정적 메소드이기 때문에 외부에 객체 생성없이 바로 호출이 가능하다는 장점이 있다.
        * - Member 엔티티의 속성이 변화된다고 할지라도 여기서만 바꿔주면 된다.
        * - passwordEncoder.encode : 비밀번호 암호화 함수
        * - 사용자가 입력한 암호는 "평문"이다. 즉 암호화가 안된 문자열이다.
     */
    public static Member createMember(MemberFormDto memberFormDto, PasswordEncoder passwordEncoder) {
        Member member = new Member();
        member.setName(memberFormDto.getName());
        member.setEmail(memberFormDto.getEmail());
        String password = passwordEncoder.encode(memberFormDto.getPassword()); // 비밀번호 암호화
        member.setPassword(password);
        member.setAddress(memberFormDto.getAddress());
        member.setPhone(memberFormDto.getPhone());
        member.setSocial(false); // 일반 회원가입이므로 소셜 로그인 여부는 false
        member.setRole(memberFormDto.getRole());  // 회원가입 시 사용자의 권한 : USER [수정]
        member.setActivate(true); // 기본값: 활성 상태
        member.setBirthDate(memberFormDto.getBirthDate()); // 생년월일 추가
        member.setGender(memberFormDto.getGender()); // 성별 추가
        return member;
    }

    public static Member createSocialMember(String email, String provider) {
        Member member = new Member();
        member.setEmail(email);
        member.setSocial(true); // 소셜 로그인 회원가입이므로 소셜 로그인 여부는 true
        member.setProvider(provider);
        member.setRole(Role.USER); // 소셜 사용자는 기본적으로 USER 권한
        return member;
    }

    // 권한 정보 반환 메서드
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + this.role.name()));
    }

    /*
     * 회원 탈퇴 처리 (active 변경 + deletedAt 저장)
     */
    public void deactivateMember() {
        this.activate = false; // 비활성화
        this.deletedAt = LocalDateTime.now(); // 탈퇴 날짜 저장
    }

    /*
     * 로그인 성공 시 마지막 로그인 날짜 업데이트
     */
    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
        System.out.println("🔹 [Member] 마지막 로그인 시간 업데이트: " + this.lastLoginAt);
    }

}

