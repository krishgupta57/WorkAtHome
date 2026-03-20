import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function ServiceCard({ service }) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
    >
      <img src={service.image} className="h-52 w-full object-cover" />

      <div className="p-6">
        <h3 className="text-xl font-semibold dark:text-white">
          {service.name}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mt-3">
          {service.description}
        </p>

        <button
          onClick={() => navigate(`/book/${service.name}`)}
          className="mt-4 w-full bg-black text-white py-2 rounded-xl"
        >
          Book Now
        </button>
      </div>
    </motion.div>
  );
}

export default ServiceCard;