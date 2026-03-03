import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddLocationPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || '';

  // ✅ Detect Current Location
  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setErrorMessage("❌ Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude.toFixed(6));
        setLongitude(longitude.toFixed(6));

        // ✅ Reverse geocoding to get full address (using OpenStreetMap)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          if (data.display_name) {
            setFullAddress(data.display_name);
          } else {
            setFullAddress("");
            setErrorMessage("⚠️ Could not fetch full address.");
          }
        } catch {
          setErrorMessage("⚠️ Failed to fetch address from coordinates.");
        }

        setLoadingLocation(false);
      },
      (err) => {
        setLoadingLocation(false);
        setErrorMessage("❌ Location access denied. Please enter manually.");
      }
    );
  };

  // ✅ Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    // Check if clientId exists
    if (!clientId) {
      setErrorMessage("❌ Client ID not found. Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/location/add-location/${clientId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            latitude,
            longitude,
            fullAddress,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add location");
      }

      setSuccessMessage("✅ Location added successfully!");
      setName("");
      setLatitude("");
      setLongitude("");
      setFullAddress("");

      // ✅ Redirect after success
      setTimeout(() => {
        navigate("/locationlist");
      }, 1000);
    } catch (error) {
      setErrorMessage(`❌ ${error.message}`);
    }
  };

  return (
    <div className="max-w-3xl p-6 mx-auto bg-white rounded-lg shadow-lg">
      
      {/* Client Info Banner */}
      {clientId && (
        <div className="p-3 mb-4 text-sm text-blue-700 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <span className="font-medium">Client ID:</span>
            <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded text-xs">
              {clientId.substring(0, 8)}...
            </span>
            <span className="ml-4 text-xs text-gray-500">
              Location will be added under your client account
            </span>
          </div>
        </div>
      )}

      <h2 className="mb-6 text-2xl font-semibold text-blue-900">Add New Location</h2>

      {/* Success / Error Message */}
      {successMessage && (
        <div className="p-4 mb-4 text-green-700 bg-green-100 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Location Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Location Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            placeholder="Enter location name"
            required
          />
        </div>

        {/* Auto Detect Location Button */}
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Detect Location Automatically
          </label>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="px-4 py-1 text-white bg-green-600 rounded hover:bg-green-700"
            disabled={loadingLocation}
          >
            {loadingLocation ? "Fetching..." : "📍 Get Current Location"}
          </button>
        </div>

        {/* Latitude */}
        <div className="mb-4">
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
            Latitude *
          </label>
          <input
            id="latitude"
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            placeholder="Enter latitude"
            required
          />
        </div>

        {/* Longitude */}
        <div className="mb-4">
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
            Longitude *
          </label>
          <input
            id="longitude"
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            placeholder="Enter longitude"
            required
          />
        </div>

        {/* Full Address */}
        <div className="mb-6">
          <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-700">
            Full Address *
          </label>
          <textarea
            id="fullAddress"
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            placeholder="Enter full address or use auto-detect"
            rows="3"
            required
          ></textarea>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Add Location
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLocationPage;