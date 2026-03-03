// import axios from "axios";
// import { useEffect, useState } from "react";

// const LeavesReport = () => {
//   const [approvedLeaves, setApprovedLeaves] = useState([]);

//   const fetchApprovedLeaves = async () => {
//     try {
//       const res = await axios.get("https://api.timelyhealth.in/api/leaves/approved-leaves");
//       setApprovedLeaves(res.data);
//     } catch (err) {
//       console.error("Failed to fetch approved leaves:", err);
//     }
//   };

//   useEffect(() => {
//     fetchApprovedLeaves();
//   }, []);

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <h1 className="mb-6 text-3xl font-bold text-center">Approved Leaves Report</h1>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm border border-gray-300">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee</th>
//               <th className="px-4 py-2 border">Leave Type</th>
//               <th className="px-4 py-2 border">Start Date</th>
//               <th className="px-4 py-2 border">End Date</th>
//               <th className="px-4 py-2 border">Days</th>
//               <th className="px-4 py-2 border">Reason</th>
//               <th className="px-4 py-2 border">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {approvedLeaves.length > 0 ? (
//               approvedLeaves.map((l) => (
//                 <tr key={l._id} className="border-b hover:bg-gray-50">
//                   <td className="px-4 py-2 font-medium">{l.employeeName}</td>
//                   <td className="px-4 py-2 capitalize">{l.leaveType}</td>
//                   <td className="px-4 py-2">
//                     {new Date(l.startDate).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2">
//                     {new Date(l.endDate).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2">{l.days}</td>
//                   <td className="px-4 py-2">{l.reason}</td>
//                   <td className="px-4 py-2 font-semibold text-center text-green-700">
//                     Approved
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="7" className="py-6 text-center text-gray-500">
//                   No approved leaves found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default LeavesReport;




// import axios from "axios";
// import { useEffect, useState } from "react";

// const LeaveReport = () => {
//   const [approvedLeaves, setApprovedLeaves] = useState([]);

//   const fetchApprovedLeaves = async () => {
//     try {
//       const res = await axios.get("https://api.timelyhealth.in/api/leaves/leaves");
//       // ✅ Filter only approved leaves
//       const approved = (res.data.records || res.data).filter(
//         (l) => l.status?.toLowerCase() === "approved"
//       );
//       setApprovedLeaves(approved);
//     } catch (err) {
//       console.error("Failed to fetch approved leaves:", err);
//     }
//   };

//   useEffect(() => {
//     fetchApprovedLeaves();
//   }, []);

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <h1 className="mb-6 text-3xl font-bold text-center">Approved Leaves Report</h1>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm border border-gray-300">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee</th>
//               <th className="px-4 py-2 border">Leave Type</th>
//               <th className="px-4 py-2 border">Start Date</th>
//               <th className="px-4 py-2 border">End Date</th>
//               <th className="px-4 py-2 border">Days</th>
//               <th className="px-4 py-2 border">Reason</th>
//             </tr>
//           </thead>
//           <tbody>
//             {approvedLeaves.length > 0 ? (
//               approvedLeaves.map((l) => (
//                 <tr key={l._id} className="border-b hover:bg-gray-50">
//                   <td className="px-4 py-2 font-medium">{l.employeeName}</td>
//                   <td className="px-4 py-2 capitalize">{l.leaveType}</td>
//                   <td className="px-4 py-2">{new Date(l.startDate).toLocaleDateString()}</td>
//                   <td className="px-4 py-2">{new Date(l.endDate).toLocaleDateString()}</td>
//                   <td className="px-4 py-2">{l.days}</td>
//                   <td className="px-4 py-2">{l.reason}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" className="py-6 text-center text-gray-500">
//                   No approved leaves found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default LeaveReport;


// import axios from "axios";
// import { useEffect, useState } from "react";

// const LeaveReport = () => {
//   const [approvedLeaves, setApprovedLeaves] = useState([]);

//   const fetchApprovedLeaves = async () => {
//     try {
//       const res = await axios.get("https://api.timelyhealth.in/api/leaves/leaves");
//       // ✅ Filter only approved leaves
//       const approved = (res.data.records || res.data).filter(
//         (l) => l.status?.toLowerCase() === "approved"
//       );
//       setApprovedLeaves(approved);
//     } catch (err) {
//       console.error("Failed to fetch approved leaves:", err);
//     }
//   };

//   useEffect(() => {
//     fetchApprovedLeaves();
//   }, []);

//   // ✅ Function to download CSV
//   const downloadCSV = () => {
//     if (approvedLeaves.length === 0) {
//       alert("No approved leave data available to download!");
//       return;
//     }

