package com.hotelbooking.hotel_booking.domain.dto;

import lombok.Data;

import java.util.List;

@Data
public class AdminDashboardResponse {
    private long totalBookings;
    private double monthlyRevenue;
    private long availableRooms;
    private double occupancyRate;

    private List<BookingDTO> recentBookings;
 }
