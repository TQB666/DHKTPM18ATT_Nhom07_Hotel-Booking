package com.hotelbooking.hotel_booking.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomDTO {
    private long id;
    private String name;
    private int capacity;
    private double price;
    private int quantity;
    private String description;
    private String status;
    private String image;
    private HotelDTO hotel;
    private Long hotelId;
}
