package com.javalab.student.service.cartOrder;

import com.javalab.student.dto.cartOrder.DeliveryInfoDto;
import com.javalab.student.entity.Member;
import com.javalab.student.entity.cartOrder.DeliveryInfo;
import com.javalab.student.repository.MemberRepository;
import com.javalab.student.repository.cartOrder.DeliveryInfoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 배송 정보 Service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryInfoService {

    private final DeliveryInfoRepository deliveryInfoRepository;
    private final MemberRepository memberRepository;

    /**
     * 배송 정보 생성
     *
     * @param memberId              회원 ID
     * @param deliveryInfoCreateDto 배송 정보 생성 DTO
     * @return 생성된 배송 정보 DTO
     */
    @Transactional
    public DeliveryInfoDto createDeliveryInfo(Long memberId, DeliveryInfoDto deliveryInfoCreateDto) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 회원을 찾을 수 없습니다: " + memberId));

        DeliveryInfo deliveryInfo = DeliveryInfo.builder()
                .member(member)
                .deliveryName(deliveryInfoCreateDto.getDeliveryName())
                .recipientName(deliveryInfoCreateDto.getRecipientName())
                .recipientPhone(deliveryInfoCreateDto.getRecipientPhone())
                .postalCode(deliveryInfoCreateDto.getPostalCode())
                .roadAddress(deliveryInfoCreateDto.getRoadAddress())
                .detailAddress(deliveryInfoCreateDto.getDetailAddress())
                .deliveryMemo(deliveryInfoCreateDto.getDeliveryMemo())
                .isDefault(deliveryInfoCreateDto.isDefault())
                .build();

        DeliveryInfo savedDeliveryInfo = deliveryInfoRepository.save(deliveryInfo);

        return convertToDto(savedDeliveryInfo);
    }

    /**
     * 배송 정보 조회
     *
     * @param id 배송 정보 ID
     * @return 배송 정보 DTO
     * @throws EntityNotFoundException 배송 정보를 찾을 수 없을 경우 예외 발생
     */
    @Transactional(readOnly = true)
    public DeliveryInfoDto getDeliveryInfo(Long id) {
        DeliveryInfo deliveryInfo = deliveryInfoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 배송 정보를 찾을 수 없습니다: " + id));
        return convertToDto(deliveryInfo);
    }

    /**
     * 회원 ID로 배송 정보 목록 조회
     *
     * @param memberId 회원 ID
     * @return 배송 정보 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<DeliveryInfoDto> getDeliveryInfoByMemberId(Long memberId) {
        List<DeliveryInfo> deliveryInfos = deliveryInfoRepository.findByMemberId(memberId);
        return deliveryInfos.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 배송 정보 수정
     *
     * @param id                    배송 정보 ID
     * @param deliveryInfoCreateDto 수정할 배송 정보 DTO
     * @return 수정된 배송 정보 DTO
     * @throws EntityNotFoundException 배송 정보를 찾을 수 없을 경우 예외 발생
     */
    @Transactional
    public DeliveryInfoDto updateDeliveryInfo(Long id, DeliveryInfoDto deliveryInfoCreateDto) {
        DeliveryInfo deliveryInfo = deliveryInfoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 배송 정보를 찾을 수 없습니다: " + id));

        deliveryInfo.setDeliveryName(deliveryInfoCreateDto.getDeliveryName());
        deliveryInfo.setRecipientName(deliveryInfoCreateDto.getRecipientName());
        deliveryInfo.setRecipientPhone(deliveryInfoCreateDto.getRecipientPhone());
        deliveryInfo.setPostalCode(deliveryInfoCreateDto.getPostalCode());
        deliveryInfo.setRoadAddress(deliveryInfoCreateDto.getRoadAddress());
        deliveryInfo.setDetailAddress(deliveryInfoCreateDto.getDetailAddress());
        deliveryInfo.setDeliveryMemo(deliveryInfoCreateDto.getDeliveryMemo());
        deliveryInfo.setDefault(deliveryInfoCreateDto.isDefault());

        DeliveryInfo updatedDeliveryInfo = deliveryInfoRepository.save(deliveryInfo);
        return convertToDto(updatedDeliveryInfo);
    }

    /**
     * 배송 정보 삭제
     *
     * @param id 배송 정보 ID
     * @throws EntityNotFoundException 배송 정보를 찾을 수 없을 경우 예외 발생
     */
    @Transactional
    public void deleteDeliveryInfo(Long id) {
        DeliveryInfo deliveryInfo = deliveryInfoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 배송 정보를 찾을 수 없습니다: " + id));
        deliveryInfoRepository.delete(deliveryInfo);
    }

    /**
     * DeliveryInfo 엔티티를 DeliveryInfoDto로 변환
     *
     * @param deliveryInfo 변환할 DeliveryInfo 엔티티
     * @return DeliveryInfoDto 변환된 DeliveryInfoDto 객체
     */
    private DeliveryInfoDto convertToDto(DeliveryInfo deliveryInfo) {
        return DeliveryInfoDto.builder()
                .id(deliveryInfo.getId())
                .deliveryName(deliveryInfo.getDeliveryName())
                .recipientName(deliveryInfo.getRecipientName())
                .recipientPhone(deliveryInfo.getRecipientPhone())
                .postalCode(deliveryInfo.getPostalCode())
                .roadAddress(deliveryInfo.getRoadAddress())
                .detailAddress(deliveryInfo.getDetailAddress())
                .deliveryMemo(deliveryInfo.getDeliveryMemo())
                .isDefault(deliveryInfo.isDefault())
                .build();
    }
}
