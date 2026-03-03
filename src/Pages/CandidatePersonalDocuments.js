import React, { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import {
  FaAddressCard, FaLock, FaUserShield, FaUserFriends,
  FaUpload, FaCheckCircle, FaTimesCircle, FaEye,
  FaSearch, FaTimes, FaSync, FaUniversity, FaPhoneAlt, FaShieldAlt
} from "react-icons/fa";



const API_BASE_URL = 'http://localhost:5000/api';


const CandidatePersonalDocuments = () => {
  const { personalDocs, fetchDashboardData, formatDocumentUrl } = useOutletContext();
  const [uploading, setUploading] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", fieldName);
      const token = localStorage.getItem("candidateToken");
      await axios.post(`${API_BASE_URL}/candidate/upload-documents`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const docSections = [
    { id: "aadharCard", label: "Aadhar / National ID", icon: FaAddressCard, desc: "Government-issued identity proof" },
    { id: "panCard", label: "PAN Card", icon: FaLock, desc: "Tax identification document" },
    { id: "tenthCertificate", label: "10th Certificate", icon: FaUserShield, desc: "Secondary school certificate" },
    { id: "twelfthCertificate", label: "12th Certificate", icon: FaUserShield, desc: "Higher secondary certificate" },
    { id: "graduationCertificate", label: "Graduation Degree", icon: FaUserShield, desc: "University degree certificate" },
    { id: "passportPhoto", label: "Passport Photo", icon: FaUserFriends, desc: "Recent passport-size photograph" },
  ];

  const docs = personalDocs?.documents || {};
  const filedCount = docSections.filter(d => !!docs[d.id]?.filePath).length;

  const filteredDocs = docSections.filter(doc => {
    const filed = !!docs[doc.id]?.filePath;
    const matchesStatus = statusFilter === "Filed" ? filed : statusFilter === "Pending" ? !filed : true;
    const matchesSearch = doc.label.toLowerCase().includes(localSearch.toLowerCase()) ||
      doc.desc.toLowerCase().includes(localSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const resetFilters = () => { setStatusFilter(""); setLocalSearch(""); };
  const hasFilters = statusFilter || localSearch;

  return (
    <div className="w-full min-h-screen bg-transparent p-4 md:p-6 lg:p-8 animate-in fade-in duration-700">

      {/* ── Header & Filter Bar ── */}
      <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-shrink-0">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Personal Identity Vault</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
            Secure management of identification records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto xl:justify-end">

          {/* Status Dropdown */}
          <div className="relative w-full sm:w-44" ref={dropdownRef}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
              <FaShieldAlt className="text-gray-400 text-xs" />
            </div>
            <div
              className="w-full bg-white py-2.5 pl-9 pr-9 text-xs text-gray-700 border border-gray-200 rounded-xl font-bold cursor-pointer hover:bg-gray-50 shadow-sm overflow-hidden text-ellipsis whitespace-nowrap"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {statusFilter || "All Documents"}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
              {statusFilter
                ? <FaTimes className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer" onClick={e => { e.stopPropagation(); setStatusFilter(""); }} />
                : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
              }
            </div>
            {isDropdownOpen && (
              <div className="absolute z-[110] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-1.5">
                  {["", "Filed", "Pending"].map(s => (
                    <div
                      key={s}
                      className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors ${statusFilter === s ? "text-blue-600 bg-blue-50/60" : "text-gray-500"}`}
                      onClick={() => { setStatusFilter(s); setIsDropdownOpen(false); }}
                    >
                      {s || "All Documents"}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400 text-xs" />
            </div>
            <input
              type="text"
              className="w-full py-2.5 pl-9 pr-9 text-xs text-gray-700 placeholder-gray-400 font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="Search documents..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <FaTimes className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => setLocalSearch("")} />
              </div>
            )}
          </div>

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl shadow-sm uppercase tracking-widest transition-all"
            >
              <FaSync className="text-[10px]" /> Reset
            </button>
          )}

          {/* Progress Counter */}
          <div className={`px-4 py-2.5 rounded-xl border shadow-sm flex items-center gap-2 ${filedCount === docSections.length ? "bg-green-50 border-green-100" : "bg-white border-gray-200"}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${filedCount === docSections.length ? "bg-green-500" : "bg-yellow-400"}`}></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{filedCount} / {docSections.length} Filed</span>
          </div>
        </div>
      </div>

      {/* ── Documents Table ── */}
      <div className="bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
              <tr>
                {["Document Name", "Description", "Status", "Actions"].map(h => (
                  <th key={h} className="py-4 px-6 text-[10px] font-black text-white uppercase tracking-[0.18em] text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDocs.length > 0 ? filteredDocs.map(doc => {
                const filed = !!docs[doc.id]?.filePath;
                const isUploading = !!uploading[doc.id];
                return (
                  <tr key={doc.id} className="group hover:bg-slate-50/80 transition-colors duration-200">

                    {/* Document Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110 ${filed ? "bg-green-50 text-green-500 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"}`}>
                          <doc.icon size={13} />
                        </div>
                        <span className="text-sm font-black text-gray-800 tracking-tight whitespace-nowrap">{doc.label}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-6">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{doc.desc}</span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {filed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700 uppercase tracking-widest">
                          <FaCheckCircle size={8} /> Filed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-yellow-100 text-yellow-700 uppercase tracking-widest">
                          <FaTimesCircle size={8} /> Pending
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer">
                          <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95 ${isUploading ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed" : "bg-white border-gray-200 text-gray-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-md"}`}>
                            <FaUpload className={isUploading ? "animate-bounce" : ""} size={9} />
                            {isUploading ? "Uploading..." : filed ? "Re-upload" : "Upload"}
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            onChange={e => handleFileUpload(doc.id, e.target.files[0])}
                            disabled={isUploading}
                          />
                        </label>

                        {filed && (
                          <button
                            onClick={() => window.open(formatDocumentUrl(docs[doc.id].filePath), "_blank")}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:shadow-lg transition-all active:scale-95"
                          >
                            <FaEye size={9} /> View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-200 mx-auto mb-4">
                      <FaUserShield size={24} />
                    </div>
                    <p className="text-sm font-black text-gray-800 uppercase tracking-widest">No Documents Found</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Adjust your filters to see documents</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Info Cards: Bank & Emergency ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bank Details */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <FaUniversity className="text-white" size={13} />
            </div>
            <div>
              <p className="text-sm font-black text-white uppercase tracking-wider">Banking Details</p>
              <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest">Salary account information</p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { label: "Bank Name", value: docs.bankDetails?.bankName },
              { label: "Account Number", value: docs.bankDetails?.accountNumber },
              { label: "IFSC Code", value: docs.bankDetails?.ifscCode },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                <span className={`text-xs font-black tracking-tight ${item.value ? "text-gray-800" : "text-gray-300 italic"}`}>
                  {item.value || "Not Filed"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <FaPhoneAlt className="text-white" size={13} />
            </div>
            <div>
              <p className="text-sm font-black text-white uppercase tracking-wider">Emergency Contact</p>
              <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest">Primary emergency contact</p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { label: "Name", value: docs.emergencyContact1?.name },
              { label: "Phone Number", value: docs.emergencyContact1?.phone },
              { label: "Relationship", value: docs.emergencyContact1?.relationship },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                <span className={`text-xs font-black tracking-tight ${item.value ? "text-gray-800" : "text-gray-300 italic"}`}>
                  {item.value || "Not Filed"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePersonalDocuments;