import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BookService() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    address: "",
  });
  const user = JSON.parse(localStorage.getItem("user"));

  let navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e) => {
  e.preventDefault();

  if (!user) {
    toast.error("Please login first!");
    return;
  }

  axios.post("http://127.0.0.1:8000/create/", {
    ...form,
    user: user.id   
  })
  .then(() => {
    toast.success("Booking Confirmed!");
    navigate("/user-dashboard");
  })
  .catch((err) => {
    console.log(err.response.data); 
    toast.error("Failed to book service.");
  });
};


  return (
    <div className="min-h-screen flex justify-center items-center p-6 bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={submit}
        className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-center dark:text-white">
          Book a Service
        </h2>

        <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 
bg-white dark:bg-gray-700 
text-black dark:text-white 
placeholder-gray-500 dark:placeholder-gray-300
px-4 py-3 rounded-xl 
focus:ring-2 focus:ring-black 
outline-none transition" required />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 
bg-white dark:bg-gray-700 
text-black dark:text-white 
placeholder-gray-500 dark:placeholder-gray-300
px-4 py-3 rounded-xl 
focus:ring-2 focus:ring-black 
outline-none transition" required />
        <select name="service" onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 
bg-white dark:bg-gray-700 
text-black dark:text-white
placeholder-gray-500 dark:placeholder-gray-300
px-4 py-3 rounded-xl 
focus:ring-2 focus:ring-black
outline-none transition" required> 
          <option value="" disabled selected  >Select Service</option>
          <option value="Electrician">Electrician</option>
          <option value="Plumber">Plumber</option>
          <option value="Carpenter">Carpenter</option>
          <option value="Painter">Painter</option>
          <option value="Welder">Welder</option>
          <option value="Sweeper">Sweeper</option>
          <option value="Labor">Labor</option>
          <option value="Personal Maid">Personal Maid</option>
          <option value="Home Cleaning">Home Cleaning</option>
          <option value="AC Repair">AC Repair</option>
          <option value="Appliance Repair">Appliance Repair</option>
          <option value="Gardener">Gardener</option>
          <option value="Tile Worker">Tile Worker</option>
          <option value="Plaster Worker">Plaster Worker</option>
          <option value="Security Guard">Security Gaurd</option>
          <option value="Driver">Driver</option>
</select>
        <input type="date" name="date" onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 
bg-white dark:bg-gray-700 
text-black dark:text-white 
placeholder-gray-500 dark:placeholder-gray-300
px-4 py-3 rounded-xl 
focus:ring-2 focus:ring-black 
outline-none transition" required />
        <input name="address" placeholder="Address" onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 
bg-white dark:bg-gray-700 
text-black dark:text-white 
placeholder-gray-500 dark:placeholder-gray-300
px-4 py-3 rounded-xl 
focus:ring-2 focus:ring-black 
outline-none transition" required />

        <button className="w-full bg-black text-white py-3 rounded-xl hover:bg-white hover:text-black cursor-pointer transition">
          Confirm Booking
        </button>
      </form>
    </div>
  );
}

export default BookService;