// src/pages/LeavesList.jsx
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaTimes, FaEdit, FaSearch, FaFilter, FaDownload, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// const LeavesList = () => {
//   const [leaves, setLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [currentPageLeaves, setCurrentPageLeaves] = useState([]);
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [updatedStatus, setUpdatedStatus] = useState("");
//   const [loading, setLoading] = useState(true);
  
//   // Search and Filter States
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");

//   // Pagination States
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   const fetchLeaves = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get("http://localhost:5000/api/leaves/leaves");
//       const leavesData = res.data.records || res.data || [];
      
//       // Sort by latest first
//       const sortedLeaves = leavesData.sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));
//       setLeaves(sortedLeaves);
//       setFilteredLeaves(sortedLeaves);
//     } catch (err) {
//       console.error("Failed to fetch leaves:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLeaves();
//   }, []);

//   // Apply filters
//   useEffect(() => {
//     let filtered = leaves;

//     // Search filter
//     if (searchTerm) {
//       filtered = filtered.filter(leave =>
//         leave.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         leave.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         leave.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         leave.reason?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Status filter
//     if (statusFilter !== "all") {
//       filtered = filtered.filter(leave => leave.status === statusFilter);
//     }

//     // Leave type filter
//     if (leaveTypeFilter !== "all") {
//       filtered = filtered.filter(leave => leave.leaveType === leaveTypeFilter);
//     }

//     setFilteredLeaves(filtered);
//     setCurrentPage(1); // Reset to first page when filters change
//   }, [searchTerm, statusFilter, leaveTypeFilter, leaves]);

//   // Pagination logic
//   useEffect(() => {
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     setCurrentPageLeaves(filteredLeaves.slice(indexOfFirstItem, indexOfLastItem));
//   }, [currentPage, filteredLeaves, itemsPerPage]);

//   const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

//   const handleEdit = (rec) => {
//     setEditingRecord(rec);
//     setUpdatedStatus(rec.status);
//   };

//   const handleUpdateStatus = async () => {
//     if (!["pending", "approved", "rejected"].includes(updatedStatus)) {
//       alert("Status must be Pending, Approved, or Rejected");
//       return;
//     }
//     try {
//       await axios.put(
//         `http://localhost:5000/api/leaves/updateleaves/${editingRecord._id}`,
//         { status: updatedStatus }
//       );
//       alert(`✅ Leave ${updatedStatus} successfully!`);
//       setEditingRecord(null);
//       fetchLeaves();
//     } catch (err) {
//       console.error("Failed to update status:", err);
//       alert("❌ Failed to update leave status");
//     }
//   };

