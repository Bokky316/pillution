package com.javalab.student.service;

import com.javalab.student.dto.LoginFormDto;
import com.javalab.student.dto.MemberFormDto;
import com.javalab.student.dto.MemberUpdateDto;
import com.javalab.student.entity.Member;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.dto.PageRequestDTO;
import com.javalab.student.dto.PageResponseDTO;
import com.javalab.student.util.PageRequestDTOUtil;
import org.springframework.data.domain.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 회원가입 처리
     * @param memberFormDto - 클라이언트에서 전달받은 회원가입 데이터
     */
    @Transactional
    public void registerMember(MemberFormDto memberFormDto) {
        // 이메일 중복 체크
        if (memberRepository.findByEmail(memberFormDto.getEmail()) != null) {
            throw new IllegalStateException("이미 존재하는 이메일입니다.");
        }

        // MemberFormDto를 Member 엔티티로 변환
        Member member = Member.createMember(memberFormDto, passwordEncoder);

        // 데이터 저장
        memberRepository.save(member);
    }

    /**
     * 사용자 정보를 ID로 조회
     * @param id - 사용자 ID
     * @return Member 엔티티
     * @throws IllegalArgumentException - 해당 ID의 사용자가 없는 경우 예외 발생
     */
    @Transactional(readOnly = true)
    public Member getMemberById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 사용자를 찾을 수 없습니다."));
    }


    // 사용자 정보 수정 메서드
    public void updateMember(Long id, MemberUpdateDto memberUpdateDto) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        member.setName(memberUpdateDto.getName());
        member.setEmail(memberUpdateDto.getEmail());
        member.setPhone(memberUpdateDto.getPhone());
        member.setAddress(memberUpdateDto.getAddress());
        member.setBirthDate(memberUpdateDto.getBirthDate());
        member.setGender(memberUpdateDto.getGender());
        member.setActivate(memberUpdateDto.isActivate());

        memberRepository.save(member); // 변경 사항 저장
    }


    /**
     * 이메일 중복 체크
     * @param email - 클라이언트에서 입력받은 이메일
     * @return true(중복) or false(사용 가능)
     */
    public boolean isEmailDuplicate(String email) {
        Member foundMember = memberRepository.findByEmail(email);
        return foundMember != null;
    }

    /**
     * 로그인 처리
     * @param loginForm 로그인 폼 데이터 (이메일, 비밀번호)
     * @return 로그인 성공 여부 (true: 성공, false: 실패)
     */
    public boolean login(LoginFormDto loginForm) {
        // 이메일로 회원 검색
        Member member = memberRepository.findByEmail(loginForm.getEmail());

        // 이메일 존재 여부 & 비밀번호 일치 확인
        if (member != null && passwordEncoder.matches(loginForm.getPassword(), member.getPassword())) {
            updateLastLogin(loginForm.getEmail()); // 로그인 성공 시 마지막 로그인 시간 업데이트
            return true;// 로그인 성공
        }
        return false;

        // 로그인 성공
    }

    public Member findById(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));
    }

    public Member findByEmail(String email) {
        return memberRepository.findByEmail(email);
    }


    // 로그인 성공 시 마지막 로그인 날짜 업데이트
    @Transactional
    public void updateLastLogin(String email) {
        Member member = memberRepository.findByEmail(email);
        if (member != null) {
            member.updateLastLogin(); // 마지막 로그인 날짜 업데이트
            memberRepository.save(member);
            System.out.println("🔹 [updateLastLogin] 저장 완료: " + member.getLastLoginAt());
        } else {
            System.out.println("⚠ [updateLastLogin] 회원을 찾을 수 없음: " + email);
        }
    }

    // 회원 비활성화 처리
    public void deactivateMember(String email) {
        Member member = memberRepository.findByEmail(email);
        if (member == null) {
            throw new IllegalArgumentException("존재하지 않는 이메일입니다.");
        }
        member.deactivateMember(); //  비활성화 및 탈퇴일 저장
        memberRepository.save(member);
    }

    /**
     * 이름으로 사용자 검색 (검색어가 포함된 사용자 목록 반환)
     * @param name - 검색할 사용자 이름
     * @return 검색된 사용자 목록
     */
    @Transactional(readOnly = true)
    public List<Member> searchMembersByName(String name) {
        return memberRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * 회원 목록 조회 (페이징, 검색, 상태 필터링)
     */
    @Transactional(readOnly = true)
    public PageResponseDTO<Member> getMemberList(PageRequestDTO pageRequestDTO) {

        Pageable pageable = PageRequestDTOUtil.getPageable(pageRequestDTO);

        // 검색 조건 Specification
        Specification<Member> spec = Specification.where(null);

        // 상태(status) 필터링
        if (pageRequestDTO.getStatus() != null && !pageRequestDTO.getStatus().isEmpty()) {
            boolean activate = "ACTIVE".equalsIgnoreCase(pageRequestDTO.getStatus());
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("activate"), activate));
        }

        // 검색(searchType, keyword) 필터링
        if (pageRequestDTO.getSearchType() != null && !pageRequestDTO.getSearchType().isEmpty() &&
                pageRequestDTO.getKeyword() != null && !pageRequestDTO.getKeyword().isEmpty()) {

            String keyword = pageRequestDTO.getKeyword();
            if ("name".equalsIgnoreCase(pageRequestDTO.getSearchType())) {
                spec = spec.and((root, query, criteriaBuilder) ->
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + keyword.toLowerCase() + "%"));
            } else if ("email".equalsIgnoreCase(pageRequestDTO.getSearchType())) {
                spec = spec.and((root, query, criteriaBuilder) ->
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), "%" + keyword.toLowerCase() + "%"));
            }
        }


        // 회원 목록 조회 (필터링 적용)
        Page<Member> memberPage = memberRepository.findAll(spec, pageable);

        // PageResponseDTO 생성 및 반환
        PageResponseDTO<Member> responseDTO = PageResponseDTO.<Member>builder()
                .pageRequestDTO(pageRequestDTO)  // pageRequestDTO를 빌더에 전달
                .dtoList(memberPage.getContent())
                .total((int) memberPage.getTotalElements())
                .build();

        return responseDTO;
    }


    /**
     * [추가] 회원 상태 변경 (활성/탈퇴)
     * @param memberId - 회원 ID
     * @param status - 변경할 상태 (ACTIVE, DELETED)
     */
    @Transactional
    public void changeMemberStatus(Long memberId, String status) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if ("ACTIVE".equalsIgnoreCase(status)) {
            member.setActivate(true); // 활성 상태로 변경
        } else if ("DELETED".equalsIgnoreCase(status)) {
            member.setActivate(false); // 탈퇴 상태로 변경 (비활성화)
            member.deactivateMember(); // 탈퇴일 저장
        } else {
            throw new IllegalArgumentException("잘못된 상태 값입니다. (ACTIVE 또는 DELETED)");
        }

        memberRepository.save(member); // 변경된 회원 정보 저장
    }

}
