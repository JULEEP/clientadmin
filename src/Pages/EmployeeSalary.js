// import { ArrowLeft, Eye, FileText } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function EmployeeDashboard() {
//   const [records, setRecords] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();

//   const BASE_URL = "https://api.timelyhealth.in";

//   // ✅ Correct useEffect (Attendance Summary Fetch)
//   useEffect(() => {
//     const fetchAttendanceSummary = async () => {
//       try {
//         const employeeData = JSON.parse(localStorage.getItem("employeeData"));
//         const employeeId = employeeData?.employeeId;

//         if (!employeeId) {
//           setError("❌ Employee ID not found. Please log in again.");
//           setLoading(false);
//           return;
//         }

//         const res = await fetch(
//           `${BASE_URL}/api/attendanceSummary/getattendancesummary?employeeId=${employeeId}`
//         );
//         const data = await res.json();

//         if (!res.ok) throw new Error(data.message || "Failed to fetch summary");

//         const summary = data.summary || [];

//         // Sort by latest month first
//         const sortedSummary = summary.sort(
//           (a, b) => new Date(b.date) - new Date(a.date)
//         );

//         setRecords(sortedSummary);
//       } catch (err) {
//         console.error("Summary fetch error:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAttendanceSummary();
//   }, []);

//   return (
//     <div className="min-h-screen p-6 bg-gray-100">

//       {/* Back Button */}
//       <button
//         onClick={() => navigate("/employeedashboard")}
//         className="flex items-center gap-2 px-4 py-2 mb-4 text-white transition bg-gray-700 rounded-lg hover:bg-gray-800"
//       >
//         <ArrowLeft size={18} /> Back
//       </button>

//       <div className="p-6 bg-white shadow-lg rounded-xl">
//         <h2 className="mb-6 text-xl font-bold">My Salary Details</h2>

//         {loading && <p className="text-center text-gray-500">Loading...</p>}
//         {error && <p className="text-center text-red-500">{error}</p>}

//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="text-white bg-blue-600">
//               <th className="p-3">ID</th>
//               <th className="p-3">Name</th>
//               <th className="p-3">Present</th>
//               <th className="p-3">Late Days</th>
//               <th className="p-3">Half Days</th>
//               <th className="p-3">Salary</th>
//               <th className="p-3">Month</th>
//               <th className="p-3">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {records.map((emp, index) => (
//               <tr
//                 key={index}
//                 className="text-gray-700 transition border-b hover:bg-gray-50"
//               >
//                 <td className="p-3">{emp.employeeId}</td>

//                 <td className="flex items-center gap-3 p-3">
//                   <div className="flex items-center justify-center w-10 h-10 font-bold text-blue-700 bg-blue-100 rounded-full">
//                     {emp.name?.charAt(0)}
//                   </div>
//                   {emp.name}
//                 </td>

//                 <td className="p-3">
//                   <div className="px-4 py-1 font-semibold text-green-700 bg-green-100 rounded-full w-fit">
//                     {emp.presentDays}
//                   </div>
//                 </td>

//                 <td className="p-3">
//                   <div className="px-4 py-1 font-semibold text-blue-700 bg-blue-100 rounded-full w-fit">
//                     {emp.lateDays}
//                   </div>
//                 </td>

//                 <td className="p-3">
//                   <div className="px-4 py-1 font-semibold text-yellow-600 bg-yellow-100 rounded-full w-fit">
//                     {emp.halfDays}
//                   </div>
//                 </td>

//                 <td className="p-3 font-bold text-green-700">
//                   ₹{emp.calculatedSalary}
//                 </td>

//                 <td className="p-3">{emp.month}</td>

//                 <td className="flex gap-3 p-3">
//                   <button
//                     onClick={() =>
//                       navigate(`/employee-details/${emp.employeeId}`, {
//                         state: emp,
//                       })
//                     }
//                     className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
//                   >
//                     <Eye size={18} />
//                   </button>

//                   <button
//                     onClick={() =>
//                       navigate(`/employee-slip/${emp.employeeId}`, {
//                         state: emp,
//                       })
//                     }
//                     className="p-2 text-white bg-purple-500 rounded-lg hover:bg-purple-600"
//                   >
//                     <FileText size={18} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {!loading && records.length === 0 && (
//           <p className="p-6 text-center text-gray-500">No records found.</p>
//         )}
//       </div>
//     </div>
//   );
// }


// import { ArrowLeft, Eye, FileText, X } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function EmployeeDashboard() {
//   const [records, setRecords] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const recordsPerPage = 10;

//   const navigate = useNavigate();
//   const BASE_URL = "https://api.timelyhealth.in";

//   // ✅ Get current logged-in employee data
//   const getCurrentEmployee = () => {
//     const employeeData = JSON.parse(localStorage.getItem("employeeData"));
//     return employeeData;
//   };

//   // ✅ Fetch salary data for current employee only
//   useEffect(() => {
//     const fetchSalaryData = async () => {
//       try {
//         const employeeData = getCurrentEmployee();
//         const employeeId = employeeData?.employeeId;

//         if (!employeeId) {
//           setError("❌ Employee ID not found. Please log in again.");
//           setLoading(false);
//           return;
//         }

//         console.log("📥 Fetching salary data for employee:", employeeId);

//         // Fetch ALL salaries first
//         const salaryRes = await fetch(`${BASE_URL}/api/attendancesummary/getsalaries`);

//         if (!salaryRes.ok) {
//           throw new Error(`Failed to fetch salary data: ${salaryRes.status}`);
//         }

//         const salaryData = await salaryRes.json();
//         console.log("💰 All Salaries API Response:", salaryData);

//         let employeeSalaryRecords = [];

//         if (salaryData.success && salaryData.salaries && salaryData.salaries.length > 0) {
//           // Filter only current employee's records
//           employeeSalaryRecords = salaryData.salaries
//             .filter(salary => salary.employeeId === employeeId)
//             .map(salary => ({
//               employeeId: salary.employeeId,
//               name: salary.name,
//               presentDays: salary.presentDays || 0,
//               lateDays: salary._debug?.lateDays || 0,
//               halfDays: salary.halfDayWorking || 0,
//               calculatedSalary: salary.calculatedSalary || 0,
//               month: salary.month || "Not specified",
//               workingDays: salary.workingDays || 0,
//               weekOffs: salary.weekOffs || 0,
//               totalLeaves: salary.totalLeaves || 0,
//               salaryPerMonth: salary.salaryPerMonth || 0,
//               salaryPerDay: salary.salaryPerDay || 0
//             }));
//         }

