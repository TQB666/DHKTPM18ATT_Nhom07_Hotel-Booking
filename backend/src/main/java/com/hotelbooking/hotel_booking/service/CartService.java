package com.hotelbooking.hotel_booking.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.hotelbooking.hotel_booking.domain.Cart;
import com.hotelbooking.hotel_booking.domain.CartDetail;
import com.hotelbooking.hotel_booking.domain.Room;
import com.hotelbooking.hotel_booking.domain.User;
import com.hotelbooking.hotel_booking.domain.dto.CartDataRender;
import com.hotelbooking.hotel_booking.repository.CartDetailRepository;
import com.hotelbooking.hotel_booking.repository.CartRepository;
import com.hotelbooking.hotel_booking.repository.RoomRepository;
import com.hotelbooking.hotel_booking.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final CartDetailRepository cartDetailRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;


    // Lấy user hiện tại từ authentication
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Lấy giỏ hàng của user hiện tại
    public Cart getCurrentUserCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    // Tạo mới giỏ hàng nếu chưa có
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setSum(0);
                    return cartRepository.save(newCart);
                });
    }

    public CartDetail addToCart(Long roomId, int quantity, int guests, 
                               LocalDate checkIn, LocalDate checkOut) {
        User user = getCurrentUser();
        Cart cart = getCurrentUserCart(user);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Kiểm tra số lượng phòng còn trống
        if (room.getQuantity() < quantity) {
            throw new RuntimeException("Số lượng phòng không đủ");
        }

        // Kiểm tra xem phòng đã có trong giỏ hàng chưa
        Optional<CartDetail> existingCartDetail = cartDetailRepository
                .findByCartAndRoom(cart, room);

        CartDetail cartDetail;
        boolean isNewItem = false;
        
        if (existingCartDetail.isPresent()) {
            cartDetail = existingCartDetail.get();
            cartDetail.setQuantity(cartDetail.getQuantity() + quantity);
        } else {
            cartDetail = new CartDetail();
            cartDetail.setCart(cart);
            cartDetail.setRoom(room);
            cartDetail.setPrice(room.getPrice());
            cartDetail.setQuantity(quantity);
            cartDetail.setNumAdults(guests);
            cartDetail.setNumChildren(0);
            cartDetail.setCheckIn(checkIn);
            cartDetail.setCheckOut(checkOut);
            cartDetail.setCreateAt(LocalDateTime.now());
            isNewItem = true;
        }

        cartDetail.setUpdateAt(LocalDateTime.now());
        CartDetail savedCartDetail = cartDetailRepository.save(cartDetail);
        
        // Chỉ cập nhật số lượng loại phòng nếu là item mới
        if (isNewItem) {
            updateCartItemCount(cart);
        }

        return savedCartDetail;
    }

    public void updateCartItemCount(Cart cart) {
        long distinctRoomCount = cartDetailRepository.countByCart(cart);
        cart.setSum((int) distinctRoomCount);
        cartRepository.save(cart);
    }

    public List<CartDataRender> getCartItems() {
        User user = getCurrentUser();
        Cart cart = getCurrentUserCart(user);
        List<CartDetail> details = cartDetailRepository.findByCart(cart);
        return details.stream().map(detail -> {
            CartDataRender dto = new CartDataRender();
            dto.setImage(detail.getRoom().getImage());
            dto.setHotelName(detail.getRoom().getHotel().getName());
            dto.setStatusHotel(detail.getRoom().getHotel().getStatus());
            dto.setRoomName(detail.getRoom().getName());
            dto.setCheckIn(detail.getCheckIn());
            dto.setCheckOut(detail.getCheckOut());
            dto.setQuantity(detail.getQuantity());
            dto.setPrice(detail.getRoom().getPrice());
            dto.setId(detail.getId());
            dto.setHotel_id(detail.getRoom().getHotel().getId());
            return dto;
        }).toList();
    }

    public CartDetail updateCartItem(Long itemId, int quantity) {
        CartDetail cartDetail = cartDetailRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Kiểm tra số lượng phòng
        if (cartDetail.getRoom().getQuantity() < quantity) {
            throw new RuntimeException("Số lượng phòng không đủ");
        }

        cartDetail.setPrice(cartDetail.getRoom().getPrice());
        cartDetail.setQuantity(quantity);
        cartDetail.setUpdateAt(LocalDateTime.now());


        return cartDetailRepository.save(cartDetail);
    }

    public void removeCartItem(Long itemId) {
        CartDetail cartDetail = cartDetailRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        cartDetailRepository.delete(cartDetail);
        User user = getCurrentUser();
        Cart cart = getCurrentUserCart(user);
        updateCartItemCount(cart);
    }

    public void clearCart() {
        User user = getCurrentUser();
        Cart cart = getCurrentUserCart(user);
        cartDetailRepository.deleteAllByCart(cart);
        cart.setSum(0);
        cartRepository.save(cart);
    }

    public CartDetail updateCartItemDate(Long itemId, Map<String, String> dates) {
        CartDetail item = cartDetailRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mục giỏ hàng"));

        if (dates.containsKey("checkIn")) {
            item.setCheckIn(LocalDate.parse(dates.get("checkIn")));
        }
        if (dates.containsKey("checkOut")) {
            item.setCheckOut(LocalDate.parse(dates.get("checkOut")));
        }
        item.setUpdateAt(LocalDateTime.now());
        return cartDetailRepository.save(item);
    
    }

    public CartDetail findCartDetailById(Long id) {
    return cartDetailRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Cart item không tồn tại hoặc đã bị xóa"
        ));
    }  


}
