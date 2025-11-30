import React, { useEffect, useState } from 'react';
import { getBookingHistory } from '../../api/historyBookingApi';

const BookingHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await getBookingHistory();
            setBookings(data);
        } catch {
            setError("Không thể tải lịch sử đặt phòng.");
        } finally {
            setLoading(false);
        }
    };

    // Hàm format tiền tệ (VND)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Hàm xác định màu sắc cho trạng thái
    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'text-success'; // Xanh lá
            case 'PENDING': return 'text-warning';   // Vàng
            case 'CANCELLED': return 'text-danger';  // Đỏ
            default: return 'text-secondary';
        }
    };

    if (loading) return <div className="text-center mt-5">Đang tải...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Lịch sử đặt phòng của bạn</h2>
            
            {bookings.length === 0 ? (
                <p>Bạn chưa có đơn đặt phòng nào.</p>
            ) : (
                <div className="booking-list">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="card mb-4 shadow-sm">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Mã đơn: #{booking.confirmationToken}</strong>
                                    <br />
                                    <span className={`fw-bold ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="text-end">
                                    <span className="text-muted">Tổng tiền:</span>
                                    <h5 className="text-primary mb-0">{formatCurrency(booking.totalPrice)}</h5>
                                </div>
                            </div>
                            
                            <div className="card-body">
                                <h6 className="card-subtitle mb-2 text-muted">Chi tiết phòng:</h6>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Tên phòng</th>
                                                <th>Check-in</th>
                                                <th>Check-out</th>
                                                <th>Số lượng</th>
                                                <th>Giá/đêm</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {booking.details.map((detail, index) => (
                                                <tr key={index}>
                                                    <td>{detail.roomName} ({detail.roomType})</td>
                                                    <td>{detail.checkIn}</td>
                                                    <td>{detail.checkOut}</td>
                                                    <td className="text-center">{detail.quantity}</td>
                                                    <td>{formatCurrency(detail.price)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingHistory;