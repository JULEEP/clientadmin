import axios from "axios";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

const AddPatient = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultCampId = location.state?.campId || "";
  const [camps, setCamps] = useState([]);
  const [campId, setCampId] = useState(defaultCampId);
  const [loading, setLoading] = useState(false);

  // Client ID get function
  const getClientId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clientId') || '';
    }
    return '';
  };

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "female",
    contact: "",
    address: "",
    campId: "",
    clientId: "" // ✅ Client ID add kiya
  });

  /* -------------------------
     INITIAL SETUP - Set clientId
  ------------------------- */
  useEffect(() => {
    const clientId = getClientId();
    if (clientId) {
      setFormData(prev => ({
        ...prev,
        clientId: clientId
      }));
    }
  }, []);

  /* -------------------------
     FETCH CAMPS (with clientId)
  ------------------------- */
  useEffect(() => {
    fetchCamps();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      campId: campId
    }));
  }, [campId]);

  useEffect(() => {
    if (defaultCampId && camps.length > 0) {
      setCampId(defaultCampId);
    }
  }, [defaultCampId, camps]);

  const fetchCamps = async () => {
    try {
      const clientId = getClientId();
      if (!clientId) {
        console.error("No clientId found");
        alert("Please login first");
        navigate("/");
        return;
      }

      const res = await axios.get(`${API}/camps/allcamps?clientId=${clientId}`);
      console.log("CAMPS DATA 👉", res.data); // DEBUG
      setCamps(res.data);
    } catch (err) {
      console.error("Error fetching camps", err);
      alert("Error loading camps. Please try again.");
    }
  };

  /* -------------------------
     HANDLE CHANGE
  ------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /* -------------------------
     SUBMIT (NOW WITH ONLY campId, NOT clientId)
  ------------------------- */
  const handleSubmit = async (e) => {
  e.preventDefault();

  const clientId = getClientId();
  if (!clientId) {
    alert("Client ID not found. Please login again.");
    return;
  }

  if (!formData.campId) {
    alert("Please select a camp");
    return;
  }

  // ✅ campId को body में
  const payload = {
    name: formData.name,
    age: formData.age,
    gender: formData.gender,
    contact: formData.contact,
    address: formData.address,
    campId: formData.campId  // ✅ body में
  };

  console.log("FINAL PAYLOAD 👉", payload);

  try {
    setLoading(true);
    
    // ✅ clientId को URL parameter में (path parameter)
    // Example: POST /api/patients/:clientId
    const url = `${API}/patients/${clientId}`;
    
    await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    navigate("/camp");
    
  } catch (err) {
    console.error("ADD PATIENT ERROR 👉", err.response?.data || err);
    
    if (err.response?.data?.message) {
      alert(`Error: ${err.response.data.message}`);
    } else if (err.response?.data?.error) {
      alert(`Error: ${err.response.data.error}`);
    } else {
      alert("Error adding patient. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  // Agar koi camp nahi hai toh message show karo
  if (camps.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow border">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft />
          </Link>
          <h2 className="text-2xl font-bold">Add New Patient</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏕️</div>
          <h3 className="text-xl font-bold mb-2">No Camps Available</h3>
          <p className="text-gray-600 mb-6">
            You need to create a camp first before adding patients.
          </p>
          <div className="flex gap-4 justify-center">
            {/* ✅ Modified: /camp पर navigate करें */}
            <Link
              to="/camp"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go to Camps Page
            </Link>
            <button
              onClick={() => navigate("/camp")}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow border">
      <div className="flex items-center gap-4 mb-8">
        {/* ✅ Modified: Back button to /camp */}
        <Link to="/camp" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft />
        </Link>
        <h2 className="text-2xl font-bold">Add New Patient</h2>
      </div>

      {/* Client Info Display */}
      {formData.clientId && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <p className="text-sm font-medium text-gray-700">Client ID:</p>
          </div>
          <p className="text-sm text-gray-900 font-mono mt-1 px-1">
            {formData.clientId}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ✅ CAMP DROPDOWN */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Select Camp <span className="text-red-500">*</span>
          </label>

          <select
            value={campId}
            onChange={(e) => setCampId(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            required
          >
            <option value="">-- Select a Camp --</option>

            {camps.map((camp) => (
              <option key={camp._id} value={camp._id}>
                {camp.name} - {camp.location} ({camp.date})
              </option>
            ))}
          </select>

          <p className="text-xs text-gray-500 mt-2">
            {camps.length} camp(s) available for your account
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Patient Name <span className="text-red-500">*</span>
          </label>
          <input
            required
            name="name"
            value={formData.name}
            placeholder="Enter patient full name"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              required
              name="age"
              type="number"
              min="1"
              max="120"
              value={formData.age}
              placeholder="Age"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              onChange={handleChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            WhatsApp Number <span className="text-red-500">*</span>
          </label>
          <input
            required
            name="contact"
            value={formData.contact}
            placeholder="10-digit phone number"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            name="address"
            value={formData.address}
            rows="3"
            placeholder="Complete address"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            onChange={handleChange}
          />
        </div>

        <button
          disabled={loading || !formData.campId}
          className={`w-full p-4 rounded-xl font-bold flex justify-center gap-2 transition-colors
            ${loading || !formData.campId 
              ? "bg-gray-400 cursor-not-allowed text-gray-200" 
              : "bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
            }`}
        >
          <Save /> 
          {loading ? "Saving Patient..." : "Register Patient"}
        </button>

        {!formData.campId && (
          <p className="text-sm text-red-500 text-center">
            Please select a camp to proceed
          </p>
        )}
      </form>
    </div>
  );
};

export default AddPatient;