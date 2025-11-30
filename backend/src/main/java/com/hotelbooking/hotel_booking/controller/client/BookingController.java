package com.hotelbooking.hotel_booking.controller.client;

import java.util.List;

import com.hotelbooking.hotel_booking.domain.dto.BookingHistoryDTO;
import com.hotelbooking.hotel_booking.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hotelbooking.hotel_booking.domain.Booking;
import com.hotelbooking.hotel_booking.domain.Cart;
import com.hotelbooking.hotel_booking.domain.CartDetail;
import com.hotelbooking.hotel_booking.domain.User;
import com.hotelbooking.hotel_booking.domain.dto.BookingInfo;
import com.hotelbooking.hotel_booking.service.BookingService;
import com.hotelbooking.hotel_booking.service.CartService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/booking")
@AllArgsConstructor
public class BookingController {
    private final BookingService bookingService;
    private final CartService cartService;


    private final UserService userService;

    @PostMapping("/checkout")
    public ResponseEntity<String> checkout(@RequestBody BookingInfo bookingInfo) {
        try {
            User user = cartService.getCurrentUser();

            List<CartDetail> items = bookingInfo.getCartItemIds().stream()
                    .map(cartService::findCartDetailById)
                    .toList();

            bookingService.createBooking(bookingInfo, user, items);
            Cart cart = cartService.getCurrentUserCart(user);
            cartService.updateCartItemCount(cart);
            return ResponseEntity.ok("Đặt phòng thành công!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi khi xử lý đặt phòng.");
        }
    }

    @GetMapping("/confirm")
    public ResponseEntity<String> confirmBooking(@RequestParam("token") String token) {
        Booking booking = bookingService.findByConfirmationToken(token)
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ"));

        booking.setStatus("CONFIRMED");
        bookingService.save(booking);

        return ResponseEntity.ok("🎉 Đặt phòng của bạn đã được xác nhận thành công!");
    }

    @GetMapping("/history")
    public ResponseEntity<List<BookingHistoryDTO>> getHistory() {
        // 1. Lấy thông tin user đang đăng nhập từ Security Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        // 2. Lấy ID user từ email (hoặc lấy trực tiếp từ Principal nếu đã config)
        Long userId = userService.getUserByEmail(currentEmail).getId();

        // 3. Gọi Service
        List<BookingHistoryDTO> history = bookingService.getUserBookingHistory(userId);

        return ResponseEntity.ok(history);
    }
}
