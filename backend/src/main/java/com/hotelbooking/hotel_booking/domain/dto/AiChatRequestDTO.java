package com.hotelbooking.hotel_booking.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiChatRequestDTO {
    private String message;
    private String context; // Optional: hotel-related context
}
