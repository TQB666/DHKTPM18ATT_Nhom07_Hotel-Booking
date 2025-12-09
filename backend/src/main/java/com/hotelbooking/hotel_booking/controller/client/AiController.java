package com.hotelbooking.hotel_booking.controller.client;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.hotelbooking.hotel_booking.domain.dto.AiChatRequestDTO;
import com.hotelbooking.hotel_booking.domain.dto.AiChatResponseDTO;
import com.hotelbooking.hotel_booking.service.AiService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiController {
    private static final Logger logger = LoggerFactory.getLogger(AiController.class);
    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    /**
     * Chat endpoint - accepts user query and returns AI response with suggestions
     */
    @PostMapping("/chat")
    public ResponseEntity<AiChatResponseDTO> chat(@RequestBody AiChatRequestDTO request) {
        logger.info("AI Chat endpoint called with message: {}", request.getMessage());
        
        try {
            AiChatResponseDTO response = aiService.chat(request);
            logger.info("AI response: {}", response.getResponse());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in AI chat endpoint", e);
            AiChatResponseDTO errorResponse = new AiChatResponseDTO();
            errorResponse.setResponse("Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi của bạn: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}

