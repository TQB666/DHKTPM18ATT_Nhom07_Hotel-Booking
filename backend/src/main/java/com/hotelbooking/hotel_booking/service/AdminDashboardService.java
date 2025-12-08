package com.hotelbooking.hotel_booking.service;

import com.hotelbooking.hotel_booking.domain.Booking;
import com.hotelbooking.hotel_booking.domain.dto.AdminDashboardResponse;
import com.hotelbooking.hotel_booking.domain.dto.DashboardBookingItem;
import com.hotelbooking.hotel_booking.repository.BookingRepository;
import com.hotelbooking.hotel_booking.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public AdminDashboardResponse getDashboardData() {
        AdminDashboardResponse res = new AdminDashboardResponse();

        // Tổng booking (toàn hệ thống)
        res.setTotalBookings(bookingRepository.count());

        // Doanh thu tháng (CONFIRMED only)
        Double revenue = bookingRepository.sumMonthlyRevenue();
        res.setMonthlyRevenue(revenue != null ? revenue : 0);

        long totalRooms = roomRepository.count();
        long bookedRooms = roomRepository.countBookedRooms();

        res.setAvailableRooms(totalRooms - bookedRooms);

        res.setOccupancyRate(
                totalRooms > 0 ? (double) bookedRooms / totalRooms * 100 : 0
        );

        // 10 booking gần nhất (toàn hệ thống)
        List<Booking> recent = bookingRepository.findTop10ByOrderByBookingDateDesc();
        res.setRecentBookings(recent.stream()
                .map(this::toDashboardItem)
                .collect(Collectors.toList()));

        return res;
    }

    public AdminDashboardResponse getDashboardDataByHotel(Long hotelId) {
        AdminDashboardResponse res = new AdminDashboardResponse();

        // Tổng booking theo hotel
        res.setTotalBookings(bookingRepository.countByHotel(hotelId));

        // Doanh thu tháng theo hotel (CONFIRMED only)
        Double revenue = bookingRepository.sumMonthlyRevenueByHotel(hotelId);
        res.setMonthlyRevenue(revenue != null ? revenue : 0);

        long totalRooms = roomRepository.countByHotel(hotelId);
        long bookedRooms = roomRepository.countBookedRoomsByHotel(hotelId);

        res.setAvailableRooms(totalRooms - bookedRooms);

        res.setOccupancyRate(
                totalRooms > 0 ? (double) bookedRooms / totalRooms * 100 : 0
        );

        // 10 booking gần nhất theo hotel
        List<Booking> recent = bookingRepository.findTop10ByHotel(hotelId);
        res.setRecentBookings(recent.stream()
                .map(this::toDashboardItem)
                .collect(Collectors.toList()));

        // Optional: set hotel info on response
        // res.applyHotelFilter(hotelId, hotelName, hotelCity);

        return res;
    }

    private DashboardBookingItem toDashboardItem(Booking b) {
        DashboardBookingItem dto = new DashboardBookingItem();
        dto.setId(b.getId());
        dto.setBookingDate(b.getBookingDate());
        dto.setStatus(b.getStatus());
        dto.setTotalPrice(b.getTotalPrice());

        String name = null;

        // Nếu Booking có quan hệ User
        if (b.getUser() != null) {
            name = b.getUser().getFullName();

            if (name == null || name.isBlank()) {
                name = b.getUser().getEmail();
            }
        }

        // Nếu không có User thì fallback (tuỳ entity bạn)
        dto.setCustomerName(name != null ? name : "Khách vãng lai");

        return dto;
    }

}
