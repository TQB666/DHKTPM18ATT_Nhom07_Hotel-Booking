package com.hotelbooking.hotel_booking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hotelbooking.hotel_booking.domain.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByConfirmationToken(String token);
    List<Booking> findAllByOrderByIdDesc();

    // thực hiện cho lịch sử đặt phòng
    List<Booking> findByUserIdOrderByIdDesc(Long userId);

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE MONTH(b.bookingDate) = MONTH(CURRENT_DATE)  AND b.status = 'CONFIRMED'")
    Double sumMonthlyRevenue();

    List<Booking> findTop10ByOrderByBookingDateDesc();

    /** Tổng booking theo hotel */
    @Query("""
        SELECT COUNT(b)
        FROM Booking b
        JOIN b.bookingDetails bd
        JOIN bd.room r
        WHERE r.hotel.id = :hotelId
    """)
    long countByHotel(@Param("hotelId") Long hotelId);

    /** Doanh thu tháng theo hotel */
    @Query("""
        SELECT SUM(b.totalPrice)
        FROM Booking b
        JOIN b.bookingDetails bd
        JOIN bd.room r
        WHERE r.hotel.id = :hotelId
        AND MONTH(b.bookingDate) = MONTH(CURRENT_DATE)
        AND YEAR(b.bookingDate) = YEAR(CURRENT_DATE)
             AND b.status = 'CONFIRMED'
    """)
    Double sumMonthlyRevenueByHotel(@Param("hotelId") Long hotelId);

    /** Top 10 booking gần nhất theo hotel */
    @Query("""
        SELECT b
        FROM Booking b
        JOIN b.bookingDetails bd
        JOIN bd.room r
        WHERE r.hotel.id = :hotelId
        ORDER BY b.bookingDate DESC
    """)
    List<Booking> findTop10ByHotel(@Param("hotelId") Long hotelId);
} 
