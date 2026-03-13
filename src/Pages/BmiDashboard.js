import axios from "axios";
import {
  Activity,
  MapPin,
  Phone,
  Search,
  Trash2,
  Users
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

  const getClientId = () => localStorage.getItem('clientId') || '';

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientId = getClientId();
        if (!clientId) return;

        const [patientsRes, campsRes] = await Promise.all([
          axios.get(`http://localhost:5001/api/patients/${clientId}`),
          axios.get(`http://localhost:5001/api/camps/allcamps?clientId=${clientId}`)
        ]);

        setPatients(patientsRes.data);
        setCamps(campsRes.data || []);

        const today = new Date().toDateString();
        setActiveToday(patientsRes.data.filter(p => 
          new Date(p.createdAt).toDateString() === today
        ).length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deletePatient = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await axios.delete(`http://localhost:5001/api/patients/${id}`);
    setPatients(prev => prev.filter(p => p._id !== id));
  };

  // Filter patients
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (selectedCampId === "all" || p.campId?._id === selectedCampId)
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6 bg-white p-4 rounded-xl border">
        <h2 className="text-xl font-semibold">BMI Dashboard</h2>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border rounded-lg w-48 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          
          <button
            onClick={() => setSelectedCampId("all")}
            className={`px-3 py-2 text-sm rounded-lg border ${
              selectedCampId === "all" 
                ? "bg-blue-600 text-white" 
                : "bg-white hover:bg-gray-50"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard title="Camps" value={camps.length} icon={MapPin} color="purple" />
        <StatCard title="Active" value={camps.length} icon={Activity} color="blue" />
        <StatCard title="Patients" value={patients.length} icon={Users} color="cyan" />
        <StatCard title="Today" value={activeToday} icon={Activity} color="green" />
      </div>

      {/* Camps */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Camps</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {camps.map(camp => (
            <div
              key={camp._id}
              onClick={() => setSelectedCampId(camp._id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedCampId === camp._id
                  ? "bg-indigo-600 text-white"
                  : "bg-white hover:border-indigo-300"
              }`}
            >
              <h4 className="font-medium text-sm truncate">{camp.name}</h4>
              <p className="flex items-center gap-1 text-xs mt-1 text-gray-500">
                <MapPin size={12} />
                <span className="truncate">{camp.location}</span>
              </p>
              <p className="text-xs mt-2 font-medium">
                {patients.filter(p => p.campId?._id === camp._id).length} patients
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Patients */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div>
          <h3 className="font-semibold mb-3">Patients</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPatients.map(patient => (
              <div key={patient._id} className="bg-white rounded-xl border p-4 relative">
                <Trash2
                  size={14}
                  className="absolute top-3 right-3 text-red-400 cursor-pointer"
                  onClick={() => deletePatient(patient._id)}
                />
                
                <h4 className="font-semibold capitalize">{patient.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {patient.age}y • {patient.gender} • {patient.campId?.name || "No camp"}
                </p>
                
                {patient.bmi && (
                  <p className="text-xs text-gray-600 mt-1">BMI: {patient.bmi.toFixed(1)}</p>
                )}
                
                <p className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                  <Phone size={12} />
                  {patient.contact || "No contact"}
                </p>
                
                <Link
                  to={`/bmi-patient/${patient._id}`}
                  className="block mt-3 text-center bg-[#007A52] text-white text-sm py-2 rounded-lg hover:bg-[#007A52]/90"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Small stat card
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    cyan: "bg-cyan-500",
    green: "bg-green-500"
  };

  return (
    <div className="bg-white p-3 rounded-xl border flex items-center gap-2">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
};

export default BmiDashboard;