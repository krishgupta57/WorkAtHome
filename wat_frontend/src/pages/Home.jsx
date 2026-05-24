import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Zap, Droplet, Hammer, Brush, Anvil, Wind, Users, Heart, 
  Sparkles, Snowflake, Tv, Leaf, Grid, Layers, Shield, Car,
  Star, Award, CheckCircle, ArrowRight
} from "lucide-react";

function Home() {
  const navigate = useNavigate();

  const services = [
    { name: "Electrician", icon: Zap, color: "from-yellow-400 to-amber-500", tag: "Repairs & Wiring" },
    { name: "Plumber", icon: Droplet, color: "from-blue-400 to-dodger-600", tag: "Leaks & Piping" },
    { name: "Carpenter", icon: Hammer, color: "from-orange-400 to-amber-600", tag: "Furniture & Decor" },
    { name: "Painter", icon: Brush, color: "from-pink-400 to-rose-500", tag: "Walls & Coatings" },
    { name: "Welder", icon: Anvil, color: "from-gray-400 to-slate-600", tag: "Metal Fabrications" },
    { name: "Sweeper", icon: Wind, color: "from-teal-400 to-emerald-600", tag: "General Cleaning" },
    { name: "Labor", icon: Users, color: "from-blue-300 to-indigo-500", tag: "Heavy Lifting" },
    { name: "Personal Maid", icon: Heart, color: "from-red-400 to-pink-500", tag: "Daily Helper" },
    { name: "Home Cleaning", icon: Sparkles, color: "from-indigo-400 to-purple-600", tag: "Deep Sanitation" },
    { name: "AC Repair", icon: Snowflake, color: "from-cyan-400 to-blue-500", tag: "Cooling Servicing" },
    { name: "Appliance Repair", icon: Tv, color: "from-red-400 to-orange-500", tag: "Appliances Repair" },
    { name: "Gardener", icon: Leaf, color: "from-green-400 to-emerald-600", tag: "Lawn & Plants" },
    { name: "Tile Worker", icon: Grid, color: "from-purple-400 to-fuchsia-600", tag: "Floor & Ceramics" },
    { name: "Plaster Worker", icon: Layers, color: "from-stone-400 to-neutral-600", tag: "Cement & Repairs" },
    { name: "Security Guard", icon: Shield, color: "from-blue-600 to-indigo-800", tag: "Safety & Watching" },
    { name: "Driver", icon: Car, color: "from-sky-400 to-blue-600", tag: "Personal Chauffeur" },
  ];

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-gray-50 py-24 px-6 md:px-12 lg:px-24">
        
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="inline-block bg-indigo-50 text-indigo-700 font-semibold px-4 py-1.5 rounded-full text-sm border border-indigo-100">
              ⚡ On-Demand Home Care
            </span>

            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Your Home, <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Perfected
              </span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Hire reference-checked, highly skilled, and certified professionals for cleanings, installations, mechanical repairs, driving, and security. Zero stress, 100% satisfaction.
            </p>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
              <div>
                <p className="text-3xl font-black text-indigo-600">10k+</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Jobs Completed</p>
              </div>
              <div>
                <p className="text-3xl font-black text-purple-600">4.8★</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Average Rating</p>
              </div>
              <div>
                <p className="text-3xl font-black text-pink-600">100%</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Vetted Staff</p>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => navigate("/book")}
                className="bg-black text-white hover:bg-indigo-600 px-8 py-4 rounded-2xl font-bold hover:scale-105 shadow-lg shadow-gray-200 transition duration-300 flex items-center gap-2 cursor-pointer"
              >
                Book Service Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl rotate-3 scale-98 blur-sm -z-10 opacity-20" />
            <img
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200"
              alt="Home repair specialist working"
              className="rounded-3xl shadow-2xl border-4 border-white object-cover h-[450px] w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* SAFETY & VALUE SHOWCASE */}
      <section className="py-20 bg-white border-y border-gray-100 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          
          <div className="flex gap-4 items-start p-6 rounded-3xl hover:bg-gray-50 transition duration-300">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-gray-900">Background Vetted</h3>
              <p className="text-sm text-gray-500">Every single worker undergoes physical verification and deep background checking before listing.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-6 rounded-3xl hover:bg-gray-50 transition duration-300">
            <div className="bg-purple-50 p-3 rounded-2xl text-purple-600">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-gray-900">Premium Quality</h3>
              <p className="text-sm text-gray-500">Only verified skilled service providers who pass our rigorous field assessments are on-boarded.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-6 rounded-3xl hover:bg-gray-50 transition duration-300">
            <div className="bg-pink-50 p-3 rounded-2xl text-pink-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-gray-900">Transparent Pricing</h3>
              <p className="text-sm text-gray-500">See direct base pricing + platform fees broken down clearly prior to booking. No hidden charges.</p>
            </div>
          </div>

        </div>
      </section>

      {/* DYNAMIC CATEGORY DIRECTORY */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Explore Our Home Services Directory
            </h2>
            <p className="text-gray-500">
              Select a service, browse certified local experts, view detailed rates, and confirm your preferred slot instantly.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {services.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => navigate(`/book?service=${srv.name}`)}
                  className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-indigo-100 text-center cursor-pointer transition duration-300 relative group"
                >
                  <div className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-widest text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Book
                  </div>
                  
                  {/* Icon Wrapper */}
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center bg-gray-50 group-hover:bg-indigo-50 transition-colors">
                    <Icon className="w-8 h-8 text-gray-700 group-hover:text-indigo-600 transition-colors" />
                  </div>

                  <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {srv.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {srv.tag}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-gray-900 text-white px-6 md:px-12 lg:px-24 rounded-t-[50px] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 relative z-10">
          
          <div className="space-y-6">
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">Client Reviews</span>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">What Our Customers Say</h2>
            <p className="text-gray-400 leading-relaxed text-sm">
              We connect thousands of active home owners with trusted professionals every single day. Read real reviews left by our clients.
            </p>
          </div>

          {/* Testimonial Cards */}
          <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-3xl space-y-4">
            <div className="flex gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-gray-300 italic text-sm">
              "The deep cleaning service was outstanding. Alex and his partner arrived right on time, had all professional tools, and spent 5 hours making sure my house was sparkling clean. The ₹40 fee is absolutely worth the assurance."
            </p>
            <div className="pt-2">
              <p className="font-bold text-white text-sm">Rohan Malhotra</p>
              <p className="text-xs text-gray-500">Delhi, India</p>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-3xl space-y-4">
            <div className="flex gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-gray-300 italic text-sm">
              "I needed an AC technician on a Sunday afternoon. Placed a booking on WorkAtHome, and David accepted within 5 minutes. Real-time updates let me track everything instantly. Best home app experience ever!"
            </p>
            <div className="pt-2">
              <p className="font-bold text-white text-sm">Priya Sharma</p>
              <p className="text-xs text-gray-500">Mumbai, India</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

export default Home;