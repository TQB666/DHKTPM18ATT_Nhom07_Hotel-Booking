package com.hotelbooking.hotel_booking.controller.admin;

import com.hotelbooking.hotel_booking.domain.Room;
import com.hotelbooking.hotel_booking.domain.Hotel;
import com.hotelbooking.hotel_booking.domain.dto.RoomDTO;
import com.hotelbooking.hotel_booking.service.RoomService;
import com.hotelbooking.hotel_booking.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminRoomController {
    private final RoomService roomService;
    private final HotelService hotelService;

    @GetMapping
    public List<RoomDTO> getAllRooms() {
        List<RoomDTO> rooms = roomService.getAllRooms();
        return rooms;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRoomById(@PathVariable Long id) {
        RoomDTO room = roomService.getRoomById(id);
        if (room == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(room);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @RequestBody Room updated) {
        Room updatedRoom = roomService.updateRoom(id, updated);
        if (updatedRoom == null) {
            return ResponseEntity.notFound().build();
        }
        RoomDTO updatedRoomDTO = convertToDTO(updatedRoom);
        return ResponseEntity.ok(updatedRoomDTO);
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody RoomDTO roomDTO) {
        try {
            // Validation
            if (roomDTO.getName() == null || roomDTO.getName().isEmpty()) {
                return ResponseEntity.badRequest().body("Tên phòng không được để trống");
            }

            if (roomDTO.getCapacity() < 1) {
                return ResponseEntity.badRequest().body("Sức chứa phải lớn hơn 0");
            }

            if (roomDTO.getPrice() < 0) {
                return ResponseEntity.badRequest().body("Giá không được âm");
            }

            if (roomDTO.getQuantity() < 1) {
                return ResponseEntity.badRequest().body("Số lượng phòng phải lớn hơn 0");
            }

            if (roomDTO.getHotel() == null) {
                return ResponseEntity.badRequest().body("Khách sạn không được để trống");
            }

            // Fetch hotel
            Hotel hotel = hotelService.getHotelById(roomDTO.getHotel().getId());
            if (hotel == null) {
                return ResponseEntity.badRequest().body("Khách sạn không tồn tại");
            }

            // Create room
            Room room = new Room();
            room.setName(roomDTO.getName());
            room.setCapacity(roomDTO.getCapacity());
            room.setPrice(roomDTO.getPrice());
            room.setQuantity(roomDTO.getQuantity());
            room.setDescription(roomDTO.getDescription());
            room.setStatus(roomDTO.getStatus() != null ? roomDTO.getStatus() : "AVAILABLE");
            room.setImage(roomDTO.getImage());
            room.setHotel(hotel);

            Room createdRoom = roomService.createRoom(room);
            RoomDTO responseDTO = convertToDTO(createdRoom);

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    private RoomDTO convertToDTO(Room room) {
        return roomService.convertToDTO(room);
    }
}
