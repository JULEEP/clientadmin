// import axios from "axios";
// import {
//   Building,
//   Calendar,
//   TrendingDown,
//   TrendingUp,
//   Users,
//   IndianRupee,
//   Clock,
//   CheckCircle,
//   XCircle,
//   MapPin
// } from "lucide-react";
// import { useEffect, useState } from "react";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import { useNavigate } from "react-router-dom";

// /* ---------------- STAT CARD ---------------- */
// const StatCard = ({ title, value, icon: Icon, colorClass, trend, isPositive }) => (
//   <div className="bg-white p-4 rounded-[1.25rem] shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
//     <div className="flex items-start justify-between mb-3">
//       <div className={`p-2.5 rounded-xl ${colorClass} transition-transform group-hover:scale-110`}>
//         <Icon size={18} className="text-white" />
//       </div>
//       {trend && (
//         <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
//           {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
//           <span>{trend}</span>
//         </div>
//       )}
//     </div>
//     <h3 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">{value}</h3>
//     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{title}</p>
//   </div>
// );

// /* ---------------- BOOKING CARD ---------------- */
// const BookingCard = ({ booking }) => {
//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
//       case 'pending': return 'bg-amber-50 text-amber-600 border-amber-200';
//       case 'cancelled': return 'bg-red-50 text-red-600 border-red-200';
//       default: return 'bg-slate-50 text-slate-600 border-slate-200';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch(status) {
//       case 'confirmed': return <CheckCircle size={12} />;
//       case 'pending': return <Clock size={12} />;
//       case 'cancelled': return <XCircle size={12} />;
//       default: return null;
//     }
//   };

//   return (
//     <div className="flex items-start gap-3">
//       <div className="flex items-center justify-center text-xs font-bold border rounded-full w-9 h-9 bg-emerald-50 text-emerald-600 shrink-0 border-emerald-100">
//         {booking.cabinId?.name?.charAt(0).toUpperCase() || "C"}
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="text-sm font-bold truncate text-slate-900">
//           {booking.cabinId?.name || "Workspace"}
//         </p>
//         <p className="text-xs font-medium text-slate-500 mb-0.5 truncate">
//           {booking.cabinId?.address || "Location not specified"}
//         </p>
//         <div className="flex items-center justify-between">
//           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
//             {new Date(booking.createdAt).toLocaleDateString()}
//           </p>
//           <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(booking.status)}`}>
//             {getStatusIcon(booking.status)}
//             {booking.status || "Pending"}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ---------------- HELPER: MONTH-WISE BOOKINGS ---------------- */
// const getMonthlyBookings = (bookings) => {
//   const months = [
//     "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
//   ];

//   const map = {};

//   bookings.forEach((b) => {
//     const date = new Date(b.createdAt);
//     const month = months[date.getMonth()];
//     map[month] = (map[month] || 0) + 1;
//   });

//   return months.map((m) => ({
//     month: m,
//     bookings: map[m] || 0,
//   }));
// };

// /* ---------------- CLIENT DASHBOARD ---------------- */
// const CoworkingClientDashboard = () => {
//   const [clientId, setClientId] = useState("");
//   const [clientName, setClientName] = useState("");
//   const [loading, setLoading] = useState(true);
  
//   // Stats - exactly like admin dashboard
//   const [totalUsers] = useState(1); // Fixed as per admin
//   const [activeCabins, setActiveCabins] = useState(0);
//   const [myCabinsCount, setMyCabinsCount] = useState(0);
//   const [myBookingsCount, setMyBookingsCount] = useState(0);
//   const [recentBookings, setRecentBookings] = useState([]);
//   const [bookingChartData, setBookingChartData] = useState([]);
  
//   const navigate = useNavigate();

//   const getAuthHeader = () => {
//     const token = localStorage.getItem("token") || localStorage.getItem("authToken");
//     return { headers: { Authorization: `Bearer ${token}` } };
//   };

//   // Get client ID from localStorage
//   useEffect(() => {
//     const storedClientId = localStorage.getItem("clientId");
//     const storedClientName = localStorage.getItem("clientName") || "Client";
    
//     if (storedClientId) {
//       setClientId(storedClientId);
//       setClientName(storedClientName);
//     } else {
//       alert("Please login first");
//       navigate("/login");
//     }
//   }, [navigate]);

