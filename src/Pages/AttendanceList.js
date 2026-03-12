import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
import { filterActiveRecords, isEmployeeHidden } from "../utils/employeeStatus";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BASE_URL = "http://localhost:5000/api";

export default function AttendanceList() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientInfo, setClientInfo] = useState(null);
  
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || '';
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!clientId) {
      setError("Client ID not found. Please login again.");
      setLoading(false);
      return;
    }

    const fetchAllAttendance = async () => {
      try {
        // Fetch employees first with clientId
        const empRes = await fetch(`${BASE_URL}/employees/get-employees/${clientId}`);
        const employeesData = empRes.ok ? await empRes.json() : [];
        
        // Handle different response structures
        let employeesArray = [];
        if (Array.isArray(employeesData)) {
          employeesArray = employeesData;
        } else if (employeesData?.employees && Array.isArray(employeesData.employees)) {
          employeesArray = employeesData.employees;
        } else if (employeesData?.data && Array.isArray(employeesData.data)) {
          employeesArray = employeesData.data;
        }
        
        const activeEmployees = employeesArray.filter(emp => !isEmployeeHidden(emp));
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

        // Fetch client info from localStorage
        const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');
        setClientInfo(clientData);

        // Fetch attendance with clientId in params
        const res = await fetch(`${BASE_URL}/attendance/allattendance/${clientId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

        // Handle different response structures
        let attendanceRecords = [];
        if (Array.isArray(data)) {
          attendanceRecords = data;
        } else if (data.records && Array.isArray(data.records)) {
          attendanceRecords = data.records;
        } else if (data.allAttendance && Array.isArray(data.allAttendance)) {
          attendanceRecords = data.allAttendance;
        } else if (data.data && Array.isArray(data.data)) {
          attendanceRecords = data.data;
        }

        // Sort by checkInTime descending (newest first)
        const sortedRecords = attendanceRecords.sort((a, b) =>
          new Date(b.checkInTime) - new Date(a.checkInTime)
        );

        // Filter out inactive employees using central utility
        const activeRecords = filterActiveRecords(sortedRecords, employeesArray);

        setRecords(activeRecords);
        setFilteredRecords(activeRecords);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAttendance();
  }, [clientId]);

  // Get employee details
  const getEmployeeDetails = (employeeId) => {
    if (!employeeId) return { name: "Unknown", department: "N/A", designation: "N/A", email: "" };
    const emp = employees.find(
      (e) =>
        e.employeeId === employeeId ||
        e._id === employeeId
    );
    return {
      name: emp ? emp.name : "Unknown",
      department: emp?.department || emp?.departmentName || "N/A",
      designation: emp?.designation || emp?.role || "N/A",
      email: emp?.email || emp?.employeeEmail || ""
    };
  };

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...records];

    // Apply search filter (by name or employee ID)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(rec => {
        const empDetails = getEmployeeDetails(rec.employeeId);
        const name = empDetails.name.toLowerCase();
        const id = (rec.employeeId || "").toString().toLowerCase();
        
        return name.includes(term) || id.includes(term);
      });
    }

    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter((rec) => {
        const checkInDate = new Date(rec.checkInTime).toISOString().split("T")[0];
        return checkInDate === selectedDate;
      });
    }

    // Apply month filter
    if (selectedMonth) {
      const [year, monthNum] = selectedMonth.split("-").map(Number);
      filtered = filtered.filter((rec) => {
        const d = new Date(rec.checkInTime);
        return (
          d.getFullYear() === year &&
          d.getMonth() + 1 === monthNum
        );
      });
    }
    
    // Filter by Department
    if (filterDepartment) {
      filtered = filtered.filter(rec => {
        const empDetails = getEmployeeDetails(rec.employeeId);
        return empDetails.department === filterDepartment;
      });
    }
    
    // Filter by Designation
    if (filterDesignation) {
      filtered = filtered.filter(rec => {
        const empDetails = getEmployeeDetails(rec.employeeId);
        return empDetails.designation === filterDesignation;
      });
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle date change
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedMonth("");
  };

  // Handle month change
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setSelectedDate("");
  };

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedDate, selectedMonth, filterDepartment, filterDesignation, records]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedDate("");
    setSelectedMonth("");
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFilteredRecords(records);
    setCurrentPage(1);
  };

  // Pagination handlers
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // Download CSV function
  const downloadCSV = () => {
    if (filteredRecords.length === 0) {
      alert("No data available to download!");
      return;
    }

    const headers = [
      "Employee ID",
      "Employee Name",
      "Department",
      "Designation",
      "Email",
      "Date",
      "Check-In Time",
      "Check-Out Time",
      "Total Hours",
      "Distance (m)",
      "Onsite",
      "Reason",
      "Status"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredRecords.map((rec) => {
        const empDetails = getEmployeeDetails(rec.employeeId);
        const checkInDate = rec.checkInTime ? new Date(rec.checkInTime).toLocaleDateString('en-IN') : "-";
        return [
          `"${rec.employeeId}"`,
          `"${empDetails.name}"`,
          `"${empDetails.department}"`,
          `"${empDetails.designation}"`,
          `"${empDetails.email || rec.employeeEmail || "-"}"`,
          `"${checkInDate}"`,
          `"${rec.checkInTime ? new Date(rec.checkInTime).toLocaleString('en-IN') : "-"}"`,
          `"${rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleString('en-IN') : "-"}"`,
          rec.totalHours?.toFixed(2) || "0.00",
          rec.distance?.toFixed(2) || "0.00",
          rec.onsite ? "Yes" : "No",
          `"${rec.reason || "Not specified"}"`,
          rec.status
        ].join(",");
      }),
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_records_${clientId}_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format time for display with blinking animation
  const formatTimeWithStatus = (checkInTime, checkOutTime) => {
    const checkIn = checkInTime ? new Date(checkInTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : null;
    
    const checkOut = checkOutTime ? new Date(checkOutTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : null;

    if (checkIn && !checkOut) {
      // Still checked in - show with green blinking
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
            <span className="relative inline-flex w-2 h-2 bg-green-500 rounded-full"></span>
          </span>
          <span className="font-semibold text-green-600">{checkIn}</span>
          <span className="text-xs text-gray-400">/ --:--</span>
        </div>
      );
    } else if (checkIn && checkOut) {
      // Completed - show in red
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="inline-flex w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="font-semibold text-gray-700">{checkIn}</span>
          <span className="text-xs text-gray-400">/</span>
          <span className="font-semibold text-red-600">{checkOut}</span>
        </div>
      );
    } else {
      return <span className="text-gray-400">-</span>;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Stat Card component
  const StatCard = ({ label, value, color }) => {
    return (
      <div className="overflow-hidden bg-white shadow-sm rounded-xl">
        <div className={`h-1 ${color}`}></div>
        <div className="p-4 text-center">
          <div className="text-lg font-bold">{value}</div>
          <div className="text-xs font-medium text-gray-700">{label}</div>
        </div>
      </div>
    );
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
          <p className="text-lg font-semibold text-gray-700">Loading attendance records...</p>
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
            onClick={() => window.location.reload()}
            className="px-6 py-2 font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2 py-0 bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="mx-auto max-w-9xl">

        {/* Client Info Banner */}
        {clientInfo && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">TH</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Client: {clientInfo.name || clientInfo.companyName || 'N/A'}</p>
                  <p className="text-xs text-gray-500">ID: {clientId.substring(0, 8)}...</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Location: {clientInfo.location || 'N/A'}
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Employees: {employees.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2 sm:grid-cols-4">
          <StatCard
            label={`Total Records: ${records.length}`}
            value={records.length}
            color="bg-blue-500"
          />
          <StatCard
            label={`Onsite: ${records.filter((r) => r.onsite).length}`}
            value={records.filter((r) => r.onsite).length}
            color="bg-green-500"
          />
          <StatCard
            label={`Checked In: ${records.filter((r) => r.status === "checked-in").length}`}
            value={records.filter((r) => r.status === "checked-in").length}
            color="bg-orange-500"
          />
          <StatCard
            label={`Filtered: ${filteredRecords.length}`}
            value={filteredRecords.length}
            color="bg-purple-500"
          />
        </div>

        {/* Filters Section */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search Name / ID */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

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

            {/* Date */}
            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Month */}
            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* CSV Button */}
            <button
              onClick={downloadCSV}
              className="h-8 px-3 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700"
            >
              📥 CSV
            </button>

            {/* Clear Button */}
            {(searchTerm || filterDepartment || filterDesignation || selectedDate || selectedMonth) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
          {filteredRecords.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">📭</div>
              <p className="mb-4 text-lg font-semibold text-gray-600">
                {records.length === 0 ? "No attendance records found." : "No records match your filters."}
              </p>
              {records.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  🔄 Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
                <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                  <table className="min-w-full">
                    <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                      <tr>
                        <th className="py-2 text-center">Employee ID</th>
                        <th className="py-2 text-center">Name</th>
                        <th className="py-2 text-center">Department</th>
                        <th className="py-2 text-center">Designation</th>
                        <th className="py-2 text-center">Date</th>
                        <th className="py-2 text-center">Check-In/Out</th>
                        <th className="py-2 text-center">Hours</th>
                        <th className="py-2 text-center">Distance</th>
                        <th className="py-2 text-center">Onsite</th>
                        <th className="py-2 text-center">Reason</th>
                        <th className="py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((rec, idx) => {
                        const empDetails = getEmployeeDetails(rec.employeeId);
                        return (
                          <tr
                            key={rec._id}
                            className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 hover:shadow-sm`}
                          >
                            {/* Employee ID */}
                            <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                              {rec.employeeId}
                            </td>

                            {/* Name */}
                            <td className="px-2 py-2 text-center ">
                              <div className="font-medium text-gray-900 whitespace-nowrap">
                                {empDetails.name}
                              </div>
                            </td>

                            {/* Department */}
                            <td className="px-2 py-2 text-center text-gray-600">
                              {empDetails.department}
                            </td>

                            {/* Designation */}
                            <td className="px-2 py-2 text-center text-gray-600">
                              {empDetails.designation}
                            </td>

                            {/* Date */}
                            <td className="px-2 py-2 text-center font-medium">
                              {formatDate(rec.checkInTime)}
                            </td>

                            {/* Check-In/Out with Blinking */}
                            <td className="px-2 py-2 text-center">
                              {formatTimeWithStatus(rec.checkInTime, rec.checkOutTime)}
                            </td>

                            {/* Hours */}
                            <td className="px-2 py-2 text-center">
                              <span className={`font-medium text-lg ${rec.totalHours >= 8 ? 'text-green-600' :
                                rec.totalHours >= 4 ? 'text-orange-600' : 'text-red-600'
                                }`}>
                                {rec.totalHours ? rec.totalHours.toFixed(1) : "0.0"}h
                              </span>
                            </td>

                            {/* Distance */}
                            <td className="px-2 py-2 text-center">
                              <span className="px-2 py-1 font-mono text-gray-700 bg-gray-100 rounded">
                                {rec.distance?.toFixed(0) || "0"}m
                              </span>
                            </td>

                            {/* Onsite */}
                            <td className="px-2 py-2 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${rec.onsite
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : "bg-red-100 text-red-800 border border-red-300"
                                  }`}
                              >
                                {rec.onsite ? "🏢 Yes" : "🏠 No"}
                              </span>
                            </td>

                            {/* Reason */}
                            <td className="px-2 py-2 text-center">
                              <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded max-w-[120px] truncate block">
                                {rec.reason || "Not specified"}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-2 py-2 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${rec.status === "checked-in"
                                  ? "bg-blue-100 text-blue-800 border border-blue-300 animate-pulse"
                                  : "bg-green-100 text-green-800 border border-green-300"
                                  }`}
                              >
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Section */}
              {filteredRecords.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 p-6 border-t sm:flex-row bg-gray-50">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Show:
                      </label>
                      <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="p-2 text-sm border rounded-lg"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-600">entries</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)}</strong> of{" "}
                      <strong>{filteredRecords.length}</strong> records
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${currentPage === 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                        }`}
                    >
                      ← Previous
                    </button>

                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                        disabled={page === "..."}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${page === "..."
                          ? "bg-gray-200 text-gray-500 cursor-default"
                          : currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${currentPage === totalPages
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                        }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}