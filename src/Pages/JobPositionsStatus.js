import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiBriefcase, FiZap, FiList, FiTrendingUp, FiEdit2, FiCheck, FiX, FiUsers } from 'react-icons/fi';
import { API_BASE_URL } from '../utils/config';

const API_BASE = API_BASE_URL;

const ROLE_MAPPING = {
  "Doctor": ["Consultant", "Medical Officer", "Physician"],
  "MERN Stack Developer": ["Web Developer", "Software Engineer", "Frontend Developer", "Backend Developer"],
  "Product Specialist": ["Marketing Executive", "Sales", "Business Development"],
  "Staff Nurse": ["Nursing Staff", "Nurse"],
};

function JobPositionsStatus() {
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editingField, setEditingField] = useState(null); // 'vacancies' or 'department'
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, empsRes] = await Promise.all([
        axios.get(`${API_BASE}/jobs/all`),
        axios.get(`https://api.timelyhealth.in/api/employees/get-employees`)
      ]);

      if (jobsRes.data.success) {
        setJobs(jobsRes.data.jobPosts);
      }

      if (empsRes.data.success || Array.isArray(empsRes.data)) {
        const empData = Array.isArray(empsRes.data) ? empsRes.data : empsRes.data.employees || empsRes.data.data || [];
        setEmployees(empData);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeCount = (dept, role) => {
    const roleAliases = [role.toLowerCase().trim(), ...(ROLE_MAPPING[role] || []).map(r => r.toLowerCase())];
    
    return employees.filter(emp => {
        const empDept = (emp.department || emp.dept || "").toLowerCase().trim();
        const empRole = (emp.role || emp.position || emp.designation || "").toLowerCase().trim();
        const empStatus = (emp.status || "").toLowerCase().trim();
        
        // Match department if it's not 'general'
        const deptMatch = (dept && dept.toLowerCase() !== 'general') 
            ? empDept.includes(dept.toLowerCase().trim()) 
            : true;

        // Match role or any of its aliases
        const roleMatch = roleAliases.some(alias => empRole.includes(alias));
        
        return deptMatch && roleMatch && empStatus === "active";
    }).length;
  };

  const startEditing = (job, field) => {
    setEditingJobId(job._id);
    setEditingField(field);
    setEditValue(job[field] === 'General' ? '' : job[field]);
  };

  const cancelEditing = () => {
    setEditingJobId(null);
    setEditingField(null);
    setEditValue("");
  };

  const saveEdit = async (jobId) => {
    setSaving(true);
    try {
      const updateData = { [editingField]: editingField === 'vacancies' ? Number(editValue) : editValue };
      const res = await axios.put(`${API_BASE}/jobs/${jobId}`, updateData);
      if (res.data.success) {
        setJobs(prev => prev.map(j => j._id === jobId ? { ...j, ...updateData } : j));
        setEditingJobId(null);
        setEditingField(null);
      }
    } catch (err) {
      console.error("Failed to update:", err);
      alert("Update failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-4 lg:p-6">
      {/* Header */}
   

      {/* Filters Section (Matching JobApplicants) */}
      <div className="p-3 mb-4 bg-white rounded-lg shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dept:</span>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="pl-12 pr-6 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer appearance-none bg-gray-50/50 min-w-[140px]"
              >
                {["All", ...new Set(employees.map(emp => (emp.department || emp.dept || 'General').trim()))].sort().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="pl-12 pr-6 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer appearance-none bg-gray-50/50 min-w-[140px]"
              >
                {["All", ...new Set(jobs.map(job => job.role))].sort().map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            {(selectedDepartment !== "All" || selectedRole !== "All") && (
                <button
                    onClick={() => { setSelectedDepartment("All"); setSelectedRole("All"); }}
                    className="h-7 px-3 text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition-colors uppercase tracking-wider"
                >
                    Clear
                </button>
            )}
        </div>
        
        <button
          onClick={() => navigate('/post-new-job')}
          className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap"
        >
          <FiPlus size={14} />
          Post New Job
        </button>
      </div>

      {(() => {
        const displayedJobs = jobs.filter(job => {
          let deptMatch = false;
          if (selectedDepartment === "All") {
              deptMatch = true;
          } else {
              const jobDept = (job.department || "General").trim().toLowerCase();
              const selDept = selectedDepartment.trim().toLowerCase();
              if (jobDept === selDept) deptMatch = true;
              else if (jobDept === "general") {
                  deptMatch = getEmployeeCount(selectedDepartment, job.role) > 0;
              }
          }
          
          const roleMatch = selectedRole === "All" || job.role === selectedRole;
          
          return deptMatch && roleMatch;
        });
        return (
          <>
            {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-sm animate-pulse">Synchronizing records...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <FiBriefcase className="text-gray-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No Job Positions Yet</h3>
          <p className="text-gray-500 text-sm max-w-xs mt-2">Start by posting your first job opening to see statistics here.</p>
          <button
            onClick={() => navigate('/post-new-job')}
            className="mt-6 text-indigo-600 font-bold text-sm hover:underline"
          >
            Create first post
          </button>
        </div>
      ) : (
        <div className="p-0 mb-0 bg-white border shadow-lg rounded-2xl">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="py-2 px-6 text-left font-semibold tracking-wider">Role</th>
                  <th className="py-2 px-6 text-center font-semibold tracking-wider">Hired Positions</th>
                  <th className="py-2 px-6 text-center font-semibold tracking-wider">Salary</th>
                  <th className="py-2 px-6 text-center font-semibold tracking-wider">Skills</th>
                  <th className="py-2 px-6 text-center font-semibold tracking-wider">Vacancies</th>
                  <th className="py-2 px-6 text-center font-semibold tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedJobs.map((job) => {
                  const empCount = getEmployeeCount(job.department, job.role);
                  const isEditingDept = editingJobId === job._id && editingField === 'department';
                  const isEditingTotal = editingJobId === job._id && editingField === 'vacancies';

                  return (
                    <tr key={job._id} className="border-b hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-sm font-bold text-gray-900">{job.role}</span>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] text-gray-400 uppercase tracking-tight">{job.location}</span>
                             <span className="text-gray-300">•</span>
                             {isEditingDept ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-24 px-1 py-0.5 text-[10px] border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-100 outline-none"
                                        autoFocus
                                        placeholder="Dept..."
                                    />
                                    <button onClick={() => saveEdit(job._id)} disabled={saving} className="text-emerald-600"><FiCheck size={12} /></button>
                                    <button onClick={cancelEditing} className="text-rose-600"><FiX size={12} /></button>
                                </div>
                             ) : (
                                <div className="flex items-center gap-1 group/edit-dept">
                                    <span className={`text-[10px] font-semibold transition-colors ${!job.department || job.department === 'General' ? 'text-gray-400 italic' : 'text-indigo-600'}`}>
                                        {job.department || 'General'}
                                    </span>
                                    <button 
                                        onClick={() => startEditing(job, 'department')}
                                        className="text-gray-300 hover:text-indigo-600 opacity-0 group-hover/edit-dept:opacity-100 transition-all"
                                    >
                                        <FiEdit2 size={10} />
                                    </button>
                                </div>
                             )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <FiUsers className="text-gray-400" size={14} />
                          <span className="text-sm font-bold text-gray-600">{empCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="text-sm font-medium text-gray-600">{job.salary || '-'}</span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex flex-wrap justify-center gap-1 max-w-[200px] mx-auto">
                          {job.skills ? job.skills.split(',').map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-medium truncate max-w-[80px]">
                              {skill.trim()}
                            </span>
                          )) : <span className="text-gray-400">-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <FiBriefcase className="text-gray-300" size={14} />
                          {isEditingTotal ? (
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-16 px-2 py-1 text-sm border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-100 outline-none"
                                    min="0"
                                    autoFocus
                                />
                                <button onClick={() => saveEdit(job._id)} disabled={saving} className="p-1 text-emerald-600"><FiCheck size={14} /></button>
                                <button onClick={cancelEditing} className="p-1 text-rose-600"><FiX size={14} /></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group/edit-total">
                                <span className="text-sm font-medium text-gray-600">{job.vacancies ?? ""}</span>
                                <button 
                                    onClick={() => startEditing(job, 'vacancies')}
                                    className="p-1 text-gray-300 hover:text-indigo-600 opacity-0 group-hover/edit-total:opacity-100 transition-all"
                                >
                                    <FiEdit2 size={12} />
                                </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                          <div className="flex justify-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  job.status === 'active' 
                                  ? 'bg-emerald-50 text-emerald-600' 
                                  : job.status === 'draft'
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                  {job.status || 'active'}
                              </span>
                              <button 
                                onClick={() => navigate(`/post-new-job?role=${encodeURIComponent(job.role)}&department=${encodeURIComponent(job.department || 'General')}`)}
                                className="px-2 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm border border-indigo-100 flex items-center justify-center gap-1.5 text-[10px] font-bold"
                              >
                                <FiPlus size={10} />
                                Post View
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
      )}
      
      {/* Stats Summary Cards */}
      {!loading && displayedJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <FiUsers size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Active Workforce</p>
                        <h4 className="text-xl font-bold text-gray-900">
                            {employees.length}
                        </h4>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <FiZap size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Planned Positions</p>
                        <h4 className="text-xl font-bold text-gray-900">
                            {displayedJobs.reduce((acc, job) => acc + (job.vacancies ?? 1), 0)}
                        </h4>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <FiTrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fulfillment Rate</p>
                        <h4 className="text-xl font-bold text-gray-900">
                            {(() => {
                                const totalPositions = displayedJobs.reduce((acc, job) => acc + (job.vacancies ?? 1), 0);
                                if (totalPositions === 0) return "0%";
                                const totalActiveMatched = displayedJobs.reduce((acc, job) => acc + getEmployeeCount(job.department, job.role), 0);
                                return `${Math.round((totalActiveMatched / totalPositions) * 100)}%`;
                            })()}
                        </h4>
                    </div>
                </div>
            </div>
        </div>
      )}
          </>
        );
      })()}
    </div>
  );
}

export default JobPositionsStatus;