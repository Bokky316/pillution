package com.javalab.student.config.redis;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis 설정 클래스
 * - RedisTemplate 및 CacheManager 빈 등록
 * - Redis를 활용한 캐싱 기능 활성화 (@EnableCaching)
 * - Redis에 저장되는 Key, Value의 직렬화 방식 지정
 * - RedisConnectionFactory를 활용하여 Redis 서버와 연결
 */
@Configuration
@EnableCaching // Spring의 캐싱 기능 활성화
public class RedisConfig {

    /**
     * 🔹 RedisTemplate 빈 등록
     * - RedisTemplate은 Spring에서 Redis 데이터를 다룰 때 사용하는 주요 인터페이스
     * - Redis에 데이터를 저장하거나 조회할 때 사용됨
     * - Key와 Value의 직렬화(Serialization) 방식을 설정해야 함
     * - LettuceConnectionFactory를 사용하여 Redis 서버와 연결
     * @param connectionFactory Redis 연결을 위한 LettuceConnectionFactory
     * @return 설정된 RedisTemplate 객체
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(LettuceConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory); // Redis 연결 설정

        // Key 직렬화 방식 설정 (문자열)
        template.setKeySerializer(new StringRedisSerializer());

        // Value 직렬화 방식 설정 (JSON 변환)
        // - 객체를 JSON으로 변환하여 Redis에 저장
        // - GenericJackson2JsonRedisSerializer를 사용하여 JSON 직렬화 수행
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());

        return template;
    }

    /**
     * 🔹 CacheManager 빈 등록
     * - Spring의 캐싱 기능과 Redis를 연결하는 역할
     * - RedisCacheManager를 사용하여 Redis를 캐시 저장소로 활용
     * - CacheManager는 RedisConnectionFactory를 사용하여 Redis와 연결됨
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        return RedisCacheManager.builder(redisConnectionFactory).build();
    }
}
