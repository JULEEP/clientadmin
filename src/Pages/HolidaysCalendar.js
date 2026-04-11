import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import {
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  differenceInDays,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Edit2,
  Award,
  Sun,
  Building,
  Star,
  Info,
  Save,
  XCircle,
} from "lucide-react";
import { FaCalendarAlt, FaSearch, FaSync, FaTimes } from "react-icons/fa";
import "react-calendar/dist/Calendar.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// API Configuration
const API_BASE_URL = "https://api.timelyhealth.in/api";

// DUMMY DATA FOR FALLBACK
const DUMMY_HOLIDAYS = [
  {
    _id: "dummy_hol_001",
    name: "Republic Day",
    fromDate: "2024-01-26T00:00:00.000Z",
    toDate: "2024-01-26T00:00:00.000Z",
    type: "National Holiday",
    totalDays: 1
  },
  {
    _id: "dummy_hol_002",
    name: "Holi",
    fromDate: "2024-03-25T00:00:00.000Z",
    toDate: "2024-03-25T00:00:00.000Z",
    type: "Festival",
    totalDays: 1
  },
  {
    _id: "dummy_hol_003",
    name: "Independence Day",
    fromDate: "2024-08-15T00:00:00.000Z",
    toDate: "2024-08-15T00:00:00.000Z",
    type: "National Holiday",
    totalDays: 1
  },
  {
    _id: "dummy_hol_004",
    name: "Diwali",
    fromDate: "2024-11-12T00:00:00.000Z",
    toDate: "2024-11-14T00:00:00.000Z",
    type: "Festival",
    totalDays: 3
  },
  {
    _id: "dummy_hol_005",
    name: "Christmas",
    fromDate: "2024-12-25T00:00:00.000Z",
    toDate: "2024-12-25T00:00:00.000Z",
    type: "Observance",
    totalDays: 1
  },
  {
    _id: "dummy_hol_006",
    name: "Company Foundation Day",
    fromDate: "2024-05-10T00:00:00.000Z",
    toDate: "2024-05-10T00:00:00.000Z",
    type: "Company Holiday",
    totalDays: 1
  },
  {
    _id: "dummy_hol_007",
    name: "Gandhi Jayanti",
    fromDate: "2024-10-02T00:00:00.000Z",
    toDate: "2024-10-02T00:00:00.000Z",
    type: "National Holiday",
    totalDays: 1
  },
  {
    _id: "dummy_hol_008",
    name: "Eid al-Fitr",
    fromDate: "2024-04-10T00:00:00.000Z",
    toDate: "2024-04-10T00:00:00.000Z",
    type: "Festival",
    totalDays: 1
  },
];

/* ─── Category Config ─── */
const CATEGORIES = [
  { key: "Festival",          label: "Festival",         color: "#F97316", light: "#FFF7ED", icon: <Award size={10} /> },
  { key: "National Holiday",  label: "National Holiday", color: "#10B981", light: "#ECFDF5", icon: <Sun size={10} /> },
  { key: "Company Holiday",   label: "Company Holiday",  color: "#6366F1", light: "#EEF2FF", icon: <Building size={10} /> },
  { key: "Observance",        label: "Observance",       color: "#8B5CF6", light: "#F5F3FF", icon: <Star size={10} /> },
  { key: "Restricted Holiday",label: "Restricted",       color: "#EC4899", light: "#FDF2F8", icon: <Info size={10} /> },
];

const catOf = (type) => CATEGORIES.find((c) => c.key === type) || CATEGORIES[0];

const tileClass = {
  "Festival":          "tile-festival",
  "National Holiday":  "tile-national",
  "Company Holiday":   "tile-company",
  "Observance":        "tile-observance",
  "Restricted Holiday":"tile-restricted",
};

