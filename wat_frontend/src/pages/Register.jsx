import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/register/", form).then(() => {
      toast.success("Account Created Successfully!");
      navigate("/login");
    }).catch(() => {
      toast.error("Failed to create account. Please try again.");
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-5"
      >
        <h2 className="text-3xl font-bold text-center">
          Create Your Account
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full border border-gray-300 px-4 py-3 rounded-xl"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border border-gray-300 px-4 py-3 rounded-xl"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border border-gray-300 px-4 py-3 rounded-xl"
          onChange={handleChange}
        />

        <button className="w-full bg-black text-white py-3 rounded-xl">
          Create Account
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;