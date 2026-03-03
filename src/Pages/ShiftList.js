import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaEye, FaSearch, FaTimes, FaUser, FaClock, FaCalendar, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function ShiftList() {
  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const clientId = localStorage.getItem("clientId") || "";

  const fetchShifts = async () => {
    if (!clientId) {
      alert("Please login first!");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/shifts/all/${clientId}`);

      let shiftsData = [];
      if (res.data?.shifts) {
        shiftsData = res.data.shifts;
      } else if (Array.isArray(res.data)) {
        shiftsData = res.data;
      }

      setShifts(shiftsData);
      setFilteredShifts(shiftsData);
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to load shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredShifts(shifts);
      setCurrentPage(1);
    } else {
      const filtered = shifts.filter(shift =>
        shift.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredShifts(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, shifts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this shift?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/shifts/${id}`);
      fetchShifts();
    } catch (err) {
      alert("Failed to delete shift");
    }
  };

  const handleEdit = (shiftId) => {
    navigate(`/edit-shift/${shiftId}`);
  };

  const handleView = (shift) => {
    setSelectedShift(shift);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedShift(null);
  };

  // Pagination
  const totalPages = Math.ceil(filteredShifts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentShifts = filteredShifts.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Shifts</h1>
            <p className="text-gray-600 text-sm">{shifts.length} shifts found</p>
          </div>
          <button
            onClick={() => navigate("/shift")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus /> Add Shift
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : shifts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No shifts assigned yet.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Employee</th>
                      <th className="p-3 text-left">Shift</th>
                      <th className="p-3 text-left">Time</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentShifts.map((shift) => (
                      <tr key={shift._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{shift.employeeName}</div>
                          <div className="text-gray-500 text-xs">{shift.employeeId}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                            {shift.shiftType}
                          </span>
                        </td>
                        <td className="p-3">
                          {shift.startTime} - {shift.endTime}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${shift.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {shift.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleView(shift)} 
                              className="text-blue-600 hover:text-blue-800 p-1" 
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button 
                              onClick={() => handleEdit(shift._id)} 
                              className="text-yellow-600 hover:text-yellow-800 p-1" 
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => handleDelete(shift._id)} 
                              className="text-red-600 hover:text-red-800 p-1" 
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-3 border-t flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Modal - Compact Version */}
      {showModal && selectedShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-3 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaUser className="text-blue-600 text-sm" />
                Shift Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body - Compact */}
            <div className="p-4">
              <div className="space-y-3">
                {/* Employee Info - Compact */}
                <div className="p-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-blue-600 text-sm" />
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{selectedShift.employeeName}</h3>
                      <p className="text-xs text-gray-600">ID: {selectedShift.employeeId}</p>
                    </div>
                  </div>
                </div>

                {/* Shift Details - Compact */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <FaCalendar className="text-gray-500 text-xs" />
                      <span className="text-xs font-medium text-gray-700">Shift</span>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                      {selectedShift.shiftType}
                    </span>
                  </div>

                  <div className="p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <FaClock className="text-gray-500 text-xs" />
                      <span className="text-xs font-medium text-gray-700">Time</span>
                    </div>
                    <p className="text-xs font-medium">
                      {selectedShift.startTime} - {selectedShift.endTime}
                    </p>
                  </div>
                </div>

                {/* Status - Compact */}
                <div className="p-2 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {selectedShift.isActive ? (
                        <FaCheckCircle className="text-green-500 text-sm" />
                      ) : (
                        <FaTimesCircle className="text-red-500 text-sm" />
                      )}
                      <span className="text-xs font-medium">Status</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${selectedShift.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedShift.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Created Date - Compact */}
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 mb-1">Created</p>
                  <p className="text-xs font-medium">
                    {new Date(selectedShift.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedShift.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer - Compact */}
            <div className="p-3 border-t flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEdit(selectedShift._id);
                  closeModal();
                }}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}