//   const getStatusClass = (status) => {
//     switch (status.toLowerCase()) {
//       case "approved":
//         return "bg-green-100 text-green-800 border border-green-300";
//       case "rejected":
//         return "bg-red-100 text-red-800 border border-red-300";
//       case "pending":
//       default:
//         return "bg-yellow-100 text-yellow-800 border border-yellow-300";
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status.toLowerCase()) {
//       case "approved":
//         return "✅";
//       case "rejected":
//         return "❌";
//       case "pending":
//       default:
//         return "⏳";
//     }
//   };

//   const getLeaveTypeClass = (type) => {
//     switch (type?.toLowerCase()) {
//       case "sick leave":
//         return "bg-blue-100 text-blue-800 border border-blue-300";
//       case "casual leave":
//         return "bg-purple-100 text-purple-800 border border-purple-300";
//       case "emergency leave":
//         return "bg-red-100 text-red-800 border border-red-300";
//       case "annual leave":
//         return "bg-green-100 text-green-800 border border-green-300";
//       default:
//         return "bg-gray-100 text-gray-800 border border-gray-300";
//     }
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setStatusFilter("all");
//     setLeaveTypeFilter("all");
//   };

//   const downloadCSV = () => {
//     if (filteredLeaves.length === 0) {
//       alert("No data available to download!");
//       return;
//     }

//     const headers = [
//       "Employee Name",
//       "Employee ID",
//       "Leave Type",
//       "Start Date",
//       "End Date",
//       "Days",
//       "Reason",
//       "Status",
//       "Applied Date"
//     ];

//     const csvRows = [
//       headers.join(","),
//       ...filteredLeaves.map(leave =>
//         [
//           `"${leave.employeeName || 'N/A'}"`,
//           `"${leave.employeeId || 'N/A'}"`,
//           `"${leave.leaveType || 'N/A'}"`,
//           `"${new Date(leave.startDate).toLocaleDateString()}"`,
//           `"${new Date(leave.endDate).toLocaleDateString()}"`,
//           leave.days || '0',
//           `"${leave.reason || 'N/A'}"`,
//           leave.status,
//           `"${new Date(leave.createdAt || leave.startDate).toLocaleDateString()}"`
//         ].join(",")
//       ),
//     ];

//     const csvData = csvRows.join("\n");
//     const blob = new Blob([csvData], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `leave_requests_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   // Get unique leave types for filter
//   const leaveTypes = [...new Set(leaves.map(leave => leave.leaveType).filter(Boolean))];

//   // Pagination controls
//   const goToPage = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const nextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   // Generate page numbers
//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxPagesToShow = 5;
    
//     if (totalPages <= maxPagesToShow) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       const startPage = Math.max(1, currentPage - 2);
//       const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
//       for (let i = startPage; i <= endPage; i++) {
//         pageNumbers.push(i);
//       }
//     }
    
//     return pageNumbers;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
//         <div className="text-center">
//           <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-purple-600 rounded-full animate-spin"></div>
//           <p className="text-lg font-semibold text-gray-700">Loading leave requests...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-purple-50 to-blue-100">
//       <div className="mx-auto max-w-7xl">
//         {/* Header Section */}
//         <div className="mb-8 text-center">
//           <h1 className="mb-3 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
//             📋 Leave Requests Management
//           </h1>
//           <p className="text-lg text-gray-600">
//             Review and manage employee leave applications
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4">
//           <div className="p-6 text-center bg-white border border-purple-200 shadow-lg rounded-2xl">
//             <div className="text-3xl font-bold text-purple-600">{leaves.length}</div>
//             <div className="font-semibold text-purple-800">Total Requests</div>
//           </div>
//           <div className="p-6 text-center bg-white border border-yellow-200 shadow-lg rounded-2xl">
//             <div className="text-3xl font-bold text-yellow-600">
//               {leaves.filter(l => l.status === 'pending').length}
//             </div>
//             <div className="font-semibold text-yellow-800">Pending</div>
//           </div>
//           <div className="p-6 text-center bg-white border border-green-200 shadow-lg rounded-2xl">
//             <div className="text-3xl font-bold text-green-600">
//               {leaves.filter(l => l.status === 'approved').length}
//             </div>
//             <div className="font-semibold text-green-800">Approved</div>
//           </div>
//           <div className="p-6 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
//             <div className="text-3xl font-bold text-red-600">
//               {leaves.filter(l => l.status === 'rejected').length}
//             </div>
//             <div className="font-semibold text-red-800">Rejected</div>
//           </div>
//         </div>

//         {/* Filters Section */}
//         <div className="p-6 mb-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
//           <div className="flex flex-col items-start justify-between gap-6 mb-4 lg:flex-row lg:items-center">
//             <div>
//               <h3 className="mb-2 text-xl font-semibold text-gray-800">🔍 Filter Leave Requests</h3>
//               <p className="text-gray-600">Search and filter by various criteria</p>
//             </div>
            
//             <div className="flex flex-col gap-3 sm:flex-row">
//               <button
//                 onClick={downloadCSV}
//                 className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700"
//               >
//                 <FaDownload className="text-sm" />
//                 Download CSV
//               </button>
              
//               <button
//                 onClick={clearFilters}
//                 className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl hover:from-gray-600 hover:to-gray-700"
//               >
//                 <FaFilter className="text-sm" />
//                 Clear Filters
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//             {/* Search */}
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-blue-700">
//                 <FaSearch className="inline mr-2" />
//                 Search
//               </label>
//               <input
//                 type="text"
//                 placeholder="Search by name, ID, type, or reason..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full p-3 transition border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500"
//               />
//             </div>

//             {/* Status Filter */}
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-purple-700">
//                 📊 Status Filter
//               </label>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="w-full p-3 transition border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500"
//               >
//                 <option value="all">All Status</option>
//                 <option value="pending">Pending</option>
//                 <option value="approved">Approved</option>
//                 <option value="rejected">Rejected</option>
//               </select>
//             </div>

//             {/* Leave Type Filter */}
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-green-700">
//                 🏷️ Leave Type
//               </label>
//               <select
//                 value={leaveTypeFilter}
//                 onChange={(e) => setLeaveTypeFilter(e.target.value)}
//                 className="w-full p-3 transition border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500"
//               >
//                 <option value="all">All Types</option>
//                 {leaveTypes.map(type => (
//                   <option key={type} value={type}>{type}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Results Count */}
//           <div className="flex items-center justify-between mt-4 text-sm">
//             <span className="font-semibold text-blue-700">
//               Showing <strong>{filteredLeaves.length}</strong> of <strong>{leaves.length}</strong> requests
//             </span>
//             {(searchTerm || statusFilter !== "all" || leaveTypeFilter !== "all") && (
//               <span className="font-semibold text-orange-600">
//                 🔍 Filters applied
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Table Section */}
//         <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
//           {filteredLeaves.length === 0 ? (
//             <div className="py-16 text-center">
//               <div className="mb-4 text-6xl">📭</div>
//               <p className="mb-4 text-lg font-semibold text-gray-600">
//                 {leaves.length === 0 ? "No leave requests found." : "No requests match your filters."}
//               </p>
//               {leaves.length > 0 && (
//                 <button
//                   onClick={clearFilters}
//                   className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
//                 >
//                   🔄 Clear Filters
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead className="text-white bg-gradient-to-r from-purple-500 to-blue-600">
//                     <tr>
//                       <th className="px-6 py-4 font-semibold text-left">Employee</th>
//                       <th className="px-6 py-4 font-semibold text-left">Leave Type</th>
//                       <th className="px-6 py-4 font-semibold text-left">Date Range</th>
//                       <th className="px-6 py-4 font-semibold text-left">Days</th>
//                       <th className="px-6 py-4 font-semibold text-left">Reason</th>
//                       <th className="px-6 py-4 font-semibold text-left">Status</th>
//                       <th className="px-6 py-4 font-semibold text-left">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentPageLeaves.map((leave, idx) => (
//                       <tr
//                         key={leave._id}
//                         className={`border-t transition-all duration-200 ${
//                           idx % 2 === 0 ? "bg-gray-50" : "bg-white"
//                         } hover:bg-purple-50 hover:shadow-sm`}
//                       >
//                         <td className="px-6 py-4">
//                           <div>
//                             <div className="font-semibold text-gray-900">{leave.employeeName}</div>
//                             {leave.employeeId && (
//                               <div className="text-xs text-gray-500">ID: {leave.employeeId}</div>
//                             )}
//                             <div className="text-xs text-gray-400">
//                               {new Date(leave.createdAt || leave.startDate).toLocaleDateString()}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getLeaveTypeClass(leave.leaveType)}`}>
//                             {leave.leaveType}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="space-y-1">
//                             <div className="font-medium">
//                               {new Date(leave.startDate).toLocaleDateString()}
//                             </div>
//                             <div className="text-xs text-gray-500">to</div>
//                             <div className="font-medium">
//                               {new Date(leave.endDate).toLocaleDateString()}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className="px-3 py-1 text-sm font-bold text-blue-800 bg-blue-100 rounded-full">
//                             {leave.days} day{leave.days !== 1 ? 's' : ''}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="max-w-[200px]">
//                             <p className="text-gray-700 line-clamp-2">{leave.reason}</p>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className={`px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-2 w-fit ${getStatusClass(leave.status)}`}>
//                             <span className="text-sm">{getStatusIcon(leave.status)}</span>
//                             <span className="capitalize">{leave.status}</span>
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <button
//                             onClick={() => handleEdit(leave)}
//                             className="flex items-center gap-2 px-4 py-2 font-semibold text-white transition shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700"
//                           >
//                             <FaEdit className="text-sm" />
//                             Edit
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="flex flex-col items-center justify-between gap-4 p-6 border-t sm:flex-row bg-gray-50">
//                   <div className="text-sm text-gray-600">
//                     Showing <strong>{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredLeaves.length)}</strong> of{" "}
//                     <strong>{filteredLeaves.length}</strong> requests
//                   </div>
                  
