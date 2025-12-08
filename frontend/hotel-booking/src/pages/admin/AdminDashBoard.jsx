"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "@/components/admin/Sidebar";
import api from "@/config/axiosConfig";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    CalendarDays,
    DollarSign,
    Home,
    Percent,
    TrendingUp,
    BedDouble,
    Users,
    Receipt
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Eye, Trash2, Edit } from "lucide-react";

const COLORS = ["#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hotelId, setHotelId] = useState(null);
    const [hotels, setHotels] = useState([]);
    const navigate = useNavigate();
    const [hotelSearch, setHotelSearch] = useState("");


    useEffect(() => {
        fetchDashboard();
        fetchHotels();
    }, []);
    // 👇 thêm useEffect mới

    useEffect(() => {
        fetchDashboard();
    }, [hotelId]);

    async function fetchDashboard() {
        setLoading(true);
        setError(null);

        try {
            const res = await api.get(`/admin/dashboard`, {
                params: { hotelId }
            });

            setDashboard(res.data);
        } catch (err) {
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    }
    async function fetchHotels() {
        try {
            const res = await api.get("/admin/hotel-list");
            setHotels(res.data);
        } catch (err) {
            console.error("Load hotels failed", err);
        }
    }



    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex">
                <Sidebar />
                <div className="flex-1 p-8">
                    <div className="text-center py-20 text-slate-600">Đang tải dashboard...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex">
                <Sidebar />
                <div className="flex-1 p-8">
                    <div className="text-red-600">Lỗi khi tải dashboard: {String(error)}</div>
                </div>
            </div>
        );
    }

    const recent = dashboard?.recentBookings ?? [];

    const revenueData = [
        {
            month: "Tháng này",
            revenue: dashboard?.monthlyRevenue ?? 0,
            bookings: dashboard?.totalBookings ?? 0,
        },
    ];

    const filteredHotels = hotels.filter(
        h => h.name.toLowerCase().includes(hotelSearch.toLowerCase())
    );



    const occupancyData = [
        { name: "Chiếm dụng", value: Math.round((dashboard?.occupancyRate ?? 0) * 100) / 100 },
        { name: "Trống", value: Math.max(0, 100 - (dashboard?.occupancyRate ?? 0)) },
    ];

    const filteredBookings = recent.filter((b) => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return true;

        if (String(b.id).includes(q)) return true;
        if ((b.customerName || "").toLowerCase().includes(q)) return true; // thêm
        if ((b.status || "").toLowerCase().includes(q)) return true;
        if ((b.bookingDate || "").toLowerCase().includes(q)) return true;
        if (String(b.totalPrice).includes(q)) return true;

        return false;
    });


    const fmtCurrency = (v) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(Number(v ?? 0));

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <Sidebar />

            <div className="flex-1">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearchTerm("");
                                fetchDashboard();
                            }}
                            className="flex items-center gap-2"
                        >
                            <span className="animate-spin-slow">
                                🔄
                            </span>
                            Refresh
                        </Button>
                        <div className="relative">
                            {/* Ô search khách sạn */}
                            <input
                                className="border border-slate-300 px-3 py-2 rounded-lg w-64"
                                placeholder="Tìm khách sạn..."
                                value={hotelSearch}
                                onChange={(e) => setHotelSearch(e.target.value)}
                            />

                            {/* Select hiển thị kết quả */}
                            <select
                                className="border border-slate-300 px-3 py-2 rounded-lg w-64 mt-2 cursor-pointer"
                                value={hotelId ?? ""}
                                onChange={(e) => setHotelId(e.target.value || null)}
                            >
                                <option value="">Tất cả khách sạn</option>

                                {filteredHotels.map(h => (
                                    <option key={h.id} value={h.id}>
                                        {h.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* TOP CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Tổng đặt phòng */}
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-slate-500 text-sm">Tổng đặt phòng</p>
                                <p className="text-3xl font-bold mt-2">{dashboard.totalBookings}</p>
                            </CardContent>
                        </Card>

                        {/* Doanh thu tháng */}
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-slate-500 text-sm">Doanh thu tháng</p>
                                <p className="text-3xl font-bold mt-2">{fmtCurrency(dashboard.monthlyRevenue)}</p>
                            </CardContent>
                        </Card>

                        {/* Phòng trống */}
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-slate-500 text-sm">Phòng trống</p>
                                <p className="text-3xl font-bold mt-2">{dashboard.availableRooms}</p>
                            </CardContent>
                        </Card>

                        {/* Tỷ lệ chiếm dụng */}
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-slate-500 text-sm">Tỷ lệ chiếm dụng</p>
                                <p className="text-3xl font-bold mt-2">
                                    {Math.round((dashboard.occupancyRate ?? 0) * 100) / 100}%
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* BIỂU ĐỒ */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Bar chart - Doanh thu & Số booking tháng hiện tại */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Thống kê tháng hiện tại</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                                            <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                                            {/* Trục Y trái - Doanh thu */}
                                            <YAxis
                                                yAxisId="left"
                                                tick={{ fill: '#64748b' }}
                                                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                            />
                                            {/* Trục Y phải - Số booking */}
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                tick={{ fill: '#64748b' }}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                                formatter={(value, name) => {
                                                    if (name === "Doanh thu") return fmtCurrency(value);
                                                    return value;
                                                }}
                                                labelFormatter={() => "Tháng hiện tại"}
                                            />
                                            <Legend
                                                verticalAlign="top"
                                                height={36}
                                                iconType="rect"
                                            />
                                            <Bar yAxisId="left" dataKey="revenue" fill="#0ea5e9" name="Doanh thu" radius={[8, 8, 0, 0]} />
                                            <Bar yAxisId="right" dataKey="bookings" fill="#8b5cf6" name="Số booking" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pie chart - Tỷ lệ chiếm dụng */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tỷ lệ chiếm dụng phòng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={occupancyData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label={({ value }) => `${value.toFixed(1)}%`}
                                                labelStyle={{ fontSize: '14px', fontWeight: 'bold', fill: '#fff' }}
                                            >
                                                {occupancyData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => `${value.toFixed(1)}%`}
                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                layout="vertical"
                                                align="center"
                                                iconType="circle"
                                                formatter={(value) => value === "Chiếm dụng" ? "Đã đặt" : "Trống"}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* DANH SÁCH BOOKING */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Booking gần đây</CardTitle>

                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500"
                                        placeholder="Tìm kiếm..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-slate-100">
                                            <th className="p-3 text-left">ID</th>
                                            <th className="p-3 text-left">Khách hàng</th>
                                            <th className="p-3 text-left">Ngày đặt</th>
                                            <th className="p-3 text-left">Trạng thái</th>
                                            <th className="p-3 text-left">Tổng tiền</th>
                                            <th className="p-3 text-left">Hành động</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredBookings.length > 0 ? (
                                            filteredBookings.map((booking) => (
                                                <tr key={booking.id} className="border-b hover:bg-slate-50">
                                                    <td className="p-3">#{booking.id}</td>
                                                    <td className="p-3">{booking.customerName ?? "Không rõ"}</td>
                                                    <td className="p-3">
                                                        {booking.bookingDate
                                                            ? new Date(booking.bookingDate).toLocaleString("vi-VN")
                                                            : "N/A"}
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-3 py-1 text-xs rounded-full font-semibold ${booking.status === "CONFIRMED"
                                                                ? "bg-green-100 text-green-800"
                                                                : booking.status === "PENDING"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                                }`}
                                                        >
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-red-600 font-semibold">
                                                        {fmtCurrency(booking.totalPrice)}
                                                    </td>
                                                    <td className="p-3 items-center">
                                                        <div className="flex  gap-2">
                                                            <button
                                                                onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                                                className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 "
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-6 text-center text-slate-500">
                                                    Không có booking phù hợp
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