/* ─────────────────────────────────────── */
const HolidaysCalendar = ({ isEmployeeView = false }) => {
  const isAdmin = !isEmployeeView;

  // Get clientId from localStorage
  const clientId = localStorage.getItem("clientId") || "";
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);

  const [holidays,   setHolidays]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [filter,     setFilter]     = useState("All");
  const [search,     setSearch]     = useState("");
  const [calDate,    setCalDate]    = useState(new Date());
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);

  const [tableSearch, setTableSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [tableFilter, setTableFilter] = useState("All");

  const [form, setForm] = useState({
    name: "",
    fromDate: format(new Date(), "yyyy-MM-dd"),
    toDate:   format(new Date(), "yyyy-MM-dd"),
    type:     "Festival",
  });

  // Load dummy data function
  const loadDummyData = () => {
    console.log("Loading dummy holidays data as fallback");
    setIsUsingDummyData(true);
    setHolidays(DUMMY_HOLIDAYS);
    setLoading(false);
  };

  /* ─── Fetch ─── */
  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      setIsUsingDummyData(false);
      
      if (!clientId) {
        loadDummyData();
        return;
      }
      
      const { data } = await axios.get(`${API_BASE_URL}/holidays/all/${clientId}`);
      if (Array.isArray(data) && data.length > 0) {
        setHolidays(data);
        setIsUsingDummyData(false);
      } else {
        loadDummyData();
      }
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
      toast.error("Failed to load holidays");
      loadDummyData();
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { fetchHolidays(); }, [fetchHolidays]);

  /* ─── Calendar tile colouring ─── */
  const getTileClass = ({ date, view }) => {
    if (view !== "month") return null;
    const match = holidays.find((h) => {
      try {
        return isWithinInterval(startOfDay(date), {
          start: startOfDay(parseISO(h.fromDate)),
          end:   startOfDay(parseISO(h.toDate)),
        });
      } catch { return false; }
    });
    return match ? `hl-tile ${tileClass[match.type] || "tile-festival"}` : null;
  };

  /* ─── Date click ─── */
  const onDayClick = (date) => {
    setCalDate(date);
    if (!isAdmin) return;
    const existing = holidays.find((h) => {
      try {
        return isWithinInterval(startOfDay(date), {
          start: startOfDay(parseISO(h.fromDate)),
          end:   startOfDay(parseISO(h.toDate)),
        });
      } catch { return false; }
    });
    if (existing) {
      setEditingId(existing._id);
      setForm({
        name:     existing.name,
        fromDate: format(parseISO(existing.fromDate), "yyyy-MM-dd"),
        toDate:   format(parseISO(existing.toDate),   "yyyy-MM-dd"),
        type:     existing.type || "Festival",
      });
    } else {
      setEditingId(null);
      setForm({ name: "", fromDate: format(date, "yyyy-MM-dd"), toDate: format(date, "yyyy-MM-dd"), type: "Festival" });
    }
    setShowForm(true);
  };

  const openNewForm = () => {
    setEditingId(null);
    setForm({ name: "", fromDate: format(new Date(), "yyyy-MM-dd"), toDate: format(new Date(), "yyyy-MM-dd"), type: "Festival" });
    setShowForm(true);
  };

  const openEditForm = (hol) => {
    setEditingId(hol._id);
    setForm({
      name:     hol.name,
      fromDate: format(parseISO(hol.fromDate), "yyyy-MM-dd"),
      toDate:   format(parseISO(hol.toDate),   "yyyy-MM-dd"),
      type:     hol.type || "Festival",
    });
    setShowForm(true);
  };

  /* ─── Save ─── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (new Date(form.fromDate) > new Date(form.toDate)) {
      toast.error("'From' date cannot be after 'To' date");
      return;
    }
    
    if (isUsingDummyData) {
      const newHoliday = {
        _id: editingId || `dummy_hol_${Date.now()}`,
        name: form.name,
        fromDate: new Date(form.fromDate).toISOString(),
        toDate: new Date(form.toDate).toISOString(),
        type: form.type,
        totalDays: differenceInDays(parseISO(form.toDate), parseISO(form.fromDate)) + 1,
      };
      
      if (editingId) {
        setHolidays(holidays.map(h => h._id === editingId ? newHoliday : h));
        toast.success("Holiday updated (Demo Mode)!");
      } else {
        setHolidays([...holidays, newHoliday]);
        toast.success(`✅ ${form.name} saved to calendar (Demo Mode)!`);
      }
      setShowForm(false);
      setEditingId(null);
      return;
    }
    
    try {
      setSaving(true);
      const payload = {
        ...form,
        totalDays: differenceInDays(parseISO(form.toDate), parseISO(form.fromDate)) + 1,
        clientId
      };
      if (editingId) {
        await axios.put(`${API_BASE_URL}/holidays/${clientId}/${editingId}`, payload);
        toast.success("Holiday updated!");
      } else {
        await axios.post(`${API_BASE_URL}/holidays/add/${clientId}`, payload);
        toast.success(`✅ ${form.name} saved to calendar!`);
      }
      setShowForm(false);
      setEditingId(null);
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Delete ─── */
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this holiday?")) return;
    
    if (isUsingDummyData) {
      setHolidays(holidays.filter(h => h._id !== id));
      toast.success("Holiday removed (Demo Mode)");
      setShowForm(false);
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/holidays/${clientId}/${id}`);
      toast.success("Holiday removed");
      setShowForm(false);
      fetchHolidays();
    } catch {
      toast.error("Failed to delete");
    }
  };

  /* ─── Filtered list ─── */
  const listed = holidays
    .filter((h) => filter === "All" || h.type === filter)
    .filter((h) =>
      !search || h.name?.toLowerCase().includes(search.toLowerCase()) || h.type?.toLowerCase().includes(search.toLowerCase())
    );

  const tableListed = holidays
    .filter((h) => tableFilter === "All" || h.type === tableFilter)
    .filter((h) => !tableSearch || h.name?.toLowerCase().includes(tableSearch.toLowerCase()))
    .filter((h) => monthFilter === "" || new Date(h.fromDate).getMonth().toString() === monthFilter);

  const totalDays = form.fromDate && form.toDate
    ? differenceInDays(parseISO(form.toDate), parseISO(form.fromDate)) + 1
    : 1;

  const selCat = catOf(form.type);

  /* ─────────── RENDER ─────────── */
  return (
    <div className="min-h-screen p-1.5 bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ─── Calendar CSS ─── */}
      <style>{`
        .react-calendar{width:100%;border:none!important;border-radius:.375rem;padding:0.75rem;background:white;font-family:inherit;font-size:.7rem;}
        .react-calendar__navigation{margin-bottom:0.75rem;}
        .react-calendar__navigation button{font-weight:700!important;color:#1e293b!important;font-size:.75rem!important;border-radius:.25rem!important;min-width:32px;}
        .react-calendar__navigation button:hover,.react-calendar__navigation button:focus{background:#f1f5f9!important;}
        .react-calendar__month-view__weekdays__weekday{color:#94a3b8;font-weight:700;font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;padding:.25rem 0;}
        .react-calendar__month-view__weekdays__weekday abbr{text-decoration:none!important;}
        .react-calendar__month-view__days__day--neighboringMonth{opacity:.25!important;}
        .react-calendar__tile{padding:.4rem .2rem;border-radius:.25rem!important;font-size:.7rem;font-weight:500;color:#475569;position:relative;transition:all .12s;}
        .react-calendar__tile:enabled:hover,.react-calendar__tile:enabled:focus{background:#dbeafe!important;color:#1d4ed8!important;}
        .react-calendar__tile--now{background:transparent!important;color:#2563eb!important;font-weight:900!important;box-shadow:inset 0 0 0 2px #bfdbfe;}
        .react-calendar__tile--active,.react-calendar__tile--active:enabled:hover{background:linear-gradient(to right,#22c55e,#2563eb)!important;color:white!important;box-shadow:0 2px 8px rgba(37,99,235,.3)!important;}

        .hl-tile{font-weight:800!important;}
        .hl-tile::after{content:'';position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;}

        .tile-festival{background:#fff7ed!important;color:#f97316!important;}.tile-festival::after{background:#f97316;}
        .tile-national{background:#ecfdf5!important;color:#10b981!important;}.tile-national::after{background:#10b981;}
        .tile-company{background:#eef2ff!important;color:#6366f1!important;}.tile-company::after{background:#6366f1;}
        .tile-observance{background:#f5f3ff!important;color:#8b5cf6!important;}.tile-observance::after{background:#8b5cf6;}
        .tile-restricted{background:#fdf2f8!important;color:#ec4899!important;}.tile-restricted::after{background:#ec4899;}

        .react-calendar__tile--active.hl-tile{color:white!important;}
        .react-calendar__tile--active.hl-tile::after{background:white!important;}
      `}</style>

      <div className="mx-auto max-w-9xl">
        
        {/* Demo Mode Banner - Smaller */}
        {isUsingDummyData && (
          <div className="mb-2 p-1.5 text-[10px] text-yellow-700 bg-yellow-50 border border-yellow-300 rounded">
            <span className="font-medium">⚠️ Demo Mode:</span> Showing sample holiday data. API connection may be unavailable.
          </div>
        )}
        
        {/* Client Info Banner - Smaller */}
        {clientId && !isUsingDummyData && (
          <div className="mb-2 p-1.5 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between">
              <div><p className="text-[10px] font-medium text-gray-700">Client: {clientId.substring(0, 8)}...</p></div>
              <div><p className="text-[10px] text-gray-500">Holidays: {holidays.length}</p></div>
            </div>
          </div>
        )}

        {/* ─── TOP FILTER/CONTROL BAR - Smaller ─── */}
        <div className="p-2 mb-3 bg-white rounded-lg shadow border border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5">

            {/* Title */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-gray-200">
              <FaCalendarAlt className="text-xs text-blue-600" />
              <h1 className="text-[11px] font-bold tracking-widest text-gray-800 uppercase">Holiday Calendar</h1>
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[150px]">
              <FaSearch className="absolute text-[9px] text-gray-400 transform -translate-y-1/2 left-1.5 top-1/2" />
              <input
                type="text"
                placeholder="Search holiday name or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-6 pr-6 py-1 text-[9px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              />
              {search && (
                <FaTimes
                  className="absolute text-[9px] text-gray-400 transform -translate-y-1/2 cursor-pointer right-1.5 top-1/2 hover:text-red-500"
                  onClick={() => setSearch("")}
                />
              )}
            </div>

            {/* Category Filter - Smaller */}
            <div className="flex flex-wrap items-center gap-0.5">
              {["All", ...CATEGORIES.map((c) => c.key)].map((key) => {
                const c = CATEGORIES.find((x) => x.key === key);
                const active = filter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`h-6 px-1.5 text-[9px] font-bold rounded transition border ${
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {c?.label?.substring(0, 8) || "All"}
                  </button>
                );
              })}
            </div>

            {/* Count badge - Smaller */}
            <div className="flex items-center gap-0.5 border border-blue-200 bg-blue-50 rounded px-1.5 h-6">
              <span className="text-[8px] font-bold text-blue-600 uppercase">Total:</span>
              <span className="text-[9px] font-black text-blue-700">{listed.length}</span>
            </div>

            {/* Sync - Smaller */}
            <button
              onClick={() => { setSearch(""); setFilter("All"); fetchHolidays(); }}
              className="flex items-center gap-0.5 h-6 px-2 text-[9px] font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
            >
              <FaSync className={`text-[8px] ${loading ? "animate-spin" : ""}`} /> Sync
            </button>

            {/* Add Holiday - Smaller */}
            {isAdmin && (
              <button
                onClick={openNewForm}
                className="flex items-center gap-0.5 h-6 px-2 text-[9px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                + Add
              </button>
            )}
          </div>
        </div>

        {/* ─── MAIN GRID: Calendar + Form on left, Sidebar on right ─── */}
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 mb-3">

          {/* LEFT: Calendar */}
          <div className="lg:col-span-7 space-y-2">

            {/* Admin tip - Smaller */}
            {isAdmin && !showForm && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white rounded-lg shadow-sm border border-blue-100 text-[10px] text-blue-700 font-medium">
                <span>👆</span>
                <span>Click any <strong>date</strong> on the calendar to mark it as a holiday</span>
              </div>
            )}

            {/* Calendar Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
              <Calendar
                onClickDay={onDayClick}
                value={calDate}
                tileClassName={getTileClass}
                next2Label={null}
                prev2Label={null}
              />
              {/* Color Legend - Smaller */}
              <div className="px-3 pb-2 flex flex-wrap gap-x-3 gap-y-0.5 border-t border-gray-100 pt-1.5">
                {CATEGORIES.map((c) => (
                  <span key={c.key} className="flex items-center gap-0.5 text-[8px] font-bold" style={{ color: c.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Inline Form - Smaller */}
            <AnimatePresence>
              {showForm && isAdmin && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white rounded-lg shadow overflow-hidden border border-blue-200"
                >
                  {/* Form header - Smaller */}
                  <div
                    className="px-3 py-2 flex items-center justify-between"
                    style={{ backgroundColor: selCat.light }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ backgroundColor: selCat.color, color: "white" }}
                      >
                        {selCat.icon}
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: selCat.color }}>
                          {editingId ? "Edit Holiday" : "New Holiday"}
                        </p>
                        <p className="text-[10px] font-black text-gray-800">
                          {format(calDate, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                      <XCircle size={14} />
                    </button>
                  </div>

                  <form onSubmit={handleSave} className="p-3 space-y-2">
                    {/* Name */}
                    <div>
                      <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">
                        Occasion / Holiday Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder='e.g. "Good Friday", "Diwali"…'
                        className="w-full px-2 py-1.5 text-[10px] bg-gray-50 border border-gray-300 focus:border-blue-500 rounded font-semibold text-gray-800 outline-none transition"
                      />
                    </div>

                    {/* Category - Smaller */}
                    <div>
                      <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">
                        Category *
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                        {CATEGORIES.map((c) => (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => setForm({ ...form, type: c.key })}
                            className="flex items-center justify-center gap-0.5 px-1.5 py-1 rounded text-[8px] font-black uppercase tracking-wider border transition"
                            style={
                              form.type === c.key
                                ? { backgroundColor: c.color, color: "white", borderColor: c.color }
                                : { backgroundColor: c.light, color: c.color, borderColor: c.light }
                            }
                          >
                            {c.icon} {c.label.substring(0, 6)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Range - Smaller */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">From *</label>
                        <input
                          required type="date"
                          value={form.fromDate}
                          onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                          className="w-full px-2 py-1.5 text-[10px] bg-gray-50 border border-gray-300 focus:border-blue-500 rounded font-semibold outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">To *</label>
                        <input
                          required type="date"
                          value={form.toDate}
                          min={form.fromDate}
                          onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                          className="w-full px-2 py-1.5 text-[10px] bg-gray-50 border border-gray-300 focus:border-blue-500 rounded font-semibold outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Preview - Smaller */}
                    <div
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[9px] font-bold"
                      style={{ backgroundColor: selCat.light, color: selCat.color }}
                    >
                      {selCat.icon}
                      <span>{form.name || "Holiday"} · <strong>{totalDays}</strong> day{totalDays > 1 ? "s" : ""}</span>
                    </div>

                    {/* Buttons - Smaller */}
                    <div className="flex gap-1.5 pt-1">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-600 text-white text-[9px] font-black rounded hover:bg-blue-700 disabled:opacity-60 transition"
                      >
                        <Save size={11} />
                        {saving ? "Saving…" : editingId ? "Update" : "Save"}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => handleDelete(editingId)}
                          className="px-2 py-1.5 text-[9px] text-red-500 border border-red-200 font-black rounded hover:bg-red-50 transition"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-2 py-1.5 text-[9px] text-gray-400 border border-gray-200 font-black rounded hover:bg-gray-50 transition"
                      >
                        <XCircle size={11} />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Sidebar - Smaller */}
          <div className="lg:col-span-5 space-y-2">

            {/* Stats row - Smaller */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="px-2 py-1.5 bg-gradient-to-r from-green-500 to-blue-600 rounded text-white shadow flex items-center justify-between">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/70">Total</p>
                <h3 className="text-base font-black">{holidays.length}</h3>
              </div>
              <div className="px-2 py-1.5 bg-white rounded border border-gray-100 shadow flex items-center justify-between">
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Upcoming</p>
                <h3 className="text-base font-black text-green-600">
                  {holidays.filter((h) => { try { return parseISO(h.fromDate) >= startOfDay(new Date()); } catch { return false; } }).length}
                </h3>
              </div>
            </div>

            {/* Category breakdown - Smaller */}
            <div className="bg-white rounded shadow p-2">
              <h3 className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-2">By Category</h3>
              <div className="space-y-1.5">
                {CATEGORIES.map((c) => {
                  const count = holidays.filter((h) => h.type === c.key).length;
                  return (
                    <div key={c.key} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.light, color: c.color }}>
                        {c.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[9px] font-bold text-gray-600">{c.label}</span>
                          <span className="text-[9px] font-black" style={{ color: c.color }}>{count}</span>
                        </div>
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: holidays.length ? `${(count / holidays.length) * 100}%` : "0%", backgroundColor: c.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ─── HOLIDAY TABLE - Smaller ─── */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow border border-gray-100">

          {/* Table Filter Bar - Smaller */}
          <div className="p-2 border-b border-gray-200 bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-1.5">

              {/* Search */}
              <div className="relative flex-1 min-w-[150px]">
                <FaSearch className="absolute text-[9px] text-gray-400 transform -translate-y-1/2 left-1.5 top-1/2" />
                <input
                  type="text"
                  placeholder="Search holiday name..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full pl-6 pr-6 py-1 text-[9px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                />
                {tableSearch && (
                  <FaTimes
                    className="absolute text-[9px] text-gray-400 transform -translate-y-1/2 cursor-pointer right-1.5 top-1/2 hover:text-red-500"
                    onClick={() => setTableSearch("")}
                  />
                )}
              </div>

              {/* Month Filter - Smaller */}
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="h-6 px-1.5 text-[9px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white text-gray-700"
              >
                <option value="">All Months</option>
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>

              {/* Category filter tabs - Smaller */}
              <div className="flex flex-wrap items-center gap-0.5">
                {["All", ...CATEGORIES.map((c) => c.key)].map((key) => {
                  const c = CATEGORIES.find((x) => x.key === key);
                  const active = tableFilter === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setTableFilter(key)}
                      className={`h-6 px-1.5 text-[8px] font-bold rounded transition border ${
                        active
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {c?.label?.substring(0, 6) || "All"}
                    </button>
                  );
                })}
              </div>

              {/* Count - Smaller */}
              <div className="flex items-center gap-0.5 border border-blue-200 bg-blue-50 rounded px-1.5 h-6 ml-auto">
                <span className="text-[8px] font-bold text-blue-600 uppercase">Found:</span>
                <span className="text-[9px] font-black text-blue-700">{tableListed.length}</span>
              </div>

              {/* Clear filters - Smaller */}
              {(tableSearch || monthFilter !== "" || tableFilter !== "All") && (
                <button
                  onClick={() => { setTableSearch(""); setMonthFilter(""); setTableFilter("All"); }}
                  className="h-6 px-2 text-[8px] font-bold text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left bg-white">
              <thead className="text-[9px] font-semibold tracking-wide text-left text-white uppercase bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="px-2 py-2 text-center">#</th>
                  <th className="px-2 py-2 text-center">Holiday / Occasion</th>
                  <th className="px-2 py-2 text-center">Category</th>
                  <th className="px-2 py-2 text-center">From Date</th>
                  <th className="px-2 py-2 text-center">To Date</th>
                  <th className="px-2 py-2 text-center">Days</th>
                  {isAdmin && <th className="px-2 py-2 text-center">Actions</th>}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="px-2 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[9px] font-bold text-gray-400 tracking-widest">LOADING…</span>
                      </div>
                    </td>
                  </tr>
                ) : tableListed.length > 0 ? (
                  tableListed.map((hol, i) => {
                    const c = catOf(hol.type);
                    return (
                      <tr key={hol._id} className="hover:bg-blue-50/50 transition-colors text-[10px]">
                        <td className="px-2 py-2 text-center text-gray-500 font-bold border-b border-gray-100">
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="px-2 py-2 text-center font-medium text-gray-900 whitespace-nowrap border-b border-gray-100">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.light, color: c.color }}>
                              {c.icon}
                            </span>
                            {hol.name}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center border-b border-gray-100">
                          <span
                            className="px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-sm"
                            style={{ backgroundColor: c.light, color: c.color, border: `1px solid ${c.color}30` }}
                          >
                            {hol.type?.substring(0, 10)}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600 font-medium border-b border-gray-100">
                          {format(parseISO(hol.fromDate), "dd MMM yyyy")}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600 font-medium border-b border-gray-100">
                          {format(parseISO(hol.toDate), "dd MMM yyyy")}
                        </td>
                        <td className="px-2 py-2 text-center border-b border-gray-100">
                          <span className="px-1.5 py-0.5 bg-blue-100/50 text-blue-700 rounded-full text-[9px] font-bold shadow-sm border border-blue-200">
                            {hol.totalDays}d
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-2 py-2 text-center whitespace-nowrap border-b border-gray-100">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditForm(hol)}
                                className="p-0.5 text-yellow-500 transition-colors hover:text-yellow-700"
                                title="Edit"
                              >
                                <Edit2 size={11} />
                              </button>
                              <button
                                onClick={() => handleDelete(hol._id)}
                                className="p-0.5 text-red-500 transition-colors hover:text-red-700"
                                title="Delete"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="px-2 py-6 text-center text-[10px] text-gray-500 font-bold">
                      No holidays found.{isAdmin && " Click any date on the calendar to add one!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HolidaysCalendar;