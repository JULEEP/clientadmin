import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { 
  FaBuilding, FaEdit, FaEye, FaFileExcel, FaFileCsv, 
  FaMapMarkerAlt, FaSearch, FaTrash, FaUserTag, FaUpload 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { CSVLink } from "react-csv";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedEmployeeForLocation, setSelectedEmployeeForLocation] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  
  // Filter states
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
  
  const navigate = useNavigate();

  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || '';
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        // Pass clientId in params
        const response = await axios.get(
          `${API_BASE_URL}/employees/get-employees/${clientId}`
        );
        console.log("Employees API Response:", response.data);
        
        // Handle different response structures
        let employeesData = [];
        if (Array.isArray(response.data)) {
          employeesData = response.data;
        } else if (response.data?.employees && Array.isArray(response.data.employees)) {
          employeesData = response.data.employees;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          employeesData = response.data.data;
        } else if (response.data?.message) {
          console.log("API Message:", response.data.message);
        }
        
        setEmployees(employeesData || []);
        extractUniqueValues(employeesData || []);
      } catch (error) {
        console.error("❌ Error fetching employees:", error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchLocations = async () => {
      try {
        // Pass clientId in params for client-specific locations
        const response = await axios.get(
          `${API_BASE_URL}/location/alllocation/${clientId}`
        );
        console.log("Locations API Response:", response.data);
        
        let locationsData = [];
        if (Array.isArray(response.data)) {
          locationsData = response.data;
        } else if (response.data?.locations && Array.isArray(response.data.locations)) {
          locationsData = response.data.locations;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          locationsData = response.data.data;
        }
        setLocations(locationsData || []);
      } catch (error) {
        console.error("❌ Error fetching locations:", error);
        setLocations([]);
      }
    };

    if (clientId) {
      fetchEmployees();
      fetchLocations();
    } else {
      console.error("Client ID not found. Please login again.");
    }
  }, [clientId]);

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

  // Extract unique departments and designations
  const extractUniqueValues = (employeesData) => {
    const depts = new Set();
    const designations = new Set();
    
    employeesData.forEach(emp => {
      if (emp.department) depts.add(emp.department);
      if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
    });
    
    setUniqueDepartments(Array.from(depts).sort());
    setUniqueDesignations(Array.from(designations).sort());
  };

  // Check if employee is active based on isActive field or status
  const isEmployeeHidden = (emp) => {
    if (!emp) return true;
    if (emp.isActive === false) return true;
    if (emp.status === 'inactive') return true;
    if (emp.status === false) return true;
    return false;
  };

  const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));
  const inactiveEmployees = employees.filter(emp => isEmployeeHidden(emp));

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter((emp) => {
    if (!emp) return false;
    
    if (showInactiveOnly && !isEmployeeHidden(emp)) return false;
    if (!showInactiveOnly && isEmployeeHidden(emp)) return false;
    
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    // Search by multiple fields
    const matchesSearch = searchTerm === "" || (
      emp.name?.toLowerCase().includes(searchTermLower) ||
      emp.email?.toLowerCase().includes(searchTermLower) ||
      emp.phone?.toLowerCase().includes(searchTermLower) ||
      emp.employeeId?.toLowerCase().includes(searchTermLower) ||
      emp.department?.toLowerCase().includes(searchTermLower) ||
      emp.role?.toLowerCase().includes(searchTermLower)
    );
    
    // Filter by Department
    const matchesDept = filterDepartment === "" || emp.department === filterDepartment;
    
    // Filter by Designation
    const matchesDesig = filterDesignation === "" || (emp.role || emp.designation) === filterDesignation;
    
    return matchesSearch && matchesDept && matchesDesig;
  }).sort((a, b) => {
    const aHidden = isEmployeeHidden(a);
    const bHidden = isEmployeeHidden(b);
    if (aHidden === bHidden) {
      return a.name?.localeCompare(b.name);
    }
    return aHidden ? 1 : -1;
  });

  // Update pagination when filtered results change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalCount: filteredEmployees.length,
      totalPages: Math.ceil(filteredEmployees.length / prev.limit),
      currentPage: 1
    }));
  }, [filteredEmployees.length, pagination.limit, showInactiveOnly, searchTerm, filterDepartment, filterDesignation]);

  const indexOfLast = pagination.currentPage * pagination.limit;
  const indexOfFirst = indexOfLast - pagination.limit;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);

  const handleView = (employee) => setSelectedEmployee(employee);
  const handleCloseModal = () => setSelectedEmployee(null);
  const handleEdit = (employee) => navigate(`/addemployee`, { state: { employee } });

  const handleToggleStatus = async (emp) => {
    const isCurrentlyHidden = isEmployeeHidden(emp);
    const newStatus = isCurrentlyHidden ? 'active' : 'inactive';
    const action = isCurrentlyHidden ? 'ACTIVATE' : 'DEACTIVATE';

    if (!window.confirm(`Are you sure you want to ${action} ${emp.name}?`)) return;

    setLoading(true);
    
    try {
      const updateData = {
        status: newStatus
      };

      console.log("Updating status for:", emp._id, "Data:", updateData);

      const response = await axios.put(
        `${API_BASE_URL}/employees/update/${emp._id}/${clientId}`,
        updateData
      );

      if (response.data.success) {
        setEmployees(employees.map(e => 
          e._id === emp._id 
            ? { ...e, status: newStatus } 
            : e
        ));
        alert(`✅ Employee ${action}D successfully`);
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating employee status:", error);
      
      try {
        const updateData2 = {
          isActive: !isCurrentlyHidden
        };
        
        const retryResponse = await axios.put(
          `${API_BASE_URL}/employees/update/${emp._id}/${clientId}`,
          updateData2
        );
        
        if (retryResponse.data.success) {
          setEmployees(employees.map(e => 
            e._id === emp._id 
              ? { ...e, isActive: !isCurrentlyHidden } 
              : e
          ));
          alert(`✅ Employee ${action}D successfully`);
        }
      } catch (retryError) {
        console.error("Retry error:", retryError);
        alert(`Failed to update status: ${retryError.response?.data?.message || retryError.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(
          `${API_BASE_URL}/employees/delete-employee/${id}/${clientId}`
        );
        setEmployees(employees.filter((emp) => emp._id !== id));
        alert("✅ Employee deleted successfully!");
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert(`Failed to delete employee: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleAssignLocation = (employee) => {
    setSelectedEmployeeForLocation(employee);
    setSelectedLocationId(employee.location || "");
    setShowLocationModal(true);
  };

  const handleCloseLocationModal = () => {
    setShowLocationModal(false);
    setSelectedEmployeeForLocation(null);
    setSelectedLocationId("");
    setLoading(false);
  };

  const assignLocation = async () => {
    if (!selectedLocationId) {
      alert("Please select a location");
      return;
    }

    const selectedLoc = locations.find(loc => loc._id === selectedLocationId);
    if (!selectedLoc) {
      alert("Selected location not found");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/employees/assign-location/${selectedEmployeeForLocation.employeeId}`,
        {
          locationId: selectedLocationId,
          name: selectedLoc.name,
          latitude: selectedLoc.latitude,
          longitude: selectedLoc.longitude
        }
      );

      console.log("Assign location response:", response.data);

      setEmployees(
        employees.map((emp) =>
          emp._id === selectedEmployeeForLocation._id
            ? { ...emp, location: selectedLocationId }
            : emp
        )
      );

      alert("✅ Location assigned successfully!");
      handleCloseLocationModal();
    } catch (error) {
      console.error("❌ Error assigning location:", error);
      
      try {
        const fallbackResponse = await axios.put(
          `${API_BASE_URL}/employees/update/${selectedEmployeeForLocation._id}/${clientId}`,
          { location: selectedLocationId }
        );

        if (fallbackResponse.data.success) {
          setEmployees(employees.map((emp) =>
            emp._id === selectedEmployeeForLocation._id
              ? { ...emp, location: selectedLocationId }
              : emp
          ));
          alert("✅ Location assigned successfully!");
          handleCloseLocationModal();
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        alert(`Failed to assign location: ${fallbackError.response?.data?.message || fallbackError.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        
        console.log("Imported Employees:", parsedData);
        
        const response = await axios.post(
          `${API_BASE_URL}/employees/bulk-import/${clientId}`,
          { employees: parsedData }
        );
        
        alert(response.data.message || "✅ Employees imported successfully!");
        
        const updatedResponse = await axios.get(
          `${API_BASE_URL}/employees/get-employees/${clientId}`
        );
        
        let updatedEmployees = [];
        if (Array.isArray(updatedResponse.data)) {
          updatedEmployees = updatedResponse.data;
        } else if (updatedResponse.data?.employees && Array.isArray(updatedResponse.data.employees)) {
          updatedEmployees = updatedResponse.data.employees;
        } else if (updatedResponse.data?.data && Array.isArray(updatedResponse.data.data)) {
          updatedEmployees = updatedResponse.data.data;
        }
        
        setEmployees(updatedEmployees || []);
        extractUniqueValues(updatedEmployees || []);
      } catch (error) {
        console.error("Error importing employees:", error);
        alert(`Import failed: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Excel Export Function
  const exportToExcel = () => {
    try {
      const excelData = filteredEmployees.map(emp => ({
        'Emp ID': emp.employeeId || '',
        'Name': emp.name || '',
        'Email': emp.email || '',
        'Department': emp.department || '',
        'Designation': emp.role || emp.designation || '',
        'Join Date': emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : '',
        'Phone': emp.phone || '',
        'Location': getLocationName(emp.location),
        'Salary Per Month': `₹${emp.salaryPerMonth || ''}`,
        'Shift Hours': emp.shiftHours || '',
        'Week Off Per Month': emp.weekOffPerMonth || '',
        'Status': isEmployeeHidden(emp) ? 'INACTIVE' : 'ACTIVE'
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      
      const wscols = [
        {wch: 10}, {wch: 20}, {wch: 25}, {wch: 15}, {wch: 20},
        {wch: 15}, {wch: 15}, {wch: 20}, {wch: 18}, {wch: 12},
        {wch: 18}, {wch: 10}
      ];
      ws['!cols'] = wscols;
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Employees");
      
      const date = new Date();
      const timestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      XLSX.writeFile(wb, `employees_${timestamp}.xlsx`);
      
      alert("✅ Excel file downloaded successfully!");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export to Excel. Please try again.");
    }
  };

  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredEmployees.length,
      totalPages: Math.ceil(filteredEmployees.length / limit)
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

  const getLocationName = (locationId) => {
    if (!locationId || !Array.isArray(locations)) {
      return "Not assigned";
    }
    const location = locations.find((loc) => loc._id === locationId);
    return location ? location.name : "Not assigned";
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ isActive, onToggle, loading }) => {
    return (
      <button
        onClick={onToggle}
        disabled={loading}
        className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors focus:outline-none ${
          isActive ? 'bg-green-500' : 'bg-red-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block w-3 h-3 transform rounded-full bg-white transition-transform ${
            isActive ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    );
  };

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">
        {/* Client Info Banner */}
        {clientId && (
          <div className="p-3 mb-3 text-sm text-blue-700 bg-white rounded-lg shadow-md border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Client ID:</span>
                <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded text-xs">
                  {clientId.substring(0, 8)}...
                </span>
                <span className="ml-4 text-xs text-gray-500">
                  Showing employees for your client account
                </span>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Total: {employees.length} | Active: {activeEmployees.length}
              </span>
            </div>
          </div>
        )}

        {/* Filters - Single Row */}
        <div className="p-2 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            {/* ID/Name Search */}
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by ID, Name, Email, Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
              <button
                onClick={() => {
                  setShowInactiveOnly(false);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  !showInactiveOnly 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Active ({activeEmployees.length})
              </button>
              <button
                onClick={() => {
                  setShowInactiveOnly(true);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  showInactiveOnly 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Inactive ({inactiveEmployees.length})
              </button>
            </div>

            {/* Export Excel Button */}
            <button
              onClick={exportToExcel}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white transition-colors bg-green-600 rounded-lg shadow-sm hover:bg-green-700 whitespace-nowrap"
            >
              <FaFileExcel className="text-sm" />
              <span>Excel</span>
            </button>

            {/* CSV Export */}
            <CSVLink
              data={filteredEmployees}
              filename={`employees_${clientId.substring(0, 6)}.csv`}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white transition-colors bg-purple-600 rounded-lg shadow-sm hover:bg-purple-700 whitespace-nowrap"
            >
              <FaFileCsv className="text-sm" />
              <span>CSV</span>
            </CSVLink>

            {/* Import Button */}
            <label
              htmlFor="file-upload"
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white transition-colors bg-orange-600 rounded-lg shadow-sm cursor-pointer hover:bg-orange-700 whitespace-nowrap"
            >
              <FaUpload className="text-sm" />
              <span>Import</span>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleBulkImport}
                className="hidden"
              />
            </label>

            {/* Add Employee Button */}
            <button
              onClick={() => navigate("/addemployee")}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add</span>
            </button>

            {/* Clear Filters Button */}
            {(filterDepartment || filterDesignation || searchTerm) && (
              <button
                onClick={() => {
                  setFilterDepartment('');
                  setFilterDesignation('');
                  setSearchTerm('');
                }}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-4 mb-4 text-center bg-white rounded-lg shadow-md">
            <div className="inline-block w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        )}

        {/* Table */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-xs text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="px-2 py-2 text-center">Emp ID</th>
                  <th className="px-2 py-2 text-center">Name</th>
                  <th className="px-2 py-2 text-center">Phone</th>
                  <th className="px-2 py-2 text-center">Dept</th>
                  <th className="px-2 py-2 text-center">Desig</th>
                  <th className="px-2 py-2 text-center">Join Date</th>
                  <th className="px-2 py-2 text-center">Salary</th>
                  <th className="px-2 py-2 text-center">Shift</th>
                  <th className="px-2 py-2 text-center">Week Off</th>
                  <th className="px-2 py-2 text-center">Location</th>
                  <th className="px-2 py-2 text-center">Status</th>
                  <th className="px-2 py-2 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentEmployees.length > 0 ? (
                  currentEmployees.map((emp) => {
                    const isHidden = isEmployeeHidden(emp);
                    return (
                      <tr 
                        key={emp._id} 
                        className={`hover:bg-gray-50 transition-colors text-xs ${isHidden ? 'bg-red-50 hover:bg-red-100' : ''}`}
                      >
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {emp.employeeId}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {emp.name}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">{emp.phone}</td>
                        <td className="px-2 py-2 text-center text-gray-600">{emp.department || "N/A"}</td>
                        <td className="px-2 py-2 text-center text-gray-600">{emp.role || emp.designation || "N/A"}</td>
                        <td className="px-2 py-2 text-center text-gray-600">
                          {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">₹{emp.salaryPerMonth || 0}</td>
                        <td className="px-2 py-2 text-center text-gray-600">{emp.shiftHours || 8}h</td>
                        <td className="px-2 py-2 text-center text-gray-600">{emp.weekOffPerMonth || 0}</td>
                        <td className="px-2 py-2 text-center text-gray-600">{getLocationName(emp.location)}</td>
                        <td className="px-2 py-2 text-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isHidden 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {isHidden ? 'INACTIVE' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              className="p-1 text-blue-500 transition-colors hover:text-blue-700" 
                              onClick={() => handleView(emp)} 
                              title="View Detail"
                            >
                              <FaEye size={14} />
                            </button>
                            <button 
                              className="p-1 text-yellow-500 transition-colors hover:text-yellow-700" 
                              onClick={() => handleEdit(emp)} 
                              title="Edit Employee"
                            >
                              <FaEdit size={14} />
                            </button>
                            
                            {/* Location Button */}
                            <button 
                              className="p-1 text-green-500 transition-colors hover:text-green-700" 
                              onClick={() => handleAssignLocation(emp)} 
                              title="Assign Location"
                            >
                              <FaMapMarkerAlt size={14} />
                            </button>
                            
                            {/* Status Toggle Switch */}
                            <div className="flex items-center gap-1">
                              <ToggleSwitch 
                                isActive={!isHidden} 
                                onToggle={() => handleToggleStatus(emp)} 
                                loading={loading}
                              />
                              <span className="text-[8px] font-medium text-gray-500">
                                {isHidden ? 'OFF' : 'ON'}
                              </span>
                            </div>

                            <button 
                              className="p-1 text-red-500 transition-colors hover:text-red-700" 
                              onClick={() => handleDelete(emp._id)} 
                              title="Delete Employee"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="12" className="px-2 py-4 text-xs text-center text-gray-500">
                      {showInactiveOnly ? 'No inactive employees found.' : 'No active employees found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredEmployees.length > 0 && (
            <div className="bg-gray-50 px-2 py-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200">
              {/* Left Side - Showing Info + Select */}
              <div className="flex flex-wrap items-center gap-1 text-xs text-gray-700">
                <span>Showing</span>
                <span className="font-medium">{indexOfFirst + 1}</span>
                <span>to</span>
                <span className="font-medium">{Math.min(indexOfLast, filteredEmployees.length)}</span>
                <span>of</span>
                <span className="font-medium">{filteredEmployees.length}</span>
                <span>results</span>

                {/* Select Dropdown */}
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    handleItemsPerPageChange(newLimit);
                  }}
                  className="p-0.5 text-xs border rounded-lg ml-1"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.currentPage === 1}
                  className={`px-2 py-2 border rounded-lg text-xs font-medium transition-colors ${
                    pagination.currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-0.5">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                      disabled={page === "..."}
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
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
                  className={`px-2 py-2 border rounded-lg text-xs font-medium transition-colors ${
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

        {/* View Modal */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black bg-opacity-50">
            <div className="relative w-full max-w-md p-4 bg-white rounded-lg">
              <button 
                className="absolute text-sm text-gray-500 top-2 right-3 hover:text-gray-700" 
                onClick={handleCloseModal}
              >
                ✕
              </button>
              <h3 className="mb-2 text-base font-bold">Employee Details</h3>
              {isEmployeeHidden(selectedEmployee) && (
                <div className="p-1.5 mb-2 bg-red-100 border border-red-200 rounded">
                  <p className="text-xs font-medium text-red-800">⚠️ This employee is INACTIVE</p>
                </div>
              )}
              <div className="space-y-1 text-sm">
                <p><b>Employee ID:</b> {selectedEmployee.employeeId}</p>
                <p><b>Name:</b> {selectedEmployee.name}</p>
                <p><b>Email:</b> {selectedEmployee.email}</p>
                <p><b>Phone:</b> {selectedEmployee.phone}</p>
                <p><b>Department:</b> {selectedEmployee.department || "N/A"}</p>
                <p><b>Designation:</b> {selectedEmployee.role || selectedEmployee.designation || "N/A"}</p>
                <p><b>Join Date:</b> {selectedEmployee.joinDate ? new Date(selectedEmployee.joinDate).toLocaleDateString() : 'N/A'}</p>
                <p><b>Status:</b> <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${isEmployeeHidden(selectedEmployee) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {isEmployeeHidden(selectedEmployee) ? 'INACTIVE' : 'ACTIVE'}
                </span></p>
                <p><b>Salary Per Month:</b> ₹{selectedEmployee.salaryPerMonth || 'N/A'}</p>
                <p><b>Shift Hours:</b> {selectedEmployee.shiftHours || 'N/A'}</p>
                <p><b>Week Off Per Month:</b> {selectedEmployee.weekOffPerMonth || 'N/A'}</p>
                <p><b>Location:</b> {getLocationName(selectedEmployee.location)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Location Modal */}
        {showLocationModal && selectedEmployeeForLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black bg-opacity-50">
            <div className="relative w-full max-w-md p-4 bg-white rounded-lg">
              <button 
                className="absolute text-sm text-gray-500 top-2 right-3 hover:text-gray-700" 
                onClick={handleCloseLocationModal}
              >
                ✕
              </button>
              <h3 className="mb-3 text-base font-bold">Assign Location</h3>
              <p className="mb-2 text-xs text-gray-600">Assigning location for: {selectedEmployeeForLocation.name}</p>

              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full p-2 text-xs border border-gray-300 rounded-lg"
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCloseLocationModal}
                  className="flex-1 py-2 text-xs font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={assignLocation}
                  disabled={!selectedLocationId || loading}
                  className="flex-1 py-2 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : 'Assign Location'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;