import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Navbar() {

  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="flex justify-between items-center px-10 py-4 shadow-md bg-white sticky top-0 z-50">

      
      <h1 className="text-2xl font-bold cursor-pointer">
        WorkAtHome
      </h1>

      
      <div className="flex gap-6 items-center">

        <Link to="/" className="hover:text-gray-600 transition">
          Home
        </Link>

        <Link to="/book" className="hover:text-gray-600 transition">
          Book Service
        </Link>

        <Link to="/user-dashboard" className="hover:text-gray-600 transition">
          My Bookings
        </Link>

        <Link
          to="/admin-login"
          className="border px-4 py-2 rounded-xl hover:bg-gray-100 transition"
        >
          Admin
        </Link>

        
        {user ? (
          <div className="relative">

            
            <div
              onClick={() => setOpen(!open)}
              className="cursor-pointer bg-black text-white w-10 h-10 flex items-center justify-center rounded-full"
            >
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </div>

            
            {open && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-xl p-3">

                <p className="font-semibold mb-2">
                  {user.name || user.email || "User"}
                </p>

                <Link
                  to="/user-dashboard"
                  className="block py-2 hover:bg-gray-100 rounded"
                >
                  My Bookings
                </Link>

                <button
                  onClick={logout}
                  className="w-full text-left py-2 text-red-500 hover:bg-gray-100 rounded"
                >
                  Logout
                </button>

              </div>
            )}

          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="border px-4 py-2 rounded-xl hover:bg-gray-100 transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-black text-white px-4 py-2 rounded-xl hover:scale-105 transition"
            >
              Sign Up
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;