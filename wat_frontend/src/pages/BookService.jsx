import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { 
  Zap, Droplet, Hammer, Brush, Anvil, Wind, Users, Heart, Sparkles, Snowflake, Tv, Leaf, Grid, Layers, Shield, Car,
  User, Calendar, Clock, MapPin, Phone, CreditCard, ChevronRight, CheckCircle, AlertCircle, ShieldAlert, Star
} from "lucide-react";

function BookService() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();

  // Search parameters pre-select category
  const initialCategory = searchParams.get("service") || "";

  // Step state: 1 = service/worker list, 2 = slot/details, 3 = payment checkout
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  
  // Workers catalog
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [filters, setFilters] = useState({ rating: "", priceMax: "", onlyVerified: false });
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  // Booking details
  const [bookingDate, setBookingDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");

  // Created booking details
  const [createdBooking, setCreatedBooking] = useState(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const icons = {
    Electrician: Zap, Plumber: Droplet, Carpenter: Hammer, Painter: Brush, Welder: Anvil, Sweeper: Wind,
    Labor: Users, "Personal Maid": Heart, "Home Cleaning": Sparkles, "AC Repair": Snowflake, "Appliance Repair": Tv,
    Gardener: Leaf, "Tile Worker": Grid, "Plaster Worker": Layers, "Security Guard": Shield, Driver: Car
  };

  // Load service categories
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/categories/")
      .then(res => setCategories(res.data.results || res.data))
      .catch(err => console.log("Error loading categories:", err));
  }, []);

  // Fetch workers when category changes
  useEffect(() => {
    if (selectedCategory) {
      setLoadingWorkers(true);
      setSelectedWorker(null);
      setStep(1);
      
      let url = `http://127.0.0.1:8000/workers/?service=${selectedCategory}`;
      if (filters.rating) url += `&rating=${filters.rating}`;
      if (filters.priceMax) url += `&price_max=${filters.priceMax}`;

      axios.get(url)
        .then(res => {
          let data = res.data.results || res.data;
          if (filters.onlyVerified) {
            data = data.filter(w => w.verification_badge);
          }
          setWorkers(data);
          setLoadingWorkers(false);
        })
        .catch(err => {
          console.log("Error loading workers:", err);
          setLoadingWorkers(false);
        });
    }
  }, [selectedCategory, filters]);

  // Fetch available slots when worker & date are picked
  useEffect(() => {
    if (selectedWorker && bookingDate) {
      setLoadingSlots(true);
      setSelectedSlot(null);
      axios.get(`http://127.0.0.1:8000/slots/?worker_id=${selectedWorker.id}&date=${bookingDate}`)
        .then(res => {
          setAvailableSlots(res.data.results || res.data);
          setLoadingSlots(false);
        })
        .catch(err => {
          console.log("Error loading slots:", err);
          setLoadingSlots(false);
        });
    }
  }, [selectedWorker, bookingDate]);

  // Handle Checkout submission (creates booking + starts checkout simulation)
  const handleProceedToPayment = (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to complete your booking.");
      navigate("/login");
      return;
    }

    if (!selectedWorker || !bookingDate || !selectedSlot || !address || !phone) {
      toast.error("Please fill in all slots, date, address and phone");
      return;
    }

    setLoadingCheckout(true);

    const bookingPayload = {
      worker: selectedWorker.id,
      service: categories.find(c => c.name === selectedCategory)?.id,
      date: bookingDate,
      time_slot: `${selectedSlot.start_time.substring(0, 5)} - ${selectedSlot.end_time.substring(0, 5)}`,
      base_price: selectedWorker.base_hourly_rate,
      address: address
    };

    axios.post("http://127.0.0.1:8000/bookings/", bookingPayload, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setCreatedBooking(res.data);
      setStep(3); // Go to Payment Card
      setLoadingCheckout(false);
    })
    .catch(err => {
      console.log("Booking error:", err.response?.data);
      toast.error("Booking slot conflict or invalid data.");
      setLoadingCheckout(false);
    });
  };

  // Simulate payment (Paid/Failed)
  const handleSimulatePayment = (paymentStatus) => {
    if (!createdBooking) return;
    
    setLoadingCheckout(true);

    axios.post(`http://127.0.0.1:8000/payments/${createdBooking.id}/simulate_checkout/`, {
      status: paymentStatus
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setLoadingCheckout(false);
      if (paymentStatus === 'PAID') {
        toast.success("Payment Successful! Booking Request Submitted.");
        navigate("/user-dashboard");
      } else {
        toast.error("Payment Failed! Please try checkout again.");
        setStep(1); // Go back
      }
    })
    .catch(err => {
      console.log("Payment simulation error:", err);
      toast.error("Error processing checkout simulation.");
      setLoadingCheckout(false);
    });
  };

  // Pricing calculations
  const calculatePricing = (rate) => {
    const base = parseFloat(rate) || 0;
    const fee = 40.00;
    const commission = base * 0.10;
    const total = base + fee + commission;
    return {
      base: base.toFixed(2),
      fee: fee.toFixed(2),
      commission: commission.toFixed(2),
      total: total.toFixed(2)
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* STEP PROGRESS BAR */}
        <div className="flex justify-center items-center gap-4 text-sm font-semibold text-gray-400">
          <span className={`px-3 py-1 rounded-full ${step >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>1</span>
          <ChevronRight className="w-4 h-4" />
          <span className={`px-3 py-1 rounded-full ${step >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>2</span>
          <ChevronRight className="w-4 h-4" />
          <span className={`px-3 py-1 rounded-full ${step === 3 ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>3</span>
        </div>

        {/* STEP 1: SERVICE CATEGORY & WORKER BROWSE */}
        {step === 1 && (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Categories picker */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Select Service Category</h2>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat, idx) => {
                  const SrvIcon = icons[cat.name] || Zap;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`border rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                        selectedCategory === cat.name
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold"
                          : "border-gray-100 hover:bg-gray-50 text-gray-500"
                      }`}
                    >
                      <SrvIcon className="w-6 h-6" />
                      <span className="text-xs truncate max-w-full">{cat.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workers Listing */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCategory ? `${selectedCategory} Professionals` : "Select a service category to find workers"}
                </h2>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <select
                    className="border border-gray-200 rounded-xl p-2 bg-gray-50 outline-none"
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                  >
                    <option value="">Rating (Any)</option>
                    <option value="4.5">4.5+ ★</option>
                    <option value="4.8">4.8+ ★</option>
                  </select>

                  <select
                    className="border border-gray-200 rounded-xl p-2 bg-gray-50 outline-none"
                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  >
                    <option value="">Price (Any)</option>
                    <option value="300">Under ₹300</option>
                    <option value="400">Under ₹400</option>
                  </select>

                  <label className="flex items-center gap-1.5 cursor-pointer bg-gray-50 border border-gray-200 rounded-xl p-2">
                    <input
                      type="checkbox"
                      checked={filters.onlyVerified}
                      onChange={(e) => setFilters({ ...filters, onlyVerified: e.target.checked })}
                    />
                    <span>Verified</span>
                  </label>
                </div>
              </div>

              {/* Workers Grid */}
              {loadingWorkers ? (
                <div className="text-center py-12 text-gray-500 font-bold animate-pulse">Loading verified workers...</div>
              ) : workers.length === 0 ? (
                <div className="bg-white border border-gray-100 p-12 rounded-3xl text-center text-gray-400">
                  <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  No professionals available for this category right now.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {workers.map((worker, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-lg transition flex flex-col justify-between"
                    >
                      <div className="flex gap-4">
                        <img
                          src={worker.profile_picture || "https://api.dicebear.com/7.x/avataaars/svg"}
                          alt={worker.user.name}
                          className="w-16 h-16 rounded-full border border-gray-100 bg-gray-50"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-gray-900">{worker.user.name || "Worker"}</h3>
                            {worker.verification_badge && (
                              <span className="text-[9px] uppercase tracking-wider bg-green-50 text-green-600 font-bold px-1.5 py-0.5 rounded-full border border-green-100">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{worker.average_rating || "N/A"} ({worker.experience_years} Years Exp)</span>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">{worker.bio || "No bio added."}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-2">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Hourly Rate</p>
                          <p className="text-lg font-black text-gray-900">₹{worker.base_hourly_rate}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedWorker(worker);
                            setStep(2);
                          }}
                          className="bg-black text-white hover:bg-indigo-600 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer"
                        >
                          Book Professional
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* STEP 2: DATES, TIME SLOTS AND USER DETAILS */}
        {step === 2 && selectedWorker && (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Info and slot pickers */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
                <button onClick={() => setStep(1)} className="text-xs text-indigo-600 font-bold hover:underline">
                  ← Back to professionals
                </button>
                <div className="flex gap-4">
                  <img
                    src={selectedWorker.profile_picture || "https://api.dicebear.com/7.x/avataaars/svg"}
                    alt={selectedWorker.user.name}
                    className="w-14 h-14 rounded-full"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{selectedWorker.user.name}</h3>
                    <p className="text-xs text-gray-400">Selected service: {selectedCategory}</p>
                  </div>
                </div>
              </div>

              {/* Slot picker card */}
              <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" /> Select Date & Availability
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Booking Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white outline-none transition"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                    />
                  </div>
                </div>

                {bookingDate && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase">Available Time Slots</label>
                    {loadingSlots ? (
                      <div className="text-center py-6 text-gray-400 animate-pulse text-xs font-bold">Querying schedules...</div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-xs text-red-500 font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> No available slots on this date. Please choose another date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {availableSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`border p-3 rounded-xl text-center text-xs font-bold transition cursor-pointer ${
                              selectedSlot?.id === slot.id
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 inline mr-1" />
                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Service Address & Phone details */}
              <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" /> Service Location Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Service Address</label>
                    <textarea
                      placeholder="Street name, landmark, building, apartment number"
                      rows="3"
                      className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white outline-none transition"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Contact Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +919876543210"
                      className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white outline-none transition"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Step 2 Right Column: Pricing Engine and Checkout Actions */}
            <div className="space-y-6">
              
              {/* Pricing card */}
              <div className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-lg space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -z-10" />
                
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-3">Checkout Breakdown</h3>
                
                {/* Cost Formula Breakdown */}
                {(() => {
                  const pricing = calculatePricing(selectedWorker.base_hourly_rate);
                  return (
                    <div className="space-y-4">
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Base Hourly Service Rate</span>
                        <span className="font-bold text-gray-800">₹{pricing.base}</span>
                      </div>

                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Platform Booking Fee</span>
                        <span className="font-bold text-gray-800">₹{pricing.fee}</span>
                      </div>

                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Admin Service Commission (10%)</span>
                        <span className="font-bold text-gray-800">₹{pricing.commission}</span>
                      </div>

                      <div className="border-t border-gray-50 pt-4 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Payable Amount</span>
                        <span className="text-2xl font-black text-indigo-600">₹{pricing.total}</span>
                      </div>

                      <div className="bg-indigo-50 border border-indigo-100/50 p-4 rounded-2xl text-[11px] text-indigo-600 leading-relaxed">
                        <strong>Guarantee:</strong> Payment is securely held in platform escrow. Funds are disbursed to the worker only after job completion is verified.
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={handleProceedToPayment}
                  disabled={loadingCheckout}
                  className="w-full bg-black text-white hover:bg-indigo-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition shadow-md disabled:bg-gray-400 cursor-pointer"
                >
                  {loadingCheckout ? "Processing..." : "Proceed to Checkout"}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* STEP 3: MOCK CHECKOUT PAYMENT SANDBOX */}
        {step === 3 && createdBooking && (
          <div className="max-w-md mx-auto bg-white border border-gray-100 p-8 rounded-[36px] shadow-2xl space-y-6 text-center">
            
            <div className="w-16 h-16 bg-yellow-50 text-yellow-600 mx-auto rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Escrow Payment Gateway</h2>
              <p className="text-sm text-gray-400">Booking #{createdBooking.id} created as PENDING payment.</p>
            </div>

            {/* Checkout Pricing box */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Professional</span>
                <span className="font-bold text-gray-800">{selectedWorker.user.name}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Date & Slot</span>
                <span className="font-bold text-gray-800">{createdBooking.date} ({createdBooking.time_slot})</span>
              </div>
              <div className="border-t border-gray-200/50 pt-2 flex justify-between text-sm font-bold">
                <span>Amount Due</span>
                <span className="text-indigo-600">₹{createdBooking.final_price}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 text-[11px] text-yellow-700 leading-relaxed text-left flex gap-2">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <span>
                <strong>Test Sandbox Mode:</strong> Simulate a complete paid or failed webhook callback response to test payment-tracking and state transition flows.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSimulatePayment("PAID")}
                disabled={loadingCheckout}
                className="bg-green-600 text-white hover:bg-green-700 py-3.5 rounded-2xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:bg-gray-400 text-sm"
              >
                <CheckCircle className="w-4.5 h-4.5" /> Simulate Success
              </button>
              
              <button
                onClick={() => handleSimulatePayment("FAILED")}
                disabled={loadingCheckout}
                className="bg-red-500 text-white hover:bg-red-600 py-3.5 rounded-2xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:bg-gray-400 text-sm"
              >
                <ShieldAlert className="w-4.5 h-4.5" /> Simulate Failure
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              className="text-xs text-gray-400 font-bold hover:underline"
            >
              Cancel & Go back
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default BookService;