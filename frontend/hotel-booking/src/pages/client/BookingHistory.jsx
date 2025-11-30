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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Hàm trả về class Tailwind cho trạng thái
    const getStatusStyles = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl mx-auto mt-10" role="alert">
            <strong className="font-bold">Lỗi!</strong>
            <span className="block sm:inline"> {error}</span>
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Lịch sử đặt phòng</h2>
            
            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">Bạn chưa có đơn đặt phòng nào.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 transition-all hover:shadow-lg">
                            {/* Header của Card */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Mã đơn đặt phòng</div>
                                    <div className="text-lg font-bold text-gray-900">#{booking.confirmationToken}</div>
                                </div>
                                <div className="flex flex-col sm:items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                    <div className="text-blue-600 font-bold text-xl">
                                        {formatCurrency(booking.totalPrice)}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Body của Card - Chi tiết phòng */}
                            <div className="px-6 py-4">
                                <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Chi tiết phòng</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Giá/đêm</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {booking.details.map((detail, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{detail.roomName}</div>
                                                        <div className="text-sm text-gray-500">{detail.roomType}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {detail.checkIn}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {detail.checkOut}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                                                        {detail.quantity}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                        {formatCurrency(detail.price)}
                                                    </td>
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