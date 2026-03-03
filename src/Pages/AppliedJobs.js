import React, { useState, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  FaFileAlt, FaChevronRight, FaSearch, FaTimes, FaSync,
  FaCalendarAlt, FaBriefcase, FaEye
} from "react-icons/fa";

const AppliedJobs = () => {
  const { appliedJobs, searchQuery: globalSearchQuery } = useOutletContext();
  const navigate = useNavigate();

  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  const statuses = ["Applied", "Assessment Shared", "Interview Scheduled", "Selected", "Rejected", "Resigned"];

  const getStatusStyles = (status) => {
    switch (status) {
      case "Selected": case "Hired":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Assessment Shared": case "Interview Scheduled":
        return "bg-indigo-100 text-indigo-700";
      case "Resigned":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const filteredApps = appliedJobs.filter(app => {
    const combinedQuery = (globalSearchQuery || localSearchQuery).toLowerCase();
    const matchesSearch =
      (app.jobId?.role || "").toLowerCase().includes(combinedQuery) ||
      (app.status || "").toLowerCase().includes(combinedQuery);

    const matchesStatus = statusFilter ? app.status === statusFilter : true;

    let matchesDate = true;
    if (dateFilter) {
      const appDate = new Date(app.createdAt || app.appliedAt).toISOString().split("T")[0];
      matchesDate = appDate === dateFilter;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const resetFilters = () => {
    setLocalSearchQuery("");
    setStatusFilter("");
    setDateFilter("");
  };

  const hasFilters = localSearchQuery || statusFilter || dateFilter;

  return (
    <div className="w-full min-h-screen bg-transparent p-4 md:p-6 lg:p-8 animate-in fade-in duration-700">

      {/* Header & Filters */}
      <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-shrink-0">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">My Applications</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Real-time status tracking for all your applications</p>
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
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                onClick={() => setDateFilter("")}
              >
                <FaTimes className="text-[10px]" />
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative w-full sm:w-52" ref={statusDropdownRef}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
              <FaBriefcase className="text-xs" />
            </div>
            <div
              className="w-full bg-white py-2.5 pl-10 pr-10 text-xs text-gray-700 border border-gray-200 rounded-xl font-bold cursor-pointer hover:bg-gray-50 shadow-sm text-ellipsis whitespace-nowrap overflow-hidden"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              {statusFilter || "Filter by Status"}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
              {statusFilter ? (
                <FaTimes
                  className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                  onClick={(e) => { e.stopPropagation(); setStatusFilter(""); }}
                />
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
              )}
            </div>
            {isStatusDropdownOpen && (
              <div className="absolute z-[110] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="max-h-60 overflow-y-auto py-2">
                  <div
                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors ${!statusFilter ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`}
                    onClick={() => { setStatusFilter(""); setIsStatusDropdownOpen(false); }}
                  >
                    All Statuses
                  </div>
                  {statuses.map((s) => (
                    <div
                      key={s}
                      className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors ${statusFilter === s ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`}
                      onClick={() => { setStatusFilter(s); setIsStatusDropdownOpen(false); }}
                    >
                      {s}
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
              placeholder="Search role, status..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
            />
            {localSearchQuery && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <FaTimes
                  className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer"
                  onClick={() => setLocalSearchQuery("")}
                />
              </div>
            )}
          </div>

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-black text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all shadow-sm uppercase tracking-widest"
            >
              <FaSync className="text-[10px]" /> Reset
            </button>
          )}

          <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{filteredApps.length} Applications</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
        {filteredApps.length > 0 ? (
          <table className="min-w-full">
            <thead className="text-[10px] text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="py-4 px-8 text-center">Applied Role</th>
                <th className="py-4 px-6 text-center">Ref ID</th>
                <th className="py-4 px-6 text-center">Applied On</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-8 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredApps.map((app) => (
                <tr key={app._id} className="group hover:bg-slate-50/80 transition-all duration-300">
                  <td className="py-6 px-8 text-center">
                    <div className="font-black text-sm text-gray-900">{app.jobId?.role || "N/A"}</div>
                    <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5 font-bold">
                      {new Date(app.createdAt || app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <span className="font-black text-xs text-gray-500 uppercase tracking-wider">
                      #{app._id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-6 px-6 text-center text-xs font-bold text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <FaCalendarAlt className="text-gray-300" size={10} />
                      {new Date(app.createdAt || app.appliedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusStyles(app.status)}`}>
                        {(app.status || "Applied").toUpperCase()}
                      </span>
                      {(app.interviewStatus === "Invited" || app.interviewStatus === "Rescheduled") && app.candidateInterviewStatus && app.candidateInterviewStatus !== "Pending" && (
                        <span className={`text-[8px] font-black uppercase tracking-tighter ${app.candidateInterviewStatus === "Confirmed" ? "text-indigo-600" : "text-rose-600"}`}>
                          Interview {app.candidateInterviewStatus}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-6 px-8 text-center">
                    {app.status === "Assessment Shared" && app.assessmentId ? (
                      <button
                        onClick={() => navigate(`/assessment/${app.jobId._id}/${app._id}`)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.15em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        Start Evaluation
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/jobs/${app.jobId?._id}`)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gray-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-95 group-hover:translate-x-1"
                      >
                        View Job <FaEye className="text-xs" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 mx-auto mb-6 border-2 border-dashed border-gray-100 animate-pulse">
              <FaFileAlt size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">No Applications Yet</h3>
            <p className="text-[10px] font-black text-gray-400 mt-3 uppercase tracking-widest leading-loose max-w-xs mx-auto">
              Applications you submit will appear here with real-time status updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliedJobs;