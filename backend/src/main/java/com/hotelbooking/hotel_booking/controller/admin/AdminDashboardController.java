package com.hotelbooking.hotel_booking.controller.admin;

import com.hotelbooking.hotel_booking.domain.dto.AdminDashboardResponse;
import com.hotelbooking.hotel_booking.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping
    public AdminDashboardResponse getDashboard() {
        return dashboardService.getDashboardData();
    }
}
