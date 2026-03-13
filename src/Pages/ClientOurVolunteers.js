import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Mail, Phone, User } from "lucide-react";

const ClientOurVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDummyData, setUsingDummyData] = useState(false);

  // Dummy data
  const dummyVolunteers = [
    {
      _id: "dummy1",
      name: "Dr. Priya Sharma",
      designation: "Consultant",
      email: "priya.sharma@example.com",
      phone: "+91 98765 43210",
      joiningDate: "2023-01-15",
      experience: 8,
      profileImage: null
    },
    {
      _id: "dummy2",
      name: "Rajesh Kumar",
      designation: "Phlebotomist",
      email: "rajesh.k@example.com",
      phone: "+91 99887 66554",
      joiningDate: "2023-03-20",
      experience: 4,
      profileImage: null
    },
    {
      _id: "dummy3",
      name: "Sunita Patel",
      designation: "Staff Nurse",
      email: "sunita.p@example.com",
      phone: "+91 97766 55443",
      joiningDate: "2022-11-10",
      experience: 6,
      profileImage: null
    },
    {
      _id: "dummy4",
      name: "Dr. Amit Verma",
      designation: "Consultant",
      email: "amit.verma@example.com",
      phone: "+91 96655 44332",
      joiningDate: "2023-06-05",
      experience: 10,
      profileImage: null
    }
  ];

  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || '';
  const API_BASE_URL = "http://localhost:5001/api";

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setLoading(true);
        
        if (!clientId) {
          console.log("No client ID found, showing dummy data");
          setVolunteers(dummyVolunteers);
          setUsingDummyData(true);
          setError(null);
          setLoading(false);
          return;
        }

        // Pass clientId in params
        const response = await axios.get(
          `${API_BASE_URL}/employees/get-employees/${clientId}`
        );
        
        console.log("Employees API Response:", response.data);
        
        // Handle different response structures
        let employeesData = [];
        if (Array.isArray(response.data)) {
          employeesData = response.data;
        } else if (response.data?.employees && Array.isArray(response.data.employees)) {
          employeesData = response.data.employees;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          employeesData = response.data.data;
        } else if (response.data?.message) {
          console.log("API Message:", response.data.message);
        }

        if (employeesData.length === 0) {
          // No data from API, show dummy
          setVolunteers(dummyVolunteers);
          setUsingDummyData(true);
        } else {
          // Filter only specific roles: Phlebotomist, Staff Nurse, Consultant
          const allowedRoles = ["Phlebotomist", "Staff Nurse", "Consultant"];
          const filteredData = employeesData.filter((emp) => {
            const role = (emp.designation || emp.role || "").trim();
            return allowedRoles.some(allowed => allowed.toLowerCase() === role.toLowerCase());
          });

          setVolunteers(filteredData.length ? filteredData : dummyVolunteers);
          setUsingDummyData(filteredData.length === 0);
        }
        
        setError(null);
      } catch (error) {
        console.error("❌ Error fetching volunteers:", error);
        // Show dummy data on error
        setVolunteers(dummyVolunteers);
        setUsingDummyData(true);
        setError(null); // Clear error to show data
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2563EB]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Our <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Volunteers</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Meet the dedicated individuals working tirelessly to make a difference in our community.
          </p>
          
          {/* Dummy data badge */}
          {usingDummyData && (
            <div className="mt-3 inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full text-sm">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              Showing demo data (API unavailable)
            </div>
          )}

          {/* Client ID badge */}
          {clientId && !usingDummyData && (
            <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full inline-block">
              Client ID: {clientId.slice(0, 8)}...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {volunteers.map((volunteer) => (
            <div
              key={volunteer._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col"
            >
              <div className="h-24 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
              <div className="px-6 pb-6 -mt-12 flex-1 flex flex-col">
                {/* Avatar */}
                <div className="relative mx-auto">
                  <div className="h-24 w-24 rounded-full border-4 border-white bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shadow-md">
                    <span className="text-3xl font-bold text-blue-600">
                      {volunteer.name ? volunteer.name.charAt(0).toUpperCase() : "V"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-center flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {volunteer.name}
                  </h3>
                  <p className="text-sm font-medium text-[#2563EB] mb-4">
                    {volunteer.designation}
                  </p>

                  <div className="space-y-3 text-left">
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Demo notice footer */}
        {usingDummyData && (
          <div className="mt-8 text-center text-sm text-gray-400">
            ⚡ Showing demo data. Connect to backend to see real volunteers.
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOurVolunteers;