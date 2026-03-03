import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { FiClock, FiTrendingUp, FiUserCheck, FiUserX, FiUsers, FiPackage, FiShoppingBag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, AreaChart, Area
} from 'recharts';

const AttendanceDashboard = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [allAttendance, setAllAttendance] = useState([]);
  const [leavesData, setLeavesData] = useState([]);
  const [clientProducts, setClientProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  
  // ✅ Get clientId from localStorage
  const clientId = localStorage.getItem("clientId") || "";
  const clientData = JSON.parse(localStorage.getItem("clientData") || "{}");

  const fetchData = async () => {
    try {
      if (!clientId) {
        setError("Client ID not found. Please login again!");
        setLoading(false);
        return;
      }

      // ✅ Fetch Summary Stats with clientId
      const summaryRes = await fetch(`http://localhost:5000/api/attendance/summary/${clientId}`);
      const summaryData = await summaryRes.json();
      setAttendanceData(summaryData);

      // ✅ Fetch All Attendance for Chart with clientId
      const allAttRes = await fetch(`http://localhost:5000/api/attendance/allattendance/${clientId}`);
      const allAttData = await allAttRes.json();
      setAllAttendance(Array.isArray(allAttData) ? allAttData : allAttData.records || allAttData.allAttendance || []);

      // ✅ Fetch Approved Leaves for Chart with clientId
      const leavesRes = await fetch(`http://localhost:5000/api/leaves/leaves/${clientId}?status=approved`);
      const leavesResult = await leavesRes.json();
      setLeavesData(Array.isArray(leavesResult) ? leavesResult : leavesResult.records || leavesResult.leaves || []);

      // ✅ Get client products from localStorage
      if (clientData.accessibleProducts) {
        setClientProducts(clientData.accessibleProducts);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchData();
      const interval = setInterval(fetchData, 60000); // Update every minute
      return () => clearInterval(interval);
    } else {
      setError("Please login to view dashboard");
      setLoading(false);
    }
  }, [clientId]);

  // Process Attendance Chart Data (Top 10 Employees)
  const processAttendanceData = () => {
    if (!Array.isArray(allAttendance)) return [];

    const counts = {};
    allAttendance.forEach(record => {
      // Robust name extraction
      const name = record.employeeName ||
        (typeof record.employeeId === 'object' ? record.employeeId?.name : null) ||
        record.employeeId ||
        "Unknown Staff";

      const isPresent = record.status === "present" || record.status === "checked-in" || record.checkInTime;
      if (isPresent) {
        counts[name] = (counts[name] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Process Leaves Chart Data (Top 10 Employees)
  const processLeavesData = () => {
    if (!Array.isArray(leavesData)) return [];

    const counts = {};
    leavesData.forEach(leave => {
      const name = leave.employeeName ||
        (typeof leave.employeeId === 'object' ? leave.employeeId?.name : null) ||
        leave.employeeId ||
        "Unknown Staff";

      // Count total days of leave instead of incidents
      const leaveDays = parseFloat(leave.days) || 1;
      counts[name] = (counts[name] || 0) + leaveDays;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Product icons mapping
  const getProductIcon = (product) => {
    const icons = {
      attendance: <FiClock className="text-blue-500" />,
      coworking: <FiUsers className="text-purple-500" />,
      bmi: <FiTrendingUp className="text-green-500" />,
      health: <FiTrendingUp className="text-red-500" />,
      default: <FiPackage className="text-gray-500" />
    };
    return icons[product.toLowerCase()] || icons.default;
  };

  // Product colors mapping
  const getProductColor = (product) => {
    const colors = {
      attendance: "bg-blue-50 border-blue-200 text-blue-700",
      coworking: "bg-purple-50 border-purple-200 text-purple-700",
      bmi: "bg-green-50 border-green-200 text-green-700",
      health: "bg-red-50 border-red-200 text-red-700",
      default: "bg-gray-50 border-gray-200 text-gray-700"
    };
    return colors[product.toLowerCase()] || colors.default;
  };

  // Client Info Banner with Products
  const ClientInfo = () => (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">TH</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Welcome back, {clientData.name || 'Client'}!</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="font-mono">ID: {clientId.substring(0, 8)}...</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{clientData.companyName || 'Company'}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <FiShoppingBag className="text-gray-400" />
          <span className="text-xs text-gray-600">Active Products:</span>
          <div className="flex flex-wrap gap-2">
            {clientProducts.map((product, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getProductColor(product)}`}
              >
                {getProductIcon(product)}
                <span className="capitalize">{product}</span>
              </motion.span>
            ))}
          </div>
        </div>

        <div className="text-right bg-white/50 px-3 py-1 rounded-lg">
          <p className="text-xs text-gray-500">Total Employees</p>
          <p className="text-xl font-bold text-blue-700">
            {attendanceData?.totals?.employees || 0}
          </p>
        </div>
      </div>
    </motion.div>
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh] text-blue-600 font-medium animate-pulse">
        Initializing Dashboard Analytics...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-[80vh] text-red-500 bg-red-50 rounded-xl m-6 p-10 shadow-inner border border-red-100">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">Oops!</p>
          <p>{error}</p>
          {!clientId && (
            <button
              onClick={() => navigate("/login")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Login Again
            </button>
          )}
        </div>
      </div>
    );

  const totals = attendanceData?.totals || {};
  const attendanceChartData = processAttendanceData();
  const leavesChartData = processLeavesData();

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8 font-sans">
      {/* Main container with left padding */}
      <div className="max-w-full mx-auto pl-2 md:pl-4 lg:pl-6">
        {/* Header with Client Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Attendance Dashboard</h1>
          <p className="text-gray-600">Real-time analytics for your organization</p>
          <ClientInfo />
        </div>

        {/* ✅ Top Summary Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <StatCard
            icon={FiUsers}
            label="Total Staff"
            value={totals.employees || 0}
            color="indigo"
            onClick={() => navigate("/employeelist")}
            clientId={clientId}
          />
          <StatCard
            icon={FiUserCheck}
            label="Present Today"
            value={totals.presentToday || 0}
            color="emerald"
            onClick={() => navigate("/today-attendance")}
            clientId={clientId}
          />
          <StatCard
            icon={FiUserX}
            label="Absent Today"
            value={totals.absentToday || 0}
            color="rose"
            onClick={() => navigate("/absent-today")}
            clientId={clientId}
          />
          <StatCard
            icon={FiClock}
            label="Late Arrival"
            value={totals.lateToday || 0}
            color="amber"
            onClick={() => navigate("/late-today")}
            clientId={clientId}
          />
          <StatCard
            icon={FiTrendingUp}
            label="Success Rate"
            value={`${totals.attendanceRate || 0}%`}
            color="cyan"
            onClick={() => navigate("/attedancesummary")}
            clientId={clientId}
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attendance Performance */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Top Attendance Performance</h3>
                <p className="text-sm text-gray-500">Most consistent present employees</p>
              </div>
              <button
                onClick={() => navigate("/attedancesummary")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View Detailed Report →
              </button>
            </div>
            <div className="flex-1 w-full">
              {attendanceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceChartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={25}>
                      {attendanceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p>No attendance data available</p>
                    <p className="text-sm">Start marking attendance to see analytics</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Leave Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Leave Utilization</h3>
                <p className="text-sm text-gray-500">Approved leave counts by employee</p>
              </div>
              <button
                onClick={() => navigate("/leavelist")}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
              >
                Analyze Leaves →
              </button>
            </div>
            <div className="flex-1 w-full">
              {leavesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={leavesChartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                    <defs>
                      <linearGradient id="colorLeaves" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#f43f5e"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorLeaves)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p>No leave data available</p>
                    <p className="text-sm">No approved leaves yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Total Attendance Records</p>
            <p className="text-xl font-bold text-gray-800">{allAttendance.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Total Approved Leaves</p>
            <p className="text-xl font-bold text-gray-800">{leavesData.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Active Products</p>
            <div className="flex gap-1 mt-1">
              {clientProducts.map((product, index) => (
                <span key={index} className={`text-xs px-2 py-0.5 rounded-full capitalize ${getProductColor(product)}`}>
                  {product}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Client ID</p>
            <p className="text-sm font-mono text-gray-800 truncate">{clientId}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Updated Stat Card Component with client info
const StatCard = ({ icon: Icon, label, value, color, onClick, clientId }) => {
  const themes = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100",
    cyan: "text-cyan-600 bg-cyan-50 border-cyan-100 hover:bg-cyan-100",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-row items-center gap-3 p-3 transition-all duration-300 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg active:scale-95 group"
      onClick={onClick}
    >
      <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors ${themes[color]}`}>
        <Icon className="text-base" />
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-lg font-black text-gray-800 leading-tight">
          {typeof value === 'string' && value.includes('%') ? (
            value
          ) : (
            <CountUp end={parseFloat(value)} duration={2} />
          )}
        </p>
        {clientId && (
          <p className="text-[8px] text-gray-400 mt-1 truncate">Client ID: {clientId.substring(0, 6)}...</p>
        )}
      </div>
    </motion.div>
  );
};

export default AttendanceDashboard;