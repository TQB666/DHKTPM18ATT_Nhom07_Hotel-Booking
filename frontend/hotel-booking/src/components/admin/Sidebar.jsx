import { Home, BedDouble, Users, Receipt, Gift, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom"; // import Link

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6 sticky top-0 h-screen hidden md:block">
      <Link to="/">
        <h2 className="text-2xl font-bold mb-8 text-slate-900 cursor-pointer">
          Hotel Admin
        </h2>
      </Link>

      <nav className="space-y-2">

        {/* Dashboard */}
        <Link
          to="/admin"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        {/* Khách sạn */}
        <Link
          to="/admin/hotel"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <Home className="w-5 h-5" />
          <span>Khách Sạn</span>
        </Link>

        {/* Phòng */}
        <Link
          to="/admin/room"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <BedDouble className="w-5 h-5" />
          <span>Phòng</span>
        </Link>

        {/* Người dùng */}
        <Link
          to="/admin/user"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <Users className="w-5 h-5" />
          <span>Người dùng</span>
        </Link>

        {/* Booking / Hóa đơn */}
        <Link
          to="/admin/bookings"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <Receipt className="w-5 h-5" />
          <span>Booking (Hóa đơn)</span>
        </Link>

        {/* Voucher */}
        <Link
          to="/admin/voucher"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <Gift className="w-5 h-5" />
          <span>Voucher</span>
        </Link>

      </nav>
    </aside>
  );
};

export default Sidebar;
