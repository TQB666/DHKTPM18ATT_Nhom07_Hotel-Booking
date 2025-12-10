package com.hotelbooking.hotel_booking.controller.client;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/diagnostics")
@CrossOrigin(origins = "http://localhost:5173")
public class AiDiagnosticsController {
    private static final Logger logger = LoggerFactory.getLogger(AiDiagnosticsController.class);
    
    @Value("${spring.ai.google.genai.api-key:}")
    private String apiKey;
    
    /**
     * Check AI configuration status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> checkStatus() {
        logger.info("Diagnostics endpoint called");
        
        Map<String, Object> status = new HashMap<>();
        
        // Check API Key
        status.put("apiKeyConfigured", !apiKey.isEmpty());
        if (!apiKey.isEmpty()) {
            status.put("apiKeyFormat", apiKey.substring(0, Math.min(15, apiKey.length())) + "...");
            status.put("apiKeyValid", apiKey.startsWith("AIzaSy"));
        }
        
        // Check configuration properties
        status.put("backendUrl", "http://localhost:8080");
        status.put("chatEndpoint", "/api/ai/chat");
        status.put("diagnosticsEndpoint", "/api/ai/diagnostics/status");
        
        return ResponseEntity.ok(status);
    }
}