//                   <div className="flex items-center gap-2">
//                     {/* Previous Button */}
//                     <button
//                       onClick={prevPage}
//                       disabled={currentPage === 1}
//                       className={`p-2 rounded-lg transition ${
//                         currentPage === 1
//                           ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                           : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
//                       }`}
//                     >
//                       <FaChevronLeft className="text-sm" />
//                     </button>

//                     {/* Page Numbers */}
//                     <div className="flex gap-1">
//                       {getPageNumbers().map(pageNumber => (
//                         <button
//                           key={pageNumber}
//                           onClick={() => goToPage(pageNumber)}
//                           className={`px-3 py-2 rounded-lg transition font-semibold ${
//                             currentPage === pageNumber
//                               ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
//                               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                           }`}
//                         >
//                           {pageNumber}
//                         </button>
//                       ))}
//                     </div>

//                     {/* Next Button */}
//                     <button
//                       onClick={nextPage}
//                       disabled={currentPage === totalPages}
//                       className={`p-2 rounded-lg transition ${
//                         currentPage === totalPages
//                           ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                           : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
//                       }`}
//                     >
//                       <FaChevronRight className="text-sm" />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Edit Modal */}
//       {editingRecord && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="relative w-full max-w-md p-8 bg-white border border-purple-200 shadow-2xl rounded-2xl">
//             <button
//               onClick={() => setEditingRecord(null)}
//               className="absolute text-xl text-gray-400 transition top-4 right-4 hover:text-gray-600"
//             >
//               <FaTimes />
//             </button>
            
