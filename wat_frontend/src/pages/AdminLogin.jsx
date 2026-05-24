import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Shield, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

function AdminLogin() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    axios.post("http://127.0.0.1:8000/auth/login/", {
      email: email,
      password: password
    })
    .then((res) => {
      setLoading(false);
      const { user, access } = res.data;
      
      if (user.role !== 'ADMIN') {
        toast.error("Access Denied! Unauthorized client role.");
        logout();
        return;
      }

      login(user, access);
      toast.success("Admin Portal Accessed Successfully!");
      navigate("/admin-dashboard");
    })
    .catch((err) => {
      setLoading(false);
      console.log(err);
      toast.error(err.response?.data?.detail || "Invalid admin credentials. Please try again.");
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 px-6 py-12 relative overflow-hidden">
      
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 -z-10 w-72 h-72 bg-red-100/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl" />

      <form
        onSubmit={handleLogin}
        className="bg-white border border-gray-100 p-8 md:p-10 rounded-[32px] shadow-2xl w-full max-w-md space-y-6 relative z-10"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Administrator Gateway
          </h2>
          <p className="text-xs text-gray-400">
            Secure admin portal credentials verification.
          </p>
        </div>

        <div className="space-y-4">
          
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Admin Email address"
              className="w-full border border-gray-100 bg-gray-50/50 pl-12 pr-4 py-3.5 rounded-2xl focus:border-red-500 focus:bg-white outline-none transition text-sm"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-100 bg-gray-50/50 pl-12 pr-4 py-3.5 rounded-2xl focus:border-red-500 focus:bg-white outline-none transition text-sm"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-black hover:bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition shadow-md cursor-pointer disabled:bg-gray-400"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Verifying Access...
            </>
          ) : (
            <>
              Authorize Portal <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="text-center">
          <Link to="/" className="text-xs text-gray-400 hover:text-indigo-600 font-bold transition">
            ← Return to Customer Home
          </Link>
        </div>

      </form>
    </div>
  );
}

export default AdminLogin;