package com.hotelbooking.hotel_booking.config;

import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@ConditionalOnProperty(name = "spring.ai.openai.api-key")
public class AiConfiguration {
    private static final Logger logger = LoggerFactory.getLogger(AiConfiguration.class);
    
    @Value("${spring.ai.openai.api-key:}")
    private String apiKey;
}

