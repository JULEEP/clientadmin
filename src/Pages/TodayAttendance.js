import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { isEmployeeHidden } from "../utils/employeeStatus";
import { motion } from "framer-motion";

const BASE_URL = "http://localhost:5000/api";

const TodayAttendance = () => {
  const [todayRecords, setTodayRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || '';
  const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');
  
  // Employees data for department/designation
  const [employees, setEmployees] = useState([]);
  
  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Search filters
  const [searchTerm, setSearchTerm] = useState("");
  
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
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

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
    
    fetchTodayAttendance();
  }, [clientId]);

  useEffect(() => {
    // Apply filters whenever data or filters change
    filterRecords();
  }, [todayRecords, searchTerm, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

  useEffect(() => {
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch today's attendance with clientId
      const attendanceResp = await axios.get(
        `${BASE_URL}/attendance/today/${clientId}`
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
        `${BASE_URL}/employees/get-employees/${clientId}`
      );

      // Handle different response structures for employees
      let employeesData = [];
      if (Array.isArray(empResp.data)) {
        employeesData = empResp.data;
      } else if (empResp.data?.employees && Array.isArray(empResp.data.employees)) {
        employeesData = empResp.data.employees;
      } else if (empResp.data?.data && Array.isArray(empResp.data.data)) {
        employeesData = empResp.data.data;
      }
      
      // Filter active employees
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

      // 3️⃣ Map employee details into attendance records
      const merged = attendance
        .map((rec) => {
          const empId =
            rec.employeeId?._id ||
            rec.employeeId?.employeeId ||
            rec.employeeId ||
            rec.empId ||
            "";

          const employee = employeesData.find(
            (e) =>
              e.employeeId === empId ||
              e._id === empId ||
              e.empId === empId
          );

          // Skip if employee is hidden
          if (isEmployeeHidden(employee)) return null;

          return {
            ...rec,
            name: employee?.name || employee?.fullName || "N/A",
            employeeId: empId,
            department: employee?.department || employee?.departmentName || "N/A",
            designation: employee?.designation || employee?.role || "N/A",
            joinDate: employee?.joinDate,
            employeeEmail: employee?.email || rec.employeeEmail || "-"
          };
        })
        .filter(rec => rec !== null); // Remove hidden employees

      setTodayRecords(merged);
    } catch (err) {
      console.error("Error fetching today's attendance:", err);
      setError(err.response?.data?.message || "Failed to fetch today's attendance");
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...todayRecords];
    
    // Filter by Employee ID or Name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(rec => 
        rec.employeeId?.toString().toLowerCase().includes(term) ||
        rec.name?.toLowerCase().includes(term)
      );
    }
    
    // Filter by Department
    if (filterDepartment) {
      filtered = filtered.filter(rec => rec.department === filterDepartment);
    }
    
    // Filter by Designation
    if (filterDesignation) {
      filtered = filtered.filter(rec => rec.designation === filterDesignation);
    }
    
    // Filter by Date Range
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(rec => {
        const recDate = new Date(rec.checkInTime);
        return recDate >= from && recDate <= to;
      });
    } else if (fromDate && !toDate) {
      // Single date
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(fromDate);
      to.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(rec => {
        const recDate = new Date(rec.checkInTime);
        return recDate >= from && recDate <= to;
      });
    } else if (selectedMonth) {
      // Month filter
      const [year, month] = selectedMonth.split('-').map(Number);
      filtered = filtered.filter(rec => {
        const recDate = new Date(rec.checkInTime);
        return recDate.getFullYear() === year && recDate.getMonth() + 1 === month;
      });
    }
    
    setFilteredRecords(filtered);
    setPagination(prev => ({
      ...prev,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit)
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFromDate("");
    setToDate("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
  };

  // Pagination calculations
  const indexOfLastRow = pagination.currentPage * pagination.limit;
  const indexOfFirstRow = indexOfLastRow - pagination.limit;
  const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / limit)
    });
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

  const getHoursColor = (hours) => {
    if (hours >= 8) return 'bg-green-100 text-green-700';
    if (hours >= 4) return 'bg-yellow-100 text-yellow-700';
    return 'bg-orange-100 text-orange-700';
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
    if (!dateString) return "-";
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

  if (loading)
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading today's attendance...</span>
            </div>
          </div>
        </div>
      </div>
    );
    
  if (error)
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchTodayAttendance}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">
        
        {/* Client Info Banner - NEW */}
        {clientData && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">TH</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Welcome, {clientData.name || clientData.companyName || 'Client'}!</p>
                  <p className="text-xs text-gray-500">ID: {clientId.substring(0, 8)}...</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {clientData.location || 'Location'}
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Employees: {employees.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters - Exactly same as original */}
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
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
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
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Month Selector */}
            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-500">No attendance records found</p>
            <p className="mt-2 text-sm text-gray-400">
              {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && "Try clearing filters"}
            </p>
          </div>
        ) : (
          <>
            {/* Attendance Table - Exactly same as original */}
            <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
              <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="min-w-full">
                  <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="py-2 text-center">Employee ID</th>
                      <th className="py-2 text-center">Name</th>
                      <th className="py-2 text-center">Department</th>
                      <th className="py-2 text-center">Designation</th>
                      <th className="py-2 text-center">Check In</th>
                      <th className="py-2 text-center">Check Out</th>
                      <th className="py-2 text-center">Total Hours</th>
                      <th className="py-2 text-center">Distance (m)</th>
                      <th className="py-2 text-center">Onsite</th>
                      <th className="py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((rec, idx) => (
                      <motion.tr
                        key={rec._id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className={`transition-colors border-t cursor-pointer hover:bg-blue-50 ${
                          idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                        onClick={() =>
                          navigate(`/employee-details/${rec.employeeId}`)
                        }
                      >
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {rec.employeeId || "-"}
                        </td>

                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          <div>{rec.name}</div>
                          <div className="text-[10px] text-gray-500">{rec.employeeEmail}</div>
                        </td>

                        <td className="px-2 py-2 text-center text-gray-600">
                          {rec.department}
                        </td>

                        <td className="px-2 py-2 text-center text-gray-600">
                          {rec.designation}
                        </td>

                        <td className="px-2 py-2 text-center">
                          {formatTime(rec.checkInTime)}
                        </td>

                        <td className="px-2 py-2 text-center">
                          {rec.checkOutTime ? formatTime(rec.checkOutTime) : "-"}
                        </td>

                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHoursColor(rec.totalHours)}`}>
                            {rec.totalHours?.toFixed(1) || "0.0"}h
                          </span>
                        </td>

                        <td className="px-2 py-2 text-sm font-medium text-center text-gray-800 whitespace-nowrap">
                          {rec.distance?.toFixed(0) || "-"}
                        </td>

                        <td className="px-2 py-2 text-sm font-medium text-center text-gray-500 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${rec.onsite ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                            {rec.onsite ? "Yes" : "No"}
                          </span>
                        </td>

                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              rec.status
                            )}`}
                          >
                            {rec.status || "-"}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Exactly same as original */}
              {filteredRecords.length > 0 && (
                <div className="flex items-center justify-between px-2 py-2 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
                    <span>Showing</span>
                    <span className="font-medium">
                      {indexOfFirstRow + 1}
                    </span>
                    <span>to</span>
                    <span className="font-medium">
                      {Math.min(indexOfLastRow, filteredRecords.length)}
                    </span>
                    <span>of</span>
                    <span className="font-medium">
                      {filteredRecords.length}
                    </span>
                    <span>results</span>

                    {/* Select Dropdown */}
                    <select
                      value={pagination.limit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        handleItemsPerPageChange(newLimit);
                      }}
                      className="p-1 ml-1 text-xs border rounded-lg"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage - 1,
                        }))
                      }
                      disabled={pagination.currentPage === 1}
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-0.5">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.currentPage - 1 &&
                            page <= pagination.currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() =>
                                setPagination((prev) => ({
                                  ...prev,
                                  currentPage: page,
                                }))
                              }
                              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                pagination.currentPage === page
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === pagination.currentPage - 2 ||
                          page === pagination.currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-1 text-xs text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage + 1,
                        }))
                      }
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TodayAttendance;