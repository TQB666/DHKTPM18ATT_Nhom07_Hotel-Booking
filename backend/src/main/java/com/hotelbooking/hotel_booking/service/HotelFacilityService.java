package com.hotelbooking.hotel_booking.service;

import java.util.Set;

import org.springframework.stereotype.Service;

import com.hotelbooking.hotel_booking.domain.Facility;
import com.hotelbooking.hotel_booking.domain.Hotel;
import com.hotelbooking.hotel_booking.repository.FacilityRepository;
import com.hotelbooking.hotel_booking.repository.HotelRepository;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class HotelFacilityService {
    private final HotelRepository hotelRepository;
    private final FacilityRepository facilityRepository;

    public Set<Facility> getFacilitiesByHotelId(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
            .orElseThrow(() -> new RuntimeException("Hotel not found"));
        return hotel.getFacilities();
    }

    @Transactional
    public void addFacilityToHotel(Hotel hotel, Facility facility) {
        if (!hotel.getFacilities().contains(facility)) {
            hotel.getFacilities().add(facility);
            hotelRepository.save(hotel);
        }
    }

    @Transactional
    public void removeFacilityFromHotel(Long hotelId, Long facilityId) {
        Hotel hotel = hotelRepository.findById(hotelId)
            .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
        hotel.getFacilities().removeIf(facility -> facility.getId().equals(facilityId));
        hotelRepository.save(hotel);
    }

    public boolean existsByHotelAndFacility(Long hotelId, Long facilityId) {
        Hotel hotel = hotelRepository.findById(hotelId)
            .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
        return hotel.getFacilities().stream()
            .anyMatch(facility -> facility.getId().equals(facilityId));
    }
}
