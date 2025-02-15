package com.javalab.student.config.portone;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * PortOne API 설정 정보
 * - application.properties 파일에서 portone.api-key, portone.api-secret, portone.merchant-uid 값을 읽어온다.
 * - @ConfigurationProperties("portone") : portone.api-key=imp66240214 => apiKey 필드에 값을 주입한다.
 */
@Setter
@Getter
@Component
@ConfigurationProperties("portone")
public class PortOneProperties {
    private String apiKey;
    private String apiSecret;
    private String merchantUid;
}
