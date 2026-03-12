import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const LocationListPage = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Search filters - LIKE ABSENTTODAY.JS
  const [searchTerm, setSearchTerm] = useState("");
  
  // City and State filter states
  const [filterCity, setFilterCity] = useState("");
  const [filterState, setFilterState] = useState("");
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [showStateFilter, setShowStateFilter] = useState(false);
  
  // Pin code filter
  const [filterPinCode, setFilterPinCode] = useState("");
  
  // Unique cities and states
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueStates, setUniqueStates] = useState([]);
  
  // Refs for click outside
  const cityFilterRef = useRef(null);
  const stateFilterRef = useRef(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLocation, setEditLocation] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedFullAddress, setUpdatedFullAddress] = useState("");
  const [updatedLatitude, setUpdatedLatitude] = useState("");
  const [updatedLongitude, setUpdatedLongitude] = useState("");

  // Get clientId from localStorage
  const getClientId = () => localStorage.getItem('clientId') || '';
  const clientId = getClientId();
  const navigate = useNavigate();

  // Click outside handlers for filter dropdowns - LIKE ABSENTTODAY.JS
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityFilterRef.current && !cityFilterRef.current.contains(event.target)) {
        setShowCityFilter(false);
      }
      if (stateFilterRef.current && !stateFilterRef.current.contains(event.target)) {
        setShowStateFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract unique cities and states from locations
  const extractUniqueValues = (locationsData) => {
    const cities = new Set();
    const states = new Set();
    
    locationsData.forEach(loc => {
      // Extract city from fullAddress (simple parsing)
      const addressParts = loc.fullAddress.split(',');
      if (addressParts.length > 1) {
        // Try to get city (second last part usually)
        const possibleCity = addressParts[addressParts.length - 2]?.trim();
        if (possibleCity && possibleCity.length > 2) cities.add(possibleCity);
      }
      
      // Extract state from fullAddress (last part usually)
      const possibleState = addressParts[addressParts.length - 1]?.trim();
      if (possibleState && possibleState.length > 2) states.add(possibleState);
      
      // Also try to extract from pin code pattern
      const pinMatch = loc.fullAddress.match(/\b\d{6}\b/);
      if (pinMatch) {
        // State might be before pin code
        const beforePin = loc.fullAddress.substring(0, pinMatch.index).trim();
        const lastComma = beforePin.lastIndexOf(',');
        if (lastComma !== -1) {
          const possibleStateFromPin = beforePin.substring(lastComma + 1).trim();
          if (possibleStateFromPin && possibleStateFromPin.length > 2) states.add(possibleStateFromPin);
        }
      }
    });
    
    setUniqueCities(Array.from(cities).sort());
    setUniqueStates(Array.from(states).sort());
  };

  // Fetch all locations for specific client
  const fetchLocations = async () => {
    try {
      // Check if clientId exists
      if (!clientId) {
        setErrorMessage("Client ID not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/location/alllocation/${clientId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to fetch locations");

      // Handle different response structures
      let locationsData = [];
      if (Array.isArray(data)) {
        locationsData = data;
      } else if (data?.locations && Array.isArray(data.locations)) {
        locationsData = data.locations;
      } else if (data?.data && Array.isArray(data.data)) {
        locationsData = data.data;
      } else {
        locationsData = data || [];
      }

      setLocations(locationsData);
      
      // Extract unique cities and states
      extractUniqueValues(locationsData);
      
      setFilteredLocations(locationsData);
      setLoading(false);
      
      setPagination(prev => ({
        ...prev,
        totalCount: locationsData.length,
        totalPages: Math.ceil(locationsData.length / prev.limit),
        currentPage: 1
      }));
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [clientId]);

  // Apply filters whenever search term or filters change
  useEffect(() => {
    filterLocations();
  }, [searchTerm, filterCity, filterState, filterPinCode, locations]);

  useEffect(() => {
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, filterCity, filterState, filterPinCode]);

  const filterLocations = () => {
    let filtered = [...locations];

    // Filter by Location Name or Address
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(loc => 
        loc.name?.toLowerCase().includes(term) ||
        loc.fullAddress?.toLowerCase().includes(term)
      );
    }

    // Filter by City
    if (filterCity) {
      filtered = filtered.filter(loc => {
        const addressParts = loc.fullAddress.split(',');
        if (addressParts.length > 1) {
          const possibleCity = addressParts[addressParts.length - 2]?.trim();
          return possibleCity === filterCity;
        }
        return false;
      });
    }

    // Filter by State
    if (filterState) {
      filtered = filtered.filter(loc => {
        const addressParts = loc.fullAddress.split(',');
        const possibleState = addressParts[addressParts.length - 1]?.trim();
        return possibleState === filterState;
      });
    }

    // Filter by Pin Code
    if (filterPinCode.trim()) {
      filtered = filtered.filter(loc => {
        const pinMatch = loc.fullAddress.match(/\b\d{6}\b/);
        return pinMatch && pinMatch[0] === filterPinCode;
      });
    }

    // Sort by status (active first, inactive last)
    filtered.sort((a, b) => {
      const statusA = a.status === "inactive" ? 1 : 0;
      const statusB = b.status === "inactive" ? 1 : 0;
      return statusA - statusB;
    });

    setFilteredLocations(filtered);
    setPagination(prev => ({
      ...prev,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit)
    }));
  };

  // Clear all filters - LIKE ABSENTTODAY.JS
  const clearFilters = () => {
    setSearchTerm("");
    setFilterCity("");
    setFilterState("");
    setFilterPinCode("");
  };

  // Pagination handlers
  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredLocations.length,
      totalPages: Math.ceil(filteredLocations.length / limit)
    });
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1
      }));
    }
  };

  const handlePageClick = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      if (
        i === 1 ||
        i === pagination.totalPages ||
        (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  // Calculate pagination
  const indexOfLastItem = pagination.currentPage * pagination.limit;
  const indexOfFirstItem = indexOfLastItem - pagination.limit;
  const currentItems = filteredLocations.slice(indexOfFirstItem, indexOfLastItem);

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;

    // Check if clientId exists
    if (!clientId) {
      alert("Client ID not found. Please login again.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/location/deletelocation/${id}/${clientId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to delete location");

      setLocations((prev) => prev.filter((loc) => loc._id !== id));
      setFilteredLocations((prev) => prev.filter((loc) => loc._id !== id));
      alert("✅ Location deleted successfully!");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async (location) => {
    const newStatus = location.status === "inactive" ? "active" : "inactive";
    const confirmMsg = location.status === "inactive"
      ? `Are you sure you want to make ${location.name} ACTIVE?`
      : `Are you sure you want to make ${location.name} INACTIVE?`;

    if (!window.confirm(confirmMsg)) return;

    // Check if clientId exists
    if (!clientId) {
      alert("Client ID not found. Please login again.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/location/updatelocation/${location._id}/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...location,
          status: newStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update status");

      setLocations((prev) =>
        prev.map((loc) => (loc._id === location._id ? { ...loc, status: newStatus } : loc))
      );
      alert(`✅ Location set to ${newStatus}`);
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  // Open Edit Modal
  const openEditModal = (location) => {
    setEditLocation(location);
    setUpdatedName(location.name || "");
    setUpdatedFullAddress(location.fullAddress || "");
    setUpdatedLatitude(location.latitude?.toString() || "");
    setUpdatedLongitude(location.longitude?.toString() || "");
    setIsEditModalOpen(true);
  };
  
  // Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Check if clientId exists
    if (!clientId) {
      alert("Client ID not found. Please login again.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/location/updatelocation/${editLocation._id}/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedName,
          fullAddress: updatedFullAddress,
          latitude: parseFloat(updatedLatitude),
          longitude: parseFloat(updatedLongitude),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update location");

      // Update list locally
      setLocations((prev) =>
        prev.map((loc) =>
          loc._id === editLocation._id
            ? {
              ...loc,
              name: updatedName,
              fullAddress: updatedFullAddress,
              latitude: parseFloat(updatedLatitude),
              longitude: parseFloat(updatedLongitude),
            }
            : loc
        )
      );

      setIsEditModalOpen(false);
      fetchLocations(); // Refresh to update filters
      alert("✅ Location updated successfully!");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  // Client Info Banner Component
  const ClientInfoBanner = () => (
    <div className="p-3 mb-3 text-sm text-blue-700 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">Client ID:</span>
          <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded text-xs">
            {clientId.substring(0, 8)}...
          </span>
          <span className="ml-4 text-xs text-gray-500">
            Showing locations for your client account
          </span>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          Total Locations: {locations.length}
        </span>
      </div>
    </div>
  );

  // Check if clientId is missing
  if (!clientId && !loading) {
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg text-red-600">Client ID not found. Please login again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">
        
        {/* Client Info Banner */}
        {clientId && <ClientInfoBanner />}
        
        {/* Filters - LIKE ABSENTTODAY.JS */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Location Name/Address Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* City Filter Button */}
            <div className="relative" ref={cityFilterRef}>
              <button
                onClick={() => setShowCityFilter(!showCityFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterCity 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaBuilding className="text-xs" /> City {filterCity && `: ${filterCity}`}
              </button>
              
              {/* City Filter Dropdown */}
              {showCityFilter && (
                <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div 
                    onClick={() => {
                      setFilterCity('');
                      setShowCityFilter(false);
                    }}
                    className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-100 font-medium text-gray-700"
                  >
                    All Cities
                  </div>
                  {uniqueCities.map(city => (
                    <div 
                      key={city}
                      onClick={() => {
                        setFilterCity(city);
                        setShowCityFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterCity === city ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* State Filter Button */}
            <div className="relative" ref={stateFilterRef}>
              <button
                onClick={() => setShowStateFilter(!showStateFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterState 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaMapMarkerAlt className="text-xs" /> State {filterState && `: ${filterState}`}
              </button>
              
              {/* State Filter Dropdown */}
              {showStateFilter && (
                <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div 
                    onClick={() => {
                      setFilterState('');
                      setShowStateFilter(false);
                    }}
                    className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-100 font-medium text-gray-700"
                  >
                    All States
                  </div>
                  {uniqueStates.map(state => (
                    <div 
                      key={state}
                      onClick={() => {
                        setFilterState(state);
                        setShowStateFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterState === state ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {state}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pin Code Search */}
            <div className="relative w-[120px]">
              <input
                type="text"
                placeholder="Pin Code"
                value={filterPinCode}
                onChange={(e) => setFilterPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                maxLength="6"
              />
            </div>

            {/* Add Location Button */}
            <button
              onClick={() => {
                const isEmployee = window.location.pathname.startsWith("/emp-");
                navigate(isEmployee ? "/emp-add-location" : "/addlocation");
              }}
              className="h-8 px-3 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition flex items-center gap-1"
            >
              📍 Add Location
            </button>

            {/* Clear Filters Button */}
            {(searchTerm || filterCity || filterState || filterPinCode) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Loading / Error */}
        {loading && <div className="py-10 text-center text-gray-500">Loading...</div>}
        {errorMessage && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-200 rounded">
            ❌ {errorMessage}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredLocations.length === 0 && (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-500">
              {clientId ? "No locations found for your client." : "Please login to view locations."}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              {(searchTerm || filterCity || filterState || filterPinCode) && "Try clearing filters"}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && filteredLocations.length > 0 && (
          <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
              <table className="min-w-full">
                <thead className="text-left text-sm text-white bg-gradient-to-r from-green-500 to-blue-600">
                  <tr>
                    <th className="px-2 py-2 text-center">S.No</th>
                    <th className="px-2 py-2 text-center">Location Name</th>
                    <th className="px-2 py-2 text-center">Full Address</th>
                    <th className="px-2 py-2 text-center">City</th>
                    <th className="px-2 py-2 text-center">State</th>
                    <th className="px-2 py-2 text-center">Pin Code</th>
                    <th className="px-2 py-2 text-center">Latitude</th>
                    <th className="px-2 py-2 text-center">Longitude</th>
                    <th className="px-2 py-2 text-center">Status</th>
                    <th className="px-2 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((loc, index) => {
                    // Extract city, state, pin code from address
                    const addressParts = loc.fullAddress.split(',');
                    const city = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : '-';
                    const state = addressParts.length > 0 ? addressParts[addressParts.length - 1]?.trim() : '-';
                    const pinMatch = loc.fullAddress.match(/\b\d{6}\b/);
                    const pinCode = pinMatch ? pinMatch[0] : '-';

                    return (
                      <tr key={loc._id} className="transition hover:bg-blue-50">
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {loc.name || "N/A"}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600 max-w-xs truncate">
                          {loc.fullAddress || "N/A"}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600 whitespace-nowrap">
                          {city}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600 whitespace-nowrap">
                          {state}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600 whitespace-nowrap">
                          {pinCode}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600 whitespace-nowrap">
                          {loc.latitude || "N/A"}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600 whitespace-nowrap">
                          {loc.longitude || "N/A"}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            onClick={() => handleToggleStatus(loc)}
                            className={`px-2 py-2 text-center text-[10px] font-bold rounded uppercase transition ${
                              loc.status === "inactive"
                                ? "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
                                : "bg-green-100 text-green-700 hover:bg-gray-200 hover:text-gray-700"
                            }`}
                            title={loc.status === "inactive" ? "Make Active" : "Make Inactive"}
                          >
                            {loc.status === "inactive" ? "Inactive" : "Active"}
                          </button>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => openEditModal(loc)}
                              className="p-2 text-blue-600 transition rounded hover:bg-blue-100"
                              title="Edit Location"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(loc._id)}
                              className="p-2 text-red-600 transition rounded hover:bg-red-100"
                              title="Delete Location"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredLocations.length > 0 && (
              <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
                {/* Show entries dropdown */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Show:
                    </label>
                    <select
                      value={pagination.limit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        handleItemsPerPageChange(newLimit);
                      }}
                      className="p-2 text-sm border rounded-lg"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-600">entries</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, filteredLocations.length)}</strong> of{" "}
                    <strong>{filteredLocations.length}</strong> records
                  </div>
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={pagination.currentPage === 1}
                    className={`px-4 py-1 text-sm border rounded-lg ${
                      pagination.currentPage === 1
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-blue-600 bg-white hover:bg-blue-50 border-blue-200"
                    }`}
                  >
                    Previous
                  </button>

                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                      disabled={page === "..."}
                      className={`px-4 py-1 text-sm border rounded-lg ${
                        page === "..."
                          ? "text-gray-500 bg-gray-50 cursor-default"
                          : pagination.currentPage === page
                          ? "text-white bg-blue-600 border-blue-600"
                          : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={handleNextPage}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`px-4 py-1 text-sm border rounded-lg ${
                      pagination.currentPage === pagination.totalPages
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60">
            <div className="w-full max-w-md p-6 bg-white border border-gray-200 shadow-2xl rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-blue-800">Edit Location</h3>
              <form onSubmit={handleUpdate}>
                {/* Location Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Location Name *</label>
                  <input
                    type="text"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                    className="w-full p-2 mt-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Full Address */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Full Address *</label>
                  <textarea
                    value={updatedFullAddress}
                    onChange={(e) => setUpdatedFullAddress(e.target.value)}
                    className="w-full p-2 mt-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  ></textarea>
                </div>

                {/* Latitude */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Latitude *</label>
                  <input
                    type="text"
                    value={updatedLatitude}
                    onChange={(e) => setUpdatedLatitude(e.target.value)}
                    className="w-full p-2 mt-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Longitude */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">Longitude *</label>
                  <input
                    type="text"
                    value={updatedLongitude}
                    onChange={(e) => setUpdatedLongitude(e.target.value)}
                    className="w-full p-2 mt-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white transition bg-blue-600 rounded shadow-md hover:bg-blue-700 hover:shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationListPage;