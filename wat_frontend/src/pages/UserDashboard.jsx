import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import axios from "axios";
import { 
  User as UserIcon, Calendar, Clock, MapPin, DollarSign, Settings, Star, MessageSquare, Bell, 
  Map, Shield, Briefcase, Plus, Trash2, Check, X, FileText, BarChart3, TrendingUp, Sparkles, Send
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

function UserDashboard() {
  const { user, token, logout, update } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab
  const activeTab = searchParams.get("tab") || "profile";

  // Shared state
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Customer Profile & Address state
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ title: "Home", street_address: "", city: "", state: "", zip_code: "" });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Worker Schedule / Profile state
  const [workerProfile, setWorkerProfile] = useState(null);
  const [workerSlots, setWorkerSlots] = useState([]);
  const [slotDate, setSlotDate] = useState("");
  const [slotTimes, setSlotTimes] = useState({ start_time: "09:00", end_time: "10:00" });

  // Reviews state
  const [ratingBooking, setRatingBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  // Active Chat states
  const [chattingWith, setChattingWith] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatSocketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error("Please login to access your dashboard.");
      navigate("/login");
    }
  }, [user]);

  // Load dashboard data based on role
  useEffect(() => {
    if (user && token) {
      loadBookings();
      loadNotifications();
      
      if (user.role === 'CUSTOMER') {
        loadAddresses();
      } else if (user.role === 'WORKER') {
        loadWorkerProfile();
        loadWorkerSlots();
      }
    }
  }, [user, activeTab]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // --- API Methods ---
  const loadBookings = () => {
    axios.get("http://127.0.0.1:8000/bookings/", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setBookings(res.data.results || res.data));
  };

  const loadNotifications = () => {
    axios.get("http://127.0.0.1:8000/notifications/", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setNotifications(res.data.results || res.data));
  };

  const loadAddresses = () => {
    axios.get("http://127.0.0.1:8000/addresses/", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setAddresses(res.data.results || res.data));
  };

  const loadWorkerProfile = () => {
    axios.get("http://127.0.0.1:8000/workers/me/", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setWorkerProfile(res.data));
  };

  const loadWorkerSlots = () => {
    axios.get(`http://127.0.0.1:8000/slots/?worker_id=${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setWorkerSlots(res.data.results || res.data));
  };

  // --- Profile Edit ---
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const payload = Object.fromEntries(data.entries());
    
    setLoading(true);
    const url = user.role === 'WORKER' ? "http://127.0.0.1:8000/workers/update_profile/" : "http://127.0.0.1:8000/customers/me/";
    
    axios.put(url, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setLoading(false);
      toast.success("Profile updated successfully!");
      update({ name: payload.name });
    })
    .catch(err => {
      setLoading(false);
      toast.error("Failed to update profile.");
    });
  };

  // --- Address Book ---
  const handleAddAddress = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/addresses/", newAddress, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.success("Address added!");
      loadAddresses();
      setNewAddress({ title: "Home", street_address: "", city: "", state: "", zip_code: "" });
      setShowAddressForm(false);
    });
  };

  const handleDeleteAddress = (id) => {
    axios.delete(`http://127.0.0.1:8000/addresses/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.success("Address deleted!");
      loadAddresses();
    });
  };

  // --- Worker Schedule Create Slots ---
  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!slotDate) {
      toast.error("Select a slot date!");
      return;
    }
    axios.post("http://127.0.0.1:8000/slots/bulk_create_slots/", {
      slots: [{
        date: slotDate,
        start_time: slotTimes.start_time + ":00",
        end_time: slotTimes.end_time + ":00"
      }]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.success("Slot added successfully!");
      loadWorkerSlots();
    });
  };

  // --- Booking Workflows (Accept/Reject/Complete) ---
  const handleAcceptBooking = (id) => {
    axios.post(`http://127.0.0.1:8000/bookings/${id}/accept/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.success("Booking accepted!");
      loadBookings();
    });
  };

  const handleRejectBooking = (id) => {
    axios.post(`http://127.0.0.1:8000/bookings/${id}/reject/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.error("Booking rejected!");
      loadBookings();
    });
  };

  const handleCompleteBooking = (id) => {
    axios.post(`http://127.0.0.1:8000/bookings/${id}/complete/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.success("Booking marked completed! ESCROW disbursed.");
      loadBookings();
    });
  };

  // --- Review Submission ---
  const handleSubmittingReview = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/reviews/", {
      booking: ratingBooking.id,
      worker: ratingBooking.worker,
      rating: reviewForm.rating,
      comment: reviewForm.comment
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.success("Review submitted!");
      setRatingBooking(null);
      setReviewForm({ rating: 5, comment: "" });
      loadBookings();
    });
  };

  // --- WebSockets Live Chat Integration ---
  const startChatting = (otherUser) => {
    setChattingWith(otherUser);
    
    // Fetch past messages
    axios.get("http://127.0.0.1:8000/messages/", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const allMsgs = res.data.results || res.data;
      const roomMsgs = allMsgs.filter(
        m => (m.sender === user.id && m.receiver === otherUser.id) || 
             (m.sender === otherUser.id && m.receiver === user.id)
      );
      setChatMessages(roomMsgs);
    });

    // Close any existing socket
    if (chatSocketRef.current) {
      chatSocketRef.current.close();
    }

    // Determine room name cleanly (e.g. chat_minID_maxID)
    const roomId = [user.id, otherUser.id].sort((a, b) => a - b).join("_");
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomId}/`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setChatMessages(prev => [...prev, {
        sender: data.sender_id,
        receiver: data.receiver_id,
        content: data.message,
        timestamp: new Date().toISOString()
      }]);
    };

    socket.onclose = () => {
      console.log("Chat socket closed.");
    };

    chatSocketRef.current = socket;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatSocketRef.current) return;

    chatSocketRef.current.send(JSON.stringify({
      message: newMessage,
      sender_id: user.id,
      receiver_id: chattingWith.id
    }));
    setNewMessage("");
  };

  // Helper calculation worker earnings
  const getWorkerEarningsData = () => {
    return bookings
      .filter(b => b.status === 'COMPLETED')
      .map(b => ({
        date: b.date,
        amount: parseFloat(b.base_price) * 0.90 // 10% commission deducted
      }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="w-full md:w-64 bg-white border-r border-gray-100 p-6 space-y-8 flex-shrink-0">
        <div>
          <h2 className="text-xs uppercase tracking-widest font-black text-gray-400">Main Account</h2>
          <p className="font-bold text-gray-800 text-lg truncate mt-1">{user?.name || "WorkAtHome User"}</p>
          <span className="text-[10px] bg-indigo-50 border border-indigo-100 font-bold uppercase tracking-wider text-indigo-600 px-2 py-0.5 rounded">
            {user?.role}
          </span>
        </div>

        <nav className="flex flex-col gap-2 font-semibold text-gray-600">
          <button 
            onClick={() => setSearchParams({ tab: "profile" })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition text-left cursor-pointer ${activeTab === "profile" ? "bg-black text-white" : "hover:bg-gray-50"}`}
          >
            <Settings className="w-5 h-5" /> Profile Settings
          </button>

          <button 
            onClick={() => setSearchParams({ tab: "bookings" })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition text-left cursor-pointer ${activeTab === "bookings" ? "bg-black text-white" : "hover:bg-gray-50"}`}
          >
            <Calendar className="w-5 h-5" /> 
            {user?.role === 'WORKER' ? "Active Service Jobs" : "My Service Bookings"}
          </button>

          {user?.role === 'CUSTOMER' && (
            <button 
              onClick={() => setSearchParams({ tab: "addresses" })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition text-left cursor-pointer ${activeTab === "addresses" ? "bg-black text-white" : "hover:bg-gray-50"}`}
            >
              <MapPin className="w-5 h-5" /> Address Book
            </button>
          )}

          {user?.role === 'WORKER' && (
            <>
              <button 
                onClick={() => setSearchParams({ tab: "schedule" })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition text-left cursor-pointer ${activeTab === "schedule" ? "bg-black text-white" : "hover:bg-gray-50"}`}
              >
                <Clock className="w-5 h-5" /> Availability Slots
              </button>

              <button 
                onClick={() => setSearchParams({ tab: "earnings" })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition text-left cursor-pointer ${activeTab === "earnings" ? "bg-black text-white" : "hover:bg-gray-50"}`}
              >
                <DollarSign className="w-5 h-5" /> Revenue Analytics
              </button>
            </>
          )}

          <button 
            onClick={() => setSearchParams({ tab: "notifications" })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition text-left cursor-pointer ${activeTab === "notifications" ? "bg-black text-white" : "hover:bg-gray-50"}`}
          >
            <Bell className="w-5 h-5" /> Notifications Center
          </button>
        </nav>
      </div>

      {/* DASHBOARD CONTENT BODY */}
      <div className="flex-grow p-6 md:p-12 space-y-8">

        {/* TAB 1: PROFILE SETTINGS */}
        {activeTab === "profile" && (
          <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm max-w-2xl space-y-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Edit Profile</h2>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Display Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={user?.name || ""}
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email address</label>
                <input
                  type="email"
                  defaultValue={user?.email || ""}
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-200 outline-none text-gray-500 cursor-not-allowed"
                  disabled
                />
              </div>

              {user?.role === 'WORKER' && workerProfile && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Hourly Base Rate (₹)</label>
                    <input
                      type="number"
                      name="base_hourly_rate"
                      defaultValue={workerProfile.base_hourly_rate}
                      className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Experience Years</label>
                    <input
                      type="number"
                      name="experience_years"
                      defaultValue={workerProfile.experience_years}
                      className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Short Professional Bio</label>
                    <textarea
                      name="bio"
                      defaultValue={workerProfile.bio || ""}
                      rows="3"
                      className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white outline-none transition"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white hover:bg-indigo-600 px-6 py-3.5 rounded-xl font-bold transition flex items-center justify-center cursor-pointer shadow-md disabled:bg-gray-400"
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: BOOKINGS LISTINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {user?.role === 'WORKER' ? "Active Service Jobs" : "My Bookings History"}
            </h2>

            {bookings.length === 0 ? (
              <div className="bg-white border border-gray-100 p-12 rounded-[32px] text-center text-gray-400">
                You do not have any active bookings yet.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {bookings.map((booking, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Booking status badge */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400">Job ID: #{booking.id}</span>
                        <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full border ${
                          booking.status === 'COMPLETED' ? "bg-green-50 text-green-600 border-green-100" :
                          booking.status === 'ACCEPTED' ? "bg-blue-50 text-blue-600 border-blue-100" :
                          booking.status === 'REJECTED' ? "bg-red-50 text-red-600 border-red-100" :
                          booking.status === 'CANCELLED' ? "bg-gray-100 text-gray-500 border-gray-200" :
                          "bg-yellow-50 text-yellow-600 border-yellow-100"
                        }`}>
                          {booking.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-gray-900">
                        {user?.role === 'CUSTOMER' ? `Worker: ${booking.worker_name}` : `Customer: ${booking.customer_name}`}
                      </h3>

                      <div className="space-y-2 text-xs text-gray-500 font-semibold">
                        <p className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-indigo-500" /> Service: {booking.service_name}</p>
                        <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date: {booking.date}</p>
                        <p className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Slot: {booking.time_slot}</p>
                        <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Location: {booking.address}</p>
                        <p className="flex items-center gap-1.5 text-indigo-600 font-bold"><DollarSign className="w-4 h-4" /> Total Price: ₹{booking.final_price}</p>
                      </div>
                    </div>

                    {/* Booking actions */}
                    <div className="flex justify-end gap-2 border-t border-gray-50 pt-4 mt-4">
                      
                      {/* Customer Actions */}
                      {user?.role === 'CUSTOMER' && (
                        <>
                          {booking.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                setCreatedBooking(booking);
                                setSearchParams({ tab: "bookings" });
                                toast.loading("Checking checkout status...");
                                navigate(`/book`);
                              }}
                              className="text-xs font-bold bg-green-600 text-white hover:bg-green-700 px-3.5 py-2 rounded-xl transition cursor-pointer"
                            >
                              Checkout Escrow
                            </button>
                          )}
                          {booking.status === 'COMPLETED' && !booking.review && (
                            <button 
                              onClick={() => setRatingBooking(booking)}
                              className="text-xs font-bold bg-yellow-500 text-white hover:bg-yellow-600 px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" /> Write Review
                            </button>
                          )}
                        </>
                      )}

                      {/* Worker Actions */}
                      {user?.role === 'WORKER' && (
                        <>
                          {booking.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptBooking(booking.id)}
                                className="bg-green-600 text-white hover:bg-green-700 p-2 rounded-xl cursor-pointer"
                                title="Accept Job"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleRejectBooking(booking.id)}
                                className="bg-red-500 text-white hover:bg-red-600 p-2 rounded-xl cursor-pointer"
                                title="Reject Job"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          {booking.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleCompleteBooking(booking.id)}
                              className="text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 px-3.5 py-2 rounded-xl transition cursor-pointer"
                            >
                              Mark Completed
                            </button>
                          )}
                        </>
                      )}

                      {/* Chat Button */}
                      {booking.status === 'ACCEPTED' && (
                        <button
                          onClick={() => startChatting({
                            id: user.role === 'CUSTOMER' ? booking.worker : booking.customer,
                            name: user.role === 'CUSTOMER' ? booking.worker_name : booking.customer_name
                          })}
                          className="text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Chat
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOMER ADDRESS BOOK */}
        {activeTab === "addresses" && user?.role === 'CUSTOMER' && (
          <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm max-w-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Saved Addresses</h2>
              <button 
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-bold bg-black text-white hover:bg-indigo-600 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Home, Office" 
                      className="w-full border p-2 bg-white rounded-xl outline-none"
                      onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Street Address</label>
                    <input 
                      type="text" 
                      placeholder="Building, Street name" 
                      className="w-full border p-2 bg-white rounded-xl outline-none"
                      onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">City</label>
                    <input 
                      type="text" 
                      placeholder="City" 
                      className="w-full border p-2 bg-white rounded-xl outline-none"
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">State</label>
                    <input 
                      type="text" 
                      placeholder="State" 
                      className="w-full border p-2 bg-white rounded-xl outline-none"
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Zip Code</label>
                    <input 
                      type="text" 
                      placeholder="Zip Code" 
                      className="w-full border p-2 bg-white rounded-xl outline-none"
                      onChange={(e) => setNewAddress({ ...newAddress, zip_code: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer">
                    Save Address
                  </button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="border text-xs px-4 py-2 rounded-xl cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            {addresses.length === 0 ? (
              <p className="text-gray-400 text-sm">No saved addresses yet.</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="border border-gray-100 p-4 rounded-2xl flex justify-between items-center hover:bg-gray-50/50 transition">
                    <div>
                      <p className="font-bold text-gray-800 flex items-center gap-1.5"><Map className="w-4 h-4 text-indigo-500" /> {addr.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{addr.street_address}, {addr.city}, {addr.state} - {addr.zip_code}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WORKER AVAILABILITY SLOTS */}
        {activeTab === "schedule" && user?.role === 'WORKER' && (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Create slots */}
            <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm space-y-6">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Create Time Slot</h2>

              <form onSubmit={handleAddSlot} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Slot Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white outline-none transition"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Start Time</label>
                    <input
                      type="time"
                      className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white outline-none transition"
                      value={slotTimes.start_time}
                      onChange={(e) => setSlotTimes({ ...slotTimes, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">End Time</label>
                    <input
                      type="time"
                      className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white outline-none transition"
                      value={slotTimes.end_time}
                      onChange={(e) => setSlotTimes({ ...slotTimes, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-indigo-600 py-3.5 rounded-xl font-bold transition shadow-md cursor-pointer"
                >
                  Generate Slot
                </button>
              </form>
            </div>

            {/* List slots */}
            <div className="lg:col-span-2 bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm space-y-6">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Active Calendar Slots</h2>

              {workerSlots.length === 0 ? (
                <p className="text-gray-400 text-sm">No availability slots created yet.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {workerSlots.map((slot, idx) => (
                    <div 
                      key={idx}
                      className={`border p-4 rounded-2xl text-center space-y-1 ${
                        slot.is_booked 
                          ? "bg-red-50 border-red-100 text-red-600" 
                          : "bg-green-50 border-green-100 text-green-700"
                      }`}
                    >
                      <p className="font-bold text-sm">{slot.date}</p>
                      <p className="text-xs font-semibold">{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</p>
                      <span className="inline-block mt-2 text-[9px] uppercase tracking-wider font-bold">
                        {slot.is_booked ? "Booked" : "Available"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 5: WORKER REVENUE EARNINGS ANALYTICS */}
        {activeTab === "earnings" && user?.role === 'WORKER' && (
          <div className="space-y-8">
            
            {/* Stats aggregation cards */}
            {(() => {
              const earnings = getWorkerEarningsData();
              const total = earnings.reduce((sum, item) => sum + item.amount, 0);
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full blur-xl" />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Earnings (Escrow disbursed)</p>
                    <p className="text-3xl font-black text-green-600">₹{total.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-green-500" /> Direct bank account payout</p>
                  </div>

                  <div className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm space-y-2">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Completed Jobs</p>
                    <p className="text-3xl font-black text-gray-900">{earnings.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Excellent performance rating</p>
                  </div>

                  <div className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm space-y-2">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Platform Commission Deductions</p>
                    <p className="text-3xl font-black text-indigo-600">₹{(total * 0.10).toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">10% standard admin fee</p>
                  </div>

                </div>
              );
            })()}

            {/* Interactive chart */}
            <div className="bg-white border border-gray-100 p-8 rounded-[36px] shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" /> Revenue Earnings History
              </h3>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getWorkerEarningsData()}>
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm max-w-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Notifications Center</h2>
              <button 
                onClick={() => {
                  axios.post("http://127.0.0.1:8000/notifications/mark_all_read/", {}, {
                    headers: { Authorization: `Bearer ${token}` }
                  }).then(() => {
                    toast.success("Notifications marked read!");
                    loadNotifications();
                  });
                }}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Mark all as read
              </button>
            </div>

            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm">No notifications yet.</p>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                      notif.is_read 
                        ? "bg-white border-gray-50 text-gray-500" 
                        : "bg-indigo-50/30 border-indigo-100/50 text-indigo-950 font-semibold"
                    }`}
                  >
                    <p className="font-bold">{notif.title}</p>
                    <p className="text-xs mt-1">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* --- FLOATING REVIEW MODAL --- */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <form onSubmit={handleSubmittingReview} className="bg-white p-8 rounded-[36px] max-w-md w-full space-y-6 text-center animate-in scale-in duration-200">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Submit Star Review</h3>
            <p className="text-sm text-gray-400">Share your service experience with worker {ratingBooking.worker_name}.</p>
            
            {/* Rating Stars Selection */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className="cursor-pointer transition"
                >
                  <Star className={`w-8 h-8 ${star <= reviewForm.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`} />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Tell other customers about their timeliness, expertise, and cleanup..."
              rows="3"
              className="w-full border border-gray-200 rounded-2xl p-3 bg-gray-50 focus:bg-white outline-none text-sm transition"
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            />

            <div className="flex gap-4">
              <button type="submit" className="w-full bg-black text-white py-3.5 rounded-2xl font-bold text-xs cursor-pointer shadow-md">
                Submit Review
              </button>
              <button type="button" onClick={() => setRatingBooking(null)} className="w-full border py-3.5 rounded-2xl text-xs cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- WEB-SOCKETS PRIVATE LIVE CHAT OVERLAY --- */}
      {chattingWith && (
        <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-white border border-gray-100 rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="bg-black text-white px-5 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="font-bold text-sm leading-none">{chattingWith.name}</p>
                <span className="text-[10px] text-gray-400">Live Escrow Chat</span>
              </div>
            </div>
            <button 
              onClick={() => {
                if (chatSocketRef.current) chatSocketRef.current.close();
                setChattingWith(null);
              }}
              className="text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-grow p-4 space-y-3 max-h-72 overflow-y-auto bg-gray-50/50">
            {chatMessages.map((msg, idx) => {
              const isMe = msg.sender === user.id;
              return (
                <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                    isMe 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Send secure message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow border border-gray-100 p-2.5 bg-gray-50 focus:bg-white text-xs rounded-xl outline-none"
            />
            <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl cursor-pointer">
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}

export default UserDashboard;