//   /* ---------- FETCH ALL ACTIVE CABINS ---------- */
//   useEffect(() => {
//     axios
//       .get("http://localhost:5050/api/cabins")
//       .then((res) => {
//         const cabins = res.data.cabins || res.data;
//         setActiveCabins(Array.isArray(cabins) ? cabins.length : 0);
//       })
//       .catch((err) => console.log(err));
//   }, []);

//   /* ---------- FETCH CLIENT'S CABINS ---------- */
//   useEffect(() => {
//     if (!clientId) return;

//     axios
//       .get(`http://localhost:5050/api/cabins/my-cabins/${clientId}`, getAuthHeader())
//       .then((res) => {
//         const cabins = res.data.cabins || res.data;
//         setMyCabinsCount(Array.isArray(cabins) ? cabins.length : 0);
//       })
//       .catch((err) => console.error("Error fetching my cabins", err));
//   }, [clientId]);

//   /* ---------- FETCH CLIENT'S BOOKINGS ---------- */
//   useEffect(() => {
//     if (!clientId) return;

//     const fetchMyBookings = async () => {
//       try {
//         setLoading(true);
        
//         const response = await axios.get(
//           `http://localhost:5050/api/bookings/client/${clientId}`,
//           getAuthHeader()
//         );

//         if (response.data.success || response.data.bookings) {
//           const bookings = response.data.bookings || [];
          
//           setMyBookingsCount(bookings.length);

//           const recent = [...bookings]
//             .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//             .slice(0, 5);

//           setRecentBookings(recent);

//           const monthlyData = getMonthlyBookings(bookings);
//           setBookingChartData(monthlyData);
//         }
//       } catch (err) {
//         console.error("Error fetching bookings:", err);
//         setMyBookingsCount(0);
//         setRecentBookings([]);
//         setBookingChartData(getMonthlyBookings([]));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMyBookings();
//   }, [clientId]);

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen font-sans bg-slate-50">
//         {/* Simple Navbar - exactly like admin */}
//         <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
//           <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
//             <div className="flex items-center justify-between">
//               <h1 className="text-xl font-bold text-slate-900">CoWorking Space</h1>
//               <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
//             </div>
//           </div>
//         </div>
        
//         <div className="px-4 pt-24 pb-12 mx-auto sm:px-6 lg:px-8 max-w-7xl">
//           <div className="animate-pulse">
//             <div className="w-48 h-8 mb-2 rounded bg-slate-200"></div>
//             <div className="w-32 h-4 mb-8 rounded bg-slate-200"></div>
//             <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
//               {[1,2,3,4].map(i => (
//                 <div key={i} className="bg-white p-4 rounded-[1.25rem] border border-slate-100">
//                   <div className="w-10 h-10 mb-3 bg-slate-200 rounded-xl"></div>
//                   <div className="w-16 h-6 mb-1 rounded bg-slate-200"></div>
//                   <div className="w-20 h-3 rounded bg-slate-200"></div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen font-sans bg-slate-50">
//       {/* Navbar - exactly like admin */}
//       <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
//         <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between">
//             <h1 className="text-xl font-bold text-slate-900">CoWorking Space</h1>
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => navigate("/my-cabins")}
//                 className="text-sm font-medium transition-colors text-slate-600 hover:text-slate-900"
//               >
//                 My Cabins
//               </button>
//               <button
//                 onClick={() => navigate("/my-bookings")}
//                 className="text-sm font-medium transition-colors text-slate-600 hover:text-slate-900"
//               >
//                 My Bookings
//               </button>
//               <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full bg-gradient-to-r from-blue-600 to-indigo-700">
//                 {clientName.charAt(0).toUpperCase()}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <main className="px-4 pt-24 pb-12 mx-auto sm:px-6 lg:px-8 max-w-7xl">
//         <div className="mb-8">
//           <h2 className="text-2xl font-black tracking-tight uppercase text-slate-900">Dashboard Overview</h2>
//           <p className="text-sm font-medium text-slate-500">Welcome back, {clientName}</p>
//         </div>

//         {/* ---------- STATS GRID - EXACTLY LIKE ADMIN ---------- */}
//         <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4 md:gap-6">
//           <StatCard
//             title="Users"
//             value={totalUsers}
//             icon={Users}
//             colorClass="bg-blue-500 shadow-blue-500/30"
//           />

