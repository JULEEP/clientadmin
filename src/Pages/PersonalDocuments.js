import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FaAsterisk, FaBriefcase, FaBuilding, FaCalendarAlt, FaCheck, FaDownload, FaEdit,
  FaEye, FaSave, FaSearch, FaShieldAlt, FaSignOutAlt, FaSpinner, FaSync, FaTimes,
  FaUser, FaUserTie
} from "react-icons/fa";
import { toast } from "react-toastify";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { API_BASE_URL } from "../utils/config";

const MetaRow = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    {icon && <div className="mt-1 text-blue-500 scale-110">{icon}</div>}
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value || "---"}</p>
    </div>
  </div>
);

const StatusBadge = ({ status, className = "" }) => {
  const badges = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm",
    rejected: "bg-rose-50 text-rose-700 border-rose-100 shadow-sm",
    uploaded: "bg-blue-50 text-blue-700 border-blue-100 shadow-sm",
    missing: "bg-gray-50 text-gray-400 border-gray-100 shadow-sm"
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all duration-300 ${badges[status] || badges.missing} ${className}`}>
      {status === 'approved' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
      {status === 'rejected' && <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>}
      {status === 'uploaded' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>}
      {status === 'missing' && <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></div>}
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
  const [isDownloadingBulk, setIsDownloadingBulk] = useState(false);

  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId');

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
      const res = await axios.post(`${API_BASE_URL}/jobs/all`, { clientId });
      if (res.data.success) {
        // Extract unique roles from jobs
        const jobData = res.data.data || res.data.jobPosts || [];
        const roleNames = Array.from(new Set(jobData.map(job => job.role))).filter(Boolean);
        const uniqueRoles = roleNames.map((name, index) => ({ _id: index, name }));
        setRoles(uniqueRoles);
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
        const res = await axios.get(`${API_BASE_URL}/candidate/admin/${userId}`, { headers });
        if (res.data) {
          const payload = res.data.success ? res.data.data : res.data;
          setData(payload);
        }
      } else {
        try {
          const listRes = await axios.get(`${API_BASE_URL}/candidate/all-documents`, { headers });
          if (listRes.data && listRes.data.success && Array.isArray(listRes.data.data)) {
            setData(listRes.data.data);
          } else if (listRes.data && Array.isArray(listRes.data)) {
            setData(listRes.data);
          } else {
            const res = await axios.get(`${API_BASE_URL}/candidate/documents`, { headers });
            const payload = res.data && res.data.success ? res.data.data : res.data;
            setData(payload);
          }
        } catch (e) {
          const res = await axios.get(`${API_BASE_URL}/candidate/documents`, { headers });
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
        { bankDetails: bankForm },
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
        { contactNumber: num, contact: form },
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

  const handleBulkDownload = async (targetData = null) => {
    const activeData = targetData || data;
    if (!activeData || Array.isArray(activeData)) return;

    const docsToDownload = Object.entries(activeData.documents || {})
      .filter(([key, doc]) =>
        !['bankDetails', 'emergencyContact1', 'emergencyContact2', '_id'].includes(key) &&
        doc && typeof doc === 'object' && doc.filePath
      );

    if (docsToDownload.length === 0) {
      return toast.info("No documents uploaded to download");
    }

    setIsDownloadingBulk(true);
    const zip = new JSZip();
    const toastId = toast.loading(`Preparing bulk download for ${activeData.candidateName || 'Candidate'}...`);

    try {
      const downloadPromises = docsToDownload.map(async ([key, doc]) => {
        const relativePath = doc.filePath.includes("uploads")
          ? "uploads/" + doc.filePath.split(/uploads[\\/]/).pop().replace(/\\/g, "/")
          : doc.filePath.replace(/\\/g, "/");
        const url = `${API_BASE_URL.replace("/api", "")}/${relativePath}`;

        try {
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          const fileName = doc.fileName || `${key}.${doc.filePath.split('.').pop()}`;
          zip.file(fileName, response.data);
        } catch (err) {
          console.error(`Failed to download ${key}:`, err);
        }
      });

      await Promise.all(downloadPromises);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${activeData.candidateName || 'Candidate'}_Documents.zip`);
      toast.update(toastId, { render: "Bulk download complete!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      console.error("Bulk download failed:", err);
      toast.update(toastId, { render: "Bulk download failed", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsDownloadingBulk(false);
    }
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
        <p className="text-sm font-bold text-gray-400">Loading Documents...</p>
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
      <div className="w-full min-h-screen p-0 md:p-2 lg:p-4 pb-20">
        {/* Unified Search & Filter Bar */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md border border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Header Info - Matching Assessment Manager */}
            <div className="flex items-center gap-2 mr-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <FaUserTie size={12} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-gray-900 leading-none uppercase tracking-tighter">Document Manager</h1>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{filteredData.length} active records</p>
              </div>
            </div>

            {/* Search Bar - Compact Style */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              <input 
                type="text"
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search candidates..." 
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Role Dropdown - Compact */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className={`h-8 px-3 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 border uppercase tracking-widest ${roleFilter
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                >
                  <FaBriefcase className={roleFilter ? 'text-white' : 'text-blue-500'} size={10} />
                  {roleFilter || 'All Departments'}
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute z-50 mt-1 right-0 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-1">
                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                      <div className="relative">
                        <FaUserTie className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />
                        <input
                          type="text"
                          className="w-full py-1.5 pl-8 pr-3 text-[10px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                          placeholder="Search roles..."
                          value={roleSearchQuery}
                          onChange={(e) => setRoleSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <div
                        onClick={() => { setRoleFilter(''); setIsRoleDropdownOpen(false); setRoleSearchQuery(''); }}
                        className={`px-3 py-2 text-[10px] font-bold cursor-pointer hover:bg-blue-50 transition-colors ${!roleFilter ? 'text-blue-600 bg-blue-50/80' : 'text-gray-600'}`}
                      >
                        ALL DEPARTMENTS
                      </div>
                      {roles
                        .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                        .map((r) => (
                          <div
                            key={r._id}
                            onClick={() => { setRoleFilter(r.name); setIsRoleDropdownOpen(false); setRoleSearchQuery(''); }}
                            className={`px-3 py-2 text-[10px] font-bold cursor-pointer hover:bg-blue-50/80 transition-colors ${roleFilter === r.name ? 'text-blue-600 bg-blue-50/80' : 'text-gray-600'}`}
                          >
                            {r.name.toUpperCase()}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Date Filter - Compact */}
              <div className="relative group">
                <FaCalendarAlt className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-8 pl-7 pr-2 bg-white border border-gray-300 rounded-md text-[10px] font-bold text-gray-600 uppercase tracking-widest focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer hover:border-blue-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2">
                <button 
                  onClick={fetchData} 
                  className="w-8 h-8 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center"
                  title="Refresh Data"
                >
                  <FaSync className={loading ? 'animate-spin' : ''} size={12} />
                </button>
                {(searchQuery || roleFilter || dateFilter) && (
                  <button
                    onClick={resetFilters}
                    className="h-8 px-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-[9px] font-bold uppercase tracking-wider hover:bg-red-100 transition-all flex items-center gap-1.5"
                  >
                    <FaTimes size={10} /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-gray-100">
          <table className="min-w-full border-collapse">
            <thead className="bg-gradient-to-r from-green-500 to-blue-600">
              <tr>
                <th className="px-6 py-4 text-center font-bold text-white text-xs uppercase tracking-widest">Candidate</th>
                {["Aadhar", "PAN", "Photo", "10th", "12th", "Graduation", "Experience", "Banking"].map((header) => (
                  <th key={header} className="px-3 py-4 text-center font-bold text-white text-xs uppercase tracking-widest">{header}</th>
                ))}
                <th className="px-6 py-4 text-center font-bold text-white text-xs uppercase tracking-widest">Actions</th>
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
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {uploaded ? (
                          <>
                            <button
                              onClick={() => openFile(doc.filePath)}
                              className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              title="View"
                            >
                              <FaEye size={14} />
                            </button>
                            <button
                              onClick={() => openFile(doc.filePath)}
                              className="p-1.5 rounded bg-gray-50 text-gray-500 hover:bg-gray-800 hover:text-white transition-all shadow-sm"
                              title="Download"
                            >
                              <FaDownload size={14} />
                            </button>
                          </>
                        ) : (
                          <FaTimes className="text-gray-100" size={12} />
                        )}
                      </div>
                    </td>
                  );
                };

                return (
                  <tr key={candId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white shadow-sm text-xs">
                          {candName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-800">{candName}</div>
                          <div className="text-[10px] text-gray-400 font-bold">{candEmail || candId.slice(-8)}</div>
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
                    <td className="p-2 text-center">
                      <div className={`w-2 h-2 mx-auto rounded-full ${docs.bankDetails?.bankName ? 'bg-green-500 shadow-sm' : 'bg-gray-100'}`}></div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => window.location.assign(`/personal-documents?userId=${candId}`)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5"
                          title="Detailed Review"
                        >
                          <FaEye size={16} />
                          <span>REVIEW</span>
                        </button>
                        <button
                          onClick={() => handleBulkDownload(row)}
                          disabled={isDownloadingBulk}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
                          title="Generate Archive"
                        >
                          <FaDownload size={16} />
                          <span>ARCHIVE</span>
                        </button>
                      </div>
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
                <span className="font-bold">
                  {indexOfFirstItem + 1}
                </span>
                <span>to</span>
                <span className="font-bold">
                  {Math.min(indexOfLastItem, filteredData.length)}
                </span>
                <span>of</span>
                <span className="font-bold">
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
                  className={`px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${pagination.currentPage === 1
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
                      className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${page === "..."
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
                  className={`px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${pagination.currentPage === pagination.totalPages
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
            <div className="p-12 text-center text-gray-500 text-sm font-bold">No active records found.</div>
          )}
        </div>
      </div>
    );
  }

  // Profile Specific View (single candidate)
  const docKeys = Object.keys(data.documents || {}).filter(key =>
    !['bankDetails', 'emergencyContact1', 'emergencyContact2', '_id'].includes(key)
  );

  return (
    <div className="w-full min-h-screen p-2 bg-slate-50/50">
      <div className="max-w-[1600px] mx-auto space-y-3">
        
        {/* Corporate Sleek Header - Compact & Professional */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-blue-700 rounded-3xl p-6 shadow-xl border border-white/10 group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold shadow-2xl ring-4 ring-white/20 group-hover:scale-105 transition-transform duration-500 bg-white">
                  {data.candidateName?.charAt(0) || data.candidateId?.name?.charAt(0) || <FaUser />}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center text-white shadow-lg">
                  <FaCheck size={10} />
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">
                  {data.candidateName || data.candidateId?.name || 'Review Profile'}
                </h1>
                <p className="text-white/90 text-[9px] font-bold uppercase tracking-[0.15em] mt-1.5 flex items-center justify-center md:justify-start gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-lg w-fit border border-white/10">
                  <FaUserTie size={10} className="text-emerald-400" /> IDENTITY VERIFICATION RECORD
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-blue-100 text-[9px] font-bold uppercase tracking-wider rounded-lg border border-white/10">
                    UID: {data._id?.slice(-8).toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-emerald-100 text-[9px] font-bold uppercase tracking-wider rounded-lg border border-white/10 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBulkDownload()}
                disabled={isDownloadingBulk}
                className="h-10 px-6 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all border border-white/10 active:scale-95 disabled:opacity-50"
              >
                {isDownloadingBulk ? <FaSpinner className="animate-spin" size={12} /> : <FaDownload size={12} />}
                {isDownloadingBulk ? "GENERATING..." : "DOWNLOAD VAULT"}
              </button>
              <button
                onClick={() => window.location.assign('/personal-documents')}
                className="h-10 px-6 bg-white text-blue-600 hover:bg-gray-50 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-3"
              >
                <FaSignOutAlt size={12} />
                BACK TO INDEX
              </button>
            </div>
          </div>
        </div>

        {/* Main Review Dashboard - Optimized Layout */}
        <div className="flex flex-col gap-3 pb-8">
          
          {/* Documents Table View - Full Width */}
          <div className="w-full space-y-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner border border-blue-100"><FaBriefcase size={14}/></div>
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest font-sans">Primary Credentials</h3>
                 </div>
                 <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-gray-100">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Approved
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Uploaded
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div> Missing
                 </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gradient-to-r from-green-500 to-blue-600 text-[11px] font-bold text-white uppercase tracking-widest border-b border-blue-100">
                    <tr>
                      <th className="px-6 py-5">Asset Identification</th>
                      <th className="px-6 py-5 text-center">Status</th>
                      <th className="px-6 py-5 text-center">Reference</th>
                      <th className="px-6 py-5 text-right">Verification Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 border-t border-gray-100">
                    {docKeys.map((key) => {
                      const doc = data.documents[key] || {};
                      const uploaded = !!doc.filePath;
                      const state = marks[key] || (doc.verified ? 'approved' : uploaded ? 'uploaded' : 'missing');

                      return (
                        <tr key={key} className="group hover:bg-slate-50 transition-all duration-300">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${uploaded ? 'bg-blue-50 text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}>
                                   <FaBriefcase size={18} />
                                </div>
                                 <div>
                                    <p className="text-xs font-bold text-gray-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{key.replace(/([A-Z])/g, ' $1')}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{uploaded ? 'Synchronized Archive' : 'Awaiting Manifest'}</p>
                                 </div>
                             </div>
                           </td>
                          <td className="px-6 py-4 text-center">
                            <StatusBadge status={state} />
                           </td>
                          <td className="px-6 py-4 text-center font-mono text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                            {doc.fileName ? `...${doc.fileName.slice(-15)}` : '--'}
                           </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2 outline-none">
                               <button
                                  onClick={() => openFile(doc.filePath)}
                                  disabled={!uploaded}
                                  className={`h-11 px-5 rounded-xl transition-all flex items-center gap-2 active:scale-95 ${uploaded ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 shadow-md shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'}`}
                               >
                                  <FaEye size={18} />
                                  <span className="text-[11px] font-bold uppercase tracking-widest">{uploaded ? '' : 'Locked'}</span>
                               </button>
                               <div className="h-6 w-px bg-gray-200 mx-1"></div>
                               <button
                                 onClick={() => mark(key, 'approved')}
                                 className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border-2 ${state === 'approved' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' : 'border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 shadow-sm'}`}
                                 title="Approve"
                               >
                                 <FaCheck size={24} />
                               </button>
                               <button
                                 onClick={() => mark(key, 'rejected')}
                                 className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border-2 ${state === 'rejected' ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200' : 'border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white hover:border-rose-500 shadow-sm'}`}
                                 title="Reject"
                               >
                                 <FaTimes size={24} />
                               </button>
                            </div>
                           </td>
                         </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Details Row - Three Cards Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            
             {/* Bank Card - Sleek Minimalist */}
             <div className="bg-white rounded-2xl shadow-lg border-t-4 border-blue-500 overflow-hidden group hover:shadow-xl transition-all duration-500">
               <div className="p-5 bg-gray-50 flex items-center justify-between border-b border-gray-100">
                   <div className="flex items-center gap-3 text-gray-800">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner border border-blue-100">
                         <FaBuilding size={14} />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-widest">Banking Profile</h3>
                   </div>
                   {!isEditingBank && (
                    <button 
                      onClick={() => setIsEditingBank(true)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 border border-blue-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                    >
                      <FaEdit size={14} />
                      <span>EDIT</span>
                    </button>
                  )}
               </div>
               
               <div className="p-4 space-y-3">
                  {isEditingBank ? (
                    <div className="space-y-3">
                        <input value={bankForm.bankName} onChange={e => setBankForm({...bankForm, bankName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500" placeholder="Bank Name" />
                        <input value={bankForm.accountNumber} onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold font-mono outline-none focus:ring-1 focus:ring-blue-500" placeholder="A/C Number" />
                         <div className="flex gap-2">
                            <button onClick={handleSaveBankDetails} className="flex-1 h-10 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-blue-100 active:scale-95 transition-all">Save</button>
                            <button onClick={() => setIsEditingBank(false)} className="px-6 h-10 bg-gray-50 text-gray-400 border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-all">Cancel</button>
                         </div>
                    </div>
                  ) : (
                     <div className="space-y-2">
                        <MetaRow icon={<FaBuilding className="text-blue-500" />} label="Financial Institution" value={data.documents?.bankDetails?.bankName} />
                        <MetaRow icon={<FaBuilding className="text-blue-500" />} label="Account Repository" value={data.documents?.bankDetails?.accountNumber} />
                        <MetaRow icon={<FaBuilding className="text-blue-500" />} label="Transit Code (IFSC)" value={data.documents?.bankDetails?.ifscCode} />
                     </div>
                  )}
               </div>
            </div>

            {/* Emergency #1 Card - Sleek Minimalist */}
            <div className="bg-white rounded-2xl shadow-lg border-t-4 border-emerald-500 overflow-hidden group hover:shadow-xl transition-all duration-500">
               <div className="p-5 bg-gray-50 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-3 text-gray-800">
                     <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-100">
                        <FaAsterisk size={14} />
                     </div>
                     <h3 className="text-xs font-bold uppercase tracking-widest">Emergency #1</h3>
                  </div>
                   {!isEditingEmergency1 && (
                    <button 
                      onClick={() => setIsEditingEmergency1(true)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
                    >
                      <FaEdit size={14} />
                      <span>EDIT</span>
                    </button>
                  )}
               </div>
               <div className="p-4">
                  {isEditingEmergency1 ? (
                    <div className="space-y-3">
                        <input value={emergency1Form.name} onChange={e => setEmergency1Form({...emergency1Form, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" placeholder="Name" />
                        <input value={emergency1Form.phone} onChange={e => setEmergency1Form({...emergency1Form, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" placeholder="Phone" />
                        <div className="flex gap-2">
                            <button onClick={() => handleSaveEmergencyContact(1)} className="flex-1 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 active:scale-95 transition-all">Save</button>
                            <button onClick={() => setIsEditingEmergency1(false)} className="px-6 h-10 bg-gray-50 text-gray-400 border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-all">Cancel</button>
                         </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                       <MetaRow icon={<FaUser className="text-emerald-500" />} label="Identity" value={data.documents?.emergencyContact1?.name} />
                       <MetaRow icon={<FaBuilding className="text-emerald-500" />} label="Emergency Line" value={data.documents?.emergencyContact1?.phone} />
                    </div>
                  )}
               </div>
            </div>

            {/* Emergency #2 Card - Sleek Minimalist */}
            <div className="bg-white rounded-2xl shadow-lg border-t-4 border-teal-500 overflow-hidden group hover:shadow-xl transition-all duration-500">
               <div className="p-5 bg-gray-50 flex items-center justify-between border-b border-gray-100">
                   <div className="flex items-center gap-3 text-gray-800">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner border border-teal-100">
                         <FaAsterisk size={14} />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-widest">Emergency #2</h3>
                   </div>
                   {!isEditingEmergency2 && (
                    <button 
                      onClick={() => setIsEditingEmergency2(true)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-teal-600 border border-teal-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-teal-50 transition-all shadow-sm active:scale-95"
                    >
                      <FaEdit size={14} />
                      <span>EDIT</span>
                    </button>
                  )}
                </div>
                <div className="p-4">
                   {isEditingEmergency2 ? (
                     <div className="space-y-3">
                         <input value={emergency2Form.name} onChange={e => setEmergency2Form({...emergency2Form, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" placeholder="Name" />
                         <input value={emergency2Form.phone} onChange={e => setEmergency2Form({...emergency2Form, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" placeholder="Phone" />
                         <div className="flex gap-2">
                            <button onClick={() => handleSaveEmergencyContact(2)} className="flex-1 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-teal-100 active:scale-95 transition-all">Save</button>
                            <button onClick={() => setIsEditingEmergency2(false)} className="px-6 h-10 bg-gray-50 text-gray-400 border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-all">Cancel</button>
                         </div>
                     </div>
                  ) : (
                    <div className="space-y-2">
                       <MetaRow icon={<FaUser className="text-teal-500" />} label="Identity" value={data.documents?.emergencyContact2?.name} />
                       <MetaRow icon={<FaBuilding className="text-teal-500" />} label="Emergency Line" value={data.documents?.emergencyContact2?.phone} />
                    </div>
                  )}
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}