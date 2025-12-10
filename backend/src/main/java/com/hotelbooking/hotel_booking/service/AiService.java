package com.hotelbooking.hotel_booking.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

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
        String lowerText = userQuery.toLowerCase();
        List<com.hotelbooking.hotel_booking.domain.Hotel> allHotels = hotelRepository.findAll();

        // --- BƯỚC 1: XÁC ĐỊNH Ý ĐỊNH ĐỊA ĐIỂM (Giữ nguyên) ---
        List<String> detectedCities = allHotels.stream()
                .map(h -> h.getCity())
                .filter(city -> city != null && lowerText.contains(city.toLowerCase()))
                .distinct()
                .collect(Collectors.toList());

        boolean hasLocationIntent = !detectedCities.isEmpty();

        // --- BƯỚC 2: XÁC ĐỊNH Ý ĐỊNH SỐ SAO (MỚI) ---
        Integer targetRating = null;
        boolean isMinRating = false; // True nếu tìm "trên X sao", False nếu tìm "đúng X sao"

        // Regex tìm số đứng trước chữ "sao" hoặc "star" (ví dụ: "5 sao", "4 star")
        Pattern ratingPattern = Pattern.compile("(\\d+)\\s*(sao|star)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = ratingPattern.matcher(lowerText);

        if (matcher.find()) {
            try {
                int r = Integer.parseInt(matcher.group(1));
                // Chỉ chấp nhận rating từ 1 đến 5
                if (r >= 1 && r <= 5) {
                    targetRating = r;
                    // Kiểm tra xem có từ khóa "trên", "hơn", "từ" không
                    if (lowerText.contains("trên") || lowerText.contains("hơn") || lowerText.contains("từ")) {
                        isMinRating = true;
                    }
                }
            } catch (NumberFormatException e) { /* Bỏ qua lỗi ép kiểu */ }
        }

        // Biến final để dùng trong lambda
        final Integer finalRating = targetRating;
        final boolean finalIsMin = isMinRating;

        return allHotels.stream()
                .filter(h -> {
                    // --- ĐIỀU KIỆN 1: CHECK SỐ SAO (Ưu tiên lọc trước) ---
                    if (finalRating != null) {
                        if (finalIsMin) {
                            // Tìm "trên 3 sao" -> Lấy >= 3
                            if (h.getRating() < finalRating) return false;
                        } else {
                            // Tìm "5 sao" -> Lấy đúng == 5
                            if (h.getRating() != finalRating) return false;
                        }
                    }

                    // --- ĐIỀU KIỆN 2: CHECK ĐỊA ĐIỂM & TÊN ---

                    // Trường hợp A: User CÓ nhắc đến địa điểm (Vd: "Đà Lạt 5 sao")
                    if (hasLocationIntent) {
                        return h.getCity() != null && detectedCities.stream()
                                .anyMatch(city -> h.getCity().equalsIgnoreCase(city));
                    }

                    // Trường hợp B: User KHÔNG nhắc địa điểm (Vd: "Khách sạn 5 sao", "Pullman")
                    boolean nameMatch = h.getName() != null && lowerText.contains(h.getName().toLowerCase());

                    // Nếu đã lọc theo số sao rồi (finalRating != null) thì không cần check "gợi ý" nữa,
                    // chỉ cần trả về true (vì rating đã khớp ở trên).
                    // Nếu chưa có rating, mới check keyword chung chung.
                    boolean isGeneralInquiry = lowerText.contains("gợi ý") || lowerText.contains("tốt nhất") || lowerText.contains("khách sạn");

                    // Nếu có rating filter -> Chấp nhận luôn. Nếu không -> Check tên hoặc gợi ý
                    return (finalRating != null) || nameMatch || (isGeneralInquiry && h.getRating() >= 4);
                })
                .map(this::convertHotelToDTO)
                .distinct()
                .limit(5)
                .collect(Collectors.toList());
    }

    /**
     * Extract room suggestions based on user query
     */
    private List<RoomDTO> extractRoomSuggestions(String userQuery) {
        String lowerText = userQuery.toLowerCase();
        List<com.hotelbooking.hotel_booking.domain.Room> allRooms = roomRepository.findAll();

        // --- BƯỚC 1: XÁC ĐỊNH ĐỊA ĐIỂM (Tương tự logic Hotel) ---
        // Mục đích: Nếu khách tìm "Đà Lạt", chỉ hiện phòng của khách sạn ở Đà Lạt
        List<String> detectedCities = hotelRepository.findAll().stream()
                .map(h -> h.getCity())
                .filter(city -> city != null && lowerText.contains(city.toLowerCase()))
                .distinct()
                .collect(Collectors.toList());

        boolean hasLocationIntent = !detectedCities.isEmpty();

        // --- BƯỚC 2: XÁC ĐỊNH SỐ LƯỢNG NGƯỜI (Parsing thông minh) ---
        int targetCapacity = 2; // Mặc định là phòng đôi nếu không nói gì
        boolean hasCapacityIntent = false;

        // Regex bắt: "2 người", "4 khach", "1 pax", "gia đình" (tính là 4)
        Pattern capacityPattern = Pattern.compile("(\\d+)\\s*(người|khách|pax|person)|(gia đình)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = capacityPattern.matcher(lowerText);

        if (matcher.find()) {
            if (matcher.group(3) != null) {
                // Nếu tìm thấy chữ "gia đình"
                targetCapacity = 4;
                hasCapacityIntent = true;
            } else {
                // Nếu tìm thấy số (group 1)
                try {
                    targetCapacity = Integer.parseInt(matcher.group(1));
                    hasCapacityIntent = true;
                } catch (NumberFormatException e) { /* Ignore */ }
            }
        }

        final int finalCapacity = targetCapacity;
        final boolean finalHasCapacityIntent = hasCapacityIntent;

        // --- BƯỚC 3: LỌC VÀ SẮP XẾP ---
        return allRooms.stream()
                .filter(room -> {
                    // 1. Chỉ lấy phòng còn trống
                    if (room.getQuantity() <= 0) return false;

                    // 2. Lọc theo Địa điểm (QUAN TRỌNG)
                    if (hasLocationIntent) {
                        com.hotelbooking.hotel_booking.domain.Hotel hotel = room.getHotel();
                        // Nếu phòng không gắn với khách sạn hoặc khách sạn không đúng thành phố -> Loại
                        if (hotel == null || hotel.getCity() == null) return false;

                        boolean matchCity = detectedCities.stream()
                                .anyMatch(city -> hotel.getCity().equalsIgnoreCase(city));
                        if (!matchCity) return false;
                    }

                    // 3. Lọc theo Số người
                    // Logic: Lấy phòng có sức chứa >= yêu cầu (Ví dụ tìm 2 người thì phòng 2 hoặc 3 người đều ok)
                    // Nhưng không được lớn quá (Ví dụ tìm 1 người mà gợi ý phòng 10 người là sai)
                    if (finalHasCapacityIntent) {
                        return room.getCapacity() >= finalCapacity && room.getCapacity() <= finalCapacity + 2;
                    }

                    return true;
                })
                // Sắp xếp: Ưu tiên phòng vừa khít số người nhất, sau đó đến giá rẻ nhất
                .sorted(Comparator.comparingInt((com.hotelbooking.hotel_booking.domain.Room r) -> Math.abs(r.getCapacity() - finalCapacity))
                        .thenComparingDouble(com.hotelbooking.hotel_booking.domain.Room::getPrice))
                .map(room -> {
                    RoomDTO dto = convertRoomToDTO(room);
                    // Gán thêm hotelId nếu cần dùng ở Frontend để chuyển hướng
                    if (room.getHotel() != null) dto.setHotelId(room.getHotel().getId());
                    return dto;
                })
                .distinct() // Khử trùng lặp dựa trên ID (nhờ @EqualsAndHashCode)
                .limit(4)   // Chỉ lấy 4 phòng tốt nhất
                .collect(Collectors.toList());
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
