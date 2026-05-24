import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Bell, User, LogOut, Menu, X, Shield, Briefcase, Calendar, DollarSign, MapPin } from "lucide-react";
import axios from "axios";

function Navbar() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications if logged in
  useEffect(() => {
    if (user && token) {
      axios.get("http://127.0.0.1:8000/notifications/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const data = res.data.results || res.data;
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      })
      .catch(err => console.log("Error loading notifications:", err));
    }
  }, [user, token]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    setMobileMenu(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-100 shadow-sm px-6 md:px-12 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
            WorkAtHome
          </span>
          <span className="text-[10px] uppercase tracking-widest bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
            PRO
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex gap-6 items-center font-medium text-gray-600">
          
          {/* GENERAL / CUSTOMER LINKS */}
          {(!user || user.role === 'CUSTOMER') && (
            <>
              <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              <Link to="/book" className="hover:text-indigo-600 transition-colors">Book Service</Link>
              {user && (
                <Link to="/user-dashboard" className="hover:text-indigo-600 transition-colors">My Bookings</Link>
              )}
            </>
          )}

          {/* WORKER LINKS */}
          {user && user.role === 'WORKER' && (
            <>
              <Link to="/user-dashboard" className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                <Briefcase className="w-4 h-4" /> Dashboard
              </Link>
              <Link to="/user-dashboard?tab=requests" className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                <Calendar className="w-4 h-4" /> Requests
              </Link>
              <Link to="/user-dashboard?tab=earnings" className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                <DollarSign className="w-4 h-4" /> Earnings
              </Link>
            </>
          )}

          {/* ADMIN LINKS */}
          {user && user.role === 'ADMIN' && (
            <>
              <Link to="/admin-dashboard" className="flex items-center gap-1.5 hover:text-red-600 transition-colors font-bold">
                <Shield className="w-4 h-4" /> Admin Console
              </Link>
            </>
          )}
        </div>

        {/* AUTH BUTTONS & MENU */}
        <div className="flex gap-4 items-center">
          
          {user ? (
            <div className="relative flex items-center gap-4">
              
              {/* Notification bell */}
              <div className="relative cursor-pointer text-gray-600 hover:text-indigo-600 transition" onClick={() => navigate("/user-dashboard?tab=notifications")}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* User Avatar Dropdown trigger */}
              <button
                onClick={() => setOpen(!open)}
                className="cursor-pointer bg-gradient-to-tr from-indigo-600 to-purple-600 text-white w-9 h-9 flex items-center justify-center rounded-full font-bold shadow-md hover:scale-105 transition"
              >
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </button>

              {/* DROPDOWN MENU */}
              {open && (
                <div className="absolute right-0 top-11 w-56 bg-white shadow-xl rounded-2xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-3 py-2 border-b border-gray-50 mb-1">
                    <p className="font-bold text-gray-800 truncate">{user.name || "WorkAtHome User"}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[9px] uppercase tracking-wider bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/user-dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition"
                  >
                    <User className="w-4 h-4" /> My Profile & Dashboard
                  </Link>

                  {user.role === 'CUSTOMER' && (
                    <Link
                      to="/user-dashboard?tab=addresses"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition"
                    >
                      <MapPin className="w-4 h-4" /> Saved Addresses
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="hidden md:flex gap-3 items-center">
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-600 transition px-4 py-2 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-black text-white hover:bg-indigo-600 font-medium px-5 py-2.5 rounded-xl hover:scale-105 shadow-sm hover:shadow-indigo-100 transition duration-300"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* MOBILE MENU TRIGGER */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-1 text-gray-600 hover:text-indigo-600 transition cursor-pointer"
          >
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenu && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3 text-gray-600 font-medium pb-2 animate-in slide-in-from-top duration-300">
          {(!user || user.role === 'CUSTOMER') && (
            <>
              <Link to="/" onClick={() => setMobileMenu(false)} className="hover:text-indigo-600 py-1 transition">Home</Link>
              <Link to="/book" onClick={() => setMobileMenu(false)} className="hover:text-indigo-600 py-1 transition">Book Service</Link>
              {user && (
                <Link to="/user-dashboard" onClick={() => setMobileMenu(false)} className="hover:text-indigo-600 py-1 transition">My Bookings</Link>
              )}
            </>
          )}

          {user && user.role === 'WORKER' && (
            <>
              <Link to="/user-dashboard" onClick={() => setMobileMenu(false)} className="py-1 hover:text-indigo-600 transition">Dashboard</Link>
              <Link to="/user-dashboard?tab=requests" onClick={() => setMobileMenu(false)} className="py-1 hover:text-indigo-600 transition">Booking Requests</Link>
              <Link to="/user-dashboard?tab=earnings" onClick={() => setMobileMenu(false)} className="py-1 hover:text-indigo-600 transition">My Earnings</Link>
            </>
          )}

          {user && user.role === 'ADMIN' && (
            <Link to="/admin-dashboard" onClick={() => setMobileMenu(false)} className="py-1 text-red-600 font-bold hover:text-red-700 transition">Admin Dashboard</Link>
          )}

          {!user && (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-50">
              <Link
                to="/login"
                onClick={() => setMobileMenu(false)}
                className="w-full text-center border border-gray-200 py-2.5 rounded-xl font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenu(false)}
                className="w-full text-center bg-black text-white py-2.5 rounded-xl font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;