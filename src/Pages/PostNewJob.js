import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiClipboard,
  FiCode,
  FiDollarSign,
  FiList,
  FiMapPin,
  FiX,
  FiArrowLeft,
  FiSend,
  FiZap,
  FiSearch,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../utils/config";

const API_BASE = API_BASE_URL;

function PostNewJob() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    role: searchParams.get("role") || "",
    description: "",
    skills: "",
    experience: "",
    location: "",
    salary: "",
    department: searchParams.get("department") || "",
    vacancies: 1,
    assessmentIds: [],
  });

  const [quizzes, setQuizzes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingQuizzes, setFetchingQuizzes] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const roleRef = useRef(null);
  const deptRef = useRef(null);

  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
      if (deptRef.current && !deptRef.current.contains(event.target)) {
        setShowDeptDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchQuizzes();
    fetchRoles();
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchQuizzes = async () => {
    setFetchingQuizzes(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/getallquizes`).catch(() => null);
      if (res && res.data && res.data.quizzes) {
        setQuizzes(res.data.quizzes);
      }
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    } finally {
      setFetchingQuizzes(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get("https://api.timelyhealth.in/api/roles/all");
      if (res.data.success || Array.isArray(res.data) || res.data.data) {
        // Handle different possible response structures
        let rolesData = [];
        if (Array.isArray(res.data)) rolesData = res.data;
        else if (Array.isArray(res.data.data)) rolesData = res.data.data;
        else if (Array.isArray(res.data.roles)) rolesData = res.data.roles;
        
        // Ensure we extract the role name correctly (assuming it might be just a string or an object with 'name'/'title'/'role' properties)
        const uniqueRoles = rolesData.map((r, index) => {
            if (typeof r === 'string') return { _id: index, name: r };
            return { _id: r._id || index, name: r.name || r.title || r.role || "Unknown Role" };
        }).filter(r => r.name !== "Unknown Role");
        
        setRoles(uniqueRoles);
      }
    } catch (err) {
      console.error("Failed to fetch roles from TimelyHealth API:", err);
    }
  };
  
  const fetchDepartments = async () => {
    try {
      const res = await axios.get("https://api.timelyhealth.in/api/department/all");
      if (res.data.success || Array.isArray(res.data) || res.data.data) {
        let deptData = [];
        if (Array.isArray(res.data)) deptData = res.data;
        else if (Array.isArray(res.data.data)) deptData = res.data.data;
        else if (Array.isArray(res.data.departments)) deptData = res.data.departments;
        
        const uniqueDepts = deptData.map((d, index) => {
            if (typeof d === 'string') return { _id: index, name: d };
            return { _id: d._id || index, name: d.name || d.departmentName || "Unknown Dept" };
        }).filter(d => d.name !== "Unknown Dept");
        
        setDepartments(uniqueDepts);
      }
    } catch (err) {
      console.error("Failed to fetch departments from TimelyHealth API:", err);
    }
  };

  const fetchEmployees = async () => {
    setFetchingEmployees(true);
    try {
      const res = await axios.get("https://api.timelyhealth.in/api/employees/get-employees");
      const empData = Array.isArray(res.data) ? res.data : res.data.employees || res.data.data || [];
      setEmployees(empData);
    } catch (err) {
      console.error("Failed to fetch employees from TimelyHealth API:", err);
    } finally {
      setFetchingEmployees(false);
    }
  };

  // Reflect correct department based on role from employees list
  useEffect(() => {
    if (formData.role && (formData.department === "General" || !formData.department) && employees.length > 0) {
      const roleToMatch = formData.role.toLowerCase().trim();
      const matchedEmp = employees.find(emp => {
        const empRole = (emp.role || emp.position || emp.designation || "").toLowerCase().trim();
        return empRole.includes(roleToMatch) || roleToMatch.includes(empRole);
      });

      if (matchedEmp) {
        const matchedDept = (matchedEmp.department || matchedEmp.dept || "").trim();
        if (matchedDept && matchedDept.toLowerCase() !== "general") {
          setFormData(prev => ({ ...prev, department: matchedDept }));
        }
      }
    }
  }, [formData.role, employees]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssessmentToggle = (assessmentId) => {
    setFormData((prev) => {
      const current = prev.assessmentIds;
      return {
        ...prev,
        assessmentIds: current.includes(assessmentId)
          ? current.filter((id) => id !== assessmentId)
          : [...current, assessmentId],
      };
    });
  };

  const handleSubmit = async (e, status = "active") => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post(`${API_BASE}/jobs/create`, { 
        ...formData, 
        status,
        clientId 
      });
      if (response.data.success) {
        setMessage({ type: "success", text: status === "draft" ? "Job saved as draft!" : "Job posted successfully!" });
        setTimeout(() => navigate("/job-post"), 1800);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to create job post.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const sortedQuizzes = [...quizzes].sort((a, b) => {
    const roleA = (a.role || a.category || "").toLowerCase();
    const roleB = (b.role || b.category || "").toLowerCase();
    const target = formData.role.toLowerCase();
    if (target) {
      if (roleA === target && roleB !== target) return -1;
      if (roleB === target && roleA !== target) return 1;
    }
    return 0;
  });

  const filteredQuizzes = sortedQuizzes.filter(quiz => 
    (quiz.topic || quiz.title || "").toLowerCase().includes(assessmentSearch.toLowerCase()) ||
    (quiz.role || quiz.category || "").toLowerCase().includes(assessmentSearch.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-4 lg:p-6">
      {/* Page Header */}
      {/* <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <FiArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back
        </button>
        <div className="h-4 w-px bg-gray-300" />
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Post New Opening</h1>
          <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest font-medium">
            Configure recruitment details
          </p>
        </div>
      </div> */}

      {/* Status Message */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-rose-50 text-rose-600 border border-rose-100"
          }`}
        >
          {message.type === "success" ? (
            <FiCheckCircle size={18} />
          ) : (
            <FiX size={18} />
          )}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column – Core Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FiBriefcase size={15} className="text-indigo-600" />
                </div>
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
                  Job Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Job Role */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Job Position <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group" ref={roleRef}>
                    <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" size={15} />
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={(e) => {
                        handleChange(e);
                        setShowRoleDropdown(true);
                      }}
                      onFocus={() => setShowRoleDropdown(true)}
                      required
                      autoComplete="off"
                      className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                      placeholder="Enter or search position..."
                    />
                    {showRoleDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto no-scrollbar">
                        {roles.filter(r => r.name.toLowerCase().includes(formData.role.toLowerCase())).length === 0 ? (
                          <div className="p-3 text-xs text-gray-500 text-center">No existing roles match</div>
                        ) : (
                          roles.filter(r => r.name.toLowerCase().includes(formData.role.toLowerCase())).map((role) => (
                            <div
                              key={role._id}
                              className="px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, role: role.name }));
                                setShowRoleDropdown(false);
                              }}
                            >
                              {role.name}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Salary */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Salary / Package
                  </label>
                  <div className="relative group">
                    <FaRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={15} />
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800"
                      placeholder="5 - 12 LPA"
                    />
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Experience Required <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white appearance-none"
                  >
                    <option value="">Select Experience</option>
                    <option value="Fresher">Fresher</option>
                    <option value="0-1">0-1 Years</option>
                    <option value="1-2">1-2 Years</option>
                    <option value="2-3">2-3 Years</option>
                    <option value="3-4">3-4 Years</option>
                    <option value="5+">5+ Years</option>
                  </select>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={15} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800"
                      placeholder="Hyderabad / Remote"
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group" ref={deptRef}>
                    <FiList className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" size={15} />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={(e) => {
                        handleChange(e);
                        setShowDeptDropdown(true);
                      }}
                      onFocus={() => setShowDeptDropdown(true)}
                      required
                      autoComplete="off"
                      className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                      placeholder="Enter or search department..."
                    />
                    {showDeptDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto no-scrollbar">
                        {departments.filter(d => d.name.toLowerCase().includes(formData.department.toLowerCase())).length === 0 ? (
                          <div className="p-3 text-xs text-gray-500 text-center">No existing departments match</div>
                        ) : (
                          departments.filter(d => d.name.toLowerCase().includes(formData.department.toLowerCase())).map((dept) => (
                            <div
                              key={dept._id}
                              className="px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, department: dept.name }));
                                setShowDeptDropdown(false);
                              }}
                            >
                              {dept.name}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Vacancies */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Vacancies <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <FiZap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={15} />
                    <input
                      type="number"
                      name="vacancies"
                      value={formData.vacancies}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800"
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-1.5 mt-5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Required Skills <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <FiCode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={15} />
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800"
                    placeholder="Communication Skills, Positive Attitude, Ready to learn"
                  />
                </div>
                <p className="text-[10px] text-gray-400">Separate multiple skills with commas</p>
              </div>
            </div>

            {/* Job Description Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FiList size={15} className="text-blue-600" />
                </div>
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
                  Job Description
                </h2>
              </div>
              <div className="relative group">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={7}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 resize-none"
                  placeholder="Describe the role responsibilities, key objectives, team context, and growth opportunities..."
                />
              </div>
            </div>
          </div>

          {/* Right Column – Assessments + Actions */}
          <div className="space-y-6">

            {/* Assessments Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <FiClipboard size={15} className="text-emerald-600" />
                </div>
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
                  Assessments
                </h2>
              </div>
              <p className="text-[10px] text-gray-400 mb-3 ml-10">
                Link multiple assessments to this job
              </p>

              <div className="relative mb-4">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors z-10" size={14} />
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={assessmentSearch}
                  onChange={(e) => setAssessmentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none text-[11px] text-gray-800"
                />
              </div>

              {fetchingQuizzes ? (
                <div className="flex items-center gap-2 py-4 justify-center">
                  <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <span className="text-xs text-gray-400">Syncing banks...</span>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-8">
                  <FiClipboard className="mx-auto text-3xl text-gray-200 mb-2" />
                  <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                    No Assessments Available
                  </p>
                  <p className="text-[9px] text-gray-400 mt-1">
                    Create assessments in the manager first.
                  </p>
                </div>
              ) : filteredQuizzes.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                    No results found
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
                  {filteredQuizzes.map((quiz) => {
                    const isSelected = formData.assessmentIds.includes(quiz._id);
                    const isSuggested =
                      formData.role &&
                      (quiz.role || quiz.category || "").toLowerCase() ===
                        formData.role.toLowerCase();
                    return (
                      <label
                        key={quiz._id}
                        htmlFor={`quiz-${quiz._id}`}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                            : "bg-gray-50 border-transparent hover:border-gray-200"
                        }`}
                      >
                        <input
                          id={`quiz-${quiz._id}`}
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={() => handleAssessmentToggle(quiz._id)}
                        />
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-medium truncate">{quiz.topic || quiz.title}</span>
                            {isSuggested && (
                              <span className="bg-emerald-100 text-emerald-700 text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter flex-shrink-0">
                                Match
                              </span>
                            )}
                          </div>
                          <span className="text-[9px]  text-gray-800 uppercase tracking-wider mt-0.5">
                            {quiz.role || quiz.category || "General"} · {quiz.experienceLevel || "All"}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {formData.assessmentIds.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-xs text-indigo-600 font-bold">
                    {formData.assessmentIds.length} assessment{formData.assessmentIds.length > 1 ? "s" : ""} linked
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <FiSend size={15} />
                    Post Job Opening
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, "draft")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-indigo-600 text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-all disabled:opacity-60 shadow-sm"
              >
                {loading ? "Saving..." : "Save as Draft"}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                <FiX size={15} />
                Cancel
              </button>

              {/* Quick Tip */}
              <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                <FiZap size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-amber-700">
                  Linking assessments will auto-filter candidates based on their quiz performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default PostNewJob;