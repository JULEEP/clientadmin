import axios from "axios";
import {
  Activity,
  MapPin,
  Phone,
  Search,
  Trash2,
  Users,
  Calendar,
  Clock,
  Filter,
  User
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BmiDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [camps, setCamps] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCampId, setSelectedCampId] = useState("all");
  const [activeToday, setActiveToday] = useState(0);

  // Client ID get function
  const getClientId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clientId') || '';
    }
    return '';
  };

  /* ================= FETCH ================= */
  const fetchPatients = async () => {
    try {
      const clientId = getClientId();
      if (!clientId) {
        console.error("No clientId found");
        alert("Please login first");
        return;
      }

      // ✅ clientId को URL parameter में भेजें
      const res = await axios.get(`http://localhost:5000/api/patients/${clientId}`);
      setPatients(res.data);

      const today = new Date().toDateString();
      setActiveToday(
        res.data.filter(
          (p) => new Date(p.createdAt).toDateString() === today
        ).length
      );
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCamps = async () => {
    try {
      const clientId = getClientId();
      if (!clientId) {
        console.error("No clientId found");
        return;
      }

      // ✅ clientId को query parameter में भेजें
      const res = await axios.get(`http://localhost:5000/api/camps/allcamps?clientId=${clientId}`);
      setCamps(res.data || []);
    } catch (err) {
      console.error("Error fetching camps:", err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchCamps();
  }, []);

  // Filter for My Assigned Camps
  const employeeName = localStorage.getItem("employeeName");
  const myAssignedCamps = camps.filter(camp =>
    camp.volunteers && camp.volunteers.includes(employeeName)
  );

  /* ================= DELETE ================= */
  const deletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/patients/${id}`);
      fetchPatients();
    } catch (err) {
      console.error("Error deleting patient:", err);
      alert("Failed to delete patient");
    }
  };

  /* ================= FILTER ================= */
  const filteredPatients = patients.filter((p) => {
    const matchSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCamp =
      selectedCampId === "all"
        ? true
        : p.campId?._id === selectedCampId;

    return matchSearch && matchCamp;
  });

  /* ================= STATS ================= */
  const totalCamps = camps.length;
  const totalPatients = patients.length;
  const recentPatients = activeToday;

  // Client ID display
  const clientId = getClientId();

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Overview of camps and patients</p>
            {clientId && (
              <div className="mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block">
                Client ID: {clientId.slice(0, 8)}...
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search patients by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>

            <button
              onClick={() => setSelectedCampId("all")}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition
                ${selectedCampId === "all"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              All Camps
            </button>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Camps"
          value={totalCamps}
          icon={MapPin}
          iconBg="bg-gradient-to-br from-purple-500 to-indigo-500"
        />
        <StatsCard
          title="Active Camps"
          value={camps.length}
          icon={Activity}
          iconBg="bg-gradient-to-br from-indigo-500 to-blue-500"
        />
        <StatsCard
          title="Total Patients"
          value={totalPatients}
          icon={Users}
          iconBg="bg-gradient-to-br from-sky-500 to-cyan-500"
        />
        <StatsCard
          title="Today"
          value={recentPatients}
          icon={Activity}
          iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
        />
      </div>

      {/* ================= CAMPS SECTION ================= */}
      <div className="space-y-6">
        {/* MY ASSIGNED CAMPS SECTION */}
        {myAssignedCamps.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <User size={16} className="text-indigo-600" />
                </div>
                My Assigned Camps ({myAssignedCamps.length})
              </h3>
              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                Employee: {employeeName || "Unknown"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {myAssignedCamps.map((camp) => (
                <div
                  key={camp._id}
                  onClick={() => setSelectedCampId(camp._id)}
                  className={`cursor-pointer p-3 rounded-xl border transition-all text-sm
                  ${selectedCampId === camp._id
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-white hover:border-indigo-300 hover:shadow-sm"
                    }`}
                >
                  <h4 className="font-semibold truncate text-sm">{camp.name}</h4>
                  <div className={`mt-2 flex items-center gap-1.5 text-xs
                    ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                    <MapPin size={12} />
                    <span className="truncate">{camp.location}</span>
                  </div>
                  <div className={`mt-1 flex items-center gap-1.5 text-xs
                    ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                    <Calendar size={12} />
                    <span>{camp.date ? new Date(camp.date).toLocaleDateString('en-IN') : "No date"}</span>
                  </div>
                  {camp.volunteers && camp.volunteers.length > 0 && (
                    <div className={`mt-2 text-xs ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-600"}`}>
                      <div className="flex items-center gap-1 mb-1">
                        <Users size={10} />
                        <span className="font-medium">Volunteers:</span>
                      </div>
                      <div className="pl-3 space-y-0.5">
                        {camp.volunteers.slice(0, 2).map((volunteer, idx) => (
                          <div key={idx} className="truncate" title={volunteer}>
                            • {volunteer}
                          </div>
                        ))}
                        {camp.volunteers.length > 2 && (
                          <div className="text-xs opacity-70">
                            +{camp.volunteers.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded
                    ${selectedCampId === camp._id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                    }`}>
                    {patients.filter((p) => p.campId?._id === camp._id).length} patients
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALL CAMPS SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <MapPin size={16} className="text-blue-600" />
              </div>
              All Camps ({camps.length})
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Filter size={12} />
              <span>Filter by clicking camp</span>
            </div>
          </div>
          {camps.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border">
              <div className="text-4xl mb-2">🏕️</div>
              <p className="text-sm font-medium text-gray-600">No camps found</p>
              <p className="text-xs text-gray-400 mt-1">Create a camp to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {camps.map((camp) => (
                <div
                  key={camp._id}
                  onClick={() => setSelectedCampId(camp._id)}
                  className={`cursor-pointer p-3 rounded-xl border transition-all text-sm
                  ${selectedCampId === camp._id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white hover:border-blue-300 hover:shadow-sm"
                  }`}
                >
                  <h4 className="font-semibold truncate text-sm">{camp.name}</h4>
                  <div className={`mt-2 flex items-center gap-1.5 text-xs
                    ${selectedCampId === camp._id ? "text-blue-100" : "text-gray-500"}`}>
                    <MapPin size={12} />
                    <span className="truncate">{camp.location}</span>
                  </div>
                  <div className={`mt-1 flex items-center gap-1.5 text-xs
                    ${selectedCampId === camp._id ? "text-blue-100" : "text-gray-500"}`}>
                    <Calendar size={12} />
                    <span>{camp.date ? new Date(camp.date).toLocaleDateString('en-IN') : "No date"}</span>
                  </div>
                  {camp.volunteers && camp.volunteers.length > 0 && (
                    <div className={`mt-2 text-xs ${selectedCampId === camp._id ? "text-blue-100" : "text-gray-600"}`}>
                      <div className="flex items-center gap-1 mb-1">
                        <Users size={10} />
                        <span className="font-medium">Volunteers:</span>
                      </div>
                      <div className="pl-3 space-y-0.5">
                        {camp.volunteers.slice(0, 2).map((volunteer, idx) => (
                          <div key={idx} className="truncate" title={volunteer}>
                            • {volunteer}
                          </div>
                        ))}
                        {camp.volunteers.length > 2 && (
                          <div className="text-xs opacity-70">
                            +{camp.volunteers.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded
                    ${selectedCampId === camp._id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                    }`}>
                    {patients.filter((p) => p.campId?._id === camp._id).length} patients
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= PATIENTS ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Users size={16} className="text-green-600" />
            </div>
            Patients ({filteredPatients.length})
            {selectedCampId !== "all" && (
              <span className="text-xs text-gray-500 ml-2 px-2 py-0.5 bg-gray-100 rounded">
                Filtered by camp
              </span>
            )}
          </h3>
          <div className="text-xs text-gray-500">
            Showing {filteredPatients.length} of {patients.length} patients
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <span className="ml-2 text-sm text-gray-500">Loading patients...</span>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <div className="text-4xl mb-2">👤</div>
            <p className="text-sm font-medium text-gray-600">No patients found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="bg-white rounded-xl border shadow-sm p-4 relative hover:shadow-md transition-shadow"
              >
                {/* Delete Button */}
                <button
                  onClick={() => deletePatient(patient._id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete patient"
                >
                  <Trash2 size={14} />
                </button>

                {/* Patient Info */}
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    {patient.name?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate text-gray-800">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {patient.age} Y • {patient.gender}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <MapPin size={10} />
                      {patient.campId?.name || "No camp"}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-600">
                  <Phone size={12} />
                  <span>{patient.contact || "No contact"}</span>
                </div>

                {/* View Button */}
                <Link
                  to={`/patient/${patient._id}`}
                  className="block mt-4 text-center bg-gradient-to-r from-blue-500 to-blue-600
                    hover:from-blue-600 hover:to-blue-700 transition-all text-white py-2 
                    rounded-lg text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= STATS CARD ================= */
const StatsCard = ({ title, value, icon: Icon, iconBg }) => {
  return (
    <div className="bg-white rounded-xl p-4 border shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default BmiDashboard;