//         // If no data from salary API, try fallback
//         if (employeeSalaryRecords.length === 0) {
//           console.log("🔄 Trying fallback API for employee:", employeeId);
//           const summaryRes = await fetch(
//             `${BASE_URL}/api/attendancesummary/get?employeeId=${employeeId}`
//           );

//           if (summaryRes.ok) {
//             const summaryData = await summaryRes.json();
//             const summary = summaryData.summary || [];

//             employeeSalaryRecords = summary
//               .filter(item => item.employeeId === employeeId)
//               .map(item => ({
//                 employeeId: item.employeeId,
//                 name: item.name,
//                 presentDays: item.presentDays || 0,
//                 lateDays: item.lateDays || 0,
//                 halfDays: item.halfDayWorking || 0,
//                 calculatedSalary: item.calculatedSalary || 0,
//                 month: item.month || "Not specified",
//                 workingDays: item.workingDays || 0,
//                 weekOffs: item.weekOffs || 0
//               }));
//           }
//         }

//         // Sort by latest month first
//         const sortedRecords = employeeSalaryRecords.sort((a, b) => {
//           const monthA = a.month || "";
//           const monthB = b.month || "";
//           return monthB.localeCompare(monthA);
//         });

//         console.log("✅ Current Employee Salary Records:", sortedRecords);
//         setRecords(sortedRecords);
//         setFilteredRecords(sortedRecords);

//       } catch (err) {
//         console.error("❌ Salary fetch error:", err);
//         setError(err.message || "Failed to load salary data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSalaryData();
//   }, []);

//   // ✅ Filter records based on search (only for current employee)
//   useEffect(() => {
//     const filtered = records.filter(record =>
//       record.month?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredRecords(filtered);
//     setCurrentPage(1);
//   }, [searchTerm, records]);

//   // ✅ Pagination calculations
//   const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
//   const indexOfLastRecord = currentPage * recordsPerPage;
//   const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
//   const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

//   const handlePrevious = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNext = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handlePageClick = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxVisiblePages = 5;

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       const startPage = Math.max(1, currentPage - 2);
//       const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

//       for (let i = startPage; i <= endPage; i++) {
//         pageNumbers.push(i);
//       }
//     }

//     return pageNumbers;
//   };

//   // ✅ Handle view details - OPEN MODAL (no navigation)
//   const handleViewDetails = (employee) => {
//     setSelectedEmployee(employee);
//     setShowDetailsModal(true);
//   };

//   // ✅ Close modal
//   const handleCloseModal = () => {
//     setShowDetailsModal(false);
//     setSelectedEmployee(null);
//   };

//   // ✅ Generate salary slip HTML
//   const generateSalarySlipHTML = (employee) => {
//     const currentEmployee = getCurrentEmployee();

//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Salary Slip - ${currentEmployee?.name || employee.name}</title>
//         <style>
//           body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
//           .slip-container { max-width: 800px; margin: 0 auto; border: 2px solid #3b82f6; border-radius: 10px; padding: 30px; }
//           .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
//           .company-name { font-size: 28px; font-weight: bold; color: #3b82f6; margin-bottom: 5px; }
//           .slip-title { font-size: 24px; font-weight: bold; margin: 20px 0; }
//           .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
//           .detail-item { margin-bottom: 10px; }
//           .detail-label { font-weight: bold; color: #666; }
//           .salary-breakdown { margin: 30px 0; }
//           .breakdown-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//           .breakdown-table th, .breakdown-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
//           .breakdown-table th { background-color: #3b82f6; color: white; }
//           .total-row { font-weight: bold; background-color: #f8fafc; }
//           .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #3b82f6; color: #666; }
//           .signature { margin-top: 50px; display: flex; justify-content: space-between; }
//           .signature-box { width: 200px; border-top: 1px solid #333; padding-top: 10px; text-align: center; }
//         </style>
//       </head>
//       <body>
//         <div class="slip-container">
//           <div class="header">
//             <div class="company-name">TECH SOLUTIONS LTD</div>
//             <div>123 Tech Park, Innovation City, IC 12345</div>
//             <div>Phone: (123) 456-7890 | Email: hr@techsolutions.com</div>
//           </div>

//           <div class="slip-title">SALARY SLIP</div>

//           <div class="details-grid">
//             <div>
//               <div class="detail-item">
//                 <span class="detail-label">Employee ID:</span> ${currentEmployee?.employeeId || employee.employeeId}
//               </div>
//               <div class="detail-item">
//                 <span class="detail-label">Employee Name:</span> ${currentEmployee?.name || employee.name}
//               </div>
//               <div class="detail-item">
//                 <span class="detail-label">Month:</span> ${employee.month}
//               </div>
//             </div>
//             <div>
//               <div class="detail-item">
//                 <span class="detail-label">Issue Date:</span> ${new Date().toLocaleDateString()}
//               </div>
//               <div class="detail-item">
//                 <span class="detail-label">Slip No:</span> SLIP-${currentEmployee?.employeeId || employee.employeeId}-${new Date().getTime()}
//               </div>
//             </div>
//           </div>

//           <div class="salary-breakdown">
//             <h3>Salary Breakdown - ${employee.month}</h3>
//             <table class="breakdown-table">
//               <thead>
//                 <tr>
//                   <th>Particulars</th>
//                   <th>Details</th>
//                   <th>Amount</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td>Present Days</td>
//                   <td>${employee.presentDays || 0} days</td>
//                   <td>-</td>
//                 </tr>
//                 <tr>
//                   <td>Working Days</td>
//                   <td>${employee.workingDays || 0} days</td>
//                   <td>-</td>
//                 </tr>
//                 <tr>
//                   <td>Half Days</td>
//                   <td>${employee.halfDays || 0} days</td>
//                   <td>-</td>
//                 </tr>
//                 <tr>
//                   <td>WeekOff Days</td>
//                   <td>${employee.weekOffs || 0} days</td>
//                   <td>-</td>
//                 </tr>
//                 <tr>
//                   <td>Late Days</td>
//                   <td>${employee.lateDays || 0} days</td>
//                   <td>-</td>
//                 </tr>
//                 <tr>
//                   <td>Total Leaves</td>
//                   <td>${employee.totalLeaves || 0} days</td>
//                   <td>-</td>
//                 </tr>
//                 ${employee.salaryPerMonth ? `
//                 <tr>
//                   <td>Monthly Salary</td>
//                   <td>-</td>
//                   <td>₹${employee.salaryPerMonth}</td>
//                 </tr>
//                 ` : ''}
//                 ${employee.salaryPerDay ? `
//                 <tr>
//                   <td>Daily Rate</td>
//                   <td>-</td>
//                   <td>₹${employee.salaryPerDay}/day</td>
//                 </tr>
//                 ` : ''}
//                 <tr class="total-row">
//                   <td colspan="2"><strong>Final Salary</strong></td>
//                   <td><strong>₹${employee.calculatedSalary || 0}</strong></td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           <div class="signature">
//             <div class="signature-box">
//               Employee Signature
//             </div>
//             <div class="signature-box">
//               Authorized Signature
//             </div>
//           </div>