//             <div className="mb-6 text-center">
//               <h2 className="mb-2 text-2xl font-bold text-gray-800">Update Leave Status</h2>
//               <p className="text-gray-600">Change the status of this leave request</p>
//             </div>

//             <div className="mb-6 space-y-4">
//               <div className="p-4 bg-gray-50 rounded-xl">
//                 <p className="font-semibold text-gray-700">{editingRecord.employeeName}</p>
//                 <p className="text-sm text-gray-500 capitalize">{editingRecord.leaveType}</p>
//                 <p className="text-xs text-gray-400">
//                   {new Date(editingRecord.startDate).toLocaleDateString()} - {new Date(editingRecord.endDate).toLocaleDateString()}
//                 </p>
//               </div>

//               <div>
//                 <label className="block mb-2 text-sm font-semibold text-gray-700">
//                   New Status
//                 </label>
//                 <select
//                   value={updatedStatus}
//                   onChange={(e) => setUpdatedStatus(e.target.value)}
//                   className="w-full p-3 transition border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500"
//                 >
//                   <option value="pending">⏳ Pending</option>
//                   <option value="approved">✅ Approved</option>
//                   <option value="rejected">❌ Rejected</option>
//                 </select>
//               </div>

//               <div className={`p-3 rounded-xl text-center ${getStatusClass(updatedStatus)}`}>
//                 <span className="font-semibold capitalize">Current: {updatedStatus}</span>
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setEditingRecord(null)}
//                 className="flex-1 px-4 py-3 font-semibold text-white transition bg-gray-500 rounded-xl hover:bg-gray-600"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleUpdateStatus}
//                 className="flex-1 px-4 py-3 font-semibold text-white transition shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700"
//               >
//                 Update Status
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LeavesList;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import {
//   FaCalendarAlt,
//   FaSearch,
// } from "react-icons/fa";

// const LeavesList = () => {
//   const [leaves, setLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
//   const [startDateFilter, setStartDateFilter] = useState("");
//   const [endDateFilter, setEndDateFilter] = useState("");

//   // Fetch Leaves
//   const fetchLeaves = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get("http://localhost:5000/api/leaves/leaves");
//       const leavesData = res.data.records || res.data || [];
//       const sorted = leavesData.sort(
//         (a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate)
//       );
//       setLeaves(sorted);
//       setFilteredLeaves(sorted);
//     } catch (err) {
//       console.error("Failed to fetch leaves:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLeaves();
//   }, []);

//   // ✅ Apply Filters
//   useEffect(() => {
//     let filtered = [...leaves];

//     if (searchTerm) {
//       filtered = filtered.filter(
//         (l) =>
//           l.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           l.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           l.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           l.reason?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (statusFilter !== "all") {
//       filtered = filtered.filter((l) => l.status === statusFilter);
//     }

//     if (leaveTypeFilter !== "all") {
//       filtered = filtered.filter((l) => l.leaveType === leaveTypeFilter);
//     }

//     // ✅ Fixed Date Range Filter
//     if (startDateFilter) {
//       const start = new Date(startDateFilter);
//       filtered = filtered.filter((l) => new Date(l.startDate) >= start);
//     }

//     if (endDateFilter) {
//       const end = new Date(endDateFilter);
//       filtered = filtered.filter((l) => new Date(l.endDate) <= end);
//     }

//     setFilteredLeaves(filtered);
//   }, [searchTerm, statusFilter, leaveTypeFilter, startDateFilter, endDateFilter, leaves]);

//   const clearFilters = () => {
//     setSearchTerm("");
//     setStatusFilter("all");
//     setLeaveTypeFilter("all");
//     setStartDateFilter("");
//     setEndDateFilter("");
//   };

//   // ✅ Small Stat Boxes
//   const StatCard = ({ label, value, color }) => (
//     <div className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} text-center`}>
//       <div className="text-lg font-bold">{value}</div>
//       <div className="text-xs font-medium text-gray-700">{label}</div>
//     </div>
//   );

//   const leaveTypes = [...new Set(leaves.map((l) => l.leaveType).filter(Boolean))];

//   if (loading)
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
//         <div className="text-center">
//           <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-purple-600 rounded-full animate-spin"></div>
//           <p className="font-semibold text-gray-600">Loading leave requests...</p>
//         </div>
//       </div>
//     );

//   return (
//     <div className="min-h-screen px-3 py-6 bg-gradient-to-br from-purple-50 to-blue-100">
//       <div className="mx-auto max-w-7xl">
//         {/* Header */}
//         <div className="mb-6 text-center">
//           <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
//             📋 Leave Requests
//           </h1>
//           <p className="text-sm text-gray-600">Manage and filter employee leave requests easily</p>
//         </div>

//         {/* ✅ Compact Stats */}
//         <div className="grid grid-cols-2 gap-2 mb-4 sm:grid-cols-4">
//           <StatCard label="Total Requests" value={leaves.length} color="border-purple-500" />
//           <StatCard
//             label="Pending"
//             value={leaves.filter((l) => l.status === "pending").length}
//             color="border-yellow-500"
//           />
//           <StatCard
//             label="Approved"
//             value={leaves.filter((l) => l.status === "approved").length}
//             color="border-green-500"
//           />
//           <StatCard
//             label="Rejected"
//             value={leaves.filter((l) => l.status === "rejected").length}
//             color="border-red-500"
//           />
//         </div>

//         {/* ✅ Filters Section */}
//         <div className="p-5 mb-6 bg-white border border-gray-200 shadow-md rounded-xl">
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-5">
//             {/* Search */}
//             <div>
//               <label className="block mb-1 text-xs font-semibold text-gray-600">
//                 <FaSearch className="inline mr-1" /> Search
//               </label>
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded-md"
//                 placeholder="Name / ID / Type / Reason"
//               />
//             </div>

//             {/* Status Filter */}
//             <div>
//               <label className="block mb-1 text-xs font-semibold text-gray-600">Status</label>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded-md"
//               >
//                 <option value="all">All</option>
//                 <option value="pending">Pending</option>
//                 <option value="approved">Approved</option>
//                 <option value="rejected">Rejected</option>
//               </select>
//             </div>

//             {/* Leave Type */}
//             <div>
//               <label className="block mb-1 text-xs font-semibold text-gray-600">Leave Type</label>
//               <select
//                 value={leaveTypeFilter}
//                 onChange={(e) => setLeaveTypeFilter(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded-md"
//               >
//                 <option value="all">All</option>
//                 {leaveTypes.map((t) => (
//                   <option key={t}>{t}</option>
//                 ))}
//               </select>
//             </div>

//             {/* ✅ Start Date */}
//             <div>
//               <label className="block mb-1 text-xs font-semibold text-gray-600">
//                 <FaCalendarAlt className="inline mr-1" /> From
//               </label>
//               <input
//                 type="date"
//                 value={startDateFilter}
//                 onChange={(e) => setStartDateFilter(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded-md"
//               />
//             </div>

//             {/* ✅ End Date */}
//             <div>
//               <label className="block mb-1 text-xs font-semibold text-gray-600">
//                 <FaCalendarAlt className="inline mr-1" /> To
//               </label>
//               <input
//                 type="date"
//                 value={endDateFilter}
//                 onChange={(e) => setEndDateFilter(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded-md"
//               />
//             </div>
//           </div>

//           <div className="flex justify-end gap-3 mt-4">
//             <button
//               onClick={clearFilters}
//               className="px-4 py-2 text-sm text-white transition bg-gray-500 rounded-md hover:bg-gray-600"
//             >
//               Clear Filters
//             </button>
//           </div>
//         </div>

//         {/* ✅ Table (Your Existing Table Design Below) */}
//         <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//           <table className="min-w-full">
//             <thead className="text-left text-white bg-gradient-to-r from-purple-500 to-blue-600">
//               <tr>
//                 <th className="px-4 py-3 rounded-tl-lg">Employee</th>
//                 <th className="px-4 py-3">Leave Type</th>
//                 <th className="px-4 py-3">Date Range</th>
//                 <th className="px-4 py-3">Days</th>
//                 <th className="px-4 py-3">Reason</th>
//                 <th className="px-4 py-3">Status</th>
//                 <th className="px-4 py-3 rounded-tr-lg">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredLeaves.length > 0 ? (
//                 filteredLeaves.map((l) => (
//                   <tr key={l._id} className="transition border-b hover:bg-gray-50">
//                     <td className="px-4 py-3">
//                       <div className="font-semibold">{l.employeeName}</div>
//                       <div className="text-xs text-gray-500">
//                         ID: {l.employeeId}
//                       </div>
//                       <div className="text-xs text-gray-400">
//                         {new Date(l.createdAt).toLocaleDateString()}
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full">
//                         {l.leaveType || "Enter Leave Type"}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-600">
//                       {new Date(l.startDate).toLocaleDateString()} <br />
//                       <span className="text-xs text-gray-400">to</span> <br />
//                       {new Date(l.endDate).toLocaleDateString()}
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className="px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded-full">
//                         {l.days} days
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-700">{l.reason}</td>
//                     <td className="px-4 py-3">
//                       {l.status === "approved" && (
//                         <span className="px-3 py-1 text-xs text-green-700 bg-green-100 rounded-full">
//                           ✅ Approved
//                         </span>
//                       )}
//                       {l.status === "pending" && (
//                         <span className="px-3 py-1 text-xs text-yellow-700 bg-yellow-100 rounded-full">
//                           ⏳ Pending
//                         </span>
//                       )}
//                       {l.status === "rejected" && (
//                         <span className="px-3 py-1 text-xs text-red-700 bg-red-100 rounded-full">
//                           ❌ Rejected
//                         </span>
//                       )}
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-1.5 rounded-md text-sm shadow hover:opacity-90 transition">
//                         ✏️ Edit
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="py-6 text-center text-gray-500">
//                     No leave records found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LeavesList;




import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaSearch, FaUserTag, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { isEmployeeHidden } from "../utils/employeeStatus";

const LeavesList = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Employees data for department/designation
  const [employees, setEmployees] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  
  // Department and Designation filter states
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  
  // Unique departments and designations
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);
  
  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);

  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || '';

  // Click outside handlers for filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
        setShowDepartmentFilter(false);
      }
      if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
        setShowDesignationFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fetch all leaves and employees for specific client
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      
      // Check if clientId exists
      if (!clientId) {
        console.error("Client ID not found. Please login again.");
        setLeaves([]);
        setFilteredLeaves([]);
        setEmployees([]);
        return;
      }

      const [leavesRes, empRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/leaves/leaves/${clientId}`),
        axios.get(`http://localhost:5000/api/employees/get-employees/${clientId}`)
      ]);

      // Handle employees response
      let employeesData = [];
      if (Array.isArray(empRes.data)) {
        employeesData = empRes.data;
      } else if (empRes.data?.employees && Array.isArray(empRes.data.employees)) {
        employeesData = empRes.data.employees;
      } else if (empRes.data?.data && Array.isArray(empRes.data.data)) {
        employeesData = empRes.data.data;
      }

      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);
      
      // Extract unique departments and designations
      const depts = new Set();
      const designations = new Set();
      activeEmployees.forEach(emp => {
        if (emp.department) depts.add(emp.department);
        if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
      });
      setUniqueDepartments(Array.from(depts).sort());
      setUniqueDesignations(Array.from(designations).sort());

      // Handle leaves response
      let leavesData = [];
      if (Array.isArray(leavesRes.data)) {
        leavesData = leavesRes.data;
      } else if (leavesRes.data?.records && Array.isArray(leavesRes.data.records)) {
        leavesData = leavesRes.data.records;
      } else if (leavesRes.data?.leaves && Array.isArray(leavesRes.data.leaves)) {
        leavesData = leavesRes.data.leaves;
      } else if (leavesRes.data?.data && Array.isArray(leavesRes.data.data)) {
        leavesData = leavesRes.data.data;
      } else {
        leavesData = leavesRes.data || [];
      }

      const sorted = leavesData.sort(
        (a, b) =>
          new Date(b.createdAt || b.startDate) -
          new Date(a.createdAt || a.startDate)
      );
      
      // Filter out leaves from hidden employees
      const activeEmployeeIds = new Set(activeEmployees.map(emp => emp.employeeId || emp._id));
      const filteredLeavesData = sorted.filter(leave => 
        activeEmployeeIds.has(leave.employeeId)
      );
      
      setLeaves(filteredLeavesData);
      setFilteredLeaves(filteredLeavesData);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      setLeaves([]);
      setFilteredLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [clientId]);

  // Get employee department and designation
  const getEmployeeDetails = (employeeId) => {
    const emp = employees.find(e => e.employeeId === employeeId || e._id === employeeId);
    return {
      department: emp?.department || emp?.departmentName || emp?.departments || "N/A",
      designation: emp?.designation || emp?.role || "N/A"
    };
  };

  // ✅ Update Leave Status (Approve / Reject)
  const updateLeaveStatus = async (id, status) => {
    try {
      // Check if clientId exists
      if (!clientId) {
        alert("Client ID not found. Please login again.");
        return;
      }

      const adminName = localStorage.getItem("adminName") || "Admin";
      const adminEmail = localStorage.getItem("adminEmail") || "";

      const res = await axios.put(
        `http://localhost:5000/api/leaves/updateleaves/${id}`,
        {
          status,
          adminName,
          adminEmail,
          clientId
        }
      );

      if (res.status === 200) {
        alert(`Leave ${status} successfully`);
        fetchLeaves();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update leave status");
    }
  };

  // ✅ Apply Filters
  useEffect(() => {
    let filtered = [...leaves];

    if (searchTerm) {
      filtered = filtered.filter(
        (l) =>
          l.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((l) => l.status === statusFilter);
    }

    if (leaveTypeFilter !== "all") {
      filtered = filtered.filter((l) => l.leaveType === leaveTypeFilter);
    }

    if (startDateFilter) {
      const start = new Date(startDateFilter);
      filtered = filtered.filter((l) => new Date(l.startDate) >= start);
    }

    if (endDateFilter) {
      const end = new Date(endDateFilter);
      filtered = filtered.filter((l) => new Date(l.endDate) <= end);
    }
    
    // Filter by Department
    if (filterDepartment) {
      filtered = filtered.filter(l => {
        const empDetails = getEmployeeDetails(l.employeeId);
        return empDetails.department === filterDepartment;
      });
    }
    
    // Filter by Designation
    if (filterDesignation) {
      filtered = filtered.filter(l => {
        const empDetails = getEmployeeDetails(l.employeeId);
        return empDetails.designation === filterDesignation;
      });
    }

    setFilteredLeaves(filtered);
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    leaveTypeFilter,
    startDateFilter,
    endDateFilter,
    filterDepartment,
    filterDesignation,
    leaves,
  ]);

  // ✅ Clear Filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLeaveTypeFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setFilterDepartment("");
    setFilterDesignation("");
  };
  
  const navigate = useNavigate();

  // ✅ Pagination Handlers
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  // ✅ Stat Box
  const StatCard = ({ label, value, color }) => (
    <div
      className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} text-center`}
    >
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs font-medium text-gray-700">{label}</div>
    </div>
  );

  // ✅ Client Info Banner
  const ClientInfoBanner = () => (
    <div className="p-3 mb-3 text-sm text-blue-700 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">Client ID:</span>
          <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded text-xs">
            {clientId.substring(0, 8)}...
          </span>
          <span className="ml-4 text-xs text-gray-500">
            Showing leave requests for your client account
          </span>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          Total Leaves: {leaves.length}
        </span>
      </div>
    </div>
  );

  // ✅ Loading Screen
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-purple-600 rounded-full animate-spin"></div>
          <p className="font-semibold text-gray-600">
            Loading leave requests...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="mx-auto max-w-9xl">
        
        {/* Client Info Banner */}
        {clientId && <ClientInfoBanner />}
        
        {/* ✅ Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2 sm:grid-cols-4">
          <StatCard
            label={`Total Requests: ${leaves.length}`}
            color="border-purple-500"
          />
          <StatCard
            label={`Pending: ${leaves.filter((l) => l.status === "pending").length}`}
            color="border-yellow-500"
          />
          <StatCard
            label={`Approved: ${leaves.filter((l) => l.status === "approved").length}`}
            color="border-green-500"
          />
          <StatCard
            label={`Rejected: ${leaves.filter((l) => l.status === "rejected").length}`}
            color="border-red-500"
          />
        </div>

        {/* Filters Section */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* ID/Name Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[100px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Leave Type Filter */}
            <select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[100px]"
            >
              <option value="all">All Types</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="earned">Earned Leave</option>
              <option value="other">Other</option>
            </select>

            {/* Department Filter Button */}
            <div className="relative" ref={departmentFilterRef}>
              <button
                onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDepartment 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
              </button>
              
              {/* Department Filter Dropdown */}
              {showDepartmentFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDepartment('');
                      setShowDepartmentFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Departments
                  </div>
                  {uniqueDepartments.map(dept => (
                    <div 
                      key={dept}
                      onClick={() => {
                        setFilterDepartment(dept);
                        setShowDepartmentFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Designation Filter Button */}
            <div className="relative" ref={designationFilterRef}>
              <button
                onClick={() => setShowDesignationFilter(!showDesignationFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDesignation 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
              </button>
              
              {/* Designation Filter Dropdown */}
              {showDesignationFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDesignation('');
                      setShowDesignationFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Designations
                  </div>
                  {uniqueDesignations.map(des => (
                    <div 
                      key={des}
                      onClick={() => {
                        setFilterDesignation(des);
                        setShowDesignationFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {des}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* From Date */}
            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                From:
              </span>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* To Date */}
            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                To:
              </span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || filterDepartment || filterDesignation || statusFilter !== "all" || leaveTypeFilter !== "all" || startDateFilter || endDateFilter) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
            
            {/* Report Button */}
            <button 
              onClick={() => navigate("/leaves-report")}
              className="h-8 px-3 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
            >
              📊 Report
            </button>
          </div>
        </div>

        {/* ✅ Table */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="py-2 text-center">Employee ID</th>
                  <th className="py-2 text-center">Name</th>
                  <th className="py-2 text-center">Department</th>
                  <th className="py-2 text-center">Designation</th>
                  <th className="py-2 text-center">Dates</th>
                  <th className="py-2 text-center">Days</th>
                  <th className="py-2 text-center">Reason</th>
                  <th className="py-2 text-center">Status</th>
                  <th className="py-2 text-center rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((l) => {
                    const empDetails = getEmployeeDetails(l.employeeId);
                    return (
                      <tr
                        key={l._id}
                        className="transition border-b hover:bg-gray-50"
                      >
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {l.employeeId || "N/A"}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          <div className="font-medium">{l.employeeName || "N/A"}</div>
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">
                          {empDetails.department}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">
                          {empDetails.designation}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {l.startDate ? new Date(l.startDate).toLocaleDateString() : "N/A"} <br />
                          <span className="text-xs text-gray-400">to</span> <br />
                          {l.endDate ? new Date(l.endDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          <span className="px-2 py-2 text-xs text-center text-blue-700 bg-blue-100 rounded-full">
                            {l.days || 0} {l.days === 1 ? 'day' : 'days'}
                          </span>
                        </td>
                        <td className="max-w-xs px-2 py-2 font-medium text-center text-gray-500 truncate whitespace-nowrap">
                          {l.reason || "No reason provided"}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {l.status === "approved" && (
                            <span className="px-2 py-2 text-xs text-center text-green-700 bg-green-100 rounded-full">
                              ✅ Approved
                            </span>
                          )}
                          {l.status === "pending" && (
                            <span className="px-2 py-2 text-xs text-center text-yellow-700 bg-yellow-100 rounded-full">
                              ⏳ Pending
                            </span>
                          )}
                          {l.status === "rejected" && (
                            <span className="px-2 py-2 text-xs text-center text-red-700 bg-red-100 rounded-full">
                              ❌ Rejected
                            </span>
                          )}
                          {!l.status && (
                            <span className="px-2 py-2 text-xs text-center text-gray-700 bg-gray-100 rounded-full">
                              Unknown
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {l.status === "pending" ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => updateLeaveStatus(l._id, "approved")}
                                className="px-2 py-2 text-xs text-center text-white transition bg-green-500 rounded-md hover:bg-green-600"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateLeaveStatus(l._id, "rejected")}
                                className="px-2 py-2 text-xs text-center text-white transition bg-red-500 rounded-md hover:bg-red-600"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs italic text-gray-400">
                              No actions
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="py-6 text-center text-gray-500">
                      {clientId ? "No leave records found for your client." : "Please login to view leaves."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ Pagination Section */}
        {filteredLeaves.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="font-medium text-gray-700">
                  Show:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="p-2 border rounded-lg"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-1 text-sm border rounded-lg ${
                  currentPage === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 bg-white hover:bg-blue-50 border-blue-200"
                }`}
              >
                Previous
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                  disabled={page === "..."}
                  className={`px-4 py-1 text-sm border rounded-lg ${
                    page === "..."
                      ? "text-gray-500 bg-gray-50 cursor-default"
                      : currentPage === page
                      ? "text-white bg-blue-600 border-blue-600"
                      : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-1 text-sm border rounded-lg ${
                  currentPage === totalPages
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeavesList;