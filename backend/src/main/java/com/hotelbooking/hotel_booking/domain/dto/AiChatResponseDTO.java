package com.hotelbooking.hotel_booking.domain.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiChatResponseDTO {
    private String response;
    private List<HotelDTO> hotelSuggestions;
    private List<RoomDTO> roomSuggestions;
    private String timestamp;
}
