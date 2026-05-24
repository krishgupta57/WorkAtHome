import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { User, Mail, Lock, Phone, ArrowRight, Loader2, Briefcase, Heart } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "CUSTOMER",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectRole = (role) => {
    setForm({ ...form, role });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    setForm(prev => ({ ...prev, username: prev.email.split('@')[0] }));
    const registrationPayload = {
      ...form,
      username: form.username || form.email.split('@')[0]
    };

    setLoading(true);

    axios.post("http://127.0.0.1:8000/auth/register/", registrationPayload)
      .then(() => {
        setLoading(false);
        toast.success("Account Created Successfully! Please login.");
        navigate("/login");
      })
      .catch((err) => {
        setLoading(false);
        console.log("Error:", err.response?.data);
        toast.error(err.response?.data?.email?.[0] || err.response?.data?.error || "Registration failed. Please try again.");
      });
  };

  return (
    <div className="min-h-[90vh] flex justify-center items-center bg-gray-50 px-6 py-12 relative overflow-hidden">
      
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/4 -z-10 w-72 h-72 bg-indigo-200/50 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-72 h-72 bg-purple-200/40 rounded-full blur-3xl" />

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-100 p-8 md:p-10 rounded-[32px] shadow-2xl w-full max-w-lg space-y-6 relative z-10"
      >
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-sm text-gray-400">
            Join WorkAtHome as a customer or service provider today.
          </p>
        </div>

        {/* ROLE SELECTION CARDS */}
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => selectRole("CUSTOMER")}
            className={`border rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              form.role === "CUSTOMER"
                ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold"
                : "border-gray-100 hover:bg-gray-50 text-gray-500"
            }`}
          >
            <Heart className="w-6 h-6" />
            <span className="text-sm">Hire Services</span>
          </div>

          <div
            onClick={() => selectRole("WORKER")}
            className={`border rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              form.role === "WORKER"
                ? "border-purple-600 bg-purple-50/50 text-purple-700 font-bold"
                : "border-gray-100 hover:bg-gray-50 text-gray-500"
            }`}
          >
            <Briefcase className="w-6 h-6" />
            <span className="text-sm">Join as Worker</span>
          </div>
        </div>

        <div className="space-y-4">
          
          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full border border-gray-100 bg-gray-50/50 pl-12 pr-4 py-3.5 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition"
              onChange={handleChange}
              required
            />
          </div>

          {/* Email address */}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="w-full border border-gray-100 bg-gray-50/50 pl-12 pr-4 py-3.5 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition"
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone number */}
          <div className="relative">
            <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (e.g. +919876543210)"
              className="w-full border border-gray-100 bg-gray-50/50 pl-12 pr-4 py-3.5 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition"
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full border border-gray-100 bg-gray-50/50 pl-12 pr-4 py-3.5 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition"
              onChange={handleChange}
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
              <Loader2 className="w-5 h-5 animate-spin" /> Registering...
            </>
          ) : (
            <>
              Get Started <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;