package com.hotelbooking.hotel_booking.service;

import com.hotelbooking.hotel_booking.domain.dto.AdminDashboardResponse;
import com.hotelbooking.hotel_booking.domain.dto.BookingDTO;
import com.hotelbooking.hotel_booking.repository.BookingRepository;
import com.hotelbooking.hotel_booking.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public AdminDashboardResponse getDashboardData() {

        AdminDashboardResponse res = new AdminDashboardResponse();

        // Tổng booking
        res.setTotalBookings(bookingRepository.count());

        // Doanh thu tháng hiện tại
        Double revenue = bookingRepository.sumMonthlyRevenue();
        res.setMonthlyRevenue(revenue != null ? revenue : 0);

        long totalRooms = roomRepository.count();
        long bookedRooms = roomRepository.countBookedRooms();

        // Phòng trống
        res.setAvailableRooms(totalRooms - bookedRooms);

        // Tỷ lệ sử dụng phòng
        res.setOccupancyRate(
                totalRooms > 0
                        ? (double) bookedRooms / totalRooms * 100
                        : 0
        );

        // 10 booking gần nhất
        res.setRecentBookings(
                bookingRepository.findTop10ByOrderByBookingDateDesc()
                        .stream()
                        .map(b -> {
                            BookingDTO dto = new BookingDTO();
                            dto.setId(b.getId());
                            dto.setBookingDate(b.getBookingDate());
                            dto.setStatus(b.getStatus());
                            dto.setTotalPrice(b.getTotalPrice());
                            return dto;
                        })
                        .collect(Collectors.toList())
        );

        return res;
    }
}
