package com.javalab.student.config.portone;

import com.siot.IamportRestClient.IamportClient;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 포트원 API 클라이언트 설정
 */
@Configuration
@RequiredArgsConstructor
public class IamportConfig {

    private final PortOneProperties portOneProperties;

    @Bean
    public IamportClient iamportClient() {
        return new IamportClient(portOneProperties.getApiKey(), portOneProperties.getApiSecret());
    }
}
