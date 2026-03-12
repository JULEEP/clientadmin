import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
import { isEmployeeHidden } from "../utils/employeeStatus";

const BASE_URL = "http://localhost:5000"; // or your actual base URL

export const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || '';
  
  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

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

  const fetchAllData = async () => {
    // Check if clientId exists
    if (!clientId) {
      setError("Client ID not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(""); // Clear any previous errors
      
      console.log("Fetching data for client:", clientId);
      
      // Fetch both permissions and employees data with clientId
      const [permissionsRes, employeesRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/permissions/all/${clientId}`),
        axios.get(`${BASE_URL}/api/employees/get-employees/${clientId}`)
      ]);

      console.log("Permissions API Response:", permissionsRes.data);
      console.log("Employees API Response:", employeesRes.data);
      
      // ✅ FIX: Handle permissions response properly
      let permissionsData = [];
      if (permissionsRes.data) {
        if (Array.isArray(permissionsRes.data)) {
          permissionsData = permissionsRes.data;
        } else if (permissionsRes.data.permissions && Array.isArray(permissionsRes.data.permissions)) {
          permissionsData = permissionsRes.data.permissions;
        } else if (permissionsRes.data.data && Array.isArray(permissionsRes.data.data)) {
          permissionsData = permissionsRes.data.data;
        } else if (permissionsRes.data.records && Array.isArray(permissionsRes.data.records)) {
          permissionsData = permissionsRes.data.records;
        } else {
          // If it's an object but not an array, check if it has data property
          console.warn("Permissions data is not an array:", permissionsRes.data);
          permissionsData = [];
        }
      }

      // Handle employees response
      let employeesData = [];
      if (employeesRes.data) {
        if (Array.isArray(employeesRes.data)) {
          employeesData = employeesRes.data;
        } else if (employeesRes.data.employees && Array.isArray(employeesRes.data.employees)) {
          employeesData = employeesRes.data.employees;
        } else if (employeesRes.data.data && Array.isArray(employeesRes.data.data)) {
          employeesData = employeesRes.data.data;
        }
      }
      
      console.log("Processed permissions data:", permissionsData);
      console.log("Processed employees data:", employeesData);
      
      // Filter active employees
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      
      setEmployees(activeEmployees);
      setPermissions(permissionsData); // ✅ Now it's always an array
      
      // Extract unique departments and designations
      const depts = new Set();
      const designations = new Set();
      activeEmployees.forEach(emp => {
        if (emp.department) depts.add(emp.department);
        if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
      });
      setUniqueDepartments(Array.from(depts).sort());
      setUniqueDesignations(Array.from(designations).sort());
      
      setPagination(prev => ({
        ...prev,
        totalCount: permissionsData.length,
        totalPages: Math.ceil(permissionsData.length / prev.limit),
        currentPage: 1
      }));
      
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to fetch data.");
      setPermissions([]); // ✅ Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [clientId]);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to APPROVE this permission?")) return;

    try {
      const res = await axios.put(`${BASE_URL}/api/permissions/approve/${id}`, {
        clientId
      });
      if (res.status === 200) {
        alert("✅ Permission Approved Successfully!");
        fetchAllData();
      }
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || err.message));
    }
  };

  // Get employee details by ID
  const getEmployeeDetails = (employeeId) => {
    if (!employeeId) return { department: "N/A", designation: "N/A" };
    
    const employee = employees.find(emp => 
      emp.employeeId === employeeId || 
      emp._id === employeeId || 
      emp.empId === employeeId ||
      emp.id === employeeId
    );
    
    return {
      department: employee?.department || employee?.departmentName || "N/A",
      designation: employee?.designation || employee?.role || "N/A"
    };
  };

  // Handle date range filter
  const handleDateRangeFilter = () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }
    
    // Apply date filter
    filterPermissions();
  };

  // Handle month change
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setFromDate(""); // Reset date filters when month changes
    setToDate("");
  };

  // Apply all filters
  const filterPermissions = () => {
    let filtered = [...permissions];
    
    // Apply date range filter
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= from && itemDate <= to;
      });
    } else if (selectedMonth) {
      // Apply month filter
      const [year, month] = selectedMonth.split('-').map(Number);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
      });
    }
    
    setPagination(prev => ({
      ...prev,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit),
      currentPage: 1
    }));
  };

  // ✅ Search Filter Logic - FIXED: Check if permissions is array
  const filteredPermissions = Array.isArray(permissions) && permissions.length > 0
    ? permissions
        .map(permission => {
          // Enrich permission with employee details
          const empDetails = getEmployeeDetails(permission.employeeId);
          return {
            ...permission,
            department: empDetails.department,
            designation: empDetails.designation
          };
        })
        .filter((item) => {
          const term = searchTerm.toLowerCase();
          
          // Search by ID or Name
          const matchesSearch = searchTerm.trim() === "" || (
            (item.employeeName?.toLowerCase().includes(term) || false) ||
            (item.employeeId?.toString().toLowerCase().includes(term) || false) ||
            (item._id?.toLowerCase().includes(term) || false)
          );
          
          // Filter by Department
          const matchesDepartment = filterDepartment === "" || 
            item.department === filterDepartment;
          
          // Filter by Designation
          const matchesDesignation = filterDesignation === "" || 
            item.designation === filterDesignation;
          
          // Apply date filters
          let matchesDate = true;
          if (fromDate && toDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            const itemDate = new Date(item.createdAt);
            matchesDate = itemDate >= from && itemDate <= to;
          } else if (selectedMonth) {
            const [year, month] = selectedMonth.split('-').map(Number);
            const itemDate = new Date(item.createdAt);
            matchesDate = itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
          }
          
          return matchesSearch && matchesDepartment && matchesDesignation && matchesDate;
        })
    : [];

  // Update pagination when filtered results change
  useEffect(() => {
    if (Array.isArray(permissions)) {
      setPagination(prev => ({
        ...prev,
        totalCount: filteredPermissions.length,
        totalPages: Math.ceil(filteredPermissions.length / prev.limit),
        currentPage: 1
      }));
    }
  }, [filteredPermissions.length, filterDepartment, filterDesignation, searchTerm, fromDate, toDate, selectedMonth, permissions]);

  // ✅ Pagination Handlers
  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredPermissions.length,
      totalPages: Math.ceil(filteredPermissions.length / limit)
    });
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1
      }));
    }
  };

  const handlePageClick = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      if (
        i === 1 ||
        i === pagination.totalPages ||
        (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  // Calculate pagination
  const indexOfLastItem = pagination.currentPage * pagination.limit;
  const indexOfFirstItem = indexOfLastItem - pagination.limit;
  const currentItems = filteredPermissions.slice(indexOfFirstItem, indexOfLastItem);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFromDate("");
    setToDate("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
  };

  // Format month for display (e.g., "March, 2026")
  const getMonthDisplay = () => {
    if (!selectedMonth) return "";
    const [year, month] = selectedMonth.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Client Info Banner
  const ClientInfoBanner = () => (
    <div className="p-3 mb-3 text-sm text-blue-700 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">Client ID:</span>
          <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded text-xs">
            {clientId.substring(0, 8)}...
          </span>
          <span className="ml-4 text-xs text-gray-500">
            Showing permissions for your client account
          </span>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          Total Permissions: {Array.isArray(permissions) ? permissions.length : 0}
        </span>
      </div>
    </div>
  );

  if (!clientId) {
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg text-red-600">Client ID not found. Please login again.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading permissions...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">
        
        {/* Client Info Banner */}
        <ClientInfoBanner />
        
        {/* Filters */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* ID/Name Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
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
                <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div 
                    onClick={() => {
                      setFilterDepartment('');
                      setShowDepartmentFilter(false);
                    }}
                    className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-100 font-medium text-gray-700"
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
                <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div 
                    onClick={() => {
                      setFilterDesignation('');
                      setShowDesignationFilter(false);
                    }}
                    className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-100 font-medium text-gray-700"
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
                onChange={(e) => {
                  setFromDate(e.target.value);
                  if (e.target.value && toDate) {
                    handleDateRangeFilter();
                  }
                }}
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
                onChange={(e) => {
                  setToDate(e.target.value);
                  if (fromDate && e.target.value) {
                    handleDateRangeFilter();
                  }
                }}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Month Selector */}
            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Apply Date Range Button */}
            <button
              onClick={handleDateRangeFilter}
              disabled={!fromDate || !toDate}
              className="h-8 px-3 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Date Range
            </button>

            {/* Clear Filters Button */}
            {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 p-4 text-center bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600 mb-2">{error}</p>
            <button
              onClick={fetchAllData}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {filteredPermissions.length === 0 && !error ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-500">No permission requests found</p>
            <p className="mt-2 text-sm text-gray-400">
              {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && "Try clearing search filters"}
            </p>
          </div>
        ) : filteredPermissions.length > 0 ? (
          <>
            {/* Permissions Table */}
            <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
              <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="min-w-full">
                  <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="py-2 text-center px-2">Employee ID</th>
                      <th className="py-2 text-center px-2">Name</th>
                      <th className="py-2 text-center px-2">Department</th>
                      <th className="py-2 text-center px-2">Designation</th>
                      <th className="py-2 text-center px-2">Date & Time</th>
                      <th className="py-2 text-center px-2">Duration</th>
                      <th className="py-2 text-center px-2">Reason</th>
                      <th className="py-2 text-center px-2">Status</th>
                      <th className="py-2 text-center px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((p) => (
                      <tr key={p._id} className="transition-colors hover:bg-gray-50">
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {p.employeeId || "N/A"}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {p.employeeName || "N/A"}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">
                          {p.department}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">
                          {p.designation}
                        </td>
                        <td className="px-3 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-gray-500">
                            {new Date(p.createdAt).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                            {p.duration} mins
                          </span>
                        </td>
                        <td className="max-w-xs px-2 py-2 text-sm text-center text-gray-700 truncate">
                          "{p.reason}"
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                              p.status === "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : p.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-700"
                                : p.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {p.status === "COMPLETED" ? "IN DUTY" : p.status}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          {p.status === "PENDING" ? (
                            <button
                              onClick={() => handleApprove(p._id)}
                              className="px-3 py-1 text-xs font-semibold text-white transition-all bg-green-600 rounded-md shadow-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                          ) : p.status === "APPROVED" ? (
                            <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md">
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredPermissions.length > 0 && (
                <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
                  {/* Left Side - Showing Info + Select */}
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                    <span>Showing</span>
                    <span className="font-medium">
                      {indexOfFirstItem + 1}
                    </span>
                    <span>to</span>
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredPermissions.length)}
                    </span>
                    <span>of</span>
                    <span className="font-medium">
                      {filteredPermissions.length}
                    </span>
                    <span>results</span>

                    {/* Select Dropdown */}
                    <select
                      value={pagination.limit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        handleItemsPerPageChange(newLimit);
                      }}
                      className="p-1 ml-2 text-sm border rounded-lg"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={handlePrevPage}
                      disabled={pagination.currentPage === 1}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        pagination.currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                          disabled={page === "..."}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === "..."
                              ? "text-gray-500 cursor-default"
                              : pagination.currentPage === page
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        pagination.currentPage === pagination.totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};