import axios from "axios";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { FaEdit, FaEye, FaFileCsv, FaMapMarkerAlt, FaTrash, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Pagination from "./Pagination";
import { isEmployeeHidden } from "../utils/employeeStatus";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedEmployeeForLocation, setSelectedEmployeeForLocation] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || '';

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Pass clientId in params
        const response = await axios.get(
          `http://localhost:5000/api/employees/get-employees/${clientId}`
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
      } catch (error) {
        console.error("❌ Error fetching employees:", error);
        setEmployees([]);
      }
    };

    const fetchLocations = async () => {
      try {
        // Pass clientId in params for client-specific locations
        const response = await axios.get(
          `http://localhost:5000/api/location/alllocation/${clientId}`
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
      // Optionally redirect to login
      // navigate('/login');
    }
  }, [clientId]);

  const filteredEmployees = Array.isArray(employees) ? employees.filter((emp) => {
    if (!emp) return false;
    const searchTerm = search.toLowerCase().trim();
    return (
      emp.name?.toLowerCase().includes(searchTerm) ||
      emp.email?.toLowerCase().includes(searchTerm) ||
      emp.phone?.toLowerCase().includes(searchTerm) ||
      emp.employeeId?.toLowerCase().includes(searchTerm) ||
      emp.department?.toLowerCase().includes(searchTerm) ||
      emp.role?.toLowerCase().includes(searchTerm)
    );
  })
  .sort((a, b) => isEmployeeHidden(a) - isEmployeeHidden(b)) : [];

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleView = (employee) => setSelectedEmployee(employee);
  const handleCloseModal = () => setSelectedEmployee(null);
  const handleEdit = (employee) => navigate(`/addemployee`, { state: { employee } });

  const handleToggleStatus = async (emp) => {
    const isCurrentlyHidden = isEmployeeHidden(emp);
    const newStatus = isCurrentlyHidden ? 'active' : 'inactive';
    const confirmMsg = isCurrentlyHidden
      ? `Are you sure you want to make ${emp.name} ACTIVE?`
      : `Are you sure you want to HIDE ${emp.name}? They will not appear in reports.`;

    if (window.confirm(confirmMsg)) {
      try {
        setLoading(true);

        const payload = {
          status: newStatus
        };

        // Pass clientId in params for update
        const response = await axios.put(
          `http://localhost:5000/api/employees/update/${emp._id}/${clientId}`,
          payload
        );
        
        console.log("Update response:", response.data);

        // Update local state
        setEmployees(employees.map(e => e._id === emp._id ? { ...e, status: newStatus } : e));
        alert(`✅ Employee status updated to ${newStatus}`);
      } catch (error) {
        console.error("❌ Error updating employee status:", error);
        alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    console.log("Attempting to delete employee with ID:", id);
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        // Pass clientId in params for delete
        await axios.delete(
          `http://localhost:5000/api/employees/delete-employee/${id}/${clientId}`
        );
        setEmployees(employees.filter((emp) => emp._id !== id));
        alert("✅ Employee deleted successfully!");
      } catch (error) {
        console.error("❌ Error deleting employee:", error);
        const errMsg = error.response?.data?.message || error.message || "Unknown error";
        alert(`Failed to delete employee. Error: ${errMsg}`);
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
      // ✅ CHANGED: Employee ID in params, Location ID in body
      const response = await axios.put(
        `http://localhost:5000/api/employees/assign-location/${selectedEmployeeForLocation.employeeId}`,
        {
          locationId: selectedLocationId,  // ✅ Location ID in body
          name: selectedLoc.name,
          latitude: selectedLoc.latitude,
          longitude: selectedLoc.longitude
        }
      );

      console.log("Assign location response:", response.data);

      // Update local state
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
      alert(`Failed to assign location: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        
        console.log("Imported Employees:", parsedData);
        
        // Send bulk import data with clientId
        const response = await axios.post(
          `http://localhost:5000/api/employees/bulk-import/${clientId}`,
          { employees: parsedData }
        );
        
        alert(response.data.message || "Employees imported successfully!");
        
        // Refresh employee list
        const updatedResponse = await axios.get(
          `http://localhost:5000/api/employees/get-employees/${clientId}`
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
      } catch (error) {
        console.error("Error importing employees:", error);
        alert(`Import failed: ${error.response?.data?.message || error.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const getLocationName = (locationId) => {
    if (!locationId || !Array.isArray(locations)) {
      return "Not assigned";
    }
    const location = locations.find((loc) => loc._id === locationId);
    return location ? location.name : "Not assigned";
  };

  return (
    <div className="p-3 mx-auto bg-white rounded-lg shadow-md max-w-9xl">
      {/* Client Info Banner */}
      {clientId && (
        <div className="p-3 mb-4 text-sm text-blue-700 bg-blue-50 rounded-lg border border-blue-200">
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
              Total Employees: {Array.isArray(employees) ? employees.length : 0}
            </span>
          </div>
        </div>
      )}

      {/* Header Section: Search & Actions */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* CSV Export */}
          <CSVLink
            data={filteredEmployees}
            filename={`employees_${clientId.substring(0, 6)}.csv`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
          >
            <FaFileCsv className="text-lg" />
            <span>Export CSV</span>
          </CSVLink>

          {/* Import Button */}
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-purple-600 rounded-lg shadow-sm cursor-pointer hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
          >
            <FaUpload className="text-lg" />
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-4 mb-4 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        {Array.isArray(employees) && employees.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No employees found. Add your first employee!</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Emp ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Department</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Join Date</th>
                <th className="p-2 border">Salary</th>
                <th className="p-2 border">Shift</th>
                <th className="p-2 border">Week Off</th>
                <th className="p-2 border">Location</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentEmployees.length > 0 ? (
                currentEmployees.map((emp) => (
                  <tr key={emp._id} className="border-b hover:bg-gray-50">
                    <td className="p-2 border">{emp.employeeId || "N/A"}</td>
                    <td className="p-2 border">{emp.name || "N/A"}</td>
                    <td className="p-2 border">{emp.phone || "N/A"}</td>
                    <td className="p-2 border">{emp.department || "N/A"}</td>
                    <td className="p-2 border">{emp.role || "N/A"}</td>
                    <td className="p-2 border">
                      {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-2 border">₹{emp.salaryPerMonth || "0"}</td>
                    <td className="p-2 border">{emp.shiftHours || "8"}</td>
                    <td className="p-2 border">{emp.weekOffPerMonth || "0"}</td>
                    <td className="p-2 border">{getLocationName(emp.location)}</td>

                    <td className="p-2 text-center border">
                      <div className="flex justify-center gap-2">
                        <button className="text-blue-500" onClick={() => handleView(emp)} title="View Detail">
                          <FaEye />
                        </button>
                        <button className="text-yellow-500" onClick={() => handleEdit(emp)} title="Edit Employee">
                          <FaEdit />
                        </button>
                        <button className="text-green-500" onClick={() => handleAssignLocation(emp)} title="Assign Location">
                          <FaMapMarkerAlt />
                        </button>

                        {/* Status Toggle Button */}
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`px-2 py-0.5 text-xs font-bold rounded ${isEmployeeHidden(emp) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                          title={isEmployeeHidden(emp) ? "Make Active" : "Hide Employee"}
                        >
                          {isEmployeeHidden(emp) ? 'INACTIVE' : 'ACTIVE'}
                        </button>

                        <button className="text-red-500" onClick={() => handleDelete(emp._id)} title="Delete Employee">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="p-4 text-center text-gray-500">
                    No employees found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredEmployees.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* VIEW MODAL */}
      {selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center p-3 bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-5 bg-white rounded-lg">
            <button className="absolute top-2 right-3" onClick={handleCloseModal}>X</button>
            <h3 className="mb-3 text-lg font-bold">Employee Details</h3>
            <p><b>Name:</b> {selectedEmployee.name}</p>
            <p><b>Email:</b> {selectedEmployee.email}</p>
            <p><b>Phone:</b> {selectedEmployee.phone}</p>
            <p><b>Department:</b> {selectedEmployee.department}</p>
            <p><b>Role:</b> {selectedEmployee.role}</p>
            <p><b>Employee ID:</b> {selectedEmployee.employeeId}</p>
            <p><b>Join Date:</b> {selectedEmployee.joinDate ? new Date(selectedEmployee.joinDate).toLocaleDateString() : "-"}</p>
          </div>
        </div>
      )}

      {/* ASSIGN LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 flex items-center justify-center p-3 bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-5 bg-white rounded-lg">
            <button className="absolute top-2 right-3" onClick={handleCloseLocationModal}>
              X
            </button>
            <h3 className="mb-4 text-lg font-bold">Assign Location</h3>

            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </select>

            <button
              onClick={assignLocation}
              className="w-full py-2 mt-4 text-white bg-blue-600 rounded"
            >
              Assign
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;