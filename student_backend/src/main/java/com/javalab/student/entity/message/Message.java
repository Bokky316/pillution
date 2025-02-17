package com.javalab.student.entity.message;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.javalab.student.entity.BaseEntity;
import com.javalab.student.entity.Member;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * 메시지 엔티티
 * - 사용자 간 주고받는 메시지를 표현하는 엔티티 클래스
 * - BaseEntity를 상속받아 생성일, 수정일 정보를 포함
 */
@Entity
@Getter @Setter
@Table(name = "message")
@Builder
@NoArgsConstructor  // @Builder 사용 시 @NoArgsConstructor 필수
@AllArgsConstructor // @Builder 사용 시 @AllArgsConstructor 필수
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Message extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "msg_id")
    private Long id;  // 메시지의 고유 식별자

    // 발신자 (ManyToOne 관계)
    @ManyToOne(fetch = FetchType.LAZY)  // 지연 로딩 설정으로 성능 최적화
    @JoinColumn(name = "sender_id", nullable = false)  // FK 설정, null 허용하지 않음
    private Member sender;  // 메시지를 보낸 사용자

    // 수신자 (ManyToOne 관계)
    @ManyToOne(fetch = FetchType.LAZY)  // 지연 로딩 설정으로 성능 최적화
    @JoinColumn(name = "receiver_id", nullable = false)  // FK 설정, null 허용하지 않음
    private Member receiver;  // 메시지를 받는 사용자

    @NotBlank(message = "메시지 내용은 비워둘 수 없습니다.")
    @Size(min = 1, max = 255, message = "메시지 내용은 1자 이상 255자 이하여야 합니다.")
    @Column(nullable = false)
    private String content;  // 메시지 내용

    // 메시지를 읽었는지 여부
    @Column(name = "is_read", nullable = false)
    private boolean read = false;  // 기본값은 false (읽지 않음)

    // 메시지를 발신자가 삭제했는지 여부
    @Column(name = "deleted_by_sender", nullable = false)
    private boolean deletedBySender = false;  // 기본값은 false (삭제하지 않음)

    // 메시지를 수신자가 삭제했는지 여부
    @Column(name = "deleted_by_receiver", nullable = false)
    private boolean deletedByReceiver = false;  // 기본값은 false (삭제하지 않음)

    // 공지 여부
    @Column(name = "is_notice", nullable = false)
    private boolean notice = false;  // 기본값은 false (공지아님)
}