//     const headers = [
//       "Employee Name,Leave Type,Start Date,End Date,Days,Reason",
//     ];
//     const rows = approvedLeaves.map((l) =>
//       [
//         l.employeeName,
//         l.leaveType,
//         new Date(l.startDate).toLocaleDateString(),
//         new Date(l.endDate).toLocaleDateString(),
//         l.days,
//         `"${l.reason}"`,
//       ].join(",")
//     );

//     const csvContent = [headers, ...rows].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "Approved_Leave_Report.csv";
//     link.click();
//   };

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-3xl font-bold">Approved Leave Requests</h1>
//         <button
//           onClick={downloadCSV}
//           className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
//         >
//           ⬇️ Download CSV
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm border border-gray-300">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee</th>
//               <th className="px-4 py-2 border">Leave Type</th>
//               <th className="px-4 py-2 border">Start Date</th>
//               <th className="px-4 py-2 border">End Date</th>
//               <th className="px-4 py-2 border">Days</th>
//               <th className="px-4 py-2 border">Reason</th>
//             </tr>
//           </thead>
//           <tbody>
//             {approvedLeaves.length > 0 ? (
//               approvedLeaves.map((l) => (
//                 <tr key={l._id} className="border-b hover:bg-gray-50">
//                   <td className="px-4 py-2 font-medium">{l.employeeName}</td>
//                   <td className="px-4 py-2 capitalize">{l.leaveType}</td>
//                   <td className="px-4 py-2">
//                     {new Date(l.startDate).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2">
//                     {new Date(l.endDate).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2">{l.days}</td>
//                   <td className="px-4 py-2">{l.reason}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" className="py-6 text-center text-gray-500">
//                   No approved leaves found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default LeaveReport;


// import axios from "axios";
// import { useEffect, useState } from "react";

// const LeaveReport = () => {
//   const [approvedLeaves, setApprovedLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState("");

//   // ✅ Fetch all approved leaves
//   const fetchApprovedLeaves = async () => {
//     try {
//       const res = await axios.get("https://api.timelyhealth.in/api/leaves/leaves");
//       const approved = (res.data.records || res.data).filter(
//         (l) => l.status?.toLowerCase() === "approved"
//       );
//       setApprovedLeaves(approved);
//       setFilteredLeaves(approved);
//     } catch (err) {
//       console.error("Failed to fetch approved leaves:", err);
//     }
//   };

//   useEffect(() => {
//     fetchApprovedLeaves();
//   }, []);

//   // ✅ Handle Month Change
//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);

//     if (!month) {
//       setFilteredLeaves(approvedLeaves);
//       return;
//     }

//     const [year, selectedMonthNum] = month.split("-");
//     const filtered = approvedLeaves.filter((l) => {
//       const leaveDate = new Date(l.startDate);
//       return (
//         leaveDate.getFullYear().toString() === year &&
//         (leaveDate.getMonth() + 1).toString().padStart(2, "0") === selectedMonthNum
//       );
//     });

//     setFilteredLeaves(filtered);
//   };

//   // ✅ Download CSV
//   const downloadCSV = () => {
//     if (filteredLeaves.length === 0) {
//       alert("No approved leave data available to download!");
//       return;
//     }

//     const headers = ["Employee Name,Leave Type,Start Date,End Date,Days,Reason"];
//     const rows = filteredLeaves.map((l) =>
//       [
//         l.employeeName,
//         l.leaveType,
//         new Date(l.startDate).toLocaleDateString(),
//         new Date(l.endDate).toLocaleDateString(),
//         l.days,
//         `"${l.reason}"`,
//       ].join(",")
//     );

//     const csvContent = [headers, ...rows].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);

//     const fileName = selectedMonth
//       ? `Approved_Leaves_${selectedMonth}.csv`
//       : "Approved_Leaves_All.csv";

//     link.download = fileName;
//     link.click();
//   };

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       {/* Header Section */}
//       <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
//         <h1 className="text-3xl font-bold">Approved Leave Requests</h1>

//         <div className="flex items-center gap-3">
//           {/* ✅ Month Picker */}
//           <input
//             type="month"
//             value={selectedMonth}
//             onChange={handleMonthChange}
//             className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-200"
//           />
//           <button
//             onClick={downloadCSV}
//             className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
//           >
//             ⬇️ Download CSV
//           </button>
//         </div>
//       </div>

