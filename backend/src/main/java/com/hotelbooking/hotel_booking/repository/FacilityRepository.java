package com.hotelbooking.hotel_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hotelbooking.hotel_booking.domain.Facility;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    boolean existsByName(String name);
}