//           <StatCard
//             title="Active Cabins"
//             value={activeCabins}
//             icon={Building}
//             colorClass="bg-emerald-500 shadow-emerald-500/30"
//           />

//           <StatCard
//             title="My Cabins"
//             value={myCabinsCount}
//             icon={Building}
//             colorClass="bg-slate-900 shadow-slate-900/30"
//           />

//           <StatCard
//             title="My Bookings"
//             value={myBookingsCount}
//             icon={Calendar}
//             colorClass="bg-indigo-500 shadow-indigo-500/30"
//           />
//         </div>

//         {/* ---------- CONTENT - EXACTLY LIKE ADMIN ---------- */}
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//           {/* ---------- BOOKINGS BAR CHART ---------- */}
//           <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-lg font-bold tracking-tight text-slate-900">
//                 Booking Trends
//               </h3>
//               <select className="px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-slate-50 border-slate-200 text-slate-600 focus:border-emerald-500">
//                 <option>This Year</option>
//                 <option>Last Year</option>
//               </select>
//             </div>

//             {myBookingsCount === 0 ? (
//               <div className="h-[300px] flex items-center justify-center">
//                 <div className="text-center">
//                   <Calendar size={48} className="mx-auto mb-3 text-slate-300" />
//                   <p className="text-sm text-slate-500">No booking data available</p>
//                 </div>
//               </div>
//             ) : (
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={bookingChartData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
//                   <XAxis
//                     dataKey="month"
//                     stroke="#94A3B8"
//                     fontSize={12}
//                     tickLine={false}
//                     axisLine={false}
//                     dy={10}
//                   />
//                   <YAxis
//                     stroke="#94A3B8"
//                     fontSize={12}
//                     tickLine={false}
//                     axisLine={false}
//                     dx={-10}
//                   />
//                   <Tooltip
//                     cursor={{ fill: '#F8FAFC' }}
//                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
//                   />
//                   <Bar
//                     dataKey="bookings"
//                     fill="#10B981"
//                     radius={[6, 6, 0, 0]}
//                     barSize={32}
//                   />
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </div>

//           {/* ---------- RECENT BOOKINGS ---------- */}
//           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
//             <h3 className="mb-6 text-lg font-bold tracking-tight text-slate-900">
//               Recent Activity
//             </h3>

//             <div className="space-y-5">
//               {recentBookings.length === 0 ? (
//                 <div className="py-8 text-sm text-center text-slate-400">
//                   No recent activity
//                 </div>
//               ) : (
//                 recentBookings.map((b) => (
//                   <BookingCard key={b._id} booking={b} />
//                 ))
//               )}
//             </div>

//             <button 
//               onClick={() => navigate("/my-bookings")}
//               className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
//             >
//               View All Bookings
//             </button>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default CoworkingClientDashboard;


// import axios from "axios";
// import {
//   Building,
//   Calendar,
//   Users
// } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import AdminNavbar from "./AdminNavbar";

// // ========== YAHAN STATCARD COMPONENT JODEN ==========
// const StatCard = ({ title, value, icon: Icon, colorClass, borderColor }) => {
//   return (
//     <div
//       className="flex items-center gap-2 px-3 py-2 bg-white border-t-4 shadow-sm rounded-xl"
//       style={{ borderTopColor: borderColor }}
//     >
//       <div className={`p-2 rounded-lg ${colorClass}`}>
//         <Icon className="w-4 h-4 text-white" />
//       </div>
//       <span className="text-sm text-gray-700 whitespace-nowrap">
//         {title}: <span className="font-semibold text-gray-900">{value}</span>
//       </span>
//     </div>
//   );
// };

// // ========== YAHAN HELPER FUNCTION JODEN ==========
// const getMonthlyBookings = (bookings) => {
//   const months = [
//     "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
//   ];

//   const map = {};

//   bookings.forEach((b) => {
//     const date = new Date(b.createdAt);
//     const month = months[date.getMonth()];
//     map[month] = (map[month] || 0) + 1;
//   });

//   return months.map((m) => ({
//     month: m,
//     bookings: map[m] || 0,
//   }));
// };

// // ========== MAIN COMPONENT ==========
// const CoworkingClientDashboard = () => {
//   const [clientId, setClientId] = useState("");
//   const [clientName, setClientName] = useState("");
//   const [loading, setLoading] = useState(true);
  
//   const [totalCabins, setTotalCabins] = useState(0);
//   const [myCabinsCount, setMyCabinsCount] = useState(0);
//   const [myBookingsCount, setMyBookingsCount] = useState(0);
//   const [recentBookings, setRecentBookings] = useState([]);
//   const [bookingChartData, setBookingChartData] = useState([]);
  
//   const navigate = useNavigate();

//   const getAuthHeader = () => {
//     const token = localStorage.getItem("token") || localStorage.getItem("authToken");
//     return { headers: { Authorization: `Bearer ${token}` } };
//   };

//   useEffect(() => {
//     const storedClientId = localStorage.getItem("clientId");
//     const storedClientName = localStorage.getItem("clientName") || "Client";
    
//     if (storedClientId) {
//       setClientId(storedClientId);
//       setClientName(storedClientName);
//     } else {
//       alert("Please login first");
//       navigate("/login");
//     }
//   }, [navigate]);

//   useEffect(() => {
//     axios
//       .get("http://localhost:5050/api/cabins")
//       .then((res) => {
//         const cabins = res.data.cabins || res.data;
//         setTotalCabins(Array.isArray(cabins) ? cabins.length : 0);
//       })
//       .catch((err) => console.log(err));
//   }, []);

//   useEffect(() => {
//     if (!clientId) return;

//     axios
//       .get(`http://localhost:5050/api/cabins/my-cabins/${clientId}`, getAuthHeader())
//       .then((res) => {
//         const cabins = res.data.cabins || res.data;
//         setMyCabinsCount(Array.isArray(cabins) ? cabins.length : 0);
//       })
//       .catch((err) => console.error("Error fetching my cabins", err));
//   }, [clientId]);

//   useEffect(() => {
//     if (!clientId) return;

//     const fetchMyBookings = async () => {
//       try {
//         setLoading(true);
        
//         const response = await axios.get(
//           `http://localhost:5050/api/bookings/client/${clientId}`,
//           getAuthHeader()
//         );

//         if (response.data.success || response.data.bookings) {
//           const bookings = response.data.bookings || [];
          
//           setMyBookingsCount(bookings.length);

//           const recent = [...bookings]
//             .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//             .slice(0, 5);

//           setRecentBookings(recent);

//           const monthlyData = getMonthlyBookings(bookings);
//           setBookingChartData(monthlyData);
//         }
//       } catch (err) {
//         console.error("Error fetching bookings:", err);
//         setMyBookingsCount(0);
//         setRecentBookings([]);
//         setBookingChartData(getMonthlyBookings([]));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMyBookings();
//   }, [clientId]);

//   if (loading) {
//     return (
//       <div className="min-h-screen font-sans bg-slate-50">
//         <AdminNavbar />
//         <main className="w-full px-4 pb-12 mx-auto pt-28 sm:px-6 lg:px-8">
//           <div className="mb-8">
//             <div className="w-48 h-8 mb-2 rounded bg-slate-200 animate-pulse"></div>
//             <div className="w-32 h-4 rounded bg-slate-200 animate-pulse"></div>
//           </div>
//           <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
//             {[1, 2, 3, 4].map(i => (
//               <div key={i} className="px-3 py-2 bg-white shadow-sm rounded-xl h-14 animate-pulse"></div>
//             ))}
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen font-sans bg-slate-50">
//       <AdminNavbar />

//       <main className="w-full px-4 pb-12 mx-auto pt-28 sm:px-6 lg:px-8">
//         <div className="mb-8">
//           <h2 className="text-2xl font-black tracking-tight uppercase text-slate-900">Dashboard Overview</h2>
//           <p className="text-sm font-medium text-slate-500">Welcome back, {clientName}</p>
//         </div>

//         <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
//           <StatCard
//             title="Users"
//             value={1}
//             icon={Users}
//             colorClass="bg-blue-500"
//             borderColor="#3b82f6"
//           />

//           <StatCard
//             title="Active Cabins"
//             value={totalCabins}
//             icon={Building}
//             colorClass="bg-emerald-500"
//             borderColor="#22c55e"
//           />

//           <StatCard
//             title="My Cabins"
//             value={myCabinsCount}
//             icon={Building}
//             colorClass="bg-slate-900"
//             borderColor="#1f2937"
//           />

//           <StatCard
//             title="My Bookings"
//             value={myBookingsCount}
//             icon={Calendar}
//             colorClass="bg-indigo-500"
//             borderColor="#6366f1"
//           />
//         </div>

//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//           <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-lg font-bold tracking-tight text-slate-900">
//                 Booking Trends
//               </h3>
//               <select className="px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-slate-50 border-slate-200 text-slate-600 focus:border-emerald-500">
//                 <option>This Year</option>
//                 <option>Last Year</option>
//               </select>
//             </div>

//             {myBookingsCount === 0 ? (
//               <div className="h-[300px] flex items-center justify-center">
//                 <div className="text-center">
//                   <Calendar size={48} className="mx-auto mb-3 text-slate-300" />
//                   <p className="text-sm text-slate-500">No booking data available</p>
//                 </div>
//               </div>
//             ) : (
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={bookingChartData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
//                   <XAxis
//                     dataKey="month"
//                     stroke="#94A3B8"
//                     fontSize={12}
//                     tickLine={false}
//                     axisLine={false}
//                     dy={10}
//                   />
//                   <YAxis
//                     stroke="#94A3B8"
//                     fontSize={12}
//                     tickLine={false}
//                     axisLine={false}
//                     dx={-10}
//                   />
//                   <Tooltip
//                     cursor={{ fill: '#F8FAFC' }}
//                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
//                   />
//                   <Bar
//                     dataKey="bookings"
//                     fill="#10B981"
//                     radius={[6, 6, 0, 0]}
//                     barSize={32}
//                   />
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </div>

//           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
//             <h3 className="mb-6 text-lg font-bold tracking-tight text-slate-900">
//               Recent Activity
//             </h3>

//             <div className="space-y-5">
//               {recentBookings.length === 0 ? (
//                 <div className="py-8 text-sm text-center text-slate-400">
//                   No recent activity
//                 </div>
//               ) : (
//                 recentBookings.map((b) => (
//                   <div key={b._id} className="flex items-start gap-3">
//                     <div className="flex items-center justify-center text-xs font-bold border rounded-full w-9 h-9 bg-emerald-50 text-emerald-600 shrink-0 border-emerald-100">
//                       {b.cabinId?.name?.charAt(0).toUpperCase() || "C"}
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-sm font-bold truncate text-slate-900">
//                         {b.cabinId?.name || "Workspace"}
//                       </p>
//                       <p className="text-xs font-medium text-slate-500 mb-0.5 truncate">
//                         Reserved by <span className="text-slate-700">{b.userId?.name || "You"}</span>
//                       </p>
//                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
//                         {new Date(b.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>

//             <button 
//               onClick={() => navigate("/my-bookings")}
//               className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
//             >
//               View All Bookings
//             </button>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default CoworkingClientDashboard;


import axios from "axios";
import {
    Building,
    Calendar,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import AdminNavbar from "../Components/AdminNavbar";

/* ---------------- STAT CARD ---------------- */

const StatCard = ({ title, value, icon: Icon, colorClass, borderColor }) => {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 bg-white border-t-4 shadow-sm rounded-xl"
      style={{ borderTopColor: borderColor }}
    >
      {/* Colorful Icon */}
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>

      {/* Title + Value (same line) */}
      <span className="text-sm text-gray-700 whitespace-nowrap">
        {title}: <span className="font-semibold text-gray-900">{value}</span>
      </span>
    </div>
  );
};

/* ---------------- HELPER: MONTH-WISE BOOKINGS ---------------- */

const getMonthlyBookings = (bookings) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const map = {};

  bookings.forEach((b) => {
    const date = new Date(b.createdAt);
    const month = months[date.getMonth()];
    map[month] = (map[month] || 0) + 1;
  });

  return months.map((m) => ({
    month: m,
    bookings: map[m] || 0,
  }));
};

/* ---------------- DASHBOARD ---------------- */

const CoworkingClientDashboard = () => {
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [totalCabins, setTotalCabins] = useState(0);
  const [myCabinsCount, setMyCabinsCount] = useState(0);
  const [myBookingsCount, setMyBookingsCount] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingChartData, setBookingChartData] = useState([]);
  
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  /* ---------- GET CLIENT INFO ---------- */
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

  /* ---------- TOTAL CABINS ---------- */
  useEffect(() => {
    axios
      .get("http://localhost:5050/api/cabins")
      .then((res) => {
        const cabins = res.data.cabins || res.data;
        setTotalCabins(Array.isArray(cabins) ? cabins.length : 0);
      })
      .catch((err) => console.log(err));
  }, []);

  /* ---------- MY CABINS ---------- */
  useEffect(() => {
    if (!clientId) return;

    axios
      .get(`http://localhost:5050/api/cabins/my-cabins/${clientId}`, getAuthHeader())
      .then((res) => {
        const cabins = res.data.cabins || res.data;
        setMyCabinsCount(Array.isArray(cabins) ? cabins.length : 0);
      })
      .catch((err) => console.error("Error fetching my cabins", err));
  }, [clientId]);

  /* ---------- MY BOOKINGS + CHART ---------- */
  useEffect(() => {
    if (!clientId) return;

    const fetchMyBookings = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(
          `http://localhost:5050/api/bookings/client/${clientId}`,
          getAuthHeader()
        );

        if (response.data.success || response.data.bookings) {
          const bookings = response.data.bookings || [];
          
          setMyBookingsCount(bookings.length);

          const recent = [...bookings]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

          setRecentBookings(recent);

          const monthlyData = getMonthlyBookings(bookings);
          setBookingChartData(monthlyData);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setMyBookingsCount(0);
        setRecentBookings([]);
        setBookingChartData(getMonthlyBookings([]));
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen font-sans bg-slate-50">
        <AdminNavbar />
        <main className="w-full px-4 pt-24 pb-12 mx-auto sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="w-48 h-8 mb-2 rounded bg-slate-200 animate-pulse"></div>
            <div className="w-32 h-4 rounded bg-slate-200 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="px-3 py-2 bg-white shadow-sm rounded-xl h-14 animate-pulse"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <AdminNavbar />

      <main className="w-full px-4 pt-24 pb-12 mx-auto sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-black tracking-tight uppercase text-slate-900">Dashboard Overview</h2>
          <p className="text-sm font-medium text-slate-500">Welcome back, {clientName}</p>
        </div>

        {/* ---------- STATS GRID ---------- */}
        <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
          <StatCard
            title="Users"
            value={1}
            icon={Users}
            colorClass="bg-blue-500"
            borderColor="#3b82f6"
          />

          <StatCard
            title="Active Cabins"
            value={totalCabins}
            icon={Building}
            colorClass="bg-emerald-500"
            borderColor="#22c55e"
          />

          <StatCard
            title="My Cabins"
            value={myCabinsCount}
            icon={Building}
            colorClass="bg-slate-900"
            borderColor="#1f2937"
          />

          <StatCard
            title="My Bookings"
            value={myBookingsCount}
            icon={Calendar}
            colorClass="bg-indigo-500"
            borderColor="#6366f1"
          />
        </div>

        {/* ---------- CONTENT ---------- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ---------- BOOKINGS BAR CHART ---------- */}
          <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Booking Trends
              </h3>
              <select className="px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-slate-50 border-slate-200 text-slate-600 focus:border-emerald-500">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>

            {myBookingsCount === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Calendar size={48} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm text-slate-500">No booking data available</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bookingChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar
                    dataKey="bookings"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ---------- RECENT BOOKINGS ---------- */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="mb-6 text-lg font-bold tracking-tight text-slate-900">
              Recent Activity
            </h3>

            <div className="space-y-5">
              {recentBookings.length === 0 ? (
                <div className="py-8 text-sm text-center text-slate-400">
                  No recent activity
                </div>
              ) : (
                recentBookings.map((b) => (
                  <div key={b._id} className="flex items-start gap-3">
                    <div className="flex items-center justify-center text-xs font-bold border rounded-full w-9 h-9 bg-emerald-50 text-emerald-600 shrink-0 border-emerald-100">
                      {b.cabinId?.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate text-slate-900">
                        {b.cabinId?.name || "Workspace"}
                      </p>
                      <p className="text-xs font-medium text-slate-500 mb-0.5 truncate">
                        Reserved by <span className="text-slate-700">{b.userId?.name || "You"}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => navigate("/my-bookings")}
              className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              View All Bookings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoworkingClientDashboard;