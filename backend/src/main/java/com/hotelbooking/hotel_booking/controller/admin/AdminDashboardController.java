package com.hotelbooking.hotel_booking.controller.admin;

import com.hotelbooking.hotel_booking.domain.Hotel;
import com.hotelbooking.hotel_booking.domain.dto.AdminDashboardResponse;
import com.hotelbooking.hotel_booking.service.AdminDashboardService;
import com.hotelbooking.hotel_booking.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboard(
            @RequestParam(required = false) Long hotelId
    ) {
        if (hotelId == null) {
            return dashboardService.getDashboardData();
        }
        return dashboardService.getDashboardDataByHotel(hotelId);
    }

    private final HotelService hotelService;

    @GetMapping("/hotel-list")
    public List<Hotel> getHotels() {
        return hotelService.getAllHotels();
    }

}
