package com.hotelbooking.hotel_booking.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.hotelbooking.hotel_booking.domain.Hotel;
import com.hotelbooking.hotel_booking.domain.Image;
import com.hotelbooking.hotel_booking.service.HotelService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/admin/hotels")
public class AdminHotelController {

    private final HotelService hotelService;

    // Lọc danh sách khách sạn
    @GetMapping("/filter")
    public Page<Hotel> getHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer stars,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size)  {
        return hotelService.searchHotels(city, name, stars, minPrice, maxPrice,page, size);
    }

    // Lấy chi tiết 1 khách sạn
    @GetMapping("/{id}")
    public Hotel getHotelById(@PathVariable Long id) {
        return hotelService.getHotelById(id);
    }

    // Lấy toàn bộ khách sạn
    @GetMapping("")
    public List<Hotel> getAllHotels() {
        return hotelService.getAllHotels();
    }

    // Tạo khách sạn mới
    @PostMapping("")
    public Hotel createHotel(@RequestBody Hotel hotel) {
        return hotelService.createHotel(hotel);
    }

    // Cập nhật khách sạn
    @PutMapping("/{id}")
    public Hotel updateHotel(@PathVariable Long id, @RequestBody Hotel hotel) {
        return hotelService.updateHotel(id, hotel);
    }

    @PostMapping("/{id}/images")
    public List<Image> uploadGalleryImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {

        return hotelService.uploadGalleryImages(id, files);
    }


    // Xóa mềm khách sạn (soft delete)
    @DeleteMapping("/{id}")
    public String softDeleteHotel(@PathVariable Long id) {
        hotelService.softDelete(id);
        return "Hotel " + id + " has been set to UNAVAILABLE";
    }

    // Kích hoạt lại khách sạn
    @PutMapping("/{id}/activate")
    public String activateHotel(@PathVariable Long id) {
        hotelService.activateHotel(id);
        return "Hotel " + id + " is now ACTIVE";
    }
}


