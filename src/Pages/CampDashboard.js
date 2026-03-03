import axios from "axios";
import {
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  Copy,
  Eye,
  FileText,
  Filter,
  Link,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { generateMedicalReport, generateMedicalReportFile } from "../utils/pdfGenerator";

const API_BASE = "http://localhost:5000/api";

/* ================= UTILS ================= */
const calculateBMI = (weight, heightCm) => {
  if (!weight || !heightCm) return null;
  const h = heightCm / 100;
  return +(weight / (h * h)).toFixed(1);
};

const getBMICategory = (bmi) => {
  if (!bmi) return "-";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

const extractLatestVitals = (tests = []) => {
  const r = {};
  if (!tests) return r;

  tests.forEach(t => {
    r.date = t.date;
    if (t.type === "weight") r.weight = t.value;
    if (t.type === "height") r.height = t.value;
    if (t.type === "sugar") r.sugar = t.value;
    if (t.type === "bp") {
      r.systolic = t.value;
      r.diastolic = t.value2;
    }
  });
  return r;
};

/* ================= COMPONENTS ================= */
const StatsCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all">
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <h3 className="text-lg font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

export default function CampDashboard() {
  const navigate = useNavigate();
  const [showCampModal, setShowCampModal] = useState(false);
  const [campForm, setCampForm] = useState({
    name: "",
    location: "",
    address: "",
    date: "",
    time: "",
    volunteers: [],
    clientId: ""
  });
  
  // DUMMY DATA FOR VOLUNTEERS
  const [volunteers] = useState([
    {
      _id: "1",
      name: "Dr. Rohan Sharma",
      role: "doctor",
      phone: "9876543210"
    },
    {
      _id: "2",
      name: "Dr. Priya Verma",
      role: "doctor",
      phone: "9876543211"
    },
    {
      _id: "3",
      name: "Sneha Desai",
      role: "nurse",
      phone: "9876543212"
    },
    {
      _id: "4",
      name: "Rajesh Kumar",
      role: "nurse",
      phone: "9876543213"
    },
    {
      _id: "5",
      name: "Amit Singh",
      role: "phlebotomist",
      phone: "9876543214"
    },
    {
      _id: "6",
      name: "Vikram Patel",
      role: "phlebotomist",
      phone: "9876543215"
    },
    {
      _id: "7",
      name: "Anjali Mehta",
      role: "staff",
      phone: "9876543216"
    },
    {
      _id: "8",
      name: "Rahul Joshi",
      role: "volunteer",
      phone: "9876543217"
    }
  ]);
  
  const [camps, setCamps] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const getClientId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clientId') || '';
    }
    return '';
  };

  useEffect(() => {
    if (showCampModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showCampModal]);

  useEffect(() => {
    const clientId = getClientId();
    if (clientId) {
      setCampForm(prev => ({
        ...prev,
        clientId: clientId
      }));
    }
  }, []);

  const [selectedCampId, setSelectedCampId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [generatedReportFile, setGeneratedReportFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const clientId = getClientId();
        
        if (!clientId) {
          alert("Client ID not found. Please login again.");
          navigate("/");
          return;
        }
        
        // ✅ Fetch camps WITH clientId in query params
        const campsRes = await axios.get(`${API_BASE}/camps/allcamps?clientId=${clientId}`);
        setCamps(campsRes.data || []);
        
        // ✅ Fetch patients WITH clientId in URL params (not query)
        const patientsRes = await axios.get(`${API_BASE}/patients/${clientId}`);
        setPatients(patientsRes.data || []);
        
      } catch (err) {
        console.error("Failed to fetch data", err);
        alert("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      if (selectedCampId !== "all") {
        if (String(p.campId?._id) !== String(selectedCampId)) return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesPhone = p.contact?.includes(q);
        const matchesCamp = p.campId?.name?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesCamp) return false;
      }

      return true;
    });
  }, [patients, selectedCampId, searchQuery]);

  const totalCamps = camps.length;
  const totalPatients = patients.length;
  const recentPatients = patients.filter(p => {
    const d = new Date(p.createdAt);
    const now = new Date();
    return (now - d) < (7 * 24 * 60 * 60 * 1000);
  }).length;

  const campsWithCount = useMemo(() => {
    return camps.map(c => {
      const count = patients.filter(
        p => String(p.campId?._id) === String(c._id)
      ).length;
      return { ...c, count };
    });
  }, [camps, patients]);

  const prepareReportData = async (patientId) => {
    try {
      const res = await axios.get(`${API_BASE}/patients/single/${patientId}`);
      const fullPatient = res.data;

      if (!fullPatient?.tests?.length) {
        alert("No test data available for this patient.");
        return null;
      }

      const test = extractLatestVitals(fullPatient.tests);
      const bmiValue = calculateBMI(test.weight, test.height);

      const patientData = {
        name: fullPatient.name,
        age: fullPatient.age,
        gender: fullPatient.gender,
        id: fullPatient._id?.slice(-6)?.toUpperCase() || "N/A",
        date: new Date(test.date || Date.now()).toLocaleDateString(),
        phone: fullPatient.contact,
        address: fullPatient.address,
      };

      const testsData = {
        weight: test.weight,
        height: test.height,
        sugar: test.sugar,
        sugarType: test.sugarType || "Random",
        systolic: test.systolic,
        diastolic: test.diastolic,
        heartRate: "-",
      };

      const bmiData = {
        bmi: bmiValue,
        category: getBMICategory(bmiValue),
      };

      return { patientData, testsData, bmiData };

    } catch (err) {
      console.error(err);
      alert("Failed to fetch report data.");
      return null;
    }
  };

  const uploadPdfToServer = async (patientData, testsData, bmiData) => {
    const rawPdf = await generateMedicalReportFile(
      patientData,
      testsData,
      bmiData
    );

    const pdfBlob = new Blob([rawPdf], {
      type: "application/pdf"
    });

    const formData = new FormData();
    formData.append("file", pdfBlob, "health-report.pdf");
    
    const clientId = getClientId();
    if (clientId) {
      formData.append("clientId", clientId);
    }

    const res = await axios.post(
      "http://localhost:5000/api/reports/upload",
      formData
    );

    return res.data.downloadLink;
  };

  const downloadPDF = async (patient) => {
    const data = await prepareReportData(patient._id);
    if (!data) return;
    generateMedicalReport(data.patientData, data.testsData, data.bmiData);
  };

  const viewReport = async (patient) => {
    const data = await prepareReportData(patient._id);
    if (!data) return;
    navigate('/health-report', {
      state: {
        patient: data.patientData,
        tests: data.testsData
      }
    });
  };

  const shareReport = async (patient) => {
    try {
      setCurrentPatient(patient);

      const data = await prepareReportData(patient._id);
      if (!data) return;

      const publicLink = await uploadPdfToServer(
        data.patientData,
        data.testsData,
        data.bmiData
      );

      const message = `*Health Checkup Report* 🩺

Hello ${patient.name},
Your medical health report is ready.

📄 Download Report:
${publicLink}

(Generated by BIM Medical)`;

      setDownloadLink(message);
      setShowShareModal(true);

    } catch (err) {
      console.error("UPLOAD ERROR 👉", err);
      alert("Failed to generate sharing link");
    }
  };

  const handleWhatsAppShare = () => {
    if (!currentPatient || !downloadLink) return;

    const phone = currentPatient.contact ? currentPatient.contact.replace(/\D/g, '') : '';

    if (!phone) {
      alert("Patient phone number is required for WhatsApp sharing");
      return;
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(downloadLink)}`;
    window.open(whatsappUrl, "_blank");
    setShowShareModal(false);
  };

  const handleCopyMessage = () => {
    if (!downloadLink) return;

    navigator.clipboard.writeText(downloadLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLinkOnly = () => {
    if (!downloadLink) return;

    const urlMatch = downloadLink.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      navigator.clipboard.writeText(urlMatch[0]);
      alert("Download link copied to clipboard!");
    }
  };

  const handleAddVolunteer = (e) => {
    const val = e.target.value;
    if (!val) return;
    
    const selectedVolunteer = volunteers.find(v => v._id === val);
    if (selectedVolunteer) {
      const volunteerString = `${selectedVolunteer.name} (${selectedVolunteer.role})`;
      if (!campForm.volunteers.includes(volunteerString)) {
        setCampForm({
          ...campForm,
          volunteers: [...campForm.volunteers, volunteerString]
        });
      }
    }
  };

  const handleRemoveVolunteer = (name) => {
    setCampForm({
      ...campForm,
      volunteers: campForm.volunteers.filter(v => v !== name)
    });
  };

  const handleCreateCamp = async () => {
    try {
      const clientId = getClientId();
      
      if (!clientId) {
        alert("Client ID not found. Please login again.");
        return;
      }
      
      if (!campForm.name || !campForm.location || !campForm.date) {
        alert("Please fill in all required fields: Name, Location, and Date");
        return;
      }
      
      console.log("Creating camp with clientId:", clientId);
      console.log("Camp data:", campForm);
      
      const response = await axios.post(
        `${API_BASE}/camps/addcamp/${clientId}`,
        {
          name: campForm.name,
          location: campForm.location,
          address: campForm.address,
          date: campForm.date,
          time: campForm.time,
          volunteers: campForm.volunteers
        }
      );
      
      console.log("API response:", response.data);
      
      if (response.status === 200 || response.status === 201) {
        alert("✅ Camp created successfully");
        
        setShowCampModal(false);
        setCampForm({
          name: "",
          location: "",
          address: "",
          date: "",
          time: "",
          volunteers: [],
          clientId: clientId
        });
        
        // Refresh camps list
        const campsRes = await axios.get(`${API_BASE}/camps/allcamps?clientId=${clientId}`);
        setCamps(campsRes.data || []);
      } else {
        throw new Error(response.data?.message || "Failed to create camp");
      }
      
    } catch (err) {
      console.error("CREATE CAMP ERROR:", err);
      alert(`❌ Failed to create camp: ${err.response?.data?.message || err.message}`);
    }
  };

  const cleanupGeneratedFiles = () => {
    if (generatedReportFile?.blobUrl) {
      URL.revokeObjectURL(generatedReportFile.blobUrl);
    }
    setGeneratedReportFile(null);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50/50 animate-fade-in">
      {/* HEADER Section */}
      <div className="flex flex-col justify-between gap-3 mb-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Camp Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage health camps, participants, and reports.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 shadow-sm rounded-lg">
          <Calendar size={16} className="text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* STATS Section */}
      <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4">
        <StatsCard
          title="Total Camps"
          value={totalCamps}
          icon={MapPin}
          colorClass="bg-gradient-to-br from-indigo-500 to-purple-600"
        />
        <StatsCard
          title="Active Camps"
          value={camps.length}
          icon={Activity}
          colorClass="bg-gradient-to-br from-indigo-400 to-indigo-600"
        />
        <StatsCard
          title="Total Patients"
          value={totalPatients}
          icon={Users}
          colorClass="bg-gradient-to-br from-blue-500 to-cyan-500"
        />
        <StatsCard
          title="This Week"
          value={recentPatients}
          icon={Activity}
          colorClass="bg-gradient-to-br from-emerald-500 to-teal-500"
        />
      </div>

      {/* CAMPS Section */}
      <div className="mb-6">
        <div className="flex flex-col justify-between gap-3 mb-4 sm:flex-row sm:items-center">
          <h3 className="text-lg font-bold text-gray-800">All Camps</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCampId("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedCampId === "all" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Camps
            </button>
            <button
              onClick={() => setShowCampModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition"
            >
              <Calendar size={12} />
              Create Camp
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {camps.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-xl border border-gray-100">
              <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                <MapPin size={36} className="opacity-20" />
                <p className="text-sm font-medium">No camps found</p>
                <p className="text-xs">Create your first camp to get started</p>
                <button
                  onClick={() => setShowCampModal(true)}
                  className="mt-2 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Create Camp
                </button>
              </div>
            </div>
          ) : (
            campsWithCount.map(camp => (
              <div
                key={camp._id}
                onClick={() => setSelectedCampId(camp._id)}
                className={`cursor-pointer p-3 rounded-xl border transition-all text-sm
                  ${selectedCampId === camp._id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white hover:border-indigo-300 hover:shadow-sm"
                  }`}
              >
                <h4 className="font-bold truncate text-sm">{camp.name}</h4>
                <div className={`mt-1.5 flex items-center gap-1.5 text-xs
                  ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                  <MapPin size={12} />
                  <span className="truncate">{camp.location}</span>
                </div>
                <div className={`mt-1 flex items-center gap-1.5 text-xs
                  ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                  <Calendar size={12} />
                  <span>{camp.date ? new Date(camp.date).toLocaleDateString() : "No date"}</span>
                </div>
                <div className={`mt-1 flex items-center gap-1.5 text-xs
                  ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-500"}`}>
                  <Clock size={12} />
                  <span>{camp.time || "No time specified"}</span>
                </div>
                {camp.volunteers && camp.volunteers.length > 0 ? (
                  <div className={`mt-2 text-xs ${selectedCampId === camp._id ? "text-indigo-100" : "text-gray-600"}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <Users size={10} />
                      <span className="font-semibold">Volunteers:</span>
                    </div>
                    <div className="pl-3 space-y-1">
                      {camp.volunteers.slice(0, 3).map((volunteer, idx) => (
                        <div key={idx} className="truncate" title={volunteer}>
                          • {volunteer}
                        </div>
                      ))}
                      {camp.volunteers.length > 3 && (
                        <div className="text-xs opacity-70">
                          +{camp.volunteers.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`mt-1.5 flex items-center gap-1.5 text-xs
                    ${selectedCampId === camp._id ? "text-indigo-200" : "text-gray-400"}`}>
                    <Users size={10} />
                    <span>No volunteers assigned</span>
                  </div>
                )}
                <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded
                  ${selectedCampId === camp._id
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                  }`}>
                  {camp.count || 0} Patients
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PARTICIPANTS Section */}
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col gap-3 p-3 bg-white border border-gray-100 shadow-sm rounded-xl sm:flex-row sm:items-center">
          <div className="relative w-full">
            <Search
              className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name, phone or camp..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Filter size={14} />
              <span>{filteredPatients.length} patients found</span>
            </div>
            <button
              onClick={() => navigate("/add-patient", {
                state: { campId: selectedCampId }
              })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={14} />
              Add Patient
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Patient</th>
                  <th className="p-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Contact</th>
                  <th className="p-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Camp</th>
                  <th className="p-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-5 h-5 border-2 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                        <span className="text-sm">Loading patients...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient._id} className="transition-colors group hover:bg-gray-50/80">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-indigo-700 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                            {patient.name?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{patient.name}</p>
                            <p className="text-xs text-gray-500">{patient.age} Y • {patient.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-700">{patient.contact || "N/A"}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">
                            {patient.campId?.name || "No Camp"}
                          </span>
                          {patient.campId?.date && (
                            <span className="text-xs text-gray-500">
                              {new Date(patient.campId.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => viewReport(patient)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                              bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                            title="View Report"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            onClick={() => downloadPDF(patient)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                              bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            title="Download PDF"
                          >
                            <FileText size={12} /> PDF
                          </button>
                          <button
                            onClick={() => shareReport(patient)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                              bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                            title="Share via WhatsApp"
                          >
                            <MessageCircle size={12} /> Share
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                        <Users size={36} className="opacity-20" />
                        <p className="text-sm font-medium">No patients found</p>
                        <p className="text-xs">Try adjusting your search or add new patients</p>
                        <button
                          onClick={() => navigate("/add-patient")}
                          className="mt-2 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                          Add Patient
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- SHARE MODAL --- */}
      {showShareModal && currentPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md overflow-hidden bg-white shadow-xl rounded-2xl animate-scale-in">
            <div className="p-5 text-center text-white bg-green-600">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-white/20">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-lg font-bold">Share Report on WhatsApp</h3>
              <p className="mt-1 text-xs text-green-100">Download link generated successfully!</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-green-700 rounded-full bg-gradient-to-br from-green-100 to-emerald-100">
                    {currentPatient.name?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{currentPatient.name}</p>
                    <p className="text-xs text-gray-600">{currentPatient.contact || "No phone"} • {currentPatient.age} Y</p>
                  </div>
                </div>
              </div>
              <div className="p-3 border border-green-200 border-dashed rounded-xl bg-green-50/50">
                <p className="mb-1.5 text-xs font-bold text-green-800">📄 WhatsApp Message:</p>
                <div className="p-2 overflow-y-auto text-xs bg-white border border-green-100 rounded-lg max-h-32">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">{downloadLink}</pre>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageCircle size={16} /> Open WhatsApp
                </button>
                <button
                  onClick={handleCopyMessage}
                  className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all flex items-center justify-center gap-1.5"
                >
                  {copied ? <CheckCircle size={14} className="text-green-600" /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Message"}
                </button>
                <button
                  onClick={handleCopyLinkOnly}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <Link size={14} /> Copy Link Only
                </button>
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    cleanupGeneratedFiles();
                  }}
                  className="w-full py-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE CAMP MODAL --- */}
      {showCampModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Create New Camp</h2>
                    <p className="text-sm text-gray-600 mt-1">Fill in the camp details below</p>
                  </div>
                  <button
                    onClick={() => setShowCampModal(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="text-sm font-medium text-gray-700">Client ID:</p>
                  </div>
                  <p className="text-sm text-gray-900 font-mono mt-1 px-1">{getClientId() || "Not set"}</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Camp Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Enter camp name (e.g., Health Camp 2024)"
                      value={campForm.name}
                      onChange={(e) => setCampForm({ ...campForm, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Enter location (e.g., City, Area)"
                      value={campForm.location}
                      onChange={(e) => setCampForm({ ...campForm, location: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        value={campForm.date}
                        onChange={(e) => setCampForm({ ...campForm, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <input
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="HH:MM AM/PM (e.g., 10:00 AM)"
                        value={campForm.time}
                        onChange={(e) => setCampForm({ ...campForm, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address (Optional)
                    </label>
                    <textarea
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Full address (optional)"
                      rows="2"
                      value={campForm.address}
                      onChange={(e) => setCampForm({ ...campForm, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Assign Volunteers
                    </label>
                    
                    {campForm.volunteers.length > 0 && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Selected Volunteers ({campForm.volunteers.length})
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {campForm.volunteers.map((vol, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-lg">
                              <span className="text-sm">{vol}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveVolunteer(vol)}
                                className="text-indigo-500 hover:text-indigo-800 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-white"
                        onChange={handleAddVolunteer}
                        value=""
                      >
                        <option value="">+ Select volunteer to add</option>
                        {volunteers.map((vol) => (
                          <option key={vol._id} value={vol._id}>
                            {vol.name} - {vol.role} 
                            {vol.phone ? ` (${vol.phone})` : ''}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {volunteers.length} volunteers available (Doctors, Nurses, Phlebotomists, Staff)
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCampModal(false)}
                    className="px-5 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCamp}
                    disabled={!campForm.name || !campForm.location || !campForm.date}
                    className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition flex items-center gap-2 ${
                      !campForm.name || !campForm.location || !campForm.date
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    <Calendar size={16} />
                    Create Camp
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}