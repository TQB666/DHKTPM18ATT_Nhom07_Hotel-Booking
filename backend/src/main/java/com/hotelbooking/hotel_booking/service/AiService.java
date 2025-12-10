package com.hotelbooking.hotel_booking.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.annotation.PostConstruct;

import com.hotelbooking.hotel_booking.domain.dto.AiChatRequestDTO;
import com.hotelbooking.hotel_booking.domain.dto.AiChatResponseDTO;
import com.hotelbooking.hotel_booking.domain.dto.HotelDTO;
import com.hotelbooking.hotel_booking.domain.dto.RoomDTO;
import com.hotelbooking.hotel_booking.repository.HotelRepository;
import com.hotelbooking.hotel_booking.repository.RoomRepository;

@Service
public class AiService {
    private static final Logger logger = LoggerFactory.getLogger(AiService.class);
    
    @Autowired(required = false)
    private OpenAiChatModel chatModel;
    
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    public AiService(HotelRepository hotelRepository, RoomRepository roomRepository) {
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
        logger.info("AiService initialized");
    }
    
    @PostConstruct
    public void init() {
        logger.info("=== AI Service Post-Construct ===");
        logger.info("OpenAiChatModel injected: {}", chatModel != null);
        if (chatModel == null) {
            logger.warn("WARNING: OpenAiChatModel is NULL - Spring AI auto-configuration may have failed!");
            logger.warn("Possible causes:");
            logger.warn("1. API key is missing or empty");
            logger.warn("2. spring-ai-openai dependency is not properly configured");
            logger.warn("3. OpenAI API key is invalid");
        } else {
            logger.info("✓ OpenAiChatModel is available and ready to use");
        }
    }

    /**
     * Process user message and provide AI-assisted response with database suggestions
     */
    public AiChatResponseDTO chat(AiChatRequestDTO request) {
        logger.info("Chat request received: {}", request.getMessage());
        
        // Build context from database
        String databaseContext = buildDatabaseContext();
        logger.debug("Database context built with {} characters", databaseContext.length());
        
        String aiResponse = "Xin lỗi, dịch vụ AI hiện không khả dụng. Vui lòng kiểm tra cấu hình API key.";
        
        // Check if ChatModel is available
        if (chatModel == null) {
            logger.warn("OpenAiChatModel is null - AI service is not available");
            aiResponse = "Dịch vụ AI không khả dụng. Vui lòng kiểm tra cấu hình OpenAI API key trong application.properties";
        } else {
            try {
                logger.info("OpenAiChatModel is available, processing request");
                
                // Create system prompt
                String systemPrompt = """
                    Bạn là một trợ lý AI đặc biệt cho ứng dụng đặt phòng khách sạn.
                    Bạn sẽ giúp người dùng tìm khách sạn, phòng và cung cấp thông tin về dịch vụ.
                    
                    Dữ liệu khách sạn và phòng hiện có:
                    """ + databaseContext + """
                    
                    Hãy trả lời các câu hỏi của người dùng một cách thân thiện, hữu ích và dựa trên dữ liệu sẵn có.
                    Nếu có khách sạn hoặc phòng liên quan đến câu hỏi, hãy gợi ý chúng.""";

                logger.info("Calling OpenAI API...");
                
                // Create prompt with system and user messages
                Prompt prompt = new Prompt(List.of(
                    new SystemMessage(systemPrompt),
                    new UserMessage(request.getMessage())
                ));
                
                ChatResponse response = chatModel.call(prompt);
                aiResponse = response.getResult().getOutput().getText();
                
                logger.info("AI response received successfully");
            } catch (Exception e) {
                logger.error("Error calling AI service", e);
                
                // Check if it's a rate limit or API error
                if (e.getMessage() != null && (e.getMessage().contains("429") || e.getMessage().contains("quota"))) {
                    logger.warn("OpenAI API rate limit or quota exceeded. Providing fallback response with suggestions.");
                    aiResponse = "Dịch vụ AI tạm thời quá tải. Tôi sẽ cung cấp các gợi ý từ cơ sở dữ liệu của chúng tôi. Vui lòng thử lại sau.";
                } else {
                    aiResponse = "Lỗi khi gọi AI: " + e.getClass().getSimpleName() + " - " + e.getMessage();
                }
            }
        }

        // Extract suggestions based on user query
        List<HotelDTO> hotelSuggestions = extractHotelSuggestions(request.getMessage());
        List<RoomDTO> roomSuggestions = extractRoomSuggestions(request.getMessage());
        
        logger.info("Found {} hotel suggestions and {} room suggestions", hotelSuggestions.size(), roomSuggestions.size());

        AiChatResponseDTO aiChatResponse = new AiChatResponseDTO();
        aiChatResponse.setResponse(aiResponse);
        aiChatResponse.setHotelSuggestions(hotelSuggestions);
        aiChatResponse.setRoomSuggestions(roomSuggestions);
        aiChatResponse.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        return aiChatResponse;
    }

