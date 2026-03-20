import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const services = [
    "Electrician",
    "Plumber",
    "Carpenter",
    "Painter",
    "Welder",
    "Sweeper",
    "Labor",
    "Personal Maid",
    "Home Cleaning",
    "AC Repair",
    "Appliance Repair",
    "Gardener",
    "Tile Worker",
    "Plaster Worker",
    "Security Guard",
    "Driver",
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900">

      {/* HERO */}
      <section className="py-20 px-6 md:px-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-5xl font-bold dark:text-white">
            Professional Home Services
          </h1>

          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
            We provide trusted, verified and professional workers 
            for all your home needs — cleaning, repairs, maintenance,
            construction, and more.
          </p>

          <ul className="mt-6 text-gray-600 dark:text-gray-300 space-y-2">
            <li>✔ Verified Professionals</li>
            <li>✔ Affordable Pricing</li>
            <li>✔ On-Time Service</li>
            <li>✔ Easy Booking</li>
          </ul>

          <button
            onClick={() => navigate("/book")}
            className="mt-8 bg-black text-white px-6 py-3 rounded-xl hover:scale-105 transition"
          >
            Book a Service
          </button>
        </div>

        <img
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952"
          className="rounded-3xl shadow-2xl"
        />
      </section>

      {/* SERVICES GRID */}
      <section className="py-20 px-6 md:px-20">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
          Our Services
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.07 }}
              onClick={() => navigate("/book")}
              className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl text-center cursor-pointer"
            >
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="font-semibold dark:text-white">
                {service}
              </h3>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;