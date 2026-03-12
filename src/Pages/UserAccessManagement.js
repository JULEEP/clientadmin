import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiSearch,
  FiSettings,
  FiUser
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://localhost:5000/api";

const UserAccessManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissions, setPermissions] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  const roleDropdownRef = useRef(null);
  const employeeDropdownRef = useRef(null);
  const globalSearchRef = useRef(null);

  // Get clientId from localStorage
  const getClientId = () => localStorage.getItem("clientId") || "";

  const permissionGroups = [
    {
      title: "Standard Employee Features",
      type: "immutable",
      items: [
        { id: "std_dashboard", name: "Employee Dashboard" },
        { id: "std_leave", name: "My Leaves & Application" },
        { id: "std_attendance", name: "My Attendance" },
        { id: "std_shift", name: "My Shift & Location" },
        { id: "std_salary", name: "My Salary Support" },
        { id: "std_profile", name: "My Profile" },
      ]
    },
    {
      title: "Admin: Dashboard & Monitoring",
      type: "toggleable",
      items: [
        { id: "dashboard_view", name: "Admin Dashboard" },
        { id: "user_activity_view", name: "User Activity Logs" },
      ]
    },
    {
      title: "Admin: Employee Management",
      type: "toggleable",
      items: [
        { id: "employee_view_all", name: "View All Employees" },
        { id: "employee_add", name: "Add New Employee" },
      ]
    },
    {
      title: "Admin: Operations",
      type: "toggleable",
      items: [
        { id: "attendance_view_all", name: "Manage Attendance" },
        { id: "leave_approve", name: "Leave Approval" },
        { id: "shifts_manage", name: "Shift Management" },
        { id: "locations_manage", name: "Location Management" },
      ]
    },
    {
      title: "Admin: Financials & Reports",
      type: "toggleable",
      items: [
        { id: "payroll_manage", name: "Payroll Management" },
        { id: "reports_view", name: "View Reports" },
      ]
    },
    {
      title: "Super Admin: System Control",
      type: "toggleable",
      items: [
        { id: "user_access_manage", name: "Manage User Access" },
      ]
    }
  ];

  useEffect(() => {
    fetchEmployees();

    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setIsEmployeeDropdownOpen(false);
      }
      if (globalSearchRef.current && !globalSearchRef.current.contains(event.target)) {
        setIsGlobalSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const clientId = getClientId();
      if (!clientId) {
        toast.error("Client ID not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/employees/get-employees/${clientId}`);

      // Handle both array and object responses
      const raw = response.data;
      const data = Array.isArray(raw)
        ? raw
        : (raw.employees || raw.data || raw.result || []);

      setEmployees(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const roleStats = employees.reduce((acc, emp) => {
    const role = emp.role || "No Role";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  const availableRoles = Object.keys(roleStats).sort();

  const filteredEmployees = employees.filter((e) => {
    const matchesRole = selectedRole ? (e.role || "No Role") === selectedRole : true;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      e.name?.toLowerCase().includes(term) ||
      e.employeeId?.toLowerCase().includes(term);
    return matchesRole && matchesSearch;
  });

  const filteredGlobalEmployees = employees.filter((e) => {
    if (!globalSearchTerm) return false;
    const term = globalSearchTerm.toLowerCase();
    return (
      e.name?.toLowerCase().includes(term) ||
      e.employeeId?.toLowerCase().includes(term)
    );
  });

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setIsRoleDropdownOpen(false);
    setSelectedEmployee(null);
    setSearchTerm("");
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setPermissions(emp.permissions || []);
    setSearchTerm(emp.name);
    setIsEmployeeDropdownOpen(false);
  };

  const handleGlobalSelectEmployee = (emp) => {
    setSelectedRole(emp.role || "");
    setSelectedEmployee(emp);
    setPermissions(emp.permissions || []);
    setSearchTerm(emp.name);
    setIsGlobalSearchOpen(false);
    setGlobalSearchTerm("");
  };

  const handleTogglePermission = (permId) => {
    setPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const savePermissions = async () => {
    if (!selectedEmployee) return;
    try {
      const clientId = getClientId();
      const response = await axios.put(
        `${API_BASE_URL}/employees/update/${selectedEmployee._id}`,
        { permissions, clientId }
      );

      if (response.status === 200) {
        toast.success(`Access updated for ${selectedEmployee.name}`);
        setEmployees((prev) =>
          prev.map((e) => (e._id === selectedEmployee._id ? { ...e, permissions } : e))
        );
      } else {
        toast.error("Failed to update access");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error updating permissions");
    }
  };

  // Client Info Banner
  const ClientInfoBanner = () => {
    const clientId = getClientId();
    if (!clientId) return null;
    
    return (
      <div className="p-3 mb-3 text-sm text-blue-700 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Client ID:</span>
            <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded text-xs">
              {clientId.substring(0, 8)}...
            </span>
            <span className="ml-4 text-xs text-gray-500">
              Managing access for your client account
            </span>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            Total Employees: {employees.length}
          </span>
        </div>
      </div>
    );
  };

  // Stats cards
  const StatsCards = () => (
    <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-4">
      <div className="px-2 py-2 bg-white border-t-4 border-blue-500 rounded-md shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold leading-tight text-gray-800">
              Total Employees: {employees.length}
            </p>
          </div>
        </div>
      </div>
      <div className="px-2 py-2 bg-white border-t-4 border-green-500 rounded-md shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold leading-tight text-gray-800">
              Roles: {availableRoles.length}
            </p>
          </div>
        </div>
      </div>
      <div className="px-2 py-2 bg-white border-t-4 border-purple-500 rounded-md shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold leading-tight text-gray-800">
              Admins: {employees.filter(e => e.role === 'admin' || e.role === 'Admin').length}
            </p>
          </div>
        </div>
      </div>
      <div className="px-2 py-2 bg-white border-t-4 border-yellow-500 rounded-md shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold leading-tight text-gray-800">
              Super Admins: {employees.filter(e => e.role === 'super_admin' || e.role === 'Super Admin').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Check if clientId is missing
  const clientId = getClientId();
  if (!clientId && !loading) {
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg text-red-600">Client ID not found. Please login again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-purple-50 to-blue-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="mx-auto max-w-9xl">

        {/* Client Info Banner */}
        <ClientInfoBanner />

        {/* Stats Overview */}
        <StatsCards />

        {/* Main Content Card */}
        <div className="p-3 bg-white border border-gray-200 shadow-md rounded-xl">
          
          {/* Header with Global Search */}
          <div className="flex flex-col items-start gap-3 mb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <FiSettings className="text-gray-400" />
              <h1 className="text-sm font-bold text-gray-800">User Access Management</h1>
            </div>

            {/* Global Search */}
            <div className="relative w-full md:w-72" ref={globalSearchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Quick Search Employee (Name or ID)..."
                  value={globalSearchTerm}
                  onChange={(e) => {
                    setGlobalSearchTerm(e.target.value);
                    setIsGlobalSearchOpen(true);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {isGlobalSearchOpen && globalSearchTerm && (
                <div className="absolute right-0 z-30 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredGlobalEmployees.length > 0 ? (
                    filteredGlobalEmployees.map((emp) => (
                      <div
                        key={emp._id}
                        onClick={() => handleGlobalSelectEmployee(emp)}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-800 text-xs group-hover:text-blue-700">{emp.name}</p>
                            <p className="text-[9px] text-gray-500 font-medium uppercase mt-0.5">{emp.role || "No Role"}</p>
                          </div>
                          <span className="text-[8px] font-bold text-white bg-purple-600 px-1.5 py-0.5 rounded-full">
                            {emp.employeeId}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-center text-gray-400">No employees found.</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* --- ALL FILTERS IN ONE ROW --- */}
          <div className="flex flex-col items-start gap-3 mb-4 md:flex-row md:items-end">
            
            {/* 1. Role Selector - Second */}
            <div className="relative flex-1" ref={roleDropdownRef}>
              <label className="block mb-1 text-xs font-medium text-gray-700">Select Role</label>
              <div 
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs text-gray-700 transition-all bg-white border border-gray-300 rounded-md cursor-pointer hover:border-blue-400"
              >
                <span>
                   {selectedRole ? (
                     <span className="flex items-center gap-2">
                       <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-medium uppercase">{selectedRole}</span>
                       <span className="text-gray-400 text-[9px]">({roleStats[selectedRole]})</span>
                     </span>
                   ) : "All Roles"}
                </span>
                <FiChevronDown className={`text-gray-400 text-xs transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
              </div>

              {/* Role Dropdown */}
              {isRoleDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => handleSelectRole("")}
                    className="flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-blue-50"
                  >
                    <span className="font-medium text-gray-700">All Roles</span>
                    {!selectedRole && <FiCheck className="text-xs text-blue-600" />}
                  </div>
                  {availableRoles.map(role => (
                    <div 
                      key={role}
                      onClick={() => handleSelectRole(role)}
                      className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">{role}</span>
                        <span className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{roleStats[role]}</span>
                      </div>
                      {selectedRole === role && <FiCheck className="text-xs text-blue-600" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Employee Selector - Third */}
            <div className="flex-[2] relative" ref={employeeDropdownRef}>
              <label className="block mb-1 text-xs font-medium text-gray-700">Select Employee</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsEmployeeDropdownOpen(true);
                    if(!e.target.value) setSelectedEmployee(null);
                  }}
                  onClick={() => setIsEmployeeDropdownOpen(true)}
                  placeholder={selectedRole ? `Search in ${selectedRole}...` : `Search Name or ID...`}
                  className="w-full px-3 py-2 pr-8 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute text-gray-400 -translate-y-1/2 right-2 top-1/2">
                   {loading ? <div className="w-3 h-3 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"/> : <FiUser className="text-xs" />}
                </div>
              </div>

              {/* Employee Dropdown */}
              {isEmployeeDropdownOpen && filteredEmployees.length > 0 && (
                <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp._id}
                      onClick={() => handleSelectEmployee(emp)}
                      className="flex items-center justify-between px-3 py-2 border-b border-gray-100 cursor-pointer hover:bg-blue-50 last:border-0"
                    >
                      <div>
                        <p className="text-xs font-medium text-gray-800">{emp.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[8px] font-medium text-white bg-purple-600 px-1.5 py-0.5 rounded-full">
                             {emp.employeeId}
                          </span>
                          {!selectedRole && (
                            <>
                              <span className="text-[8px] text-gray-400">•</span>
                              <span className="text-[8px] font-medium text-gray-500 uppercase">{emp.role}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {selectedEmployee?._id === emp._id && <FiCheck className="text-xs text-blue-600" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Employee Info - Shows when employee is selected */}
          {selectedEmployee && (
            <div className="p-2 mb-4 border border-blue-200 rounded-md bg-blue-50">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                  <span className="text-xs font-semibold text-blue-800">
                    {selectedEmployee.name?.charAt(0) || 'E'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{selectedEmployee.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-white bg-purple-600 px-1.5 py-0.5 rounded-full">{selectedEmployee.employeeId}</span>
                    <span className="text-[9px] text-gray-600">{selectedEmployee.role || 'No Role'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- PERMISSIONS GRID --- */}
          {selectedEmployee ? (
            <div className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
                {permissionGroups.flatMap(group => group.items.map(item => ({...item, type: group.type}))).map((item) => (
                  <label 
                    key={item.id} 
                    className={`flex items-center gap-2 cursor-pointer select-none py-1 px-2 rounded hover:bg-gray-50 transition-colors ${
                       item.type === "immutable" ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={item.type === "immutable" ? true : permissions.includes(item.id)}
                        onChange={() => item.type === "toggleable" && handleTogglePermission(item.id)}
                        disabled={item.type === "immutable"}
                        className="sr-only peer"
                      />
                      <div className={`w-3.5 h-3.5 rounded border transition-all duration-200 flex items-center justify-center ${
                         item.type === "immutable"
                           ? "bg-blue-500 border-blue-500 text-white"
                           : "border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white hover:border-blue-400"
                      }`}>
                        <FiCheck size={8} className={item.type === "toggleable" && !permissions.includes(item.id) ? "hidden" : "block"} />
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-gray-700">
                      {item.name}
                    </span>
                  </label>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 mt-4 border-t border-gray-200">
                 <button
                    onClick={savePermissions}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition"
                  >
                    Update Access
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEmployee(null);
                      setSearchTerm("");
                    }}
                    className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
              </div>
            </div>
          ) : (
             /* Empty State */
             <div className="flex flex-col items-center justify-center py-8 text-gray-400 border border-gray-300 border-dashed rounded-md bg-gray-50">
               <FiFilter size={24} className="mb-2 text-blue-400 opacity-50"/>
               <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Select Role & Employee to Configure</p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserAccessManagement;