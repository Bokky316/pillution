package com.javalab.student.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig : 환경설정 파일
 * - @configuration : 이 클래스가 spring의 설정 파일임을 명시, 여기에는 하나 이상의 @Bean이 있음.
 *   프로젝트가 구동될 때 이 클래스를 읽어들여 Bean으로 등록
 *
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // application.properties 파일에 설정된 값을 가져온다.
    @Value("${uploadPath}")
    String uploadPath;  // file:///c:/shop/

    /**
     * CORS(Cross-Origin Resource Sharing) 설정
     * - addMapping : CORS를 적용할 URL pattern, 모든 URL에 대해 적용하려면 /** 로 설정
     * - allowedOrigins : CORS를 허용할 origin URL, 여기서는 3000번 포트로 들어오는 요청만 허용
     * - allowedMethods : CORS를 허용할 HTTP 메서드, GET, POST, PUT, DELETE, OPTIONS
     * - allowedHeaders : CORS를 허용할 HTTP 헤더
     * - allowCredentials : 쿠키를 주고 받을 수 있게 설정
     * @param registry
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")    // 모든 헤더를 허용
                .allowCredentials(true);    // 쿠키를 주고 받을 수 있게 설정, 세션을 사용할 때는 true로 설정, 왜? 세션은 쿠키를 사용하기 때문, 쿠키에는 사용자의 정보가 담겨있음
    }


    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/images/**")   // /images/** 요청이 오면 uploadPath로 매핑
                .addResourceLocations(uploadPath);  // 로컬 컴퓨터에 저장된 파일을 읽어올 root 경로를 설정합니다.

        // aws
        //registry.addResourceHandler("/images/**")
        //    .addResourceLocations("file:///home/ec2-user/shop/chap05_shop_social/build/libs/upload/");


        registry.addResourceHandler("/static-images/**")
                .addResourceLocations("classpath:/static/images/");  // 정적 리소스

        registry.addResourceHandler("/favicon.ico")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(0);
    }
}
