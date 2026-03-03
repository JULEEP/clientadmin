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
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LeavesList = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || '';

  // ✅ Fetch all leaves for specific client
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      
      // Check if clientId exists
      if (!clientId) {
        console.error("Client ID not found. Please login again.");
        setLeaves([]);
        setFilteredLeaves([]);
        return;
      }

      // Fetch leaves with clientId
      const res = await axios.get(
        `http://localhost:5000/api/leaves/leaves/${clientId}`
      );
      
      // Handle different response structures
      let leavesData = [];
      if (Array.isArray(res.data)) {
        leavesData = res.data;
      } else if (res.data?.records && Array.isArray(res.data.records)) {
        leavesData = res.data.records;
      } else if (res.data?.leaves && Array.isArray(res.data.leaves)) {
        leavesData = res.data.leaves;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        leavesData = res.data.data;
      } else {
        leavesData = res.data || [];
      }
      
      const sorted = leavesData.sort(
        (a, b) =>
          new Date(b.createdAt || b.startDate) -
          new Date(a.createdAt || a.startDate)
      );
      setLeaves(sorted);
      setFilteredLeaves(sorted);
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

  // ✅ Update Leave Status (Approve / Reject)
  const updateLeaveStatus = async (id, status) => {
    try {
      // Check if clientId exists
      if (!clientId) {
        alert("Client ID not found. Please login again.");
        return;
      }

      const res = await axios.put(
        `http://localhost:5000/api/leaves/updateleaves/${id}`,
        { status }
      );

      if (res.status === 200) {
        alert(`Leave ${status} successfully`);
        fetchLeaves(); // refresh table
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

    setFilteredLeaves(filtered);
  }, [
    searchTerm,
    statusFilter,
    leaveTypeFilter,
    startDateFilter,
    endDateFilter,
    leaves,
  ]);

  // ✅ Clear Filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLeaveTypeFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
  };

  const navigate = useNavigate();

  // ✅ Stat Box
  const StatCard = ({ label, value, color }) => (
    <div
      className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} text-center`}
    >
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs font-medium text-gray-700">{label}</div>
    </div>
  );

  const leaveTypes = [...new Set(leaves.map((l) => l.leaveType).filter(Boolean))];

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
    <div className="min-h-screen px-3 py-6 bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="mx-auto max-w-9xl">
        
        {/* Client Info Banner */}
        {clientId && <ClientInfoBanner />}

        {/* ✅ Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 sm:grid-cols-4">
          <StatCard
            label="Total Requests"
            value={leaves.length}
            color="border-purple-500"
          />
          <StatCard
            label="Pending"
            value={leaves.filter((l) => l.status === "pending").length}
            color="border-yellow-500"
          />
          <StatCard
            label="Approved"
            value={leaves.filter((l) => l.status === "approved").length}
            color="border-green-500"
          />
          <StatCard
            label="Rejected"
            value={leaves.filter((l) => l.status === "rejected").length}
            color="border-red-500"
          />
        </div>

        <div className="p-3 mb-3 bg-white border border-gray-200 shadow-md rounded-xl">
          {/* Filters – Single Row */}
          <div className="flex items-end gap-10 flex-nowrap">
            {/* Search */}
            <div className="flex flex-col w-64">
              <label className="mb-1 text-xs font-semibold text-gray-600">
                <FaSearch className="inline mr-1" /> Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Name / ID / Type / Reason"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col w-40">
              <label className="mb-1 text-xs font-semibold text-gray-600">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* From Date */}
            <div className="flex flex-col w-40">
              <label className="mb-1 text-xs font-semibold text-gray-600">
                <FaCalendarAlt className="inline mr-1" /> From
              </label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col w-40">
              <label className="mb-1 text-xs font-semibold text-gray-600">
                <FaCalendarAlt className="inline mr-1" /> To
              </label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Clear Button */}
            <button
              onClick={clearFilters}
              className="h-9 px-5 mb-[2px] text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* ✅ Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
          <table className="min-w-full">
            <thead className="text-left text-sm text-white bg-gradient-to-r from-purple-500 to-blue-600">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Employee</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((l) => (
                  <tr
                    key={l._id}
                    className="transition border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold">{l.employeeName || "N/A"}</div>
                      <div className="text-xs text-gray-500">
                        ID: {l.employeeId || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {l.startDate ? new Date(l.startDate).toLocaleDateString() : "N/A"} <br />
                      <span className="text-xs text-gray-400">to</span> <br />
                      {l.endDate ? new Date(l.endDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded-full">
                        {l.days || 0} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {l.reason || "No reason provided"}
                    </td>
                    <td className="px-4 py-3">
                      {l.status === "approved" && (
                        <span className="px-3 py-1 text-xs text-green-700 bg-green-100 rounded-full">
                          ✅ Approved
                        </span>
                      )}
                      {l.status === "pending" && (
                        <span className="px-3 py-1 text-xs text-yellow-700 bg-yellow-100 rounded-full">
                          ⏳ Pending
                        </span>
                      )}
                      {l.status === "rejected" && (
                        <span className="px-3 py-1 text-xs text-red-700 bg-red-100 rounded-full">
                          ❌ Rejected
                        </span>
                      )}
                      {!l.status && (
                        <span className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full">
                          ⚠️ Unknown
                        </span>
                      )}
                    </td>

                    {/* ✅ Approve / Reject Buttons */}
                    <td className="px-4 py-3 text-right">
                      {l.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => updateLeaveStatus(l._id, "approved")}
                            className="px-3 py-1 text-xs text-white transition bg-green-500 rounded-md hover:bg-green-600"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(l._id, "rejected")}
                            className="px-3 py-1 text-xs text-white transition bg-red-500 rounded-md hover:bg-red-600"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs italic text-gray-400">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">
                    {clientId ? "No leave records found for your client." : "Please login to view leaves."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeavesList;