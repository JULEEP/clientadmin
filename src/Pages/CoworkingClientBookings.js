import axios from "axios";
import {
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  Ticket,
  User,
  XCircle,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CoworkingClientBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [filter, setFilter] = useState("all"); // all, confirmed, pending, cancelled
  
  const navigate = useNavigate();

  // Get client ID from localStorage
  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId");
    const storedClientName = localStorage.getItem("clientName") || "Client";
    
    if (storedClientId) {
      setClientId(storedClientId);
      setClientName(storedClientName);
    } else {
      alert("Please login first");
      navigate("/login");
    }
  }, [navigate]);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return <CheckCircle size={14} className="text-emerald-600" />;
      case 'pending': return <AlertCircle size={14} className="text-amber-600" />;
      case 'cancelled': return <XCircle size={14} className="text-red-600" />;
      default: return null;
    }
  };

  useEffect(() => {
    if (!clientId) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        if (!token) return;

        const res = await axios.get(
          `http://localhost:5050/api/bookings/client/${clientId}`,
          getAuthHeader()
        );
        
        const bookingsData = res.data.bookings || res.data || [];
        setBookings(bookingsData);
      } catch (error) {
        console.error("API ERROR:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [clientId]);

  // Filter bookings based on status
  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  // Calculate stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending' || !b.status).length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        {/* Simple Navbar */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-900">CoWorking Space</h1>
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-16 max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-slate-200 rounded mb-8"></div>
            
            {/* Stats cards skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100">
                  <div className="h-10 w-10 bg-slate-200 rounded-xl mb-3"></div>
                  <div className="h-6 w-16 bg-slate-200 rounded mb-1"></div>
                  <div className="h-3 w-20 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
            
            {/* Filter tabs skeleton */}
            <div className="flex gap-2 mb-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-8 w-20 bg-slate-200 rounded-full"></div>
              ))}
            </div>
            
            {/* Bookings skeleton */}
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex gap-4">
                    <div className="w-40 h-40 bg-slate-200 rounded-2xl"></div>
                    <div className="flex-1">
                      <div className="h-6 w-48 bg-slate-200 rounded mb-2"></div>
                      <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="h-16 bg-slate-200 rounded-xl"></div>
                        <div className="h-16 bg-slate-200 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Simple Navbar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">CoWorking Space</h1>
              <p className="text-xs text-slate-500">Welcome back, {clientName}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/client-dashboard")}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/my-cabins")}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                My Cabins
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold">
                {clientName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 px-4 sm:px-6 lg:px-8 pb-16 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-100/50 rounded-xl text-emerald-600">
            <Ticket size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tight">
              My Bookings
            </h2>
            <p className="text-sm text-slate-500 mt-1">Manage your workspace reservations</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total</p>
            <p className="text-2xl font-black text-slate-900">{totalBookings}</p>
          </div>
          
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Confirmed</p>
            <p className="text-2xl font-black text-emerald-600">{confirmedBookings}</p>
          </div>
          
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Pending</p>
            <p className="text-2xl font-black text-amber-600">{pendingBookings}</p>
          </div>
          
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Cancelled</p>
            <p className="text-2xl font-black text-red-600">{cancelledBookings}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              filter === "all" 
                ? "bg-slate-900 text-white" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All ({totalBookings})
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              filter === "confirmed" 
                ? "bg-emerald-600 text-white" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Confirmed ({confirmedBookings})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              filter === "pending" 
                ? "bg-amber-600 text-white" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Pending ({pendingBookings})
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              filter === "cancelled" 
                ? "bg-red-600 text-white" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Cancelled ({cancelledBookings})
          </button>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center">
            <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Calendar size={28} className="text-slate-300" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">No bookings found</h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              {filter === "all" 
                ? "You haven't made any reservations yet. Explore our spaces." 
                : `No ${filter} bookings found.`}
            </p>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
              >
                View All Bookings
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b._id}
                className="group bg-white rounded-[1.5rem] border border-slate-100 p-2 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col sm:flex-row gap-4"
              >
                {/* Image */}
                <div className="w-full sm:w-40 h-40 rounded-2xl overflow-hidden relative shrink-0">
                  <img
                    src={
                      b.cabinId?.images?.[0]
                        ? `http://localhost:5050/${b.cabinId.images[0]}`
                        : "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&auto=format&fit=crop"
                    }
                    alt="cabin"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Content */}
                <div className="flex-1 py-2 pr-4 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-lg font-bold uppercase text-slate-900 leading-tight">
                        {b.cabinId?.name || "Workspace"}
                      </h2>
                      <div className="flex items-center gap-1 text-slate-500 text-xs font-medium mt-0.5">
                        <MapPin size={12} className="text-emerald-500" />
                        {b.cabinId?.address || "Location not specified"}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${getStatusColor(b.status)}`}>
                      {getStatusIcon(b.status)}
                      {b.status || "Pending"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Start</p>
                      <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-sm">
                        <Calendar size={14} className="text-emerald-500" />
                        {b.startDate || "N/A"} 
                        {b.startTime && (
                          <>
                            <span className="text-slate-300 text-xs">|</span> 
                            {b.startTime}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">End</p>
                      <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-sm">
                        <Clock size={14} className="text-emerald-500" />
                        {b.endDate || "N/A"}
                        {b.endTime && (
                          <>
                            <span className="text-slate-300 text-xs">|</span> 
                            {b.endTime}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User size={12} />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{clientName}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-slate-900 font-bold text-base">
                      <IndianRupee size={16} className="text-emerald-600" />
                      {b.totalPrice?.toLocaleString("en-IN") || "0"}
                    </div>
                  </div>

                  {/* Booking ID for reference */}
                  <div className="mt-2 text-[8px] text-slate-400 font-mono">
                    ID: {b._id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/client-dashboard")}
            className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] text-white text-left hover:shadow-xl transition-all group"
          >
            <h4 className="text-xl font-black mb-2">Back to Dashboard</h4>
            <p className="text-sm text-blue-100 mb-4">View your workspace analytics and stats</p>
            <div className="flex items-center gap-2 text-sm font-bold group-hover:translate-x-2 transition-transform">
              <span>Go to Dashboard</span>
              <span>→</span>
            </div>
          </button>

          <button
            onClick={() => navigate("/my-cabins")}
            className="p-6 bg-white rounded-[2rem] border border-slate-200 text-left hover:shadow-xl transition-all group"
          >
            <h4 className="text-xl font-black text-slate-900 mb-2">Manage Cabins</h4>
            <p className="text-sm text-slate-500 mb-4">View and manage your cabin listings</p>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-600 group-hover:translate-x-2 transition-transform">
              <span>View My Cabins</span>
              <span>→</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoworkingClientBookings;