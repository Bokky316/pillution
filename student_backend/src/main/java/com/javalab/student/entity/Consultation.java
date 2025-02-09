package com.javalab.student.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id")
    private ChatRoom chatRoom;

    @Column(length = 1000)
    private String consultantMemo;

    @Enumerated(EnumType.STRING)
    private ConsultationResult result;

    private Long relatedOrderId;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private int userSatisfactionScore;
}

