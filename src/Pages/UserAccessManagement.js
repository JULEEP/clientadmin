import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiSearch,
  FiUser
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isEmployeeHidden } from "../utils/employeeStatus";

// Use relative path for proxy to handle it, or environment variable
const API_BASE_URL = "https://api.timelyhealth.in/api"; 

const UserAccessManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Get clientId from localStorage
  const clientId = localStorage.getItem("clientId") || "";
  
  // Selection State
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissions, setPermissions] = useState([]);

  // UI State - Main Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

  // UI State - Global Search
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  const roleDropdownRef = useRef(null);
  const employeeDropdownRef = useRef(null);
  const globalSearchRef = useRef(null);

  // --- Permission Configuration ---
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
        { id: "holidays_add", name: "Add New Holidays" },
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
        { id: "leave_approval_manager", name: "Leave Approval By Manager" },
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
    // ✅ RECRUITMENT SECTION
    {
      title: "Admin: Recruitment",
      type: "toggleable",
      items: [
        { id: "job_recruitment_manage", name: "Manage Job Recruitment" },
        { id: "job_posts_view", name: "Job Posts" },
        { id: "job_applicants_view", name: "Job Applicants" },
        { id: "score_board_view", name: "Score Board" },
        { id: "assessments_view", name: "Assessments" },
        { id: "documents_view", name: "Documents" },
      ]
    },
    // ✅ EXPENSES SECTION
    {
      title: "Admin: Expenses",
      type: "toggleable",
      items: [
        { id: "expenses_manage", name: "Manage Expenses" },
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
    
    // Click outside handler
    const handleClickOutside = (event) => {
      // Role Dropdown
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
      // Employee Dropdown
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setIsEmployeeDropdownOpen(false);
      }
      // Global Search Dropdown
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
      // Add clientId to API call
      const response = await axios.get(`${API_BASE_URL}/employees/get-employees/${clientId}`);
      
      let employeesData = [];
      if (Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (response.data?.employees) {
        employeesData = response.data.employees;
      } else if (response.data?.data) {
        employeesData = response.data.data;
      } else {
        employeesData = response.data || [];
      }
      
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);
      
      // ❌ NOT auto-selecting first employee - permission models show read-only by default
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // --- Derived Data ---
  // Get unique roles with counts
  const roleStats = employees.reduce((acc, emp) => {
    const role = emp.role || "No Role";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  const availableRoles = Object.keys(roleStats).sort();

  // Filter employees based on Role AND Search Term (Main Filter)
  const filteredEmployees = employees.filter((e) => {
    const matchesRole = selectedRole ? (e.role || "No Role") === selectedRole : true;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      e.name?.toLowerCase().includes(term) ||
      e.employeeId?.toLowerCase().includes(term);
    
    return matchesRole && matchesSearch;
  });

  // Global Search Filter (Any Role)
  const filteredGlobalEmployees = employees.filter((e) => {
    if (!globalSearchTerm) return false;
    const term = globalSearchTerm.toLowerCase();
    return (
      e.name?.toLowerCase().includes(term) ||
      e.employeeId?.toLowerCase().includes(term)
    );
  });

  // --- Handlers ---
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setIsRoleDropdownOpen(false);
    setSelectedEmployee(null); // Reset employee when role changes
    setSearchTerm("");
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setPermissions(emp.permissions || []);
    setSearchTerm(emp.name);
    setIsEmployeeDropdownOpen(false);
  };

  const handleGlobalSelectEmployee = (emp) => {
    setSelectedRole(emp.role || ""); // Auto-switch context to employee's role
    setSelectedEmployee(emp);
    setPermissions(emp.permissions || []);
    setSearchTerm(emp.name); // Sync main search
    setIsGlobalSearchOpen(false);
    setGlobalSearchTerm(""); // Clear global search
  };

  const handleTogglePermission = (permId) => {
    // Special handling for "Manage Job Recruitment"
    if (permId === "job_recruitment_manage") {
      const recruitmentPermissions = [
        "job_recruitment_manage",
        "job_posts_view",
        "job_applicants_view",
        "score_board_view",
        "assessments_view",
        "documents_view"
      ];
      
      // If "Manage Job Recruitment" is being checked
      if (!permissions.includes("job_recruitment_manage")) {
        // Add all recruitment permissions
        setPermissions(prev => {
          const newPermissions = [...prev];
          recruitmentPermissions.forEach(p => {
            if (!newPermissions.includes(p)) {
              newPermissions.push(p);
            }
          });
          return newPermissions;
        });
      } else {
        // If "Manage Job Recruitment" is being unchecked, remove all recruitment permissions
        setPermissions(prev => prev.filter(p => !recruitmentPermissions.includes(p)));
      }
    } 
    // Special handling for individual recruitment permissions
    else if (["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"].includes(permId)) {
      setPermissions(prev => {
        const newPermissions = prev.includes(permId) 
          ? prev.filter(p => p !== permId)
          : [...prev, permId];
        
        // Check if all individual recruitment permissions are checked
        const individualPerms = ["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"];
        const allChecked = individualPerms.every(p => newPermissions.includes(p));
        
        // If all are checked, add manage permission
        if (allChecked && !newPermissions.includes("job_recruitment_manage")) {
          return [...newPermissions, "job_recruitment_manage"];
        }
        // If any is unchecked, remove manage permission
        else if (!allChecked && newPermissions.includes("job_recruitment_manage")) {
          return newPermissions.filter(p => p !== "job_recruitment_manage");
        }
        
        return newPermissions;
      });
    }
    else {
      // Normal toggle for other permissions
      setPermissions((prev) =>
        prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
      );
    }
  };

  const savePermissions = async () => {
    if (!selectedEmployee) return;

    try {
      // Add clientId to API call
      const response = await axios.put(`${API_BASE_URL}/employees/update/${selectedEmployee._id}/${clientId}`, { permissions });

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

  // Loading screen matching other components
  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-purple-600 rounded-full animate-spin"></div>
          <p className="font-semibold text-gray-600">
            Loading user access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="mx-auto max-w-9xl">

        {/* Client Info Banner */}
        {clientId && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-gray-700">Client: {clientId.substring(0, 8)}...</p></div>
              <div><p className="text-xs text-gray-500">Employees: {employees.length}</p></div>
            </div>
          </div>
        )}

        {/* Stats Overview - matching other components */}
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

        {/* Main Content Card */}
        <div className="p-3 bg-white border border-gray-200 shadow-md rounded-xl">
          
          {/* --- ALL FILTERS IN ONE ROW --- */}
          <div className="flex flex-col items-start gap-3 mb-4 md:flex-row md:items-end">
            
            {/* Global Search - First */}
            <div className="relative w-full md:w-72" ref={globalSearchRef}>
              <label className="block mb-1 text-xs font-medium text-gray-700">Quick Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name or ID..."
                  value={globalSearchTerm}
                  onChange={(e) => {
                    setGlobalSearchTerm(e.target.value);
                    setIsGlobalSearchOpen(true);
                  }}
                  className="w-full py-2 pl-8 pr-3 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {/* Global Search Results Dropdown */}
              {isGlobalSearchOpen && globalSearchTerm && (
                <div className="absolute right-0 z-30 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  {filteredGlobalEmployees.length > 0 ? (
                    filteredGlobalEmployees.map((emp) => (
                      <div
                        key={emp._id}
                        onClick={() => handleGlobalSelectEmployee(emp)}
                        className="px-3 py-2 transition-colors border-b border-gray-100 cursor-pointer hover:bg-blue-50 last:border-0"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-800">{emp.name}</p>
                            <p className="text-[9px] text-gray-500 mt-0.5">{emp.role || "No Role"}</p>
                          </div>
                          <span className="text-[8px] font-medium text-white bg-purple-600 px-1.5 py-0.5 rounded-full">
                            {emp.employeeId}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-center text-gray-400">
                      No employees found.
                    </div>
                  )}
                </div>
              )}
            </div>
            
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
          <div className="pt-2 mt-4">
            <h3 className="mb-4 text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>{selectedEmployee ? `Permissions Profile: ${selectedEmployee.name}` : 'Platform Permission Models (Read-Only)'}</span>
              {selectedEmployee && (
                <span className="text-[10px] font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 px-2 py-0.5 rounded-full shadow-sm">
                  {selectedEmployee.role || 'No Role Assigned'}
                </span>
              )}
            </h3>
            
            {!selectedEmployee && (
              <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center gap-3">
                <FiFilter className="text-blue-500" size={18} />
                <p className="text-xs text-blue-800 font-medium">Please select an employee or role above to modify these permission assignments. Showing available system modules below.</p>
              </div>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ${!selectedEmployee ? 'opacity-60 pointer-events-none grayscale-[10%]' : ''}`}>
              {permissionGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="p-4 bg-white border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] rounded-2xl hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] transition-all duration-300">
                  <h4 className="mb-4 text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-700 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                    {group.title}
                  </h4>
                  <div className="space-y-3">
                    {group.items.map(item => (
                      <label 
                        key={item.id} 
                        className={`flex items-start gap-3 cursor-pointer select-none group p-2 -mx-2 rounded-xl hover:bg-purple-50/50 transition-all duration-300 ${
                          group.type === "immutable" ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={group.type === "immutable" ? true : permissions.includes(item.id)}
                            onChange={() => group.type === "toggleable" && handleTogglePermission(item.id)}
                            disabled={!selectedEmployee || group.type === "immutable"}
                            className="sr-only peer"
                          />
                          <div className={`w-4 h-4 rounded-md border transition-all duration-300 flex items-center justify-center ${
                             group.type === "immutable"
                               ? "bg-gradient-to-br from-gray-400 to-gray-500 border-transparent text-white shadow-sm"
                               : "border-gray-300 peer-checked:bg-gradient-to-br peer-checked:from-purple-500 peer-checked:to-indigo-600 peer-checked:border-transparent peer-checked:text-white group-hover:border-purple-400 group-hover:shadow-[0_0_0_4px_rgba(168,85,247,0.1)]"
                          }`}>
                            <FiCheck size={10} className={group.type === "toggleable" && !permissions.includes(item.id) ? "opacity-0 scale-50 transition-all duration-200" : "opacity-100 scale-100 transition-all duration-300"} />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-gray-600 group-hover:text-purple-900 leading-tight transition-colors">
                          {item.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setSearchTerm("");
                }}
                className="px-6 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:border-gray-300 rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
              >
                Clear Selection
              </button>
              <button
                onClick={savePermissions}
                disabled={!selectedEmployee}
                className={`px-8 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                  selectedEmployee 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-200 hover:shadow-emerald-300' 
                    : 'bg-gray-300 shadow-none cursor-not-allowed opacity-50'
                }`}
              >
                <FiCheck size={14} />
                Save Assignments
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserAccessManagement;