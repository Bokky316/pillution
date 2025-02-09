package com.javalab.student.dto;

import com.javalab.student.constant.Role;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationMemberDto extends MemberFormDto {

    // 상담 관련 추가 필드
    private int totalConsultations;
    private LocalDateTime lastConsultationDate;
    private String preferredConsultationType;
    private int satisfactionScore;
    private boolean isBadConsumer;

    @Builder(builderMethodName = "consultationMemberBuilder")
    public ConsultationMemberDto(String name, String email, String password, String address,
                                 String phone, LocalDate birthDate, String gender, boolean activate,
                                 int points, Role role, int totalConsultations,
                                 LocalDateTime lastConsultationDate, String preferredConsultationType,
                                 int satisfactionScore, boolean isBadConsumer) {
        super(name, email, password, address, phone, birthDate, gender, activate, points, role);
        this.totalConsultations = totalConsultations;
        this.lastConsultationDate = lastConsultationDate;
        this.preferredConsultationType = preferredConsultationType;
        this.satisfactionScore = satisfactionScore;
        this.isBadConsumer = isBadConsumer;
    }
}
