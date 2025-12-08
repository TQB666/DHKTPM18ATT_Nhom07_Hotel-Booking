package com.hotelbooking.hotel_booking.domain.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DashboardBookingItem {

    private Long id;
    private LocalDateTime bookingDate;
    private String status;
    private Double totalPrice;
    private String customerName;

}