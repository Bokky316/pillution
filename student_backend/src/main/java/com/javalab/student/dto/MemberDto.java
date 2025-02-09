package com.javalab.student.dto;

import com.javalab.student.entity.Member;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDto {
    private Long id;
    private String name;
    private String email;
    private boolean social;
    private String provider;

    // Member 엔티티로부터 MemberDto를 생성하는 정적 메서드
    public static MemberDto fromEntity(Member member) {
        return MemberDto.builder()
                .id(member.getId())
                .name(member.getName())
                .email(member.getEmail())
                .social(member.isSocial())
                .provider(member.getProvider())
                .build();
    }
}
