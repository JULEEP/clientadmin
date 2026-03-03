import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import EmployeeSidebar from "../Components/EmployeeSidebar";


const LeaveRequestForm = ({ defaultEmployeeId = "", defaultEmployeeName = "" }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: defaultEmployeeId,
    employeeName: defaultEmployeeName,
    leaveType: "Enter Leave Type",
    startDate: "Enter Start Date",
    endDate: "Enter End Date",
    days: 0,
    reason: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Automatically calculate days if start or end date changes
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
      setFormData((prev) => ({ ...prev, days: diffDays }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await axios.post("https://api.timelyhealth.in/api/leaves/add-leave", formData);

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.data.error || "Something went wrong");
      }

      setSuccessMessage("✅ Leave request submitted successfully!");
      setFormData({
        employeeId: defaultEmployeeId,
        employeeName: defaultEmployeeName,
        leaveType: "Enter Leave Type",
        startDate: "Enter Start Date",
        endDate: "Enter ENd Date",
        days: 0,
        reason: "",
      });

      setTimeout(() => navigate("/myattendance"), 1000);
    } catch (error) {
      setErrorMessage(`❌ ${error.message}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
     

      <div className="flex-1 flex flex-col">
       
        <div className="p-6">
          <div className="max-w-md mx-auto bg-white rounded shadow p-6">
            {/* ✅ Back Button */}
            <button
              onClick={() => navigate("/myleaves")}
              className="mb-5 w-full sm:w-auto px-5 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
            >
              MY Leave
            </button>

            <h2 className="mb-4 text-xl font-bold text-blue-900">Leave Request Form</h2>

            {/* Success / Error Messages */}
            {successMessage && (
              <div className="p-3 mb-4 text-green-700 bg-green-100 rounded">{successMessage}</div>
            )}
            {errorMessage && (
              <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{errorMessage}</div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="mb-2 p-2 border rounded w-full"
                placeholder="Employee ID"
                required
              />
              <input
                name="employeeName"
                value={formData.employeeName}
                onChange={handleChange}
                className="mb-2 p-2 border rounded w-full"
                placeholder="Employee Name"
                required
              />
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                className="mb-2 p-2 border rounded w-full"
                required
              >
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
                <option value="earned">Earned</option>
              </select>
              <input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className="mb-2 p-2 border rounded w-full"
                required
              />
              <input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                className="mb-2 p-2 border rounded w-full"
                required
              />
              <input
                name="days"
                type="number"
                value={formData.days}
                readOnly
                className="mb-2 p-2 border rounded w-full"
                placeholder="Number of Days"
              />
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="mb-2 p-2 border rounded w-full"
                placeholder="Reason for leave"
                rows="3"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Submit Leave Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestForm;
