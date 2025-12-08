package com.hotelbooking.hotel_booking.repository;

import com.hotelbooking.hotel_booking.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query("""
        SELECT COUNT(DISTINCT r.id)
        FROM Room r
        JOIN BookingDetail bd ON bd.room.id = r.id
        JOIN Booking b ON bd.booking.id = b.id
        WHERE b.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
        """)
    long countBookedRooms();
}