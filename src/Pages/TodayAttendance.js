// // src/pages/TodayAttendance.jsx
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const TodayAttendance = () => {
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchTodayAttendance();
//   }, []);

//   const fetchTodayAttendance = async () => {
//     try {
//       setLoading(true);
//       const resp = await axios.get(
//         "https://api.timelyhealth.in//api/attendance/today"
//       );

//       let records = resp.data.records || [];

//       const formattedRecords = records.map((rec) => ({
//         ...rec,
//         employeeName: rec.employeeName || rec.employee?.name || "-",
//         employeeEmail: rec.employeeEmail || rec.employee?.email || "-",
//       }));

//       setTodayRecords(formattedRecords);
//     } catch (err) {
//       setError("Failed to fetch today's attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "checked-in":
//         return "bg-green-100 text-green-800";
//       case "checked-out":
//         return "bg-blue-100 text-blue-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   if (loading)
//     return <p className="mt-6 text-center text-gray-600">Loading today's attendance...</p>;

//   if (error)
//     return <p className="mt-6 text-center text-red-600">{error}</p>;

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold text-gray-800">Today's Attendance</h3>

//         <button
//           onClick={() => navigate("/attendance-records")}
//           className="px-4 py-2 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700"
//         >
//           View All Records
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm text-left border border-gray-200">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee ID</th>
//               <th className="px-4 py-2 border">Name</th>
//               <th className="px-4 py-2 border">Check In</th>
//               <th className="px-4 py-2 border">Check Out</th>
//               <th className="px-4 py-2 border">Total Hours</th>
//               <th className="px-4 py-2 border">Distance (m)</th>
//               <th className="px-4 py-2 border">Onsite</th>
//               <th className="px-4 py-2 border">Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {todayRecords.length > 0 ? (
//               todayRecords.map((rec) => (
//                 <tr key={rec._id} className="border-t hover:bg-gray-50">
//                   <td className="px-4 py-2 font-medium">{rec.employeeId}</td>
//                   <td className="px-4 py-2">{rec.employeeName}</td>
//                   <td className="px-4 py-2">
//                     {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "-"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "-"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.totalHours ? Number(rec.totalHours).toFixed(2) : "0.00"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.distance ? Number(rec.distance).toFixed(2) : "0.00"}
//                   </td>
//                   <td className="px-4 py-2">{rec.onsite ? "Yes" : "No"}</td>
//                   <td className="px-4 py-2">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                         rec.status
//                       )}`}
//                     >
//                       {rec.status || "-"}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={8} className="py-4 text-center text-gray-500">
//                   No attendance records for today.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TodayAttendance;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// // const BASE_URL = "https://api.timelyhealth.in/"; // replace with your backend base URL

// const TodayAttendance = () => {
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchTodayAttendance();
//   }, []);

//   const fetchTodayAttendance = async () => {
//     try {
//       setLoading(true);
//       const resp = await axios.get("https://api.timelyhealth.in//api/attendance/today");
//       if (resp.data && resp.data.records) {
//         setTodayRecords(resp.data.records);
//       }
//     } catch (err) {
//       console.error("Error fetching today's attendance:", err);
//       setError("Failed to fetch today's attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "checked-in":
//         return "bg-green-100 text-green-800";
//       case "checked-out":
//         return "bg-blue-100 text-blue-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   if (loading)
//     return <p className="mt-6 text-center text-gray-600">Loading today's attendance...</p>;
//   if (error) return <p className="mt-6 text-center text-red-600">{error}</p>;

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold text-gray-800">Today's Attendance</h3>
//         <button
//           onClick={() => navigate("/attendance-records")}
//           className="px-4 py-2 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700"
//         >
//           View All Records
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm text-left border border-gray-200">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee ID</th>
//               <th className="px-4 py-2 border">Email</th>
//               <th className="px-4 py-2 border">Check In</th>
//               <th className="px-4 py-2 border">Check Out</th>
//               <th className="px-4 py-2 border">Total Hours</th>
//               <th className="px-4 py-2 border">Distance (m)</th>
//               <th className="px-4 py-2 border">Onsite</th>
//               <th className="px-4 py-2 border">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {todayRecords.length > 0 ? (
//               todayRecords.map((rec) => (
//                 <tr
//                   key={rec._id}
//                   className="border-t cursor-pointer hover:bg-gray-50"
//                   onClick={() =>
//                     navigate(`/employee-details/${rec.employeeId}`)
//                   }
//                 >
//                   <td className="px-4 py-2 font-medium">{rec.employeeId}</td>
//                   <td className="px-4 py-2">{rec.employeeEmail}</td>
//                   <td className="px-4 py-2">
//                     {rec.checkInTime
//                       ? new Date(rec.checkInTime).toLocaleTimeString()
//                       : "-"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.checkOutTime
//                       ? new Date(rec.checkOutTime).toLocaleTimeString()
//                       : "-"}
//                   </td>
//                   <td className="px-4 py-2">{rec.totalHours?.toFixed(2) || "-"}</td>
//                   <td className="px-4 py-2">{rec.distance?.toFixed(2) || "-"}</td>
//                   <td className="px-4 py-2">{rec.onsite ? "Yes" : "No"}</td>
//                   <td className="px-4 py-2">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                         rec.status
//                       )}`}
//                     >
//                       {rec.status || "-"}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={8} className="py-4 text-center text-gray-500">
//                   No attendance records for today.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TodayAttendance;

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isEmployeeHidden } from "../utils/employeeStatus";
import { motion } from "framer-motion";

