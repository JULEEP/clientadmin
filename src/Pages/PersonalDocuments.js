import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FaAsterisk, FaBriefcase, FaBuilding, FaCheck, FaDownload, FaEdit,
  FaEye, FaSave, FaSearch, FaSignOutAlt, FaSpinner, FaSync, FaTimes,
  FaUser, FaUserTie
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = 'http://localhost:5000/api'


const MetaRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-50 last:border-b-0 text-sm">
    <span className="text-gray-500 font-medium">{label}</span>
    <span className="font-bold text-gray-800 text-right">{value || "N/A"}</span>
  </div>
);

const StatusBadge = ({ status, className = "" }) => {
  const badges = {
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    uploaded: "bg-blue-100 text-blue-700",
    missing: "bg-gray-100 text-gray-500"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${badges[status] || badges.missing} ${className}`}>
      {status === 'approved' && <FaCheck className="mr-1 w-2 h-2" />}
      {status === 'rejected' && <FaTimes className="mr-1 w-2 h-2" />}
      {status}
    </span>
  );
};

export default function PersonalDocuments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [roles, setRoles] = useState([]);
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  const [marks, setMarks] = useState({});

  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  // Editing states
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: "", accountNumber: "", ifscCode: "" });
  const [isSavingBank, setIsSavingBank] = useState(false);

  const [isEditingEmergency1, setIsEditingEmergency1] = useState(false);
  const [emergency1Form, setEmergency1Form] = useState({ name: "", phone: "", relationship: "" });
  const [isSavingE1, setIsSavingE1] = useState(false);

  const [isEditingEmergency2, setIsEditingEmergency2] = useState(false);
  const [emergency2Form, setEmergency2Form] = useState({ name: "", phone: "", relationship: "" });
  const [isSavingE2, setIsSavingE2] = useState(false);

  const navigate = useNavigate();
  const clientId = localStorage.getItem("clientId");

  // Helper to get filtered data - define this before any conditional returns
  const getFilteredData = () => {
    if (!Array.isArray(data)) return [];
    
    return data.filter(row => {
      const docs = row.documents || {};
      const hasUploadedDocs = Object.entries(docs).some(([key, doc]) =>
        !['bankDetails', 'emergencyContact1', 'emergencyContact2', '_id'].includes(key) &&
        doc && typeof doc === 'object' && doc.filePath
      );

      const candidateObj = row.candidateId && typeof row.candidateId === 'object' ? row.candidateId : null;
      const candName = candidateObj?.name || row.candidateName || row.name || '';
      const candEmail = candidateObj?.email || row.email || '';
      const query = searchQuery.toLowerCase();

      const matchesSearch = candName.toLowerCase().includes(query) || candEmail.toLowerCase().includes(query);

      const matchesDate = dateFilter
        ? new Date(row.createdAt || row.updatedAt).toISOString().slice(0, 10) === dateFilter
        : true;

      const candRole = candidateObj?.jobId?.role || row.jobId?.role || row.role || "";
      const matchesRole = roleFilter ? candRole === roleFilter : true;

      return matchesSearch && hasUploadedDocs && matchesDate && matchesRole;
    });
  };

  useEffect(() => {
    if (!clientId) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    fetchData();
    fetchRoles();

    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update pagination when filtered data changes - MOVED TO TOP LEVEL
  useEffect(() => {
    if (Array.isArray(data)) {
      const filtered = getFilteredData();
      setPagination(prev => ({
        ...prev,
        totalCount: filtered.length,
        totalPages: Math.ceil(filtered.length / prev.limit),
        currentPage: 1
      }));
    }
  }, [data, searchQuery, roleFilter, dateFilter]);

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/roles/all?clientId=${clientId}`);
      if (res.data.success) {
        setRoles(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const getQueryUserId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("userId");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const userId = getQueryUserId();
      const token = localStorage.getItem("candidateToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (userId) {
        const res = await axios.get(`${API_BASE_URL}/candidate/admin/${userId}?clientId=${clientId}`, { headers });
        if (res.data) {
          const payload = res.data.success ? res.data.data : res.data;
          setData(payload);
        }
      } else {
        try {
          const listRes = await axios.get(`${API_BASE_URL}/candidate/all-documents?clientId=${clientId}`, { headers });
          if (listRes.data && listRes.data.success && Array.isArray(listRes.data.data)) {
            setData(listRes.data.data);
          } else if (listRes.data && Array.isArray(listRes.data)) {
            setData(listRes.data);
          } else {
            const res = await axios.get(`${API_BASE_URL}/candidate/documents?clientId=${clientId}`, { headers });
            const payload = res.data && res.data.success ? res.data.data : res.data;
            setData(payload);
          }
        } catch (e) {
          const res = await axios.get(`${API_BASE_URL}/candidate/documents?clientId=${clientId}`, { headers });
          const payload = res.data && res.data.success ? res.data.data : res.data;
          setData(payload);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  // Initialize forms when data is loaded
  useEffect(() => {
    if (data && !Array.isArray(data)) {
      setBankForm({
        bankName: data.documents?.bankDetails?.bankName || "",
        accountNumber: data.documents?.bankDetails?.accountNumber || "",
        ifscCode: data.documents?.bankDetails?.ifscCode || ""
      });
      setEmergency1Form({
        name: data.documents?.emergencyContact1?.name || "",
        phone: data.documents?.emergencyContact1?.phone || "",
        relationship: data.documents?.emergencyContact1?.relationship || ""
      });
      setEmergency2Form({
        name: data.documents?.emergencyContact2?.name || "",
        phone: data.documents?.emergencyContact2?.phone || "",
        relationship: data.documents?.emergencyContact2?.relationship || ""
      });
    }
  }, [data]);

  const handleSaveBankDetails = async () => {
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.ifscCode) {
      return toast.warning("Please fill all bank details");
    }
    setIsSavingBank(true);
    try {
      const token = localStorage.getItem("candidateToken");
      const res = await axios.post(`${API_BASE_URL}/candidate/save-bank-details`,
        { bankDetails: bankForm, clientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Bank details updated");
        setIsEditingBank(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save bank details");
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleSaveEmergencyContact = async (num) => {
    const form = num === 1 ? emergency1Form : emergency2Form;
    if (!form.name || !form.phone || !form.relationship) {
      return toast.warning(`Please fill all fields for Emergency Contact #${num}`);
    }
    num === 1 ? setIsSavingE1(true) : setIsSavingE2(true);
    try {
      const token = localStorage.getItem("candidateToken");
      const res = await axios.post(`${API_BASE_URL}/candidate/save-emergency-contact`,
        { contactNumber: num, contact: form, clientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Emergency Contact #${num} updated`);
        num === 1 ? setIsEditingEmergency1(false) : setIsEditingEmergency2(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save contact");
    } finally {
      num === 1 ? setIsSavingE1(false) : setIsSavingE2(false);
    }
  };

  const openFile = (filePath) => {
    if (!filePath) return;
    const relativePath = filePath.includes("uploads")
      ? "uploads/" + filePath.split(/uploads[\\/]/).pop().replace(/\\/g, "/")
      : filePath.replace(/\\/g, "/");
    const url = `${API_BASE_URL.replace("/api", "")}/${relativePath}`;
    window.open(url, "_blank");
  };

  const mark = (key, state) => {
    setMarks((s) => ({ ...s, [key]: state }));
    toast.success(`${state === "approved" ? "Approved" : "Rejected"}: ${key}`);
  };

  // Pagination Handlers
  const handleItemsPerPageChange = (limit) => {
    const filtered = Array.isArray(data) ? getFilteredData() : [];
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / limit)
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

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setDateFilter("");
    setRoleSearchQuery("");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <FaSpinner className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-gray-400">Loading Documents...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="bg-white rounded-lg p-8 shadow-md text-center max-w-sm w-full border border-gray-100">
        <FaUser size={32} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Unavailable</h2>
        <p className="text-sm text-gray-500 mb-6">Candidate profile not found.</p>
        <button onClick={fetchData} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">Retry</button>
      </div>
    </div>
  );

  // Admin List View
  if (Array.isArray(data)) {
    const filteredData = getFilteredData();

    const indexOfLastItem = pagination.currentPage * pagination.limit;
    const indexOfFirstItem = indexOfLastItem - pagination.limit;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
        {/* Filters Section */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">

            {/* Search Bar */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>

            {/* Role Filter Button */}
            <div className="relative" ref={roleDropdownRef}>
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  roleFilter 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaBriefcase className="text-xs" /> Role {roleFilter && `: ${roleFilter}`}
              </button>
              
              {/* Role Filter Dropdown */}
              {isRoleDropdownOpen && (
                <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                      <FaUserTie className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                      <input
                        type="text"
                        className="w-full py-1 pl-7 pr-2 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Search roles..."
                        value={roleSearchQuery}
                        onChange={(e) => setRoleSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div 
                    onClick={() => {
                      setRoleFilter('');
                      setIsRoleDropdownOpen(false);
                      setRoleSearchQuery('');
                    }}
                    className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-100 font-medium ${
                      !roleFilter ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    All Roles
                  </div>
                  {roles
                    .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                    .map((r) => (
                      <div 
                        key={r._id}
                        onClick={() => {
                          setRoleFilter(r.name);
                          setIsRoleDropdownOpen(false);
                          setRoleSearchQuery('');
                        }}
                        className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                          roleFilter === r.name ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {r.name}
                      </div>
                    ))}
                  {roles.filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-xs text-gray-400 text-center">
                      No roles found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date Filter */}
            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                Date:
              </span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button 
                onClick={fetchData} 
                className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition flex items-center gap-1"
              >
                <FaSync className="text-xs" /> Refresh
              </button>

              <button
                onClick={() => navigate('/employee-resignation')}
                className="h-8 px-3 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition flex items-center gap-1"
              >
                <FaSignOutAlt className="text-xs" /> Resignations
              </button>

              {/* Reset Filters Button */}
              {(searchQuery || roleFilter || dateFilter) && (
                <button
                  onClick={resetFilters}
                  className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
          <table className="min-w-full">
            <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
              <tr>
                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">Candidate Details</th>
                {["Aadhar", "PAN", "Pass", "10th", "12th", "Grad", "Exp", "Bank"].map((header) => (
                  <th key={header} className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">{header}</th>
                ))}
                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider border-l border-white/20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((row) => {
                const docs = row.documents || {};
                const candidateObj = row.candidateId && typeof row.candidateId === 'object' ? row.candidateId : null;
                const candName = candidateObj?.name || row.candidateName || row.name || 'Unknown';
                const candEmail = candidateObj?.email || row.email || '';
                const candId = candidateObj?._id || candidateObj?.id || row.candidateId || row._id || '-';

                const renderDocMini = (docKey) => {
                  const doc = docs[docKey] || {};
                  const uploaded = !!doc.filePath;
                  return (
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {uploaded ? (
                          <>
                            <button
                              onClick={() => openFile(doc.filePath)}
                              className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                              title="View"
                            >
                              <FaEye size={10} />
                            </button>
                            <button
                              onClick={() => openFile(doc.filePath)}
                              className="p-1 rounded bg-gray-50 text-gray-500 hover:bg-gray-800 hover:text-white transition-all"
                              title="Download"
                            >
                              <FaDownload size={10} />
                            </button>
                          </>
                        ) : (
                          <FaTimes className="text-gray-200" size={10} />
                        )}
                      </div>
                    </td>
                  );
                };

                return (
                  <tr key={candId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white shadow-sm text-xs">
                          {candName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-800">{candName}</div>
                          <div className="text-[8px] text-gray-400 font-medium">{candEmail || candId.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    {renderDocMini('aadharCard')}
                    {renderDocMini('panCard')}
                    {renderDocMini('passportPhoto')}
                    {renderDocMini('tenthCertificate')}
                    {renderDocMini('twelfthCertificate')}
                    {renderDocMini('graduationCertificate')}
                    {renderDocMini('experienceLetters')}
                    <td className="p-3 text-center">
                      <div className={`w-2 h-2 mx-auto rounded-full ${docs.bankDetails?.bankName ? 'bg-green-500 shadow-sm' : 'bg-gray-100'}`}></div>
                    </td>
                    <td className="p-3 text-center border-l border-gray-50">
                      <button
                        onClick={() => navigate(`/personaldocuments?userId=${candId}`)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                <span>Showing</span>
                <span className="font-medium">
                  {indexOfFirstItem + 1}
                </span>
                <span>to</span>
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredData.length)}
                </span>
                <span>of</span>
                <span className="font-medium">
                  {filteredData.length}
                </span>
                <span>results</span>

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
          
          {filteredData.length === 0 && (
            <div className="p-12 text-center text-gray-500 text-sm font-medium">No active records found.</div>
          )}
        </div>
      </div>
    );
  }

  // Profile Specific View (single candidate)
  const docKeys = Object.keys(data.documents || {}).filter(key =>
    !['bankDetails', 'emergencyContact1', 'emergencyContact2'].includes(key)
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-100">
              {data.candidateName?.charAt(0) || data.email?.charAt(0) || <FaUser />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                {data.candidateName || data.email || 'Candidate Profile'}
              </h2>
              <p className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mt-1">
                Verified: {data.completionPercentage ?? 0}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/personaldocuments')} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">Close</button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-10">
              {/* Documents Grid */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Verification Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {docKeys.map((key) => {
                    const doc = data.documents[key] || {};
                    const uploaded = !!doc.filePath;
                    const state = marks[key] || (doc.verified ? 'approved' : uploaded ? 'uploaded' : 'missing');

                    return (
                      <div key={key} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all flex flex-col justify-between min-h-[160px]">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-sm font-bold text-gray-800">{key.replace(/([A-Z])/g, ' $1')}</h4>
                            <StatusBadge status={state} />
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono truncate">{doc.fileName || 'No file selected'}</p>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openFile(doc.filePath)}
                              disabled={!uploaded}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${uploaded ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-50 text-gray-300'}`}
                            >
                              <FaEye size={12} /> View
                            </button>
                            <button
                              onClick={() => openFile(doc.filePath)}
                              disabled={!uploaded}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition-all ${uploaded ? 'border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-gray-50 border-transparent text-gray-300'}`}
                            >
                              <FaDownload size={12} /> Download
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => mark(key, 'approved')}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${state === 'approved' ? 'bg-green-100 border-green-200 text-green-700' : 'border-gray-100 text-gray-400 hover:text-green-600'}`}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => mark(key, 'rejected')}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${state === 'rejected' ? 'bg-red-100 border-red-200 text-red-700' : 'border-gray-100 text-gray-400 hover:text-red-600'}`}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Extra Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-gray-100">
                {/* Bank Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FaBuilding className="text-blue-500" /> Bank Details
                    </h3>
                    {!isEditingBank && (
                      <button
                        onClick={() => setIsEditingBank(true)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Bank Details"
                      >
                        <FaEdit size={12} />
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                    {isEditingBank ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Institution Name</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            value={bankForm.bankName}
                            onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                            placeholder="e.g. HDFC Bank"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Account Number</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            value={bankForm.accountNumber}
                            onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                            placeholder="Account Number"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">IFSC Code</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            value={bankForm.ifscCode}
                            onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                            placeholder="IFSC Code"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleSaveBankDetails}
                            disabled={isSavingBank}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                          >
                            {isSavingBank ? <FaSpinner className="animate-spin" /> : <><FaSave /> Save</>}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingBank(false);
                              setBankForm({
                                bankName: data.documents?.bankDetails?.bankName || "",
                                accountNumber: data.documents?.bankDetails?.accountNumber || "",
                                ifscCode: data.documents?.bankDetails?.ifscCode || ""
                              });
                            }}
                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <MetaRow label="Institution" value={data.documents?.bankDetails?.bankName} />
                        <MetaRow label="Account" value={data.documents?.bankDetails?.accountNumber} />
                        <MetaRow label="IFSC Code" value={data.documents?.bankDetails?.ifscCode} />
                        {!data.documents?.bankDetails?.bankName && (
                          <p className="text-[10px] font-bold text-gray-400 italic text-center py-2">No bank details provided</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Emergency Contact #1 Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FaAsterisk className="text-rose-500" /> Emergency #1
                    </h3>
                    {!isEditingEmergency1 && (
                      <button
                        onClick={() => setIsEditingEmergency1(true)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Edit Contact 1"
                      >
                        <FaEdit size={12} />
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                    {isEditingEmergency1 ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all shadow-sm"
                            value={emergency1Form.name}
                            onChange={(e) => setEmergency1Form({ ...emergency1Form, name: e.target.value })}
                            placeholder="Contact Name"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all shadow-sm"
                            value={emergency1Form.phone}
                            onChange={(e) => setEmergency1Form({ ...emergency1Form, phone: e.target.value })}
                            placeholder="Phone Number"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Relationship</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all shadow-sm"
                            value={emergency1Form.relationship}
                            onChange={(e) => setEmergency1Form({ ...emergency1Form, relationship: e.target.value })}
                            placeholder="Relation (e.g. Spouse)"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleSaveEmergencyContact(1)}
                            disabled={isSavingE1}
                            className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                          >
                            {isSavingE1 ? <FaSpinner className="animate-spin" /> : <><FaSave /> Save</>}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingEmergency1(false);
                              setEmergency1Form({
                                name: data.documents?.emergencyContact1?.name || "",
                                phone: data.documents?.emergencyContact1?.phone || "",
                                relationship: data.documents?.emergencyContact1?.relationship || ""
                              });
                            }}
                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <MetaRow label="Identity" value={data.documents?.emergencyContact1?.name} />
                        <MetaRow label="Phone" value={data.documents?.emergencyContact1?.phone} />
                        <MetaRow label="Relation" value={data.documents?.emergencyContact1?.relationship} />
                        {!data.documents?.emergencyContact1?.name && (
                          <p className="text-[10px] font-bold text-gray-400 italic text-center py-2">No contact provided</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Emergency Contact #2 Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FaAsterisk className="text-blue-500" /> Emergency #2
                    </h3>
                    {!isEditingEmergency2 && (
                      <button
                        onClick={() => setIsEditingEmergency2(true)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Contact 2"
                      >
                        <FaEdit size={12} />
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                    {isEditingEmergency2 ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            value={emergency2Form.name}
                            onChange={(e) => setEmergency2Form({ ...emergency2Form, name: e.target.value })}
                            placeholder="Contact Name"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            value={emergency2Form.phone}
                            onChange={(e) => setEmergency2Form({ ...emergency2Form, phone: e.target.value })}
                            placeholder="Phone Number"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Relationship</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            value={emergency2Form.relationship}
                            onChange={(e) => setEmergency2Form({ ...emergency2Form, relationship: e.target.value })}
                            placeholder="Relation (e.g. Parent)"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleSaveEmergencyContact(2)}
                            disabled={isSavingE2}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                          >
                            {isSavingE2 ? <FaSpinner className="animate-spin" /> : <><FaSave /> Save</>}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingEmergency2(false);
                              setEmergency2Form({
                                name: data.documents?.emergencyContact2?.name || "",
                                phone: data.documents?.emergencyContact2?.phone || "",
                                relationship: data.documents?.emergencyContact2?.relationship || ""
                              });
                            }}
                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <MetaRow label="Identity" value={data.documents?.emergencyContact2?.name} />
                        <MetaRow label="Phone" value={data.documents?.emergencyContact2?.phone} />
                        <MetaRow label="Relation" value={data.documents?.emergencyContact2?.relationship} />
                        {!data.documents?.emergencyContact2?.name && (
                          <p className="text-[10px] font-bold text-gray-400 italic text-center py-2">No contact provided</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Academic Background Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Academic Background
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                    <MetaRow label="Qualification" value={data.candidateId?.qualification} />
                    <MetaRow label="Percentage" value={data.candidateId?.percentage} />
                    <MetaRow label="Passing Year" value={data.candidateId?.passingYear} />
                    {(!data.candidateId?.qualification && !data.candidateId?.percentage) && (
                      <p className="text-[10px] font-bold text-gray-400 italic text-center py-2">No academic details provided</p>
                    )}
                  </div>
                </div>

                {/* Professional Record Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Professional Record
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                    <MetaRow label="Experience" value={data.candidateId?.experience} />
                    <MetaRow label="Organization" value={data.candidateId?.currentCompany} />
                    <MetaRow label="Current CTC" value={data.candidateId?.currentCTC} />
                    <MetaRow label="Expected CTC" value={data.candidateId?.expectedCTC} />
                    <div className="pt-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(data.candidateId?.skills || "").split(',').map((skill, idx) => skill.trim() && (
                          <span key={idx} className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-md text-[9px] font-bold">
                            {skill.trim()}
                          </span>
                        ))}
                        {!data.candidateId?.skills && <span className="text-[10px] text-gray-400 italic font-medium">No skills listed</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-gray-400">Onboarding Metric</h4>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-black">{data.completionPercentage ?? 0}%</span>
                  <span className="text-xs font-bold mb-1 opacity-50">Score</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.completionPercentage ?? 0}%` }}></div>
                </div>
                <p className="mt-4 text-[10px] font-medium text-gray-500 italic uppercase tracking-tighter">Requires 100% for full clearance</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Record Hash</p>
                <code className="text-[9px] text-blue-600 bg-blue-50 px-2 py-1 rounded block break-all font-mono">{data._id}</code>
                <div className="pt-2">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Created At</p>
                  <p className="text-xs font-bold text-gray-700">{data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}