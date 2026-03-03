import axios from "axios";
import { ArrowRight, MapPin, Phone, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get clientId from localStorage
  const clientId = localStorage.getItem("clientId") || "";
  const clientData = JSON.parse(localStorage.getItem("clientData") || "{}");

  useEffect(() => {
    if (!clientId) {
      setError("Client ID not found. Please login again.");
      setLoading(false);
      return;
    }

    fetchBookings();
  }, [clientId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      // ✅ API call with clientId in URL
      const response = await axios.get(
        `http://localhost:5000/api/bookings/${clientId}`
      );

      console.log("Bookings response:", response.data);
      
      if (response.data.bookings) {
        setBookings(response.data.bookings || []);
      } else if (response.data.data) {
        setBookings(response.data.data || []);
      } else {
        setBookings([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const userName = b.userId?.name || b.name || "";
    const userMobile = b.userId?.mobile || b.mobile || "";
    const cabinName = b.cabinId?.name || "";
    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cabinName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userMobile.includes(searchTerm)
    );
  });

  const formatDate = (dateString, timeString) => {
    if (!dateString) return { date: "N/A", time: "" };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
    return { date: formattedDate, time: timeString || "N/A" };
  };

  // Client Info Banner
  const ClientInfoBanner = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <span className="font-bold text-sm">TH</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              Welcome, {clientData.name || "Client"}!
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="font-mono">Client ID: {clientId.substring(0, 8)}...</span>
              {clientData.companyName && (
                <>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{clientData.companyName}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Bookings</p>
            <p className="text-lg font-bold text-blue-700">{bookings.length}</p>
          </div>
          <button
            onClick={fetchBookings}
            className="px-3 py-1.5 bg-white text-blue-600 text-xs font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans">

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Main container with left padding */}
        <div className="pl-2 md:pl-4 lg:pl-6">
          
          {/* Client Info Banner */}
          {clientId && <ClientInfoBanner />}

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tight mb-2">All Bookings</h2>
              <p className="text-slate-500 font-medium text-sm">Manage and track workspace reservations.</p>
            </div>

            <div className="w-full md:w-auto flex gap-3">
              <div className="relative flex-grow md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition shadow-sm">
                <SlidersHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-red-100 rounded-lg text-red-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors"
                >
                  Login Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="animate-spin h-10 w-10 border-t-4 border-emerald-600 border-r-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#1E3A8A] to-[#14B8A6] px-2 py-2 text-white">
                      <th className="px-6 py-5 text-sm font-bold text-white uppercase tracking-widest pl-8">Cabin Information</th>
                      <th className="px-6 py-5 text-sm font-bold text-white uppercase tracking-widest">User Details</th>
                      <th className="px-6 py-5 text-sm font-bold text-white uppercase tracking-widest">Schedule</th>
                      <th className="px-6 py-5 text-sm font-bold text-white uppercase tracking-widest text-right pr-8">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((b) => {
                        const userName = b.userId?.name || b.name || "Unknown";
                        const userMobile = b.userId?.mobile || b.mobile || "N/A";
                        const start = formatDate(b.startDate || b.date, b.startTime || b.time);
                        const end = formatDate(b.endDate, b.endTime);

                        return (
                          <tr key={b._id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-5 pl-8">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                  <MapPin size={20} />
                                </div>
                                <div>
                                  <p className="font-bold uppercase text-slate-900 text-sm tracking-tight mb-2">
                                    {b.cabinId?.name || "Unknown Workspace"}
                                  </p>
                                  <p className="text-xs font-medium text-slate-400">
                                    ID: <span className="uppercase">{b.cabinId?._id?.slice(-6) || "N/A"}</span>
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold border border-emerald-100">
                                  {userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold uppercase text-slate-900 text-sm tracking-tight mb-2">{userName}</p>
                                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                    <Phone size={10} className="text-slate-400" /> {userMobile}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase">From</p>
                                  <p className="text-sm font-bold text-slate-900">{start.date}</p>
                                  <p className="text-xs text-slate-500">{start.time}</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-300" />
                                <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase">To</p>
                                  <p className="text-sm font-bold text-slate-900">{end.date}</p>
                                  <p className="text-xs text-slate-500">{end.time}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right pr-8">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Confirmed
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">
                          {searchTerm ? (
                            <>No bookings found matching "{searchTerm}"</>
                          ) : (
                            <>No bookings found for your account</>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((b) => {
                    const userName = b.userId?.name || b.name || "Unknown";
                    const start = formatDate(b.startDate || b.date, b.startTime || b.time);
                    const end = formatDate(b.endDate, b.endTime);

                    return (
                      <div key={b._id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                              <MapPin size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold uppercase text-slate-900 text-sm tracking-tight">
                                {b.cabinId?.name || "Workspace"}
                              </h3>
                              <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                Confirmed
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center font-bold text-slate-600 shadow-sm">
                              {userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booked By</p>
                              <p className="text-sm font-bold text-slate-900">{userName}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start</p>
                              <p className="text-sm font-bold text-slate-900">{start.date}</p>
                              <p className="text-xs text-slate-500">{start.time}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End</p>
                              <p className="text-sm font-bold text-slate-900">{end.date}</p>
                              <p className="text-xs text-slate-500">{end.time}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-400 font-medium">
                    {searchTerm ? "No bookings found." : "No bookings yet."}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer Stats */}
          {!loading && !error && filteredBookings.length > 0 && (
            <div className="mt-6 text-xs text-slate-400 flex justify-between items-center">
              <span>Showing {filteredBookings.length} of {bookings.length} bookings</span>
              <span>Client: {clientId.substring(0, 8)}...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AllBookings;