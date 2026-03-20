import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    axios.post("http://127.0.0.1:8000/login/", { email, password })
      .then((res) => {
        login(res.data.user); 
        toast.success("Login Successful!");
        navigate("/");
      })
      .catch((err) => {
        console.log("ERROR:", err.response.data); 
        toast.error(err.response?.data?.error || "Login failed");
      });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-5"
      >
        <h2 className="text-3xl font-bold text-center">
          Login to Your Account
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 px-4 py-3 rounded-xl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 px-4 py-3 rounded-xl"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-black text-white py-3 rounded-xl">
          Login
        </button>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold">
            Create Account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;