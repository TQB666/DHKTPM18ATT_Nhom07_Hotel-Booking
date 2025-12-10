package com.hotelbooking.hotel_booking.domain.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class CartDataRender {
    private long id;
    private String image;
    private String hotelName;
    private String roomName;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private long quantity;
    private double price;
    private long hotel_id;
    private String statusHotel;
}