//       {/* ✅ Total Leaves Info */}
//       <div className="mb-4 text-lg font-semibold text-gray-700">
//         Total Approved Leaves:{" "}
//         <span className="text-green-700">{filteredLeaves.length}</span>
//         {selectedMonth && (
//           <span className="ml-2 text-sm text-gray-500">
//             (for {new Date(selectedMonth).toLocaleString("default", { month: "long", year: "numeric" })})
//           </span>
//         )}
//       </div>

//       {/* ✅ Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm border border-gray-300">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee</th>
//               <th className="px-4 py-2 border">Leave Type</th>
//               <th className="px-4 py-2 border">Start Date</th>
//               <th className="px-4 py-2 border">End Date</th>
//               <th className="px-4 py-2 border">Days</th>
//               <th className="px-4 py-2 border">Reason</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredLeaves.length > 0 ? (
//               filteredLeaves.map((l) => (
//                 <tr key={l._id} className="border-b hover:bg-gray-50">
//                   <td className="px-4 py-2 font-medium">{l.employeeName}</td>
//                   <td className="px-4 py-2 capitalize">{l.leaveType}</td>
//                   <td className="px-4 py-2">
//                     {new Date(l.startDate).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2">
//                     {new Date(l.endDate).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2">{l.days}</td>
//                   <td className="px-4 py-2">{l.reason}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" className="py-6 text-center text-gray-500">
//                   No approved leaves found for this month.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default LeaveReport;

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { isEmployeeHidden } from "../utils/employeeStatus";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const LeaveReport = () => {
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);

  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || '';

  // ✅ Fetch all approved leaves and employees
  const fetchApprovedLeaves = async () => {
    try {
      setLoading(true);
      
      // Check if clientId exists
      if (!clientId) {
        console.error("Client ID not found. Please login again.");
        setApprovedLeaves([]);
        setFilteredLeaves([]);
        setLoading(false);
        return;
      }

      const [leavesRes, empRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/leaves/leaves/${clientId}?status=approved`),
        axios.get(`http://localhost:5000/api/employees/get-employees/${clientId}`)
      ]);

      // Handle different response structures
      let employees = [];
      if (Array.isArray(empRes.data)) {
        employees = empRes.data;
      } else if (empRes.data?.employees && Array.isArray(empRes.data.employees)) {
        employees = empRes.data.employees;
      } else if (empRes.data?.data && Array.isArray(empRes.data.data)) {
        employees = empRes.data.data;
      } else {
        employees = empRes.data || [];
      }

      let allLeaves = [];
      if (Array.isArray(leavesRes.data)) {
        allLeaves = leavesRes.data;
      } else if (leavesRes.data?.records && Array.isArray(leavesRes.data.records)) {
        allLeaves = leavesRes.data.records;
      } else if (leavesRes.data?.leaves && Array.isArray(leavesRes.data.leaves)) {
        allLeaves = leavesRes.data.leaves;
      } else if (leavesRes.data?.data && Array.isArray(leavesRes.data.data)) {
        allLeaves = leavesRes.data.data;
      } else {
        allLeaves = leavesRes.data || [];
      }

      // Filter approved leaves and exclude hidden employees
      const approved = allLeaves.filter((l) => {
        if (l.status?.toLowerCase() !== "approved") return false;

        // Find employee to check status
        const emp = employees.find(e => 
          e.employeeId === l.employeeId || 
          e._id === l.employeeId ||
          e.email === l.employeeEmail
        );

        // Use central utility with employee object (or fallback to ID check)
        return !isEmployeeHidden(emp || { employeeId: l.employeeId });
      });

      setApprovedLeaves(approved);
      setFilteredLeaves(approved);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setApprovedLeaves([]);
      setFilteredLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedLeaves();
  }, [clientId]);

  // ✅ Unique employee and leave type lists
  const employees = [...new Set(approvedLeaves.map((l) => l.employeeName).filter(Boolean))];
  const leaveTypes = [...new Set(approvedLeaves.map((l) => l.leaveType).filter(Boolean))];

  // ✅ Filter function
  useEffect(() => {
    let filtered = [...approvedLeaves];

    if (selectedMonth) {
      const [year, selectedMonthNum] = selectedMonth.split("-");
      filtered = filtered.filter((l) => {
        const leaveDate = new Date(l.startDate);
        return (
          leaveDate.getFullYear().toString() === year &&
          (leaveDate.getMonth() + 1).toString().padStart(2, "0") === selectedMonthNum
        );
      });
    }

    if (selectedEmployee) {
      filtered = filtered.filter((l) => l.employeeName === selectedEmployee);
    }

    if (selectedType) {
      filtered = filtered.filter((l) => l.leaveType === selectedType);
    }

    setFilteredLeaves(filtered);
  }, [selectedMonth, selectedEmployee, selectedType, approvedLeaves]);

  // ✅ Download CSV
  const downloadCSV = () => {
    if (filteredLeaves.length === 0) {
      alert("No approved leave data available to download!");
      return;
    }

    const headers = ["Employee Name,Leave Type,Start Date,End Date,Days,Reason"];
    const rows = filteredLeaves.map((l) =>
      [
        l.employeeName || "N/A",
        l.leaveType || "N/A",
        l.startDate ? new Date(l.startDate).toLocaleDateString() : "N/A",
        l.endDate ? new Date(l.endDate).toLocaleDateString() : "N/A",
        l.days || "0",
        `"${l.reason || "No reason provided"}"`,
      ].join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    const fileName = selectedMonth
      ? `Approved_Leaves_${clientId.substring(0, 6)}_${selectedMonth}.csv`
      : `Approved_Leaves_${clientId.substring(0, 6)}_All.csv`;

    link.download = fileName;
    link.click();
  };

  // ✅ Chart Data - Who took the most leaves
  const leaveCountData = useMemo(() => {
    const countMap = {};
    approvedLeaves.forEach((l) => {
      if (l.employeeName) {
        countMap[l.employeeName] = (countMap[l.employeeName] || 0) + (l.days || 0);
      }
    });
    return Object.entries(countMap).map(([name, totalDays]) => ({
      name,
      totalDays,
    }));
  }, [approvedLeaves]);

  // ✅ Client Info Banner
  const ClientInfoBanner = () => (
    <div className="p-3 mb-4 text-sm text-blue-700 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">Client ID:</span>
          <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded text-xs">
            {clientId.substring(0, 8)}...
          </span>
          <span className="ml-4 text-xs text-gray-500">
            Showing approved leave reports for your client account
          </span>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          Approved Leaves: {approvedLeaves.length}
        </span>
      </div>
    </div>
  );

  // ✅ Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-green-600 rounded-full animate-spin"></div>
          <p className="font-semibold text-gray-600">Loading leave reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto mt-6 bg-white rounded-lg shadow-md max-w-7xl">
      
      {/* Client Info Banner */}
      {clientId && <ClientInfoBanner />}

      {/* Header */}
      <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
        <h1 className="text-3xl font-bold">Approved Leave Reports</h1>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-200"
          />

          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">All Employees</option>
            {employees.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">All Leave Types</option>
            {leaveTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button
            onClick={downloadCSV}
            className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
          >
            ⬇️ Download CSV
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="px-3 py-2 text-center rounded-md shadow-sm bg-green-50">
          <p className="text-[11px] text-gray-500 leading-tight">
            Approved Leaves
          </p>
          <h2 className="text-sm font-semibold text-green-700 leading-tight">
            {filteredLeaves.length}
          </h2>
        </div>

        <div className="px-3 py-2 text-center rounded-md shadow-sm bg-blue-50">
          <p className="text-[11px] text-gray-500 leading-tight">
            Employees
          </p>
          <h2 className="text-sm font-semibold text-blue-700 leading-tight">
            {employees.length}
          </h2>
        </div>

        <div className="px-3 py-2 text-center rounded-md shadow-sm bg-yellow-50">
          <p className="text-[11px] text-gray-500 leading-tight">
            Leave Types
          </p>
          <h2 className="text-sm font-semibold text-yellow-700 leading-tight">
            {leaveTypes.length}
          </h2>
        </div>
      </div>

      {/* Leave Table */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full text-sm border border-gray-300">
          <thead className="text-gray-700 bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Employee</th>
              <th className="px-4 py-2 border">Leave Type</th>
              <th className="px-4 py-2 border">Start Date</th>
              <th className="px-4 py-2 border">End Date</th>
              <th className="px-4 py-2 border">Days</th>
              <th className="px-4 py-2 border">Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((l) => (
                <tr key={l._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{l.employeeName || "N/A"}</td>
                  <td className="px-4 py-2 capitalize">{l.leaveType || "N/A"}</td>
                  <td className="px-4 py-2">
                    {l.startDate ? new Date(l.startDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    {l.endDate ? new Date(l.endDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-2">{l.days || "0"}</td>
                  <td className="px-4 py-2">{l.reason || "No reason provided"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-500">
                  {clientId ? "No approved leaves found for your client." : "Please login to view leave reports."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bar Chart */}
      <div className="p-4 mb-8 rounded-lg shadow bg-gray-50">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          📊 Who Took the Most Leaves
        </h2>
        {leaveCountData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leaveCountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalDays" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-8 text-center text-gray-500">No data available for chart</p>
        )}
      </div>
    </div>
  );
};

export default LeaveReport;