import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import {
  FaUserTie, FaCalendarAlt, FaStar, FaEye, FaDownload,
  FaCheckCircle, FaTimesCircle, FaTasks, FaSearch,
  FaFilePdf, FaFileAlt, FaSignOutAlt, FaChevronRight,
  FaArrowLeft, FaFilter, FaSync, FaEnvelope, FaBriefcase, FaUserCircle,
  FaTimes, FaUserGraduate, FaPhone, FaBuilding, FaMoneyBillWave,
  FaCalendarCheck, FaMapMarkerAlt
} from "react-icons/fa";


const API_BASE_URL = 'http://localhost:5000/api';


const Info = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 text-right">
      {value || "N/A"}
    </span>
  </div>
);

const ScoreMini = ({ label, score }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-sm font-semibold ${score >= 80
      ? "text-green-600"
      : score >= 50
        ? "text-yellow-600"
        : "text-red-600"
      }`}>
      {score || 0}
    </p>
  </div>
);

const EmployeeResignation = () => {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetchResignations();
    fetchRoles();

    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/roles/all`);
      if (res.data.success) {
        setRoles(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const fetchResignations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/applications/all`);
      const allApps = res.data.applications || [];
      const resignedApps = allApps.filter(app => app.status === "Resigned");
      setResignations(resignedApps);
    } catch (err) {
      console.error("Fetch resignations error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setUpdatingId(id);
      const res = await axios.post(`${API_BASE_URL}/applications/resignation-approval`, {
        applicationId: id,
        status
      });
      if (res.data.success) {
        alert(`Resignation ${status} successfully!`);
        setResignations(prev =>
          prev.map(app => (app._id === id ? { ...app, resignationStatus: status } : app))
        );
        if (selectedResignation && selectedResignation._id === id) {
          setSelectedResignation({ ...selectedResignation, resignationStatus: status });
        }
      }
    } catch (err) {
      console.error("Resignation update error:", err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const downloadResignationPDF = (app) => {
    if (!app) return;
    const doc = new jsPDF();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, "F");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("RESIGNATION LETTER", 105, 25, { align: "center" });
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Employee: ${app.firstName} ${app.lastName}`, 20, 55);
    doc.text(`Role: ${app.jobId?.role || "N/A"}`, 20, 62);
    doc.text(`Date Filed: ${new Date(app.resignationSentAt).toLocaleDateString()}`, 20, 69);
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 75, 190, 75);
    doc.setFont("helvetica", "normal");
    const letterBody = app.resignationLetter || "No content provided.";
    const splitText = doc.splitTextToSize(letterBody, 170);
    doc.text(splitText, 20, 85);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Timely Health Projects - Human Resources Dept", 105, 285, { align: "center" });
    doc.save(`Resignation_${app.firstName}_${app.lastName}.pdf`);
  };

  const formatDocumentUrl = (filePath) => {
    if (!filePath) return "";
    const relativePath = filePath.includes("uploads")
      ? "uploads/" + filePath.split(/uploads[\\/]/).pop().replace(/\\/g, "/")
      : filePath.replace(/\\/g, "/");
    return `${API_BASE_URL.replace("/api", "")}/${relativePath}`;
  };

  const filteredData = resignations.filter(app => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(query) ||
      (app.jobId?.role || "").toLowerCase().includes(query) ||
      (app.mobile || "").toLowerCase().includes(query) ||
      (app.email || "").toLowerCase().includes(query);

    const matchesRole = roleFilter ? (app.jobId?.role === roleFilter) : true;

    let matchesDate = true;
    if (dateFilter) {
      const appDate = new Date(app.resignationSentAt).toISOString().split('T')[0];
      matchesDate = appDate === dateFilter;
    }

    const matchesStatus = filterStatus === "All" || (app.resignationStatus || "Pending") === filterStatus;

    return matchesSearch && matchesRole && matchesDate && matchesStatus;
  });

  return (
    <div className="p-3 mx-auto bg-white rounded-lg shadow-md max-w-9xl min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
        <div></div>

        <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
          {/* Status Filter Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-lg mr-2">
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="relative w-full sm:w-auto">
            <input
              type="date"
              className="w-full appearance-none bg-white py-2 px-4 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm sm:w-40"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                onClick={() => setDateFilter("")}
                title="Clear date filter"
              >
                <FaTimes className="text-[12px]" />
              </div>
            )}
          </div>

          {/* Searchable Role Filter */}
          <div className="relative w-full sm:w-56" ref={roleDropdownRef}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
              <FaBriefcase className="text-sm" />
            </div>
            <div
              className="w-full bg-white py-2 pl-10 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm relative overflow-hidden text-ellipsis whitespace-nowrap"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            >
              {roleFilter || "Select Role"}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
              {roleFilter ? (
                <FaTimes
                  className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                  onClick={(e) => { e.stopPropagation(); setRoleFilter(""); }}
                  title="Clear role filter"
                />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
              )}
            </div>

            {isRoleDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 border-b border-gray-100 bg-gray-50">
                  <div className="relative">
                    <FaUserTie className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
                    <input
                      type="text"
                      className="w-full py-1.5 pl-8 pr-4 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search roles..."
                      value={roleSearchQuery}
                      onChange={(e) => setRoleSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  <div
                    className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${!roleFilter ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`}
                    onClick={() => { setRoleFilter(""); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
                  >
                    All Roles
                  </div>
                  {roles
                    .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                    .map((r) => (
                      <div
                        key={r._id}
                        className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${roleFilter === r.name ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`}
                        onClick={() => { setRoleFilter(r.name); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
                      >
                        {r.name}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-auto sm:min-w-[250px] md:min-w-[300px]">
            <input
              type="text"
              className="w-full py-2 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="Search employee, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <FaSearch className="text-sm" />
            </div>
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <FaTimes
                  className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                />
              </div>
            )}
          </div>

          <button
            onClick={() => fetchResignations()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors shadow-sm"
            title="Refresh"
          >
            <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading Resignations...</div>
        ) : filteredData.length > 0 ? (
          <table className="min-w-full">
            <thead className="text-left text-sm text-white bg-gradient-to-r from-purple-500 to-blue-600">
              <tr>
                <th className="py-3 px-4 text-center">Employee Name</th>
                <th className="py-3 px-4 text-center">Designation</th>
                <th className="py-3 px-4 text-center">Contact</th>
                <th className="py-3 px-4 text-center">Filing Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((app) => (
                <tr key={app._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-center">
                    <div className="font-bold text-gray-800">{app.firstName} {app.lastName}</div>
                    <div className="text-[10px] text-gray-400">{app.email}</div>
                  </td>
                  <td className="p-4 text-sm font-medium text-center">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">
                      {app.jobId?.role || "N/A"}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-center text-gray-600">
                    {app.mobile}
                  </td>
                  <td className="p-4 text-sm font-medium text-center">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500">
                      <FaCalendarAlt className="text-[8px]" />
                      {app.resignationSentAt ? new Date(app.resignationSentAt).toLocaleDateString() : "—"}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${app.resignationStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                      app.resignationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                      {(app.resignationStatus || "Pending").toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => { setSelectedResignation(app); setIsModalOpen(true); }}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="View Details"
                      >
                        <FaEye size={16} className="group-hover:scale-110 transition-transform" />
                      </button>

                      {(app.resignationStatus || "Pending") === "Pending" && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, "Approved"); }}
                            className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors group"
                            title="Accept Resignation"
                          >
                            <FaCheckCircle size={16} className="group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, "Rejected"); }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors group"
                            title="Reject Resignation"
                          >
                            <FaTimesCircle size={16} className="group-hover:scale-110 transition-transform" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); downloadResignationPDF(app); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Download PDF"
                      >
                        <FaDownload size={14} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <FaFileAlt className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="font-medium">No resignations found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedResignation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-gray-100">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl text-gray-800">
                  {selectedResignation.firstName} {selectedResignation.lastName}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-blue-600">
                  {selectedResignation.jobId?.role || "Position Not Specified"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${selectedResignation.resignationStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                  selectedResignation.resignationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                  {selectedResignation.resignationStatus || 'Pending'}
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <FaTimesCircle size={18} />
                </button>
              </div>
            </div>

            <div className="p-8 pt-4 max-h-[75vh] overflow-y-auto no-scrollbar space-y-8">
              {/* Sleek Prominent Resignation Content */}
              <div className="relative group">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-red-50 rounded-full flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                  <FaFileAlt className="text-red-500 text-xl" />
                </div>

                <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group-hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                    Statement of Resignation
                  </h3>

                  <div className="text-base text-slate-700 font-medium leading-relaxed italic relative">
                    <span className="text-3xl text-red-100 absolute -top-3 -left-3 select-none">"</span>
                    <span className="relative z-10">{selectedResignation.resignationLetter || "No statement provided."}</span>
                  </div>
                </div>
              </div>

              {/* Status & Timing Context Badge */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200/50">
                  <FaCalendarAlt className="text-red-400" />
                  Filed on {selectedResignation.resignationSentAt ? new Date(selectedResignation.resignationSentAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : "Unknown Date"}
                </div>
                {selectedResignation.resignationStatus !== 'Pending' && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${selectedResignation.resignationStatus === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                    {selectedResignation.resignationStatus === 'Approved' ? <FaCheckCircle /> : <FaTimesCircle />}
                    Decision: {selectedResignation.resignationStatus}
                  </div>
                )}
              </div>

              {(selectedResignation.resignationStatus || 'Pending') === 'Pending' && (
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => handleStatusUpdate(selectedResignation._id, "Approved")}
                    disabled={!!updatingId}
                    className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs font-black uppercase tracking-[0.1em] rounded-2xl transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-2 group transform hover:-translate-y-1"
                  >
                    <FaCheckCircle className="text-base group-hover:scale-110 transition-transform" />
                    Approve Request
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedResignation._id, "Rejected")}
                    disabled={!!updatingId}
                    className="flex-1 py-4 bg-white border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-900 text-xs font-black uppercase tracking-[0.1em] rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 group transform hover:-translate-y-1"
                  >
                    <FaTimesCircle className="text-base group-hover:scale-110 transition-transform text-red-500" />
                    Reject Request
                  </button>
                </div>
              )}
            </div>

            <div className="px-8 py-6 border-t border-gray-50 flex justify-between items-center bg-gray-50/50">
              <button
                onClick={() => downloadResignationPDF(selectedResignation)}
                className="text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group"
              >
                <FaDownload className="text-xs group-hover:animate-bounce" /> Archive PDF
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation: zoomIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}} />
    </div>
  );
};

export default EmployeeResignation;