//           <div class="footer">
//             This is a computer generated slip and does not require signature.
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   };

//   // ✅ Download salary slip
//   const downloadSalarySlip = (employee) => {
//     const slipContent = generateSalarySlipHTML(employee);
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(slipContent);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   const currentEmployee = getCurrentEmployee();

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-lg font-semibold text-blue-600">Loading your salary data...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="p-4 text-red-600 bg-red-100 rounded-lg">
//           <p className="font-semibold">Error: {error}</p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-7xl">

//         {/* Header Section */}
//         <div className="mb-8">
//           <button
//             onClick={() => navigate("/employeedashboard")}
//             className="flex items-center gap-2 px-4 py-2 mb-4 text-white transition bg-gray-700 rounded-lg hover:bg-gray-800"
//           >
//             <ArrowLeft size={18} /> Back to Dashboard
//           </button>
//           <h1 className="mb-2 text-3xl font-bold text-gray-800">
//             My Salary History - {currentEmployee?.name || 'Employee'}
//           </h1>
//           <p className="text-gray-600">View your salary details and download salary slips</p>
//         </div>

//         {/* Search Section */}
//         <div className="p-6 mb-6 bg-white border border-blue-200 shadow-lg rounded-2xl">
//           <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
//             <div className="flex-1 w-full">
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search by Month..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats Overview - Only for current employee */}
//         <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
//           <div className="p-6 bg-white border-l-4 border-blue-500 shadow-lg rounded-2xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Salary Records</p>
//                 <p className="text-2xl font-bold text-gray-800">{filteredRecords.length}</p>
//               </div>
//               <div className="p-3 bg-blue-100 rounded-full">
//                 <FileText className="w-6 h-6 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="p-6 bg-white border-l-4 border-green-500 shadow-lg rounded-2xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Latest Salary</p>
//                 <p className="text-2xl font-bold text-gray-800">
//                   ₹{records[0]?.calculatedSalary || 0}
//                 </p>
//               </div>
//               <div className="p-3 bg-green-100 rounded-full">
//                 <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="p-6 bg-white border-l-4 border-purple-500 shadow-lg rounded-2xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Active Months</p>
//                 <p className="text-2xl font-bold text-gray-800">
//                   {filteredRecords.filter(emp => (emp.presentDays || 0) > 0).length}
//                 </p>
//               </div>
//               <div className="p-3 bg-purple-100 rounded-full">
//                 <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Table Container - Only current employee data */}
//         <div className="overflow-hidden bg-white border border-blue-200 shadow-xl rounded-2xl">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="text-white bg-gradient-to-r from-blue-600 to-indigo-700">
//                 <tr>
//                   <th className="p-4 font-semibold text-left">Employee ID</th>
//                   <th className="p-4 font-semibold text-left">Name</th>
//                   <th className="p-4 font-semibold text-center">Present Days</th>
//                   <th className="p-4 font-semibold text-center">Late Days</th>
//                   <th className="p-4 font-semibold text-center">Half Days</th>
//                   <th className="p-4 font-semibold text-center">Salary</th>
//                   <th className="p-4 font-semibold text-center">Month</th>
//                   <th className="p-4 font-semibold text-center">Actions</th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-200">
//                 {currentRecords.length === 0 ? (
//                   <tr>
//                     <td colSpan="8" className="p-8 text-center">
//                       <div className="flex flex-col items-center justify-center text-gray-500">
//                         <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <p className="text-lg font-medium">No salary records found for you</p>
//                         <p className="text-sm">Contact HR if you believe this is an error</p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   currentRecords.map((emp, index) => (
//                     <tr 
//                       key={index} 
//                       className={`hover:bg-blue-50 transition duration-150 ${
//                         index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
//                       }`}
//                     >
//                       <td className="p-4 font-medium text-gray-900">
//                         {emp.employeeId}
//                       </td>

//                       <td className="p-4">
//                         <div className="flex items-center">
//                           <div className="flex items-center justify-center w-8 h-8 mr-3 font-semibold text-blue-800 bg-blue-100 rounded-full">
//                             {currentEmployee?.name?.charAt(0) || emp.name?.charAt(0) || 'E'}
//                           </div>
//                           <span className="font-medium text-gray-800">{currentEmployee?.name || emp.name}</span>
//                         </div>
//                       </td>

//                       <td className="p-4 text-center">
//                         <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
//                           {emp.presentDays || 0}
//                         </span>
//                       </td>

//                       <td className="p-4 text-center">
//                         <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
//                           {emp.lateDays || 0}
//                         </span>
//                       </td>

//                       <td className="p-4 text-center">
//                         <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
//                           {emp.halfDays || 0}
//                         </span>
//                       </td>

//                       <td className="p-4 font-semibold text-center text-green-700">
//                         ₹{emp.calculatedSalary || 0}
//                       </td>

//                       <td className="p-4 text-center text-gray-600">
//                         {emp.month || "-"}
//                       </td>

//                       <td className="p-4 text-center">
//                         <div className="flex justify-center space-x-2">
//                           <button
//                             onClick={() => handleViewDetails(emp)}
//                             className="p-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
//                             title="View Details"
//                           >
//                             <Eye size={16} />
//                           </button>

//                           <button
//                             onClick={() => downloadSalarySlip(emp)}
//                             className="p-2 text-white transition duration-200 bg-purple-500 rounded-lg hover:bg-purple-600"
//                             title="Download Salary Slip"
//                           >
//                             <FileText size={16} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {filteredRecords.length > 0 && (
//             <div className="px-6 py-4 bg-white border-t border-gray-200">
//               <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
//                 <div className="text-sm text-gray-600">
//                   Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} entries
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={handlePrevious}
//                     disabled={currentPage === 1}
//                     className={`px-4 py-2 rounded-lg border ${
//                       currentPage === 1 
//                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
//                         : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
//                     }`}
//                   >
//                     Previous
//                   </button>

//                   <div className="flex space-x-1">
//                     {getPageNumbers().map(pageNumber => (
//                       <button
//                         key={pageNumber}
//                         onClick={() => handlePageClick(pageNumber)}
//                         className={`px-4 py-2 rounded-lg border ${
//                           currentPage === pageNumber
//                             ? 'bg-blue-600 text-white border-blue-600'
//                             : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
//                         }`}
//                       >
//                         {pageNumber}
//                       </button>
//                     ))}
//                   </div>

