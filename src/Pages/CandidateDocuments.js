import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaShieldAlt, FaEye, FaSearch, FaTimes, FaInbox, FaSync, FaCalendarAlt } from "react-icons/fa";

const CandidateDocuments = () => {
  const { appliedJobs, searchQuery: globalSearchQuery, handleDownloadOffer, setIsModalOpen, setSelectedOffer, setActiveDocTab } = useOutletContext();
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  const agreementApps = appliedJobs.filter(app =>
    app.status === "Hired" || app.status === "Selected" || (app.documentHistory && app.documentHistory.length > 0)
  ).filter(app => {
    const combinedQuery = (globalSearchQuery || localSearchQuery).toLowerCase();
    return (app.jobId?.role || "").toLowerCase().includes(combinedQuery);
  });

  return (
    <div className="w-full min-h-screen bg-transparent p-4 md:p-6 lg:p-8 animate-in fade-in duration-700">

      {/* Header & Filters */}
      <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-shrink-0">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Compliance & Agreements</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Regulatory documents and digital contract history</p>
        </div>

        <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <FaSearch className="text-xs" />
            </div>
            <input
              type="text"
              className="w-full py-2.5 pl-10 pr-10 text-xs text-gray-700 placeholder-gray-400 font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
              placeholder="Search by position..."
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

          <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{agreementApps.length} Agreements</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
        {agreementApps.length > 0 ? (
          <table className="min-w-full">
            <thead className="text-[10px] text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="py-5 px-8 text-center">Document Portfolio</th>
                <th className="py-5 px-6 text-center">Reference ID</th>
                <th className="py-5 px-6 text-center">Audit Date</th>
                <th className="py-5 px-6 text-center">Compliance State</th>
                <th className="py-5 px-8 text-center">Strategic Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {agreementApps.map((app) => (
                <tr key={app._id} className="group hover:bg-slate-50/80 transition-all duration-300">
                  <td className="py-6 px-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-100 group-hover:rotate-6 transition-transform shrink-0">
                        <FaShieldAlt size={16} />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-sm text-gray-900 tracking-tight">{app.jobId?.role || "Position Asset"}</div>
                        <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5 font-bold">Regulatory Contract</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <span className="font-black text-xs text-gray-400 uppercase tracking-wider">
                      #{app._id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-6 px-6 text-center text-xs font-bold text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <FaCalendarAlt className="text-gray-300" size={10} />
                      {new Date(app.updatedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                      Verified
                    </div>
                  </td>
                  <td className="py-6 px-8 text-center">
                    <button
                      onClick={() => { setSelectedOffer(app); setActiveDocTab("agreement"); setIsModalOpen(true); }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gray-200 hover:bg-indigo-600 hover:shadow-indigo-100 transition-all active:scale-95 group-hover:translate-x-1"
                    >
                      <FaEye size={12} /> View Doc
                    </button>
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
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">No Archival Records</h3>
            <p className="text-[10px] font-black text-gray-400 mt-3 uppercase tracking-widest leading-loose max-w-xs mx-auto">
              Regulatory agreements and archival documents will be accessible once selections are finalized.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDocuments;