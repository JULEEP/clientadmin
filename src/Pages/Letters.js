import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { FaFilePdf, FaEye, FaDownload, FaInbox, FaSearch, FaTimes, FaSync, FaCalendarAlt } from "react-icons/fa";

const Letters = () => {
  const {
    appliedJobs, searchQuery: globalSearchQuery,
    handleDownloadOffer, setIsModalOpen, setSelectedOffer, setActiveDocTab
  } = useOutletContext();

  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);

  const docTypes = ["Offer", "Appointment", "Experience", "Internship", "Relieving"];

  const offerApps = appliedJobs.filter(app => app.offerLetter || app.adminAttachment);

  const filteredLetters = offerApps.filter(app => {
    const combinedQuery = (globalSearchQuery || localSearchQuery).toLowerCase();
    const matchesSearch =
      (app.jobId?.role || "").toLowerCase().includes(combinedQuery) ||
      (app.documentType || "Offer").toLowerCase().includes(combinedQuery);

    const matchesType = typeFilter
      ? (app.documentType || "Offer").toLowerCase() === typeFilter.toLowerCase()
      : true;

    let matchesDate = true;
    if (dateFilter) {
      const issueDate = new Date(app.offerSentAt || app.updatedAt).toISOString().split("T")[0];
      matchesDate = issueDate === dateFilter;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const getDocTypeBadge = (type) => {
    const t = (type || "Offer").toLowerCase();
    if (t === "offer") return "bg-blue-100 text-blue-700";
    if (t === "appointment") return "bg-green-100 text-green-700";
    if (t === "experience") return "bg-purple-100 text-purple-700";
    if (t === "internship") return "bg-orange-100 text-orange-700";
    return "bg-gray-100 text-gray-600";
  };

  const resetFilters = () => {
    setLocalSearchQuery("");
    setTypeFilter("");
    setDateFilter("");
  };

  const hasFilters = localSearchQuery || typeFilter || dateFilter;

  return (
    <div className="w-full min-h-screen bg-transparent p-4 md:p-6 lg:p-8 animate-in fade-in duration-700">

      {/* Header & Filters */}
      <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-shrink-0">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Offer Letters & Documents</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Access your formal offer letters and employment agreements</p>
        </div>

        <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">

          {/* Date Filter */}
          <div className="relative w-full sm:w-auto">
            <input
              type="date"
              className="w-full appearance-none bg-white py-2.5 px-4 pr-10 text-xs text-gray-700 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold shadow-sm sm:w-40 cursor-pointer"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-red-500 transition-colors" onClick={() => setDateFilter("")}>
                <FaTimes className="text-[10px]" />
              </div>
            )}
          </div>

          {/* Document Type Dropdown */}
          <div className="relative w-full sm:w-52" ref={typeDropdownRef}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
              <FaFilePdf className="text-xs text-red-400" />
            </div>
            <div
              className="w-full bg-white py-2.5 pl-10 pr-10 text-xs text-gray-700 border border-gray-200 rounded-xl font-bold cursor-pointer hover:bg-gray-50 shadow-sm text-ellipsis whitespace-nowrap overflow-hidden"
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            >
              {typeFilter || "Filter by Doc Type"}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
              {typeFilter ? (
                <FaTimes className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); setTypeFilter(""); }} />
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
              )}
            </div>
            {isTypeDropdownOpen && (
              <div className="absolute z-[110] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="max-h-60 overflow-y-auto py-2">
                  <div
                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors ${!typeFilter ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`}
                    onClick={() => { setTypeFilter(""); setIsTypeDropdownOpen(false); }}
                  >
                    All Types
                  </div>
                  {docTypes.map(t => (
                    <div
                      key={t}
                      className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors ${typeFilter === t ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`}
                      onClick={() => { setTypeFilter(t); setIsTypeDropdownOpen(false); }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <FaSearch className="text-xs" />
            </div>
            <input
              type="text"
              className="w-full py-2.5 pl-10 pr-10 text-xs text-gray-700 placeholder-gray-400 font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="Search role, doc type..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
            />
            {localSearchQuery && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <FaTimes className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => setLocalSearchQuery("")} />
              </div>
            )}
          </div>

          {/* Reset */}
          {hasFilters && (
            <button onClick={resetFilters} className="flex items-center gap-2 px-4 py-2.5 text-xs font-black text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl shadow-sm uppercase tracking-widest transition-all">
              <FaSync className="text-[10px]" /> Reset
            </button>
          )}

          <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{filteredLetters.length} Letters</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
        {filteredLetters.length > 0 ? (
          <table className="min-w-full">
            <thead className="text-[10px] text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="py-5 px-8 text-center">Position / Role</th>
                <th className="py-5 px-6 text-center">Document Type</th>
                <th className="py-5 px-6 text-center">Issued On</th>
                <th className="py-5 px-6 text-center">Ref ID</th>
                <th className="py-5 px-8 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLetters.map((app) => (
                <tr key={app._id} className="group hover:bg-slate-50/80 transition-all duration-300">
                  {/* Role */}
                  <td className="py-6 px-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-400 border border-red-100 group-hover:rotate-6 transition-transform shrink-0">
                        <FaFilePdf size={14} />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-sm text-gray-900">{app.jobId?.role || "N/A"}</div>
                        <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">{app.content ? "Letter Content Available" : "Attachment Available"}</div>
                      </div>
                    </div>
                  </td>

                  {/* Doc Type */}
                  <td className="py-6 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getDocTypeBadge(app.documentType)}`}>
                      {app.documentType || "Offer"}
                    </span>
                  </td>

                  {/* Issued Date */}
                  <td className="py-6 px-6 text-center text-xs font-bold text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <FaCalendarAlt className="text-gray-300" size={10} />
                      {new Date(app.offerSentAt || app.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </td>

                  {/* Ref ID */}
                  <td className="py-6 px-6 text-center">
                    <span className="font-black text-xs text-gray-400 uppercase tracking-wider">
                      #{app._id.slice(-6).toUpperCase()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-6 px-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOffer(app);
                          setActiveDocTab("offer");
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all active:scale-95"
                        title="View Document"
                      >
                        <FaEye size={12} /> View
                      </button>
                      <button
                        onClick={() => handleDownloadOffer(app)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gray-200 hover:bg-indigo-600 transition-all active:scale-95 group-hover:translate-x-1"
                        title="Download PDF"
                      >
                        <FaDownload size={10} /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 mx-auto mb-6 border-2 border-dashed border-gray-100 animate-pulse">
              <FaInbox size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">No Letters Yet</h3>
            <p className="text-[10px] font-black text-gray-400 mt-3 uppercase tracking-widest leading-loose max-w-xs mx-auto">
              Offer letters and official documents will appear here once issued by HR.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Letters;