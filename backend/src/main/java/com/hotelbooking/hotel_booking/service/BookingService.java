package com.hotelbooking.hotel_booking.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.hotelbooking.hotel_booking.domain.dto.BookingHistoryDTO;
import org.springframework.stereotype.Service;

import com.hotelbooking.hotel_booking.domain.Booking;
import com.hotelbooking.hotel_booking.domain.BookingDetail;
import com.hotelbooking.hotel_booking.domain.CartDetail;
import com.hotelbooking.hotel_booking.domain.Room;
import com.hotelbooking.hotel_booking.domain.User;
import com.hotelbooking.hotel_booking.domain.dto.BookingInfo;
import com.hotelbooking.hotel_booking.repository.BookingDetailRepository;
import com.hotelbooking.hotel_booking.repository.BookingRepository;
import com.hotelbooking.hotel_booking.repository.CartDetailRepository;
import com.hotelbooking.hotel_booking.repository.CartRepository;
import com.hotelbooking.hotel_booking.repository.RoomRepository;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor

public class BookingService {
    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final CartDetailRepository cartDetailRepository;
    private final CartRepository cartRepository;
    private final EmailService emailService;
    private final RoomRepository roomRepository;

    @Transactional
    public Booking createBooking(BookingInfo bookingInfo, User user, List<CartDetail> cartDetail) {
        //  Tạo đối tượng Booking
        Booking booking = new Booking();

        booking.setFullName(bookingInfo.getFullName());
        booking.setEmail(bookingInfo.getEmail());
        booking.setPhoneNumber(bookingInfo.getPhoneNumber());
        booking.setTotalPrice(bookingInfo.getTotalPrice());
        booking.setVAT(0.08);// 8%
        booking.setBookingDate(LocalDateTime.now());
        booking.setPaymentMethod("CASH");//"CASH", "BANK_TRANSFER", "MOMO",...
        
        // ✅ Chỉnh lại payment status hợp lý hơn
        booking.setPaymentStatus("PAID");//"PENDING": chưa thanh toán, "PAID": thanh toán thành công
        
        booking.setStatus("PENDING");// "PENDING": chờ xác nhận, "CONFIRMED": đã xác nhận
        booking.setUser(user);
        booking.setVoucher(null);

        booking.setConfirmationToken(UUID.randomUUID().toString());
        bookingRepository.save(booking);
        
        // Tạo đối tượng BookingDetail
        cartDetail.stream().forEach(c -> {
            BookingDetail bookingDetail = new BookingDetail();
            bookingDetail.setBooking(booking);
            bookingDetail.setCheckIn(c.getCheckIn());
            bookingDetail.setCheckOut(c.getCheckOut());
            bookingDetail.setNumAdults(c.getNumAdults());
            bookingDetail.setNumChildren(c.getNumChildren());
            bookingDetail.setPrice(c.getPrice());
            bookingDetail.setQuantity(c.getQuantity());
            bookingDetail.setRoom(c.getRoom());

            bookingDetailRepository.save(bookingDetail);

            //  Giảm số lượng phòng còn lại
            Room room = c.getRoom();
            if (room.getQuantity() < c.getQuantity()) {
                throw new RuntimeException(" Phòng " + room.getName() + " không đủ số lượng.");
            }
            room.setQuantity(room.getQuantity() - (int)c.getQuantity());
            roomRepository.save(room);
        });

        // ❗ Xoá giỏ hàng từng dòng dễ lỗi → đổi sang xoá 1 lần
        cartDetailRepository.deleteAll(cartDetail);

        // Gửi email xác nhận
        String confirmLink = "http://localhost:8080/api/booking/confirm?token=" + booking.getConfirmationToken();
        emailService.sendBookingConfirmationEmail(booking, confirmLink);

        return booking;
    }


    public Optional<Booking> findByConfirmationToken(String token){
        return bookingRepository.findByConfirmationToken(token);
    }

    public void save(Booking booking){
        bookingRepository.save(booking);
    }

//    admin booking managament
    /**
     * Lấy tất cả booking (cho admin)
     */
    public List<Booking> getAllBookings() {
        // Sắp xếp theo ngày đặt hàng mới nhất
        return bookingRepository.findAllByOrderByIdDesc();
    }

    /**
     * Lấy chi tiết 1 booking (cho admin)
     */
    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    /**
     * Cập nhật trạng thái booking (cho admin)
     * Ví dụ: từ PENDING -> CONFIRMED
     */
    @Transactional
    public Booking updateBookingStatus(Long id, String newStatus, String newPaymentStatus) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking với id: " + id));
        if (newStatus != null && !newStatus.isEmpty()) {
            booking.setStatus(newStatus);
        }
        if (newPaymentStatus != null && !newPaymentStatus.isEmpty()) {
            booking.setPaymentStatus(newPaymentStatus);
        }
        return bookingRepository.save(booking);
    }

    /**
     Booking history
     */
    public List<BookingHistoryDTO> getUserBookingHistory(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByIdDesc(userId);
        return bookings.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    private BookingHistoryDTO convertToDTO(Booking booking) {
        BookingHistoryDTO dto = new BookingHistoryDTO();
        dto.setId(booking.getId());
        dto.setConfirmationToken(booking.getConfirmationToken());
        dto.setStatus(booking.getStatus());
        dto.setTotalPrice(booking.getTotalPrice());

        // Map chi tiết phòng
        List<BookingHistoryDTO.BookingDetailDTO> detailDTOs = booking.getBookingDetails().stream().map(detail -> {
            BookingHistoryDTO.BookingDetailDTO detailDTO = new BookingHistoryDTO.BookingDetailDTO();
            detailDTO.setCheckIn(detail.getCheckIn());
            detailDTO.setCheckOut(detail.getCheckOut());
            detailDTO.setPrice(detail.getPrice());
            detailDTO.setQuantity((int) detail.getQuantity());

            // Giả sử bạn có entity Room liên kết
            if (detail.getRoom() != null) {
                detailDTO.setRoomName(detail.getRoom().getName());
                detailDTO.setRoomType(detail.getRoom().getDescription());
            }
            return detailDTO;
        }).collect(Collectors.toList());

        dto.setDetails(detailDTOs);
        return dto;
    }
}