//                   <button
//                     onClick={handleNext}
//                     disabled={currentPage === totalPages}
//                     className={`px-4 py-2 rounded-lg border ${
//                       currentPage === totalPages
//                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                         : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ✅ Details Modal - Same Page Par Hi Show Hoga */}
//       {showDetailsModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-gray-800">
//                 Salary Details - {selectedEmployee.month}
//               </h2>
//               <button 
//                 onClick={handleCloseModal}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="p-4 mb-4 rounded-lg bg-gray-50">
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
//                   <span className="text-lg font-semibold text-blue-800">
//                     {currentEmployee?.name?.charAt(0) || selectedEmployee.name?.charAt(0) || 'E'}
//                   </span>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800">
//                     {currentEmployee?.name || selectedEmployee.name}
//                   </h3>
//                   <p className="text-sm text-gray-600">ID: {selectedEmployee.employeeId}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4 mb-6">
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Present Days</p>
//                 <p className="text-lg font-semibold text-green-600">{selectedEmployee.presentDays || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Working Days</p>
//                 <p className="text-lg font-semibold text-blue-600">{selectedEmployee.workingDays || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Half Days</p>
//                 <p className="text-lg font-semibold text-yellow-600">{selectedEmployee.halfDays || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">WeekOff Days</p>
//                 <p className="text-lg font-semibold text-purple-600">{selectedEmployee.weekOffs || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Late Days</p>
//                 <p className="text-lg font-semibold text-red-600">{selectedEmployee.lateDays || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Total Leaves</p>
//                 <p className="text-lg font-semibold text-orange-600">{selectedEmployee.totalLeaves || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Month</p>
//                 <p className="text-lg font-semibold text-gray-800">{selectedEmployee.month || 'Not specified'}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Calculated Salary</p>
//                 <p className="text-lg font-semibold text-green-600">₹{selectedEmployee.calculatedSalary || 0}</p>
//               </div>
//             </div>

//             {selectedEmployee.salaryPerMonth && (
//               <div className="p-4 mb-4 rounded-lg bg-blue-50">
//                 <h3 className="mb-2 text-lg font-semibold text-blue-800">Salary Information</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-600">Monthly Salary</p>
//                     <p className="text-lg font-semibold text-blue-700">₹{selectedEmployee.salaryPerMonth}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Daily Rate</p>
//                     <p className="text-lg font-semibold text-blue-700">₹{selectedEmployee.salaryPerDay}/day</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="flex justify-end pt-4 border-t border-gray-200">
//               <button 
//                 onClick={handleCloseModal}
//                 className="px-6 py-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { Calendar, Eye, FileText, Search, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../Images/Timely-Health-Logo.png";