    /**
     * Build database context from hotel and room data
     */
    private String buildDatabaseContext() {
        StringBuilder context = new StringBuilder();
        
        context.append("=== DANH SÁCH KHÁCH SẠN ===\n");
        hotelRepository.findAll().stream().limit(10).forEach(hotel -> {
            context.append(String.format("- %s (%s, %s): %d ⭐ - %s\n",
                hotel.getName(), hotel.getCity(), hotel.getAddress(),
                hotel.getRating(), hotel.getShortDesc()));
            
            // Add rooms for this hotel
            if (!hotel.getRooms().isEmpty()) {
                context.append("  Phòng:\n");
                hotel.getRooms().stream().limit(5).forEach(room -> {
                    context.append(String.format("    • %s: %d người, %.0f VND/đêm, %d phòng có sẵn\n",
                        room.getName(), room.getCapacity(), room.getPrice(), room.getQuantity()));
                });
            }
        });

        return context.toString();
    }

    /**
     * Extract hotel suggestions based on user query
     */
    private List<HotelDTO> extractHotelSuggestions(String userQuery) {
        List<HotelDTO> suggestions = new ArrayList<>();
        String queryLower = userQuery.toLowerCase();

        // Check for city/location keywords
        if (queryLower.contains("hà nội") || queryLower.contains("hanoi")) {
            hotelRepository.findAll().stream()
                .filter(h -> h.getCity() != null && h.getCity().toLowerCase().contains("hà nội"))
                .limit(3)
                .forEach(h -> suggestions.add(convertHotelToDTO(h)));
        } else if (queryLower.contains("hồ chí minh") || queryLower.contains("ho chi minh")) {
            hotelRepository.findAll().stream()
                .filter(h -> h.getCity() != null && h.getCity().toLowerCase().contains("hồ chí minh"))
                .limit(3)
                .forEach(h -> suggestions.add(convertHotelToDTO(h)));
        } else {
            // Return top rated hotels
            hotelRepository.findAll().stream()
                .sorted((h1, h2) -> Integer.compare(h2.getRating(), h1.getRating()))
                .limit(3)
                .forEach(h -> suggestions.add(convertHotelToDTO(h)));
        }

        return suggestions;
    }

    /**
     * Extract room suggestions based on user query
     */
    private List<RoomDTO> extractRoomSuggestions(String userQuery) {
        List<RoomDTO> suggestions = new ArrayList<>();
        String queryLower = userQuery.toLowerCase();

        // Check for capacity/price keywords
        int desiredCapacity = 2; // default
        double maxPrice = Double.MAX_VALUE;

        if (queryLower.contains("1 người") || queryLower.contains("1 person")) {
            desiredCapacity = 1;
        } else if (queryLower.contains("2 người") || queryLower.contains("2 people")) {
            desiredCapacity = 2;
        } else if (queryLower.contains("3 người") || queryLower.contains("3 people")) {
            desiredCapacity = 3;
        } else if (queryLower.contains("4 người") || queryLower.contains("4 people")) {
            desiredCapacity = 4;
        }

        if (queryLower.contains("rẻ") || queryLower.contains("cheap")) {
            maxPrice = 50000; // Budget option
        } else if (queryLower.contains("cao cấp") || queryLower.contains("premium")) {
            maxPrice = Double.MAX_VALUE;
        }

        final int capacity = desiredCapacity;
        final double price = maxPrice;

        roomRepository.findAll().stream()
            .filter(r -> r.getCapacity() >= capacity && r.getPrice() <= price && r.getQuantity() > 0)
            .sorted((r1, r2) -> Double.compare(r1.getPrice(), r2.getPrice()))
            .limit(3)
            .forEach(r -> suggestions.add(convertRoomToDTO(r)));

        return suggestions;
    }

    /**
     * Convert Hotel entity to HotelDTO
     */
    private HotelDTO convertHotelToDTO(com.hotelbooking.hotel_booking.domain.Hotel hotel) {
        HotelDTO dto = new HotelDTO();
        dto.setId(hotel.getId());
        dto.setName(hotel.getName());
        dto.setAddress(hotel.getAddress());
        dto.setCity(hotel.getCity());
        dto.setPhone(hotel.getPhone());
        dto.setRating(hotel.getRating());
        dto.setShortDesc(hotel.getShortDesc());
        return dto;
    }

    /**
     * Convert Room entity to RoomDTO
     */
    private RoomDTO convertRoomToDTO(com.hotelbooking.hotel_booking.domain.Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setName(room.getName());
        dto.setCapacity(room.getCapacity());
        dto.setPrice(room.getPrice());
        dto.setQuantity(room.getQuantity());
        return dto;
    }
}
