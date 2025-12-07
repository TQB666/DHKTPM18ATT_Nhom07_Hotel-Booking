package com.hotelbooking.hotel_booking.controller.client;

import com.hotelbooking.hotel_booking.domain.User;
import com.hotelbooking.hotel_booking.domain.dto.UserDTO;
import com.hotelbooking.hotel_booking.domain.dto.ChangePasswordDTO;
import com.hotelbooking.hotel_booking.service.UserService;
import com.hotelbooking.hotel_booking.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import java.io.IOException;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final CloudinaryService cloudinaryService;

    /**
     * Lấy profile của user hiện tại (authenticated)
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            // Lấy username từ SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String email = authentication.getName();
            User user = userService.getUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            UserDTO userDTO = new UserDTO();
            userDTO.setId(user.getId());
            userDTO.setFullName(user.getFullName());
            userDTO.setEmail(user.getEmail());
            userDTO.setPhone(user.getPhone());
            userDTO.setAvatar(user.getAvatar());
            userDTO.setRoleName(user.getRole() != null ? user.getRole().getName() : "USER");
            userDTO.setCreatedAt(user.getCreatedAt());

            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Cập nhật profile của user hiện tại
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserDTO userDTO) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String email = authentication.getName();
            User user = userService.getUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Cập nhật thông tin
            if (userDTO.getFullName() != null && !userDTO.getFullName().isEmpty()) {
                user.setFullName(userDTO.getFullName());
            }
            if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()) {
                user.setEmail(userDTO.getEmail());
            }
            if (userDTO.getPhone() != null && !userDTO.getPhone().isEmpty()) {
                user.setPhone(userDTO.getPhone());
            }
            if (userDTO.getAvatar() != null && !userDTO.getAvatar().isEmpty()) {
                user.setAvatar(userDTO.getAvatar());
            }

            userService.handleSaveUser(user);

            // Trả về thông tin đã cập nhật
            UserDTO updatedDTO = new UserDTO();
            updatedDTO.setId(user.getId());
            updatedDTO.setFullName(user.getFullName());
            updatedDTO.setEmail(user.getEmail());
            updatedDTO.setPhone(user.getPhone());
            updatedDTO.setAvatar(user.getAvatar());
            updatedDTO.setRoleName(user.getRole() != null ? user.getRole().getName() : "USER");
            updatedDTO.setCreatedAt(user.getCreatedAt());

            return ResponseEntity.ok(updatedDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Cập nhật avatar của user hiện tại
     */
    @PutMapping("/profile/avatar")
    public ResponseEntity<?> updateAvatar(@RequestBody UserDTO userDTO) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String email = authentication.getName();
            User user = userService.getUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Cập nhật avatar
            if (userDTO.getAvatar() != null && !userDTO.getAvatar().isEmpty()) {
                user.setAvatar(userDTO.getAvatar());
                userService.handleSaveUser(user);
            }

            // Trả về thông tin đã cập nhật
            UserDTO updatedDTO = new UserDTO();
            updatedDTO.setId(user.getId());
            updatedDTO.setFullName(user.getFullName());
            updatedDTO.setEmail(user.getEmail());
            updatedDTO.setPhone(user.getPhone());
            updatedDTO.setAvatar(user.getAvatar());
            updatedDTO.setRoleName(user.getRole() != null ? user.getRole().getName() : "USER");
            updatedDTO.setCreatedAt(user.getCreatedAt());

            return ResponseEntity.ok(updatedDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Upload avatar ảnh (từ file MultipartFile)
     */
    @PostMapping("/profile/avatar/upload")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String email = authentication.getName();
            User user = userService.getUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Upload ảnh lên Cloudinary
            String avatarUrl = cloudinaryService.uploadImage(file, "avatars");

            // Cập nhật avatar URL
            user.setAvatar(avatarUrl);
            userService.handleSaveUser(user);

            // Trả về thông tin đã cập nhật
            UserDTO updatedDTO = new UserDTO();
            updatedDTO.setId(user.getId());
            updatedDTO.setFullName(user.getFullName());
            updatedDTO.setEmail(user.getEmail());
            updatedDTO.setPhone(user.getPhone());
            updatedDTO.setAvatar(user.getAvatar());
            updatedDTO.setRoleName(user.getRole() != null ? user.getRole().getName() : "USER");
            updatedDTO.setCreatedAt(user.getCreatedAt());

            return ResponseEntity.ok(updatedDTO);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Lỗi khi upload ảnh: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Đổi mật khẩu của user hiện tại
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String email = authentication.getName();

            // Validate input
            if (changePasswordDTO.getCurrentPassword() == null || changePasswordDTO.getCurrentPassword().isEmpty()) {
                return ResponseEntity.badRequest().body("Mật khẩu hiện tại không được để trống");
            }

            if (changePasswordDTO.getNewPassword() == null || changePasswordDTO.getNewPassword().isEmpty()) {
                return ResponseEntity.badRequest().body("Mật khẩu mới không được để trống");
            }

            if (changePasswordDTO.getNewPassword().length() < 6) {
                return ResponseEntity.badRequest().body("Mật khẩu mới phải có ít nhất 6 ký tự");
            }

            // Gọi service để đổi mật khẩu
            userService.changePassword(email, changePasswordDTO);

            return ResponseEntity.ok("Mật khẩu đã được đổi thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
