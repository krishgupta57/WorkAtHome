import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    axios.post("http://127.0.0.1:8000/auth/login/", { email, password })
      .then((res) => {
        setLoading(false);
        const { user, access } = res.data;
        
        // Log in in Redux / Context
        login(user, access); 
        toast.success("Welcome back!");

        // Redirect based on role
        if (user.role === 'ADMIN') {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log("ERROR:", err.response?.data); 
        toast.error(err.response?.data?.detail || err.response?.data?.error || "Invalid credentials. Please try again.");
      });
  };

  return (
    <div className="min-h-[85vh] flex justify-center items-center bg-gray-50 px-6 py-12 relative overflow-hidden">
      
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/4 -z-10 w-72 h-72 bg-indigo-200/50 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-72 h-72 bg-purple-200/40 rounded-full blur-3xl" />

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-100 p-8 md:p-10 rounded-[32px] shadow-2xl w-full max-w-md space-y-6 relative z-10"
      >
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-400">
            Sign in to book home services or manage your availability.
          </p>
        </div>

        <div className="space-y-4">
          
          {/* Email field */}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full border border-gray-100 bg-gray-50/50 pl-12 pr-4 py-3.5 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password field */}
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-100 bg-gray-50/50 pl-12 pr-4 py-3.5 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white hover:bg-indigo-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition cursor-pointer shadow-md disabled:bg-gray-400"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
            </>
          ) : (
            <>
              Sign In <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          Don't have an account yet?{" "}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Register Here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;