const BASE_URL = "http://localhost:5000";

const TodayAttendance = () => {
  const [todayRecords, setTodayRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientInfo, setClientInfo] = useState(null);
  const navigate = useNavigate();

  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || '';

  useEffect(() => {
    if (!clientId) {
      setError("Client ID not found. Please login again.");
      setLoading(false);
      return;
    }

    fetchTodayAttendance();
  }, [clientId]);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);

      // Get client data from localStorage
      const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');
      setClientInfo(clientData);

      // 1️⃣ Fetch today's attendance with clientId in params
      const attendanceResp = await axios.get(
        `${BASE_URL}/api/attendance/today/${clientId}`
      );

      // Handle different response structures
      let attendance = [];
      if (attendanceResp.data?.records && Array.isArray(attendanceResp.data.records)) {
        attendance = attendanceResp.data.records;
      } else if (Array.isArray(attendanceResp.data)) {
        attendance = attendanceResp.data;
      } else if (attendanceResp.data?.data && Array.isArray(attendanceResp.data.data)) {
        attendance = attendanceResp.data.data;
      }

      // 2️⃣ Fetch employee list with clientId
      const empResp = await axios.get(
        `${BASE_URL}/api/employees/get-employees/${clientId}`
      );

      // Handle different response structures for employees
      let employees = [];
      if (Array.isArray(empResp.data)) {
        employees = empResp.data;
      } else if (empResp.data?.employees && Array.isArray(empResp.data.employees)) {
        employees = empResp.data.employees;
      } else if (empResp.data?.data && Array.isArray(empResp.data.data)) {
        employees = empResp.data.data;
      }

      // 3️⃣ Map employee name into attendance records
      const merged = attendance.map((rec) => {
        const empId =
          rec.employeeId?._id ||
          rec.employeeId?.employeeId ||
          rec.employeeId ||
          rec.empId ||
          "";

        const employee = employees.find(
          (e) =>
            e.employeeId === empId ||
            e._id === empId ||
            e.empId === empId
        );

        return {
          ...rec,
          name: employee?.name || employee?.fullName || "N/A",
          employeeDetails: employee || null,
        };
      });

      // Filter out inactive employees
      const activeRecords = merged.filter((rec) => {
        const empId =
          rec.employeeId?.employeeId ||
          (typeof rec.employeeId === 'string' ? rec.employeeId : '') ||
          rec.empId ||
          "";

        // Find the employee in the full list to check their database status
        const employee = employees.find(e => e.employeeId === empId || e._id === empId);

        // Use central utility
        return !isEmployeeHidden(employee || { employeeId: empId });
      });

      setTodayRecords(activeRecords);
    } catch (err) {
      console.error("Error fetching today's attendance:", err);
      setError(err.response?.data?.message || "Failed to fetch today's attendance");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "checked-in":
        return "bg-green-100 text-green-800 border border-green-300";
      case "checked-out":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!clientId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
          <div className="mb-4 text-4xl text-red-500">🔒</div>
          <p className="mb-4 text-lg font-semibold text-red-600">Client ID not found!</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading today's attendance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
          <div className="mb-4 text-4xl text-red-500">❌</div>
          <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
          <button
            onClick={fetchTodayAttendance}
            className="px-6 py-2 font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto">

        {/* Client Info Banner */}
        {clientInfo && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-white border border-blue-200 rounded-xl shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">TH</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Welcome, {clientInfo.name || 'Client'}!</p>
                  <p className="text-xs text-gray-500">ID: {clientId.substring(0, 8)}...</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                  {clientInfo.companyName || 'Company'}
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full">
                  {clientInfo.location || 'Location'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Today's Attendance
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchTodayAttendance}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            <button
              onClick={() => navigate("/attendancelist")}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition shadow-sm"
            >
              View All Records
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500">Total Today</p>
            <p className="text-xl font-bold text-blue-600">{todayRecords.length}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500">Checked In</p>
            <p className="text-xl font-bold text-green-600">
              {todayRecords.filter(r => r.status === "checked-in").length}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500">Checked Out</p>
            <p className="text-xl font-bold text-purple-600">
              {todayRecords.filter(r => r.status === "checked-out").length}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500">Onsite</p>
            <p className="text-xl font-bold text-orange-600">
              {todayRecords.filter(r => r.onsite).length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {todayRecords.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">📭</div>
              <p className="mb-2 text-lg font-semibold text-gray-600">
                No attendance records for today
              </p>
              <p className="text-sm text-gray-500">
                No one has checked in yet today
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Employee ID</th>
                      <th className="px-6 py-4 text-left font-semibold">Name</th>
                      <th className="px-6 py-4 text-left font-semibold">Date</th>
                      <th className="px-6 py-4 text-left font-semibold">Check In</th>
                      <th className="px-6 py-4 text-left font-semibold">Check Out</th>
                      <th className="px-6 py-4 text-left font-semibold">Hours</th>
                      <th className="px-6 py-4 text-left font-semibold">Distance</th>
                      <th className="px-6 py-4 text-left font-semibold">Onsite</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayRecords.map((rec, index) => (
                      <motion.tr
                        key={rec._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border-t hover:bg-blue-50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        onClick={() => navigate(`/employee-details/${rec.employeeId?.employeeId || rec.employeeId}`)}
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {rec.employeeId?.employeeId || rec.employeeId || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{rec.name}</div>
                            <div className="text-xs text-gray-500">{rec.employeeEmail || "-"}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {formatDate(rec.checkInTime)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="font-medium">{formatTime(rec.checkInTime)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {rec.checkOutTime ? (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              <span>{formatTime(rec.checkOutTime)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${
                            rec.totalHours >= 8 ? 'text-green-600' :
                            rec.totalHours >= 4 ? 'text-orange-600' : 'text-gray-600'
                          }`}>
                            {rec.totalHours?.toFixed(1) || "0.0"}h
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                            {rec.distance?.toFixed(0) || "0"}m
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rec.onsite 
                              ? 'bg-green-100 text-green-800 border border-green-300' 
                              : 'bg-gray-100 text-gray-800 border border-gray-300'
                          }`}>
                            {rec.onsite ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rec.status)}`}>
                            {rec.status || "-"}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{todayRecords.length}</span> records for today
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayAttendance;