package com.hotelbooking.hotel_booking.controller.admin;

import java.util.List;

import com.hotelbooking.hotel_booking.domain.dto.UserDTO;
import com.hotelbooking.hotel_booking.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public List<UserDTO> getAllUsers() {
        List<UserDTO> users = userService.getAllUsersDTO();
       return userService.getAllUsersDTO();
    }

    // Lấy chi tiết user theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }


    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestPart("user") UserDTO userDTO,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar
    ) {
        UserDTO updatedUser = userService.updateUser(id, userDTO, avatar);
        return ResponseEntity.ok(updatedUser);
    }




}
