package com.hotelbooking.hotel_booking.domain.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class BookingHistoryDTO {
    private Long id;
    private String confirmationToken;
    private String status;
    private double totalPrice;
    private List<BookingDetailDTO> details;
    @Data
    public static class BookingDetailDTO {
        private String roomName; // Lấy từ entity Room
        private String roomType;
        private LocalDate checkIn;
        private LocalDate checkOut;
        private double price;
        private int quantity;
    }
}
