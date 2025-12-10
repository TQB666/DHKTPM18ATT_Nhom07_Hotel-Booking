package com.hotelbooking.hotel_booking.controller.client;


import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hotelbooking.hotel_booking.domain.Hotel;
import com.hotelbooking.hotel_booking.service.HotelService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/hotels")
public class HotelController {
    private final HotelService hotelService;

    // Lấy danh sách khách sạn, có thể lọc theo nếu client truyền query param
    @GetMapping("/filter")
    public Page<Hotel> getHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) List<Integer> stars,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size)  {
        return hotelService.searchHotels(city, name, stars, minPrice, maxPrice,page, size);
        }
    @GetMapping("/{id}")
    public Hotel getHotelById(@PathVariable Long id) {
        return hotelService.getHotelById(id);
    }


    
        

    
}
