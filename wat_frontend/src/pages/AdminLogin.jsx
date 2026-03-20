import { use, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function AdminLogin() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
  e.preventDefault();

  axios.post("http://127.0.0.1:8000/admin-login/", {
    username: username,
    password: password
  })
  .then((res) => {
    toast.success("Admin Login Successful!");
    navigate("/admin-dashboard");
  })
  .catch((err) => {
    console.log(err.response.data);
    toast.error("Invalid credentials. Please try again.");
  });
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-4"
      >

        <h2 className="text-2xl font-bold text-center">
          Admin Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full border p-3 rounded-lg"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-black text-white p-3 rounded-lg">
          Login
        </button>

      </form>

    </div>
  );
}

export default AdminLogin;