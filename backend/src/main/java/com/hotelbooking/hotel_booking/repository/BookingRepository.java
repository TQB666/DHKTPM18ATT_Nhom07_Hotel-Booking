package com.hotelbooking.hotel_booking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.hotelbooking.hotel_booking.domain.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByConfirmationToken(String token);
    List<Booking> findAllByOrderByIdDesc();

    // thực hiện cho lịch sử đặt phòng
    List<Booking> findByUserIdOrderByIdDesc(Long userId);

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE MONTH(b.bookingDate) = MONTH(CURRENT_DATE)")
    Double sumMonthlyRevenue();

    List<Booking> findTop10ByOrderByBookingDateDesc();
} 
