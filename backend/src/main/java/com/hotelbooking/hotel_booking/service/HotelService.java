package com.hotelbooking.hotel_booking.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.hotelbooking.hotel_booking.domain.Hotel;
import com.hotelbooking.hotel_booking.domain.Image;
import com.hotelbooking.hotel_booking.domain.Room;
import com.hotelbooking.hotel_booking.repository.HotelRepository;
import com.hotelbooking.hotel_booking.repository.ImageRepository;

import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
@Service
@AllArgsConstructor
public class HotelService {
    private final HotelRepository hotelRepository;
    private Cloudinary cloudinary;
    private ImageRepository imageRepository;
    public List<Hotel> getAllHotels(){
        return hotelRepository.findAll();
    }

    
    public List<Map<String, Object>> getHotelCountByCity() {
        List<Object[]> results = hotelRepository.countHotelsByCity();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("city", row[0]);
            map.put("totalHotels", row[1]);
            response.add(map);
        }

        return response;
    }

//    public List<Hotel> searchHotels(String city, String name, Integer stars,
//                                Double minPrice, Double maxPrice) {
//    Specification<Hotel> spec = (root, query, cb) -> {
//        List<Predicate> predicates = new ArrayList<>();
//
//        if (city != null && !city.isEmpty()) {
//            predicates.add(cb.like(cb.lower(root.get("city")), "%" + city.toLowerCase() + "%"));
//        }
//        if (name != null && !name.isEmpty()) {
//            predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
//        }
//        if (stars != null) {
//            predicates.add(cb.equal(root.get("rating"), stars));
//        }
//
//        // Subquery để tính AVG(Room.price)
//        if (minPrice != null || maxPrice != null) {
//            Subquery<Double> sub = query.subquery(Double.class);
//            Root<Room> roomRoot = sub.from(Room.class);
//            sub.select(cb.avg(roomRoot.get("price")))
//               .where(cb.equal(roomRoot.get("hotel"), root));
//
//            if (minPrice != null) {
//                predicates.add(cb.greaterThanOrEqualTo(sub, minPrice));
//            }
//            if (maxPrice != null) {
//                predicates.add(cb.lessThanOrEqualTo(sub, maxPrice));
//            }
//        }
//
//        return cb.and(predicates.toArray(new Predicate[0]));
//    };
//
//    return hotelRepository.findAll(spec);
//    }
// Chỉnh sửa pagination phần trang
public Page<Hotel> searchHotels(String city, String name, Integer stars,
                                Double minPrice, Double maxPrice,
                                int page, int size) { // Thêm tham số page, size

    // Tạo đối tượng Pageable
    Pageable pageable = PageRequest.of(page, size);

    Specification<Hotel> spec = (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();

        predicates.add(cb.equal(root.get("status"), "ACTIVE"));

        if (city != null && !city.isEmpty()) {
            predicates.add(cb.like(cb.lower(root.get("city")), "%" + city.toLowerCase() + "%"));
        }
        if (name != null && !name.isEmpty()) {
            predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
        }
        if (stars != null) {
            predicates.add(cb.equal(root.get("rating"), stars));
        }

        // Xử lý Subquery giá (giữ nguyên logic của bạn)
        if (minPrice != null || maxPrice != null) {
            Subquery<Double> sub = query.subquery(Double.class);
            Root<Room> roomRoot = sub.from(Room.class);
            sub.select(cb.avg(roomRoot.get("price")))
                    .where(cb.equal(roomRoot.get("hotel"), root));

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(sub, minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(sub, maxPrice));
            }
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    };

    // Trả về Page thay vì List
    return hotelRepository.findAll(spec, pageable);
}
    public Hotel getHotelById(Long id){
        return hotelRepository.findById(id).get();
    }

    public Hotel createHotel(Hotel hotel){
        return hotelRepository.save(hotel);
    }

    
    public Hotel updateHotel(Long id, Hotel updatedHotel) {
        Hotel existingHotel = hotelRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));

        // Update các field
        existingHotel.setName(updatedHotel.getName());
        existingHotel.setCity(updatedHotel.getCity());
        existingHotel.setAddress(updatedHotel.getAddress());
        existingHotel.setRating(updatedHotel.getRating());
        existingHotel.setDetailDesc(updatedHotel.getDetailDesc());
        existingHotel.setPhone(updatedHotel.getPhone()); 
        existingHotel.setShortDesc(updatedHotel.getShortDesc()); 

        existingHotel.setImage(updatedHotel.getImage());
        return hotelRepository.save(existingHotel);
    }

    public List<Image> uploadGalleryImages(Long hotelId, List<MultipartFile> files) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        List<Image> imageList = new ArrayList<>();
        try {
            for (MultipartFile file : files) {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "hotel_booking"
            ));

            String url = uploadResult.get("secure_url").toString();

            Image img = new Image();
            img.setHotel(hotel);
            img.setImageUrl(url);
            img.setName(file.getOriginalFilename());

            imageList.add(img);
        }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        

        return imageRepository.saveAll(imageList);
    }

    // Soft delete: set UNAVAILABLE
    public void softDelete(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        hotel.setStatus("UNAVAILABLE");
        hotelRepository.save(hotel);
    }

    // Activate: set ACTIVE
    public void activateHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        hotel.setStatus("ACTIVE");
        hotelRepository.save(hotel);
    }


}

