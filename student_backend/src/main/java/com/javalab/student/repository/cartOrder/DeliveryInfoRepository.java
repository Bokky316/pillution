package com.javalab.student.repository.cartOrder;

import com.javalab.student.entity.cartOrder.DeliveryInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


/**
 * 배송 정보 Repository
 */
public interface DeliveryInfoRepository extends JpaRepository<DeliveryInfo, Long> {
    List<DeliveryInfo> findByMemberId(Long memberId);
}
