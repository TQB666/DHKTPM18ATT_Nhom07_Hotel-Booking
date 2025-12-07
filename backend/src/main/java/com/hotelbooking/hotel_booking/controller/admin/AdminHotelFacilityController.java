package com.hotelbooking.hotel_booking.controller.admin;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hotelbooking.hotel_booking.domain.Hotel;
import com.hotelbooking.hotel_booking.domain.Facility;
import com.hotelbooking.hotel_booking.domain.dto.FacilityDTO;
import com.hotelbooking.hotel_booking.domain.dto.HotelFacilityDTO;
import com.hotelbooking.hotel_booking.service.HotelService;
import com.hotelbooking.hotel_booking.service.FacilityService;
import com.hotelbooking.hotel_booking.service.HotelFacilityService;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminHotelFacilityController {
    private final HotelService hotelService;
    private final FacilityService facilityService;
    private final HotelFacilityService hotelFacilityService;

    // Lấy tất cả facilities trong hệ thống (có thể filter theo type)
    @GetMapping("/facilities")
    public ResponseEntity<List<Facility>> getAllFacilities() {
        
        List<Facility> facilities = facilityService.getAll();
        return ResponseEntity.ok(facilities);
    }

    // Tạo facility mới trong hệ thống
    @PostMapping("/facilities")
    public ResponseEntity<Facility> createFacility(@RequestBody FacilityDTO request) {
        try {
            // Kiểm tra trùng tên facility
            if (facilityService.existsByName(request.getName())) {
                return ResponseEntity.badRequest().body(null);
            }
            
            Facility facility = new Facility();
            facility.setName(request.getName());
            facility.setType(request.getType());
            
            Facility savedFacility = facilityService.save(facility);
            return ResponseEntity.ok(savedFacility);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    

    @GetMapping("/hotels/{hotelId}/facilities")
    public ResponseEntity<List<Facility>> getHotelFacilities(@PathVariable Long hotelId) {
        Hotel hotel = hotelService.getHotelById(hotelId);
        if (hotel == null) {
            return ResponseEntity.notFound().build();
        }
        Set<Facility> facilitiesSet = hotelFacilityService.getFacilitiesByHotelId(hotelId);
        
        // Convert Set to List
        List<Facility> facilitiesList = new ArrayList<>(facilitiesSet);
        
        return ResponseEntity.ok(facilitiesList);
    }

    // Thêm facility vào hotel
    @PostMapping("/hotels/{hotelId}/facilities")
    public ResponseEntity<?> addFacilityToHotel(
            @PathVariable Long hotelId,
            @RequestBody HotelFacilityDTO request) {
        try {
            Hotel hotel = hotelService.getHotelById(hotelId);
            if (hotel == null) {
                return ResponseEntity.notFound().build();
            }

            Facility facility = facilityService.findById(request.getFacilityId());
            if (facility == null) {
                return ResponseEntity.notFound().build();
            }

            // Kiểm tra facility đã có trong hotel chưa
            if (hotelFacilityService.existsByHotelAndFacility(hotelId, request.getFacilityId())) {
                return ResponseEntity.badRequest().body("Facility already exists in hotel");
            }

            hotelFacilityService.addFacilityToHotel(hotel, facility);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Xóa facility khỏi hotel (không xóa khỏi hệ thống)
    @DeleteMapping("/hotels/{hotelId}/facilities/{facilityId}")
    public ResponseEntity<?> removeFacilityFromHotel(
            @PathVariable Long hotelId,
            @PathVariable Long facilityId) {
        try {
            Hotel hotel = hotelService.getHotelById(hotelId);
            if (hotel == null) {
                return ResponseEntity.notFound().build();
            }

            Facility facility = facilityService.findById(facilityId);
            if (facility == null) {
                return ResponseEntity.notFound().build();
            }

            hotelFacilityService.removeFacilityFromHotel(hotelId, facilityId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}