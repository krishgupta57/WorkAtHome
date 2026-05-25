import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import axios from "axios";
import { 
  Users, Briefcase, Calendar, DollarSign, Shield, ShieldCheck, 
  Trash2, UserX, BarChart3, TrendingUp, Sparkles, RefreshCw, 
  ArrowUpRight, AlertCircle, FileText, CheckCircle, Clock, MapPin, 
  Check, X, Eye, Lock, Unlock, HelpCircle, Star
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from "recharts";

function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Tab state: "overview", "bookings", "audit", "workers", "users"
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  
  const [stats, setStats] = useState({
    total_customers: 0,
    total_workers: 0,
    total_completed_bookings: 0,
    total_transaction_volume: 0,
    total_worker_payouts: 0,
    platform_earnings: 0
  });

  const [categoriesData, setCategoriesData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Selected booking for detailed inspect modal
  const [inspectBooking, setInspectBooking] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      toast.error("Unauthorized! Admins only.");
      navigate("/");
    }
  }, [user]);

  // Load dashboard data
  useEffect(() => {
    if (user && token) {
      loadStats();
      loadBookings();
      loadUsersAndWorkers();
      loadAuditLogs();
    }
  }, [user, tab]);

  const loadStats = () => {
    setLoading(true);
    axios.get("http://127.0.0.1:8000/admin-analytics/stats/", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setStats(res.data.stats);
      setCategoriesData(res.data.bookings_by_category);
      setChartData(res.data.revenue_chart_data);
      setLoading(false);
    })
    .catch(err => {
      console.log("Error loading stats:", err);
      setLoading(false);
    });
  };

  const loadBookings = () => {
    axios.get("http://127.0.0.1:8000/bookings/", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setBookings(res.data.results || res.data));
  };

  const loadUsersAndWorkers = () => {
    axios.get("http://127.0.0.1:8000/customers/", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setAllUsers(res.data.results || res.data));

    axios.get("http://127.0.0.1:8000/workers/", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setAllWorkers(res.data.results || res.data));
  };

  const loadAuditLogs = () => {
    // Generate beautiful mock financial audits dynamically from actual bookings
    axios.get("http://127.0.0.1:8000/bookings/", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const data = res.data.results || res.data;
      const completed = data.filter(b => b.status === 'COMPLETED');
      const audits = completed.map((b, i) => ({
        id: `AUD-${b.id}-${1000 + i}`,
        booking_id: b.id,
        date: b.date,
        service: b.service_name,
        customer: b.customer_name,
        worker: b.worker_name,
        total: parseFloat(b.final_price),
        payout: parseFloat(b.base_price) * 0.90,
        commission: parseFloat(b.base_price) * 0.10,
        fee: 40.00,
        status: "SETTLED"
      }));
      setAuditLogs(audits);
    });
  };

  // --- Administrative Booking Actions ---
  const handleAdminCancelBooking = (bookingId) => {
    if (window.confirm("Administrative Action: Are you sure you want to cancel this booking?")) {
      axios.post(`http://127.0.0.1:8000/bookings/${bookingId}/cancel/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        toast.success("Booking cancelled administratively.");
        loadBookings();
        setInspectBooking(null);
      })
      .catch(err => toast.error("Action not permitted."));
    }
  };

  const handleAdminVerifyWorker = (workerId) => {
    axios.put(`http://127.0.0.1:8000/workers/${workerId}/`, {
      verification_badge: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      toast.success("Service Provider successfully Verified & Vetted!");
      loadUsersAndWorkers();
    })
    .catch(err => toast.error("Verification failed."));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to remove this user from the platform?")) {
      axios.delete(`http://127.0.0.1:8000/customers/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        toast.success("User permanently removed from platform.");
        loadUsersAndWorkers();
        loadStats();
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* AIRBNB STYLE ADMIN SIDEBAR */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-8">
          
          {/* Logo / Title */}
          <div className="pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-500 fill-current" />
              <span className="text-xl font-black bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
                PlateForm Audit
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Platform Operations</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 font-semibold text-gray-500 text-sm">
            <button 
              onClick={() => setTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition text-left cursor-pointer ${tab === "overview" ? "bg-red-50 text-red-600 font-extrabold" : "hover:bg-gray-50"}`}
            >
              <BarChart3 className="w-4.5 h-4.5" /> Performance Dashboard
            </button>

            <button 
              onClick={() => setTab("bookings")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition text-left cursor-pointer ${tab === "bookings" ? "bg-red-50 text-red-600 font-extrabold" : "hover:bg-gray-50"}`}
            >
              <Calendar className="w-4.5 h-4.5" /> Bookings Ledger
            </button>

            <button 
              onClick={() => setTab("audit")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition text-left cursor-pointer ${tab === "audit" ? "bg-red-50 text-red-600 font-extrabold" : "hover:bg-gray-50"}`}
            >
              <FileText className="w-4.5 h-4.5" /> Financial Audit Ledger
            </button>

            <button 
              onClick={() => setTab("workers")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition text-left cursor-pointer ${tab === "workers" ? "bg-red-50 text-red-600 font-extrabold" : "hover:bg-gray-50"}`}
            >
              <Briefcase className="w-4.5 h-4.5" /> Vetted Host Partners
            </button>

            <button 
              onClick={() => setTab("users")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition text-left cursor-pointer ${tab === "users" ? "bg-red-50 text-red-600 font-extrabold" : "hover:bg-gray-50"}`}
            >
              <Users className="w-4.5 h-4.5" /> Customer Registry
            </button>
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-gray-100 text-[10px] text-gray-400">
          <p>WorkAtHome Inc. © 2026</p>
          <p className="mt-1">Admin Session Secure</p>
        </div>
      </div>

      {/* ADMIN CONTENT BODY */}
      <div className="flex-grow p-6 md:p-12 space-y-8 overflow-x-hidden">
        
        {/* HEADER AREA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {tab === "overview" && "Platform Operations & Insights"}
              {tab === "bookings" && "Service Bookings Lifecycle Manager"}
              {tab === "audit" && "Platform Financial Audit Ledger"}
              {tab === "workers" && "Vetted Partner Hosts Vetting Panel"}
              {tab === "users" && "Platform Customer Registry"}
            </h1>
            <p className="text-xs text-gray-400">Manage listings, review financial escrows, and audit platform volumes.</p>
          </div>
          <button 
            onClick={loadStats}
            className="flex items-center gap-1.5 self-start sm:self-center text-xs font-bold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 px-3.5 py-2 rounded-xl shadow-sm transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>

        {/* --- TAB 1: OVERVIEW & INSIGHTS --- */}
        {tab === "overview" && (
          <div className="space-y-8">
            
            {/* Airbnb Style Glassmorphic Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-gray-200/60 p-6 rounded-3xl shadow-sm space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-full blur-xl -z-10" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gross Escrow Volume</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">₹{parseFloat(stats.total_transaction_volume).toLocaleString()}</span>
                  <span className="text-xs text-green-500 font-bold flex items-center"><ArrowUpRight className="w-3 h-3" /> Live</span>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold">Total processed cash flow</p>
              </div>

              <div className="bg-white border border-gray-200/60 p-6 rounded-3xl shadow-sm space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-full blur-xl -z-10" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Net Platform Earnings</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-red-500">₹{parseFloat(stats.platform_earnings).toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold">₹40 fixed + 10% host commission</p>
              </div>

              <div className="bg-white border border-gray-200/60 p-6 rounded-3xl shadow-sm space-y-3">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Vetted Vetted Hosts</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">{stats.total_workers}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold">Service provider partners</p>
              </div>

              <div className="bg-white border border-gray-200/60 p-6 rounded-3xl shadow-sm space-y-3">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Completed Cleanings/Jobs</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">{stats.total_completed_bookings}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold">Overall successfully finished jobs</p>
              </div>

            </div>

            {/* Graphs / Charts Overview */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Category Volume chart */}
              <div className="lg:col-span-2 bg-white border border-gray-200/60 p-8 rounded-[36px] shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Demanded Booking Service Categories</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoriesData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="service__name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip cursor={{ fill: '#fafafa' }} />
                      <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} name="Completed Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Earnings Split Escrow Breakdown Card */}
              <div className="bg-white border border-gray-200/60 p-8 rounded-[36px] shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Audit Flow System</h3>
                <div className="space-y-4 text-sm leading-relaxed text-gray-500">
                  <p>WorkAtHome enforces strict **payout separations** inside the platform escrow wallet:</p>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0">✓</div>
                      <div>
                        <p className="font-bold text-gray-800 text-xs">Worker Payout Share (90%)</p>
                        <p className="text-[10.5px] text-gray-400">Total base service price minus 10% commission fee.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-red-50 text-red-500 rounded-full flex items-center justify-center font-bold text-xs shrink-0">✓</div>
                      <div>
                        <p className="font-bold text-gray-800 text-xs">Admin Platform Margin</p>
                        <p className="text-[10.5px] text-gray-400">10% commission fee + ₹40 platform booking convenience fee.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 text-xs text-red-800 leading-relaxed mt-2">
                    <strong>Vetting Requirement:</strong> Only service providers displaying the "Verified" badge are eligible to accept platform escrows.
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --- TAB 2: BOOKINGS LIFE-CYCLE MANAGER --- */}
        {tab === "bookings" && (
          <div className="bg-white border border-gray-200/60 rounded-[32px] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-gray-900">Platform Bookings Ledger</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-50 border px-3 py-1.5 rounded-full font-bold text-gray-500">Total: {bookings.length} Bookings</span>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No bookings logged on the platform yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Host Partner</th>
                      <th className="p-4">Service</th>
                      <th className="p-4">Date & Slot</th>
                      <th className="p-4">Escrow Value</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                        <td className="p-4 font-bold text-gray-900">#{b.id}</td>
                        <td className="p-4">{b.customer_name}</td>
                        <td className="p-4">{b.worker_name}</td>
                        <td className="p-4 font-semibold text-gray-800">{b.service_name}</td>
                        <td className="p-4 text-xs font-semibold">
                          <p>{b.date}</p>
                          <p className="text-gray-400 font-normal">{b.time_slot}</p>
                        </td>
                        <td className="p-4 font-black text-gray-900">₹{b.final_price}</td>
                        <td className="p-4">
                          <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full border ${
                            b.status === 'COMPLETED' ? "bg-green-50 text-green-600 border-green-100" :
                            b.status === 'ACCEPTED' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            b.status === 'REJECTED' ? "bg-red-50 text-red-600 border-red-100" :
                            b.status === 'CANCELLED' ? "bg-gray-100 text-gray-500 border-gray-200" :
                            "bg-yellow-50 text-yellow-600 border-yellow-100"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => setInspectBooking(b)}
                            className="text-xs bg-gray-50 hover:bg-red-50 hover:text-red-500 border border-gray-200 rounded-xl px-3 py-1.5 font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: PLATFORM FINANCIAL AUDIT LEDGER --- */}
        {tab === "audit" && (
          <div className="bg-white border border-gray-200/60 rounded-[32px] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-gray-900">Platform Financial Audit Ledger (SFS)</h2>
              <div className="flex gap-2">
                <span className="text-[10px] bg-green-50 border border-green-100 font-bold uppercase tracking-wider text-green-600 px-3 py-1 rounded-full">
                  Secure Escrow Active
                </span>
              </div>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No completed jobs to audit yet. Complete bookings via worker dashboards first!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="p-4">Audit ID</th>
                      <th className="p-4">Service Details</th>
                      <th className="p-4">Total Paid (Customer)</th>
                      <th className="p-4">Host Payout (90%)</th>
                      <th className="p-4">Admin Commission (10%)</th>
                      <th className="p-4">Booking Fee</th>
                      <th className="p-4">Total Net Platform Profit</th>
                      <th className="p-4">Escrow Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition text-xs font-semibold">
                        <td className="p-4 font-bold text-red-500">{log.id}</td>
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{log.service} job</p>
                          <p className="text-[10px] text-gray-400">Booking #{log.booking_id} | Host: {log.worker}</p>
                        </td>
                        <td className="p-4 font-black text-gray-900">₹{log.total.toFixed(2)}</td>
                        <td className="p-4 text-green-600 font-bold">₹{log.payout.toFixed(2)}</td>
                        <td className="p-4">₹{log.commission.toFixed(2)}</td>
                        <td className="p-4">₹{log.fee.toFixed(2)}</td>
                        <td className="p-4 text-red-600 font-black">₹{(log.commission + log.fee).toFixed(2)}</td>
                        <td className="p-4">
                          <span className="text-[8px] bg-green-50 border border-green-100 text-green-600 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: VETTED HOST PARTNERS --- */}
        {tab === "workers" && (
          <div className="bg-white border border-gray-200/60 rounded-[32px] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-gray-900">Vetted Partner Hosts Vetting Panel</h2>
              <span className="text-xs bg-gray-50 border px-3 py-1.5 rounded-full font-bold text-gray-500">Total: {allWorkers.length} Providers</span>
            </div>

            {allWorkers.length === 0 ? (
              <p className="p-8 text-gray-400 text-sm">No hosts registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                    <tr>
                      <th className="p-4">Host Partner</th>
                      <th className="p-4">Configured Skills</th>
                      <th className="p-4">Hourly Service rate</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Verification Status</th>
                      <th className="p-4">Vetting Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allWorkers.map((wrk, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                        <td className="p-4 flex items-center gap-3">
                          <img src={wrk.profile_picture || "https://api.dicebear.com/7.x/avataaars/svg"} alt="" className="w-9 h-9 rounded-full bg-gray-50 border" />
                          <div>
                            <p className="font-bold text-gray-800">{wrk.user.name}</p>
                            <p className="text-xs text-gray-400">{wrk.user.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap">
                            {wrk.skills.map((skill, sIdx) => (
                              <span key={sIdx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-black text-gray-900">₹{wrk.base_hourly_rate}</td>
                        <td className="p-4 font-bold text-yellow-500 flex items-center gap-1 mt-2.5">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{wrk.average_rating} ★</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            wrk.verification_badge 
                              ? "bg-green-50 text-green-600 border-green-100" 
                              : "bg-yellow-50 text-yellow-600 border-yellow-100"
                          }`}>
                            {wrk.verification_badge ? "Verified Vetted" : "Pending Vetting"}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2">
                          {!wrk.verification_badge ? (
                            <button
                              onClick={() => handleAdminVerifyWorker(wrk.id)}
                              className="bg-red-500 text-white hover:bg-red-600 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Approve Partner
                            </button>
                          ) : (
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Vetted Active</span>
                          )}
                          <button
                            onClick={() => handleDeleteUser(wrk.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 5: CUSTOMER REGISTRY --- */}
        {tab === "users" && (
          <div className="bg-white border border-gray-200/60 rounded-[32px] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-gray-900">Platform Customer Registry</h2>
              <span className="text-xs bg-gray-50 border px-3 py-1.5 rounded-full font-bold text-gray-500">Total: {allUsers.length} Customers</span>
            </div>
            
            {allUsers.length === 0 ? (
              <p className="p-8 text-gray-400 text-sm">No customers registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                    <tr>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Contact Phone</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((cust, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                        <td className="p-4 font-bold text-gray-800">{cust.user.name || "Customer"}</td>
                        <td className="p-4">{cust.user.email}</td>
                        <td className="p-4">{cust.phone || "N/A"}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDeleteUser(cust.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* --- FLOATING DETAILED BOOKING INSPECT MODAL --- */}
      {inspectBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[36px] max-w-lg w-full overflow-hidden shadow-2xl animate-in scale-in duration-200 border border-gray-100">
            
            {/* Header */}
            <div className="bg-black text-white px-8 py-5 flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg leading-none">Booking Audit</h3>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 inline-block">Order Ref: #{inspectBooking.id}</span>
              </div>
              <button 
                onClick={() => setInspectBooking(null)}
                className="text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details */}
            <div className="p-8 space-y-6 text-sm">
              <div className="grid grid-cols-2 gap-4 border-b border-gray-50 pb-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Customer</p>
                  <p className="font-bold text-gray-800">{inspectBooking.customer_name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Host Partner</p>
                  <p className="font-bold text-gray-800">{inspectBooking.worker_name}</p>
                </div>
              </div>

              <div className="space-y-3 border-b border-gray-50 pb-4">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Service Booking Details</p>
                <p className="flex items-center gap-1.5 text-gray-700 font-semibold"><Sparkles className="w-4 h-4 text-red-500" /> {inspectBooking.service_name}</p>
                <p className="flex items-center gap-1.5 text-gray-500"><Calendar className="w-4 h-4" /> {inspectBooking.date}</p>
                <p className="flex items-center gap-1.5 text-gray-500"><Clock className="w-4 h-4" /> {inspectBooking.time_slot}</p>
                <p className="flex items-center gap-1.5 text-gray-500"><MapPin className="w-4 h-4" /> {inspectBooking.address}</p>
              </div>

              <div className="space-y-2 bg-gray-50 border rounded-2xl p-5">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b pb-1 mb-2">Escrow Split Breakdown</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Base Host Price</span>
                  <span className="font-bold text-gray-800">₹{parseFloat(inspectBooking.base_price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Platform Booking Fee</span>
                  <span className="font-bold text-gray-800">₹{parseFloat(inspectBooking.platform_fee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Platform Commission (10%)</span>
                  <span className="font-bold text-gray-800">₹{parseFloat(inspectBooking.commission).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200/50 pt-2 flex justify-between font-black text-gray-900">
                  <span>Customer Paid Total</span>
                  <span className="text-red-500 text-lg">₹{parseFloat(inspectBooking.final_price).toFixed(2)}</span>
                </div>
              </div>

              {/* Action buttons */}
              {inspectBooking.status !== 'CANCELLED' && inspectBooking.status !== 'COMPLETED' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleAdminCancelBooking(inspectBooking.id)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl cursor-pointer shadow-sm text-xs transition"
                  >
                    Administrative Cancel Booking
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;