export default function EmployeeDashboard() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [allMonths, setAllMonths] = useState([]);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [employeesMasterData, setEmployeesMasterData] = useState({});
  const [employeeLeaves, setEmployeeLeaves] = useState({});

  const recordsPerPage = 10;

  const navigate = useNavigate();
  const BASE_URL = "https://api.timelyhealth.in";

  // ✅ Get current logged-in employee data
  const getCurrentEmployee = () => {
    const employeeData = JSON.parse(localStorage.getItem("employeeData"));
    return employeeData;
  };

  // ✅ Process Leaves Data (Logic from PayRoll.js)
  const processLeavesData = useCallback((leavesData) => {
    const leavesMap = {};

    leavesData.forEach(leave => {
      const employeeId = leave.employeeId;
      if (!employeeId) return;

      if (!leavesMap[employeeId]) {
        leavesMap[employeeId] = {
          CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0, leaveDetails: []
        };
      }

      const leaveType = leave.leaveType || 'Other';
      const duration = calculateLeaveDuration(leave.startDate, leave.endDate);

      if (leavesMap[employeeId][leaveType] !== undefined) {
        leavesMap[employeeId][leaveType] += duration;
      } else {
        leavesMap[employeeId].Other += duration;
      }

      leavesMap[employeeId].leaveDetails.push({
        type: leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        days: duration,
        reason: leave.reason || '',
        status: leave.status || 'pending'
      });
    });

    setEmployeeLeaves(leavesMap);
  }, []);

  const calculateLeaveDuration = (fromDate, toDate) => {
    if (!fromDate) return 0;
    const start = new Date(fromDate);
    const end = toDate ? new Date(toDate) : new Date(fromDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // ✅ Fetch Master Data (Employees & Leaves)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [empRes, leavesRes] = await Promise.all([
          fetch(`${BASE_URL}/api/employees/get-employees`).catch(() => ({ ok: false })),
          fetch(`${BASE_URL}/api/leaves/leaves?status=approved`).catch(() => ({ ok: false }))
        ]);

        if (empRes.ok) {
          const employees = await empRes.json();
          const empMap = {};
          employees.forEach(emp => {
            empMap[emp.employeeId] = {
              salaryPerMonth: emp.salaryPerMonth || 0,
              shiftHours: emp.shiftHours || 8,
              weekOffPerMonth: emp.weekOffPerMonth || 0,
              name: emp.name,
              employeeId: emp.employeeId,
              department: emp.department || '',
              designation: emp.role || emp.designation || '',
              joiningDate: emp.joinDate || emp.joiningDate || '',
              bankAccount: emp.bankAccount || '',
              panCard: emp.panCard || '',
              weekOffDay: emp.weekOffDay || '',
              weekOffType: emp.weekOffType || '0+4'
            };
          });
          setEmployeesMasterData(empMap);
        }

        if (leavesRes.ok) {
          const leaves = await leavesRes.json();
          processLeavesData(leaves);
        }
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };

    fetchMasterData();
  }, [processLeavesData]);

  // ✅ Helper to get Employee Data
  const getEmployeeData = (employee) => {
    return employeesMasterData[employee.employeeId] || {
      salaryPerMonth: employee.salaryPerMonth || 0,
      shiftHours: 8,
      weekOffPerMonth: employee.weekOffs || 0,
      name: employee.name || '',
      designation: '',
      department: '',
      joiningDate: '',
      employeeId: employee.employeeId
    };
  };

  // ✅ Helper to Calculate Week Offs
  const calculateWeekOffDays = (employee) => {
    return employee.weekOffs || 0;
  };

  // ✅ Calculate Daily Rate
  const calculateDailyRate = (employee) => {
    const empData = employeesMasterData[employee.employeeId];
    if (!empData || !empData.salaryPerMonth) return 0;
    const daysInMonth = employee.monthDays || 30;
    return (empData.salaryPerMonth / daysInMonth).toFixed(2);
  };

  // ✅ Format month for display
  const formatMonthDisplay = (monthStr) => {
    if (!monthStr || monthStr === "Not specified") return "All Months";
    const [year, month] = monthStr.split("-");
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // ✅ Format month for API (YYYY-MM)
  const formatMonthForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // ✅ Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const today = new Date();
    return formatMonthForAPI(today);
  };

  // ✅ Generate list of last 12 months
  const generateLast12Months = () => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = formatMonthForAPI(date);
      const displayStr = formatMonthDisplay(monthStr);
      months.push({ value: monthStr, display: displayStr });
    }

    return months;
  };

  // ✅ Fetch ALL months data for current employee
  const fetchAllMonthsData = async () => {
    try {
      const employeeData = getCurrentEmployee();
      const employeeId = employeeData?.employeeId;

      if (!employeeId) {
        setError("❌ Employee ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      console.log("📥 Fetching ALL months salary data for employee:", employeeId);
      setIsLoadingMonth(true);

      // Fetch ALL salaries without month filter
      const salaryRes = await fetch(`${BASE_URL}/api/attendancesummary/getsalaries`);

      // Fetch Summary as fallback
      const summaryRes = await fetch(`${BASE_URL}/api/attendancesummary/get`);

      if (!salaryRes.ok) {
        throw new Error(`Failed to fetch salary data: ${salaryRes.status}`);
      }

      const salaryData = await salaryRes.json();
      let summaryData = [];
      if (summaryRes.ok) {
        const summaryJson = await summaryRes.json();
        summaryData = summaryJson.summary || [];
      }

      console.log("💰 All Salaries API Response:", salaryData);

      let employeeSalaryRecords = [];

      if (salaryData.success && salaryData.salaries && salaryData.salaries.length > 0) {
        // Filter only current employee's records from ALL salaries
        employeeSalaryRecords = salaryData.salaries
          .filter(salary => salary.employeeId === employeeId)
          .map(salary => {
            // Find summary match for fallback fields
            const summary = summaryData.find(s => s.employeeId === salary.employeeId && s.month === salary.month) || {};

            return {
              ...salary,
              employeeId: salary.employeeId,
              name: salary.name,
              presentDays: salary.presentDays || 0,
              lateDays: salary.lateDays || 0,
              halfDays: salary.halfDayWorking || 0,
              calculatedSalary: salary.calculatedSalary || 0,
              month: salary.month || "Not specified",
              monthFormatted: formatMonthDisplay(salary.month),
              workingDays: salary.totalWorkingDays || salary.workingDays || 0,
              weekOffs: salary.weekOffs || summary.weekOffPerMonth || 0,
              totalLeaves: salary.totalLeaves || 0,
              salaryPerMonth: salary.salaryPerMonth || 0,
              extraWork: salary.extraWork || {}, // ✅ Ensure extraWork is captured
              fullDayLeaves: salary.fullDayLeaves || summary.fullDayLeaves || 0,
              halfDayLeaves: salary.halfDayLeaves || summary.halfDayLeaves || 0,
              monthDays: salary.monthDays || 30
            };
          });
      }

      // Extract unique months for filter dropdown
      const months = [...new Set(employeeSalaryRecords
        .map(record => record.month)
        .filter(month => month && month !== "Not specified")
        .sort((a, b) => b.localeCompare(a)) // Latest first
      )];

      setAllMonths(months);

      // Sort by latest month first
      const sortedRecords = employeeSalaryRecords.sort((a, b) => {
        const monthA = a.month || "";
        const monthB = b.month || "";
        return monthB.localeCompare(monthA); // Descending order
      });

      console.log("✅ Current Employee ALL Salary Records:", sortedRecords);
      console.log("📅 Available Months:", months);

      setRecords(sortedRecords);
      setFilteredRecords(sortedRecords);

    } catch (err) {
      console.error("❌ Salary fetch error:", err);
      setError(err.message || "Failed to load salary data");
    } finally {
      setLoading(false);
      setIsLoadingMonth(false);
    }
  };

  // ✅ Fetch specific month data
  const fetchMonthData = async (month) => {
    try {
      setIsLoadingMonth(true);
      const employeeData = getCurrentEmployee();
      const employeeId = employeeData?.employeeId;

      if (!employeeId) {
        setError("❌ Employee ID not found. Please log in again.");
        return;
      }

      console.log(`📥 Fetching ${month} salary data for employee:`, employeeId);

      // Fetch salaries with month filter
      const salaryRes = await fetch(
        `${BASE_URL}/api/attendancesummary/getsalaries?month=${month}`
      );

      const summaryRes = await fetch(
        `${BASE_URL}/api/attendancesummary/get?month=${month}`
      );

      if (!salaryRes.ok) {
        throw new Error(`Failed to fetch salary data: ${salaryRes.status}`);
      }

      const salaryData = await salaryRes.json();
      let summaryData = [];
      if (summaryRes.ok) {
        const summaryJson = await summaryRes.json();
        summaryData = summaryJson.summary || [];
      }

      let employeeSalaryRecords = [];

      if (salaryData.success && salaryData.salaries && salaryData.salaries.length > 0) {
        // Filter only current employee's records for selected month
        const monthRecords = salaryData.salaries
          .filter(salary => salary.employeeId === employeeId)
          .map(salary => {
            const summary = summaryData.find(s => s.employeeId === salary.employeeId) || {};
            return {
              ...salary,
              employeeId: salary.employeeId,
              name: salary.name,
              presentDays: salary.presentDays || 0,
              lateDays: salary.lateDays || 0,
              halfDays: salary.halfDayWorking || 0,
              calculatedSalary: salary.calculatedSalary || 0,
              month: salary.month || month,
              monthFormatted: formatMonthDisplay(salary.month || month),
              workingDays: salary.totalWorkingDays || salary.workingDays || 0,
              weekOffs: salary.weekOffs || summary.weekOffPerMonth || 0,
              totalLeaves: salary.totalLeaves || 0,
              salaryPerMonth: salary.salaryPerMonth || 0,
              extraWork: salary.extraWork || {},
              fullDayLeaves: salary.fullDayLeaves || summary.fullDayLeaves || 0,
              halfDayLeaves: salary.halfDayLeaves || summary.halfDayLeaves || 0,
              monthDays: salary.monthDays || 30
            };
          });

        employeeSalaryRecords = monthRecords;
      }

      console.log(`✅ ${month} Salary Records:`, employeeSalaryRecords);

      setRecords(employeeSalaryRecords);
      setFilteredRecords(employeeSalaryRecords);

    } catch (err) {
      console.error(`❌ ${month} Salary fetch error:`, err);
      setError(err.message || "Failed to load salary data for selected month");
    } finally {
      setIsLoadingMonth(false);
    }
  };

  // ✅ Initial load - fetch all data
  useEffect(() => {
    fetchAllMonthsData();
  }, []);

  // ✅ Handle month selection from calendar
  const handleMonthSelect = (e) => {
    const monthValue = e.target.value;
    if (monthValue) {
      // Convert YYYY-MM format from input
      const formattedMonth = monthValue.replace("-", "-");
      setSelectedMonth(formattedMonth);
      fetchMonthData(formattedMonth);
      setShowMonthPicker(false);
    }
  };

  // ✅ Handle quick month selection
  const handleQuickMonthSelect = (month) => {
    setSelectedMonth(month);
    fetchMonthData(month);
  };

  // ✅ Handle clear filter
  const handleClearFilter = () => {
    setSelectedMonth("");
    setSearchTerm("");
    fetchAllMonthsData();
  };

  // ✅ Filter records based on search (only for current employee)
  useEffect(() => {
    let filtered = [...records];

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(record => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (record.monthFormatted && record.monthFormatted.toLowerCase().includes(searchLower)) ||
          (record.month && record.month.toLowerCase().includes(searchLower)) ||
          (record.calculatedSalary && record.calculatedSalary.toString().includes(searchTerm)) ||
          (record.presentDays && record.presentDays.toString().includes(searchTerm))
        );
      });
    }

    // Apply month filter if selected
    if (selectedMonth) {
      filtered = filtered.filter(record => record.month === selectedMonth);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedMonth, records]);

  // ✅ Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  // ✅ Handle view details
  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  // ✅ Close modal
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedEmployee(null);
  };

  // ✅ Generate Invoice HTML (Matching PayRoll.js)
  const generateInvoiceHTML = (employee) => {
    // Get master data for this employee
    const employeeData = getEmployeeData(employee);

    if (!employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payslip</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; text-align: center; }
            .error { color: red; font-size: 18px; margin-top: 100px; border: 1px solid red; padding: 20px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>Salary Data Not Available</h2>
            <p>Salary information is not available for ${employee?.name || 'this employee'}.</p>
            <p>Please contact HR department.</p>
          </div>
        </body>
        </html>
      `;
    }

    const totalMonthDays = employee.monthDays || 30;
    const dailyRate = calculateDailyRate(employee);
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = calculateWeekOffDays(employee);

    // Paid component calculations
    const presentDays = employee.presentDays || 0;
    const halfDays = employee.halfDayWorking || 0;
    const paidLeaveDays = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);

    // Total Paid Days (matches backend logic)
    const totalPaidDays = presentDays + (halfDays * 0.5) + weekOffDays + paidLeaveDays;

    // Deduction Calculations
    // 1. Half Day Deduction (0.5 per half day)
    const halfDayDeductionDays = halfDays * 0.5;
    const halfDayDeductionAmount = halfDayDeductionDays * dailyRate;

    // 2. LOP / Absent Deduction (Unaccounted days)
    const totalUnpaidDays = Math.max(0, totalMonthDays - totalPaidDays);
    const lopDays = Math.max(0, totalUnpaidDays - halfDayDeductionDays); // Remaining is LOP
    const lopAmount = lopDays * dailyRate;

    // Earnings
    const grossSalary = employeeData.salaryPerMonth || 0;
    const bonus = employee.extraWork?.bonus || 0;
    const extraDaysPay = (employee.extraWork?.extraDays || 0) * dailyRate;

    // Other Deductions
    const otherDeductions = employee.extraWork?.deductions || 0;

    // Totals
    const totalEarnings = grossSalary + bonus + extraDaysPay;
    const totalDeductions = halfDayDeductionAmount + lopAmount + otherDeductions;
    const netPay = totalEarnings - totalDeductions;

    const hasExtraWork = employee.extraWork && (
      (employee.extraWork.extraDays || 0) > 0 ||
      (employee.extraWork.bonus || 0) > 0 ||
      (employee.extraWork.deductions || 0) > 0
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payslip - ${employee.name}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px;
            color: #000;
          }
          .invoice-container { 
            width: 100%; 
            max-width: 210mm;
            margin: 0 auto; 
            border: 1px solid #000; 
          }
          table { width: 100%; border-collapse: collapse; }
          th, td { 
            padding: 4px 8px; 
            border: 1px solid #000; 
            font-size: 12px; 
            vertical-align: middle;
          }
          .header-cell { border: none; padding: 2px 2px; text-align: center; border-bottom: 1px solid #000; }
          
          .section-header { 
            background-color: #f0f0f0; 
            font-weight: bold; 
            text-align: center; 
            text-transform: uppercase;
          }
          .amount-col { text-align: right; width: 15%; }
          .label-col { text-align: left; width: 35%; }
          
          .notes-box { 
            margin: 10px; 
            padding: 5px; 
            border: 1px dashed #666; 
            font-size: 11px;
            background-color: #fafafa;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          
          <!-- MAIN LAYOUT TABLE -->
          <table>
            
            <!-- HEADER -->
            <tr>
              <td colspan="4" class="header-cell">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0px;">
                  <div style="width: 130px; text-align: left;">
                    <img src="${logo}" alt="Logo" style="height: 110px; width: auto; max-width: 130px; object-fit: contain; display: block;">
                  </div>
                  <div style="flex: 1; text-align: center; margin-right: 130px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">Timely Health Tech Pvt Ltd</h1>
                    <p style="margin: 0px 0 0 0; font-size: 11px; line-height: 1.1;">
                      H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,<br> 
                      Arunodaya Colony, Madhapur, Hyderabad, TG - 500081
                    </p>
                  </div>
                </div>
                <div style="text-align: center; margin-bottom: 2px;">
                  <span style="font-size: 18px; font-weight: bold; text-decoration: underline; text-underline-offset: 3px; display: inline-block;">PAYSLIP ${formatMonthDisplay(employee.month || selectedMonth).toUpperCase()}</span>
                </div>
              </td>
            </tr>

            <!-- EMPLOYEE DETAILS -->
            <tr style="background-color: #fafafa;">
              <td width="20%"><strong>ID</strong></td>
              <td width="30%">${employee.employeeId}</td>
              <td width="20%"><strong>Joined</strong></td>
              <td width="30%">${employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString() : '-'}</td>
            </tr>
            <tr>
              <td><strong>Name</strong></td>
              <td>${employee.name}</td>
              <td><strong>Role</strong></td>
              <td>${employeeData.designation || '-'}</td>
            </tr>
            <tr style="background-color: #fafafa;">
              <td><strong>Dept</strong></td>
              <td>${employeeData.department || '-'}</td>
              <td><strong>Month</strong></td>
              <td>${formatMonthDisplay(employee.month || selectedMonth)}</td>
            </tr>
            <tr>
              <td><strong>Invoice Date</strong></td>
              <td>${new Date().toLocaleDateString()}</td>
              <td><strong>Total Days</strong></td>
              <td>${totalMonthDays} Days</td>
            </tr>

            <!-- SALARY BREAKDOWN HEADER -->
            <tr class="section-header">
              <td colspan="2">EARNINGS</td>
              <td colspan="2">DEDUCTIONS</td>
            </tr>

            <!-- SALARY CONTENT Row 1 -->
            <tr>
              <td class="label-col">Basic Salary</td>
              <td class="amount-col">₹${Math.round(grossSalary).toFixed(2)}</td>
              <td class="label-col">LOP / Absent (${lopDays} days)</td>
              <td class="amount-col" style="color:red;">
                ${lopAmount > 0 ? '-' : ''}₹${Math.round(lopAmount).toFixed(2)}
              </td>
            </tr>
            
            <!-- ROW 2: Days Info -->
            <tr>
              <td class="label-col">Working Days (Full: ${presentDays})</td>
              <td class="amount-col">-</td>
              <td class="label-col">Half Day Deductions (${halfDays} HD)</td>
              <td class="amount-col" style="color:red;">
                ${halfDayDeductionAmount > 0 ? '-' : ''}₹${Math.round(halfDayDeductionAmount).toFixed(2)}
              </td>
            </tr>

            <!-- ROW 3: Week Offs -->
            <tr>
              <td class="label-col">Week Off Days (${weekOffDays})</td>
              <td class="amount-col">-</td>
              <td class="label-col">Other Deductions</td>
              <td class="amount-col" style="color:red;">
                ${otherDeductions > 0 ? '-' : ''}₹${otherDeductions.toFixed(2)}
              </td>
            </tr>

            <!-- ROW 4: Extra / Bonus -->
            <tr>
              <td class="label-col">Bonus / Extra</td>
              <td class="amount-col">₹${Math.round(bonus + extraDaysPay).toFixed(2)}</td>
              <td class="label-col"></td>
              <td class="amount-col"></td>
            </tr>

            <!-- TOTALS ROW -->
            <tr style="font-weight: bold; background-color: #f0f0f0;">
              <td class="label-col">Gross Earnings</td>
              <td class="amount-col">₹${Math.round(totalEarnings).toFixed(2)}</td>
              <td class="label-col">Total Deductions</td>
              <td class="amount-col" style="color:red;">₹${Math.round(totalDeductions).toFixed(2)}</td>
            </tr>

            <!-- NET PAY ROW -->
             <tr style="font-weight: bold; background-color: #e0eee0; font-size: 14px;">
              <td class="label-col" colspan="2" style="text-align: right; padding-right: 20px;">NET PAY</td>
              <td class="amount-col" colspan="2" style="text-align: left; padding-left: 20px;">₹${Math.round(netPay).toFixed(2)}</td>
            </tr>

            <!-- NOTES SECTION IF EXISTS -->
            ${hasExtraWork && employee.extraWork.reason ? `
            <tr>
              <td colspan="4" style="border: none; padding: 10px;">
                <div class="notes-box">
                  <strong>Adjustments Note:</strong> ${employee.extraWork.reason}
                </div>
              </td>
            </tr>
            ` : ''}

          </table>
          
          <div style="text-align: center; font-size: 10px; margin-top: 10px;">
            This is a computer-generated document.
          </div>

        </div>
      </body>
      </html>
    `;
  };

  // ✅ Download salary slip
  const downloadSalarySlip = (employee) => {
    const slipContent = generateInvoiceHTML(employee);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(slipContent);
    printWindow.document.close();
    printWindow.print();
  };

  const currentEmployee = getCurrentEmployee();
  const last12Months = generateLast12Months();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-blue-600">Loading your salary data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 text-red-600 bg-red-100 rounded-lg">
          <p className="font-semibold">Error: {error}</p>
          <button
            onClick={() => fetchAllMonthsData()}
            className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-7xl">

        {/* Header Section */}
        {/* <div className="mb-8"> */}
        {/* <button
            onClick={() => navigate("/employeedashboard")}
            className="flex items-center gap-2 px-4 py-2 mb-4 text-white transition bg-gray-700 rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button> */}
        {/* <h1 className="mb-2 text-3xl font-bold text-gray-800">
            My Salary History - {currentEmployee?.name || 'Employee'}
          </h1> */}
        {/* <p className="text-gray-600">View your salary details and download salary slips</p> */}
        {/* <div className="flex items-center mt-2">
            {selectedMonth ? (
              <span className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-full">
                Month: {formatMonthDisplay(selectedMonth)}
              </span>
            ) : (
              <span className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-full">
                All Months
              </span>
            )}
            <span className="ml-2 text-sm text-gray-600">
              Showing {filteredRecords.length} salary records
            </span>
          </div>
        </div> */}

        {/* Search and Filter Section */}
        <div className="p-6 mb-6 bg-white border border-blue-200 shadow-lg rounded-2xl">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by month name, year, or salary amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Month Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleClearFilter}
                  className={`px-4 py-2 rounded-lg border ${!selectedMonth
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                >
                  All Months
                </button>

                {/* Last 3 months quick buttons */}
                {last12Months.slice(0, 3).map((month, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickMonthSelect(month.value)}
                    className={`px-4 py-2 rounded-lg border ${selectedMonth === month.value
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                  >
                    {month.display}
                  </button>
                ))}

                {/* Calendar Month Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowMonthPicker(!showMonthPicker)}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-purple-600 border border-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    <Calendar size={18} />
                    Select Month
                  </button>

                  {showMonthPicker && (
                    <div className="absolute left-0 z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <input
                        type="month"
                        onChange={handleMonthSelect}
                        className="p-3 border-none focus:ring-0"
                        max={getCurrentMonth()}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="flex items-center gap-2">
                {selectedMonth && (
                  <div className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                    <span>{formatMonthDisplay(selectedMonth)}</span>
                    <button
                      onClick={handleClearFilter}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Refresh Button */}
                <button
                  onClick={() => {
                    if (selectedMonth) {
                      fetchMonthData(selectedMonth);
                    } else {
                      fetchAllMonthsData();
                    }
                  }}
                  disabled={isLoadingMonth}
                  className="flex items-center px-4 py-2 font-semibold text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMonth ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Month Selection Grid */}
            {/* <div className="pt-4 border-t border-gray-200">
              <p className="mb-2 text-sm font-medium text-gray-600">Quick Select Last 12 Months:</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
                {last12Months.map((month, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickMonthSelect(month.value)}
                    className={`px-3 py-2 text-sm rounded-lg border ${
                      selectedMonth === month.value
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    {month.display}
                  </button>
                ))}
              </div>
            </div> */}
          </div>
        </div>

        {/* Stats Overview - Only for current employee */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
          <div className="p-6 bg-white border-l-4 border-blue-500 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Salary Records</p>
                <p className="text-2xl font-bold text-gray-800">{filteredRecords.length}</p>
                <p className="text-xs text-gray-500">{selectedMonth ? 'For selected month' : 'All months'}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-green-500 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Salary Earned</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedMonth ? 'This month' : 'All months total'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-purple-500 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Monthly Salary</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{filteredRecords.length > 0
                    ? Math.round(filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0) / filteredRecords.length)
                    : 0}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedMonth ? 'Current month' : 'Monthly average'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container - Only current employee data */}
        <div className="overflow-hidden bg-white border border-blue-200 shadow-xl rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-white bg-gradient-to-r from-blue-600 to-indigo-700">
                <tr>
                  <th className="p-4 font-semibold text-left">Month</th>
                  <th className="p-4 font-semibold text-center">Present Days</th>
                  <th className="p-4 font-semibold text-center">Working Days</th>
                  <th className="p-4 font-semibold text-center">Half Days</th>
                  <th className="p-4 font-semibold text-center">WeekOff Days</th>
                  <th className="p-4 font-semibold text-center">Leaves</th>
                  <th className="p-4 font-semibold text-center">Salary</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">
                          {selectedMonth
                            ? `No salary record found for ${formatMonthDisplay(selectedMonth)}`
                            : searchTerm
                              ? 'No records match your search'
                              : 'No salary records found for you'
                          }
                        </p>
                        <p className="text-sm">Contact HR if you believe this is an error</p>
                        {(selectedMonth || searchTerm) && (
                          <button
                            onClick={handleClearFilter}
                            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((emp, index) => {
                    const dailyRate = calculateDailyRate(emp);

                    return (
                      <tr
                        key={index}
                        className={`hover:bg-blue-50 transition duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                      >
                        <td className="p-4 font-medium text-gray-900">
                          <div>
                            <div className="font-semibold">{emp.monthFormatted || formatMonthDisplay(emp.month)}</div>
                            <div className="text-xs text-gray-500">{emp.monthDays || 30} days in month</div>
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                            {emp.presentDays || 0}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                            {emp.workingDays || 0}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                            {emp.halfDays || 0}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className="px-3 py-1 text-sm font-medium text-purple-800 bg-purple-100 rounded-full">
                            {emp.weekOffs || 0}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
                            {emp.totalLeaves || 0}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <div>
                            <div className="font-semibold text-green-700">₹{emp.calculatedSalary || 0}</div>
                            <div className="text-xs text-gray-500">₹{dailyRate}/day</div>
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(emp)}
                              className="p-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() => downloadSalarySlip(emp)}
                              className="p-2 text-white transition duration-200 bg-purple-500 rounded-lg hover:bg-purple-600"
                              title="Download Salary Slip"
                            >
                              <FileText size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} entries
                  {selectedMonth && ` for ${formatMonthDisplay(selectedMonth)}`}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border ${currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                  >
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {getPageNumbers().map(pageNumber => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageClick(pageNumber)}
                        className={`px-4 py-2 rounded-lg border ${currentPage === pageNumber
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg border ${currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Details Modal - Same Page Par Hi Show Hoga */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Salary Details - {selectedEmployee.monthFormatted || formatMonthDisplay(selectedEmployee.month)}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 mb-4 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                  <span className="text-lg font-semibold text-blue-800">
                    {currentEmployee?.name?.charAt(0) || selectedEmployee.name?.charAt(0) || 'E'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {currentEmployee?.name || selectedEmployee.name}
                  </h3>
                  <p className="text-sm text-gray-600">ID: {selectedEmployee.employeeId}</p>
                  <p className="text-sm text-gray-600">Month: {selectedEmployee.monthFormatted || formatMonthDisplay(selectedEmployee.month)}</p>
                  <p className="text-sm text-gray-600">Days in Month: {selectedEmployee.monthDays || 30}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Present Days</p>
                <p className="text-lg font-semibold text-green-600">{selectedEmployee.presentDays || 0}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Working Days</p>
                <p className="text-lg font-semibold text-blue-600">{selectedEmployee.workingDays || 0}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Half Days</p>
                <p className="text-lg font-semibold text-yellow-600">{selectedEmployee.halfDays || 0}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">WeekOff Days</p>
                <p className="text-lg font-semibold text-purple-600">{selectedEmployee.weekOffs || 0}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Late Days</p>
                <p className="text-lg font-semibold text-red-600">{selectedEmployee.lateDays || 0}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Total Leaves</p>
                <p className="text-lg font-semibold text-orange-600">{selectedEmployee.totalLeaves || 0}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Month Days</p>
                <p className="text-lg font-semibold text-gray-800">{selectedEmployee.monthDays || 30}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Daily Rate</p>
                <p className="text-lg font-semibold text-blue-700">₹{calculateDailyRate(selectedEmployee)}/day</p>
              </div>
            </div>

            <div className="p-4 mb-4 rounded-lg bg-blue-50">
              <h3 className="mb-2 text-lg font-semibold text-blue-800">Salary Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white border rounded-lg">
                  <p className="text-sm text-gray-600">Monthly Salary</p>
                  <p className="text-lg font-semibold text-blue-700">₹{selectedEmployee.salaryPerMonth || 0}</p>
                </div>
                <div className="p-3 bg-white border rounded-lg">
                  <p className="text-sm text-gray-600">Calculated Salary</p>
                  <p className="text-lg font-semibold text-green-600">₹{selectedEmployee.calculatedSalary || 0}</p>
                </div>
                {/* <div className="p-3 bg-white border rounded-lg col-span-2">
                  <p className="text-sm text-gray-600">Calculation</p>
                  <p className="text-sm text-gray-700">
                    ({selectedEmployee.presentDays || 0} present days + 
                    {(selectedEmployee.halfDays || 0) > 0 ? ` + ${selectedEmployee.halfDays} half days (0.5 each)` : ''} + 
                    {(selectedEmployee.weekOffs || 0) > 0 ? ` + ${selectedEmployee.weekOffs} weekoff days` : ''}) × 
                    ₹{calculateDailyRate(selectedEmployee)}/day
                  </p>
                </div> */}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => downloadSalarySlip(selectedEmployee)}
                className="px-4 py-2 mr-2 text-white transition duration-200 bg-purple-500 rounded-lg hover:bg-purple-600"
              >
                Download Slip
              </button>
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}