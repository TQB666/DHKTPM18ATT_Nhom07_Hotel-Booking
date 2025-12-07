package com.hotelbooking.hotel_booking.service;

import com.hotelbooking.hotel_booking.domain.dto.BookingDTO;
import com.hotelbooking.hotel_booking.domain.dto.UserDTO;
import org.springframework.stereotype.Service;

import com.hotelbooking.hotel_booking.domain.Role;
import com.hotelbooking.hotel_booking.domain.User;
import com.hotelbooking.hotel_booking.domain.dto.SignupDTO;
import com.hotelbooking.hotel_booking.domain.dto.ChangePasswordDTO;
import com.hotelbooking.hotel_booking.repository.RoleRepository;
import com.hotelbooking.hotel_booking.repository.UserRepository;

import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;


    public User signupDTOtoUser(SignupDTO signupDTO) {
        User user = new User();
        user.setEmail(signupDTO.getEmail());
        user.setFullName(signupDTO.getFirstName() + "" + signupDTO.getLastName());
        user.setPhone(signupDTO.getPhone());
        user.setPassword(signupDTO.getPassword());
        return user;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public void handleSaveUser(User user){
        userRepository.save(user);
    }

    public Role getRoleByName(String nameRole){
        return roleRepository.findByName(nameRole);
    }

    public List<UserDTO> getAllUsersDTO() {
        return userRepository.findAll().stream()
                .map(user -> {
                    UserDTO dto = new UserDTO();
                    dto.setId(user.getId());
                    dto.setFullName(user.getFullName());
                    dto.setEmail(user.getEmail());
                    dto.setPhone(user.getPhone());
                    dto.setAvatar(user.getAvatar());
                    dto.setRoleName(user.getRole() != null ? user.getRole().getName() : null);
                    dto.setCreatedAt(user.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }



    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return null;

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAvatar(user.getAvatar());
        dto.setRoleName(user.getRole() != null ? user.getRole().getName() : "USER");

        // 🟦 Convert danh sách booking
        if (user.getBookings() != null) {
            List<BookingDTO> bookingDTOs = user.getBookings().stream()
                    .map(b -> {
                        BookingDTO dtoB = new BookingDTO();
                        dtoB.setId(b.getId());
                        dtoB.setBookingDate(b.getBookingDate());
                        dtoB.setStatus(b.getStatus());
                        dtoB.setTotalPrice(b.getTotalPrice());
                        return dtoB;
                    })
                    .toList();

            dto.setBookings(bookingDTOs);
        }


        return dto;
    }


    public UserDTO updateUser(Long id, UserDTO userDTO, MultipartFile avatar) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update thông tin cơ bản
        user.setFullName(userDTO.getFullName());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());

        if (userDTO.getRoleName() != null) {
            Role role = roleRepository.findByName(userDTO.getRoleName());
            user.setRole(role);
        }

        // ⭐ Upload avatar nếu có upload file mới
        if (avatar != null && !avatar.isEmpty()) {
            try {
                String url = cloudinaryService.uploadImage(avatar, "avatars");
                user.setAvatar(url);
            } catch (Exception e) {
                throw new RuntimeException("Lỗi upload ảnh: " + e.getMessage());
            }
        }

        userRepository.save(user);

        // Trả DTO
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAvatar(user.getAvatar());
        dto.setRoleName(user.getRole() != null ? user.getRole().getName() : null);
        dto.setCreatedAt(user.getCreatedAt());

        return dto;
    }


    public void changePassword(String email, ChangePasswordDTO changePasswordDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(changePasswordDTO.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
        if (passwordEncoder.matches(changePasswordDTO.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }

        // Mã hóa và lưu mật khẩu mới
        user.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        userRepository.save(user);
    }

}
