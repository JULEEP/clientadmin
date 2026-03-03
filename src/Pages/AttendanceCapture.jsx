// // src/pages/AttendanceCapture.jsx
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import EmployeeSidebar from "../Components/EmployeeSidebar";
// import Navbar from "../Components/Navbar";

// const OFFICE_COORDS = { lat: 17.4458661, lng: 78.3849383 };
// const ONSITE_RADIUS_M = 50;
// const BASE_URL = "https://api.timelyhealth.in/";

// // Haversine formula
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000;
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// export default function AttendanceCapture() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [locStatus, setLocStatus] = useState("idle");
//   const [submitting, setSubmitting] = useState(false);
//   const [checkedIn, setCheckedIn] = useState(false);
//   const [employeeId, setEmployeeId] = useState(null);
//   const [email, setEmail] = useState(null);

//   const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
//   const storageKey = `attendance_${employeeId}_${today}`;

//   // Load employee data
//   useEffect(() => {
//     const stateId = location.state?.employeeId;
//     const stateEmail = location.state?.email;

//     if (stateId && stateEmail) {
//       setEmployeeId(stateId);
//       setEmail(stateEmail);
//       localStorage.setItem(
//         "employeeData",
//         JSON.stringify({ employeeId: stateId, email: stateEmail })
//       );
//     } else {
//       const stored = JSON.parse(localStorage.getItem("employeeData"));
//       if (stored) {
//         setEmployeeId(stored.employeeId);
//         setEmail(stored.email);
//       }
//     }
//   }, [location.state]);

//   // Restore today's attendance status from backend first
//   useEffect(() => {
//     const fetchTodayStatus = async () => {
//       if (!employeeId) return;

//       try {
//         const res = await fetch(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch status");

//         // Filter today's record
//         const todayRecord = data.records.find((rec) => {
//           const recDate = new Date(rec.checkInTime).toLocaleDateString("en-CA");
//           return recDate === today;
//         });

//         if (todayRecord) {
//           // Update UI based on status
//           if (todayRecord.status === "checked-in") {
//             setCheckedIn(true); // show Check-Out
//             localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: false }));
//           } else if (todayRecord.status === "checked-out") {
//             setCheckedIn(false); // show Check-In
//             localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: true }));
//           }
//         } else {
//           // No record today
//           setCheckedIn(false);
//           localStorage.removeItem(storageKey);
//         }
//       } catch (err) {
//         console.error("Error fetching today's attendance:", err.message);
//       }
//     };

//     fetchTodayStatus();
//   }, [employeeId, storageKey, today]);

//   // Fetch geolocation
//   const fetchLocation = () => {
//     if (!navigator.geolocation) return alert("Geolocation not supported!");
//     setLocStatus("fetching");

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setPosition(coords);
//         const d = haversineDistance(
//           coords.lat,
//           coords.lng,
//           OFFICE_COORDS.lat,
//           OFFICE_COORDS.lng
//         );
//         setDistance(Math.round(d));
//         setLocStatus("success");
//       },
//       (err) => {
//         setLocStatus("error");
//         alert("Location error: " + err.message);
//       },
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   // Check-In
//   const handleCheckIn = async () => {
//     if (!position) return alert("Fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const payload = { employeeId, employeeEmail: email, latitude: position.lat, longitude: position.lng };

//     try {
//       setSubmitting(true);
//       const res = await fetch(`${BASE_URL}/api/attendance/checkin`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Check-In failed");

//       alert(
//         `✅ Check-In Successful! ${
//           distance <= ONSITE_RADIUS_M ? "(Onsite)" : "(Offsite)"
//         }`
//       );

//       setCheckedIn(true); // show Check-Out
//       localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: false }));
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Check-Out
//   const handleCheckOut = async () => {
//     if (!position) return alert("Fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const payload = { employeeId, employeeEmail: email, latitude: position.lat, longitude: position.lng };

//     try {
//       setSubmitting(true);
//       const res = await fetch(`${BASE_URL}/api/attendance/checkout`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Check-Out failed");

//       alert(
//         `✅ Check-Out Successful! ${
//           distance <= ONSITE_RADIUS_M ? "(Onsite)" : "(Offsite)"
//         }`
//       );

//       setCheckedIn(false); // show Check-In
//       localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: true }));
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100 sm:flex-row">
//       {/* Sidebar hidden on small screens */}
//       <div className="hidden sm:block">
//         <EmployeeSidebar />
//       </div>

//       <div className="flex flex-col flex-1">
//         <Navbar />

//         <div className="flex flex-col items-center justify-center flex-1 p-4 sm:p-6">
//           <div className="w-full max-w-lg p-6 text-center bg-white shadow-lg rounded-2xl sm:p-8">
//             <h2 className="mb-6 text-2xl font-semibold text-gray-800 sm:text-3xl">
//               Attendance Capture
//             </h2>

//             {/* ✅ Back Button */}
//             <button
//               onClick={() => navigate("/employeedashboard")}
//               className="w-full px-5 py-2 mb-5 text-white transition-all bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
//             >
//               ← Back to Dashboard
//             </button>

//             <div className="p-4 mb-6 rounded-lg shadow-sm bg-gray-50">
//               <h3 className="mb-2 text-lg font-medium text-gray-700">Your Location</h3>
//               <button
//                 onClick={fetchLocation}
//                 className="w-full px-5 py-2 text-white bg-green-600 rounded-lg sm:w-auto hover:bg-green-700"
//                 disabled={locStatus === "fetching"}
//               >
//                 {locStatus === "fetching" ? "Fetching..." : "Get Current Location"}
//               </button>

//               {position && (
//                 <div className="mt-3 text-sm text-gray-700 sm:text-base">
//                   <p>Lat: {position.lat.toFixed(6)}</p>
//                   <p>Lng: {position.lng.toFixed(6)}</p>
//                   <p>
//                     Distance:{" "}
//                     <strong>
//                       {distance} m (
//                       {distance <= ONSITE_RADIUS_M ? (
//                         <span className="text-green-600">Onsite</span>
//                       ) : (
//                         <span className="text-red-600">Outside</span>
//                       )}
//                       )
//                     </strong>
//                   </p>
//                 </div>
//               )}
//             </div>

//             {!checkedIn ? (
//               <button
//                 onClick={handleCheckIn}
//                 disabled={submitting}
//                 className="w-full py-3 text-lg font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800"
//               >
//                 {submitting ? "Checking In..." : "Check In"}
//               </button>
//             ) : (
//               <button
//                 onClick={handleCheckOut}
//                 disabled={submitting}
//                 className="w-full py-3 text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
//               >
//                 {submitting ? "Checking Out..." : "Check Out"}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/AttendanceCapture.jsx
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import EmployeeSidebar from "../Components/EmployeeSidebar";
// import Navbar from "../Components/Navbar";

// const OFFICE_COORDS = { lat: 17.445860, lng: 78.387154 };
// const ONSITE_RADIUS_M = 600;
// const BASE_URL = "https://api.timelyhealth.in/";

// // ✅ Accurate Haversine Formula
// function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
//   const R = 6371e3; // Radius of Earth in meters
//   const φ1 = (lat1 * Math.PI) / 180;
//   const φ2 = (lat2 * Math.PI) / 180;
//   const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//   const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//   const a =
//     Math.sin(Δφ / 2) ** 2 +
//     Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   const distance = R * c; // in meters
//   return distance;
// }

// export default function AttendanceCapture() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [locStatus, setLocStatus] = useState("idle");
//   const [submitting, setSubmitting] = useState(false);
//   const [checkedIn, setCheckedIn] = useState(false);
//   const [employeeId, setEmployeeId] = useState(null);
//   const [email, setEmail] = useState(null);

//   const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
//   const storageKey = `attendance_${employeeId}_${today}`;

//   // Load employee data
//   useEffect(() => {
//     const stateId = location.state?.employeeId;
//     const stateEmail = location.state?.email;

//     if (stateId && stateEmail) {
//       setEmployeeId(stateId);
//       setEmail(stateEmail);
//       localStorage.setItem(
//         "employeeData",
//         JSON.stringify({ employeeId: stateId, email: stateEmail })
//       );
//     } else {
//       const stored = JSON.parse(localStorage.getItem("employeeData"));
//       if (stored) {
//         setEmployeeId(stored.employeeId);
//         setEmail(stored.email);
//       }
//     }
//   }, [location.state]);

//   // Restore today's attendance status
//   useEffect(() => {
//     const fetchTodayStatus = async () => {
//       if (!employeeId) return;

//       try {
//         const res = await fetch(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch status");

//         const todayRecord = data.records.find((rec) => {
//           const recDate = new Date(rec.checkInTime).toLocaleDateString("en-CA");
//           return recDate === today;
//         });

//         if (todayRecord) {
//           if (todayRecord.status === "checked-in") {
//             setCheckedIn(true);
//             localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: false }));
//           } else if (todayRecord.status === "checked-out") {
//             setCheckedIn(false);
//             localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: true }));
//           }
//         } else {
//           setCheckedIn(false);
//           localStorage.removeItem(storageKey);
//         }
//       } catch (err) {
//         console.error("Error fetching today's attendance:", err.message);
//       }
//     };

//     fetchTodayStatus();
//   }, [employeeId, storageKey, today]);

//   // ✅ Fetch Geolocation
//   const fetchLocation = () => {
//     if (!navigator.geolocation) return alert("Geolocation not supported!");
//     setLocStatus("fetching");

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setPosition(coords);

//         // ✅ Use accurate function
//         const d = getDistanceFromLatLonInMeters(
//           coords.lat,
//           coords.lng,
//           OFFICE_COORDS.lat,
//           OFFICE_COORDS.lng
//         );
//         setDistance(Math.round(d));
//         setLocStatus("success");
//       },
//       (err) => {
//         setLocStatus("error");
//         alert("Location error: " + err.message);
//       },
//       { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//     );
//   };

//   // ✅ Check-In (Auto Onsite / Offsite)
//   const handleCheckIn = async () => {
//     if (!position) return alert("Please fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const statusType = distance <= ONSITE_RADIUS_M ? "Onsite" : "Offsite";

//     const payload = {
//       employeeId,
//       employeeEmail: email,
//       latitude: position.lat,
//       longitude: position.lng,
//       locationType: statusType, // ✅ store onsite/offsite
//     };

//     try {
//       setSubmitting(true);
//       const res = await fetch(`${BASE_URL}/api/attendance/checkin`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Check-In failed");

//       alert(`✅ Check-In Successful! (${statusType})`);
//       setCheckedIn(true);
//       localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: false }));
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ✅ Check-Out (Auto Onsite / Offsite)
//   const handleCheckOut = async () => {
//     if (!position) return alert("Please fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const statusType = distance <= ONSITE_RADIUS_M ? "Onsite" : "Offsite";

//     const payload = {
//       employeeId,
//       employeeEmail: email,
//       latitude: position.lat,
//       longitude: position.lng,
//       locationType: statusType, // ✅ store onsite/offsite
//     };

//     try {
//       setSubmitting(true);
//       const res = await fetch(`${BASE_URL}/api/attendance/checkout`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Check-Out failed");

//       alert(`✅ Check-Out Successful! (${statusType})`);
//       setCheckedIn(false);
//       localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: true }));
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100 sm:flex-row">
//       {/* Sidebar */}
//       <div className="hidden sm:block">
//         <EmployeeSidebar />
//       </div>

//       <div className="flex flex-col flex-1">
//         <Navbar />

//         <div className="flex flex-col items-center justify-center flex-1 p-4 sm:p-6">
//           <div className="w-full max-w-lg p-6 text-center bg-white shadow-lg rounded-2xl sm:p-8">
//             <h2 className="mb-6 text-2xl font-semibold text-gray-800 sm:text-3xl">
//               Attendance Capture
//             </h2>

//             {/* Back Button */}
//             <button
//               onClick={() => navigate("/employeedashboard")}
//               className="w-full px-5 py-2 mb-5 text-white transition-all bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
//             >
//               ← Back to Dashboard
//             </button>

//             <div className="p-4 mb-6 rounded-lg shadow-sm bg-gray-50">
//               <h3 className="mb-2 text-lg font-medium text-gray-700">Your Location</h3>
//               <button
//                 onClick={fetchLocation}
//                 className="w-full px-5 py-2 text-white bg-green-600 rounded-lg sm:w-auto hover:bg-green-700"
//                 disabled={locStatus === "fetching"}
//               >
//                 {locStatus === "fetching" ? "Fetching..." : "Get Current Location"}
//               </button>

//               {position && (
//                 <div className="mt-3 text-sm text-gray-700 sm:text-base">
//                   <p>Lat: {position.lat.toFixed(6)}</p>
//                   <p>Lng: {position.lng.toFixed(6)}</p>
//                   <p>
//                     Distance:{" "}
//                     <strong>
//                       {distance} m (
//                       {distance <= ONSITE_RADIUS_M ? (
//                         <span className="text-green-600">Onsite</span>
//                       ) : (
//                         <span className="text-red-600">Offsite</span>
//                       )}
//                       )
//                     </strong>
//                   </p>
//                 </div>
//               )}
//             </div>

//             {!checkedIn ? (
//               <button
//                 onClick={handleCheckIn}
//                 disabled={submitting}
//                 className="w-full py-3 text-lg font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800"
//               >
//                 {submitting ? "Checking In..." : "Check In"}
//               </button>
//             ) : (
//               <button
//                 onClick={handleCheckOut}
//                 disabled={submitting}
//                 className="w-full py-3 text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
//               >
//                 {submitting ? "Checking Out..." : "Check Out"}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import EmployeeSidebar from "../Components/EmployeeSidebar";
// import Navbar from "../Components/Navbar";

// const OFFICE_COORDS = { lat: 17.4458661, lng: 78.3849383 };
// const ONSITE_RADIUS_M = 50;
// const BASE_URL = "https://api.timelyhealth.in/";

// // Haversine formula
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000; // meters
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// export default function AttendanceCapture() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [locStatus, setLocStatus] = useState("idle");
//   const [submitting, setSubmitting] = useState(false);
//   const [checkedIn, setCheckedIn] = useState(false);
//   const [employeeId, setEmployeeId] = useState(null);
//   const [email, setEmail] = useState(null);

//   const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
//   const storageKey = `attendance_${employeeId}_${today}`;

//   // Load employee data
//   useEffect(() => {
//     const stateId = location.state?.employeeId;
//     const stateEmail = location.state?.email;

//     if (stateId && stateEmail) {
//       setEmployeeId(stateId);
//       setEmail(stateEmail);
//       localStorage.setItem(
//         "employeeData",
//         JSON.stringify({ employeeId: stateId, email: stateEmail })
//       );
//     } else {
//       const stored = JSON.parse(localStorage.getItem("employeeData"));
//       if (stored) {
//         setEmployeeId(stored.employeeId);
//         setEmail(stored.email);
//       }
//     }
//   }, [location.state]);

//   // Restore today's attendance status from backend
//   useEffect(() => {
//     const fetchTodayStatus = async () => {
//       if (!employeeId) return;
//       try {
//         const res = await fetch(
//           `${BASE_URL}/api/attendance/myattendance/${employeeId}`
//         );
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch status");

//         // Filter today's record
//         const todayRecord = data.records.find((rec) => {
//           const recDate = new Date(rec.checkInTime).toLocaleDateString("en-CA");
//           return recDate === today;
//         });

//         if (todayRecord) {
//           if (todayRecord.status === "checked-in") {
//             setCheckedIn(true);
//             localStorage.setItem(
//               storageKey,
//               JSON.stringify({ checkedIn: true, checkedOut: false })
//             );
//           } else if (todayRecord.status === "checked-out") {
//             setCheckedIn(false);
//             localStorage.setItem(
//               storageKey,
//               JSON.stringify({ checkedIn: true, checkedOut: true })
//             );
//           }
//         } else {
//           setCheckedIn(false);
//           localStorage.removeItem(storageKey);
//         }
//       } catch (err) {
//         console.error("Error fetching today's attendance:", err.message);
//       }
//     };
//     fetchTodayStatus();
//   }, [employeeId, storageKey, today]);

//   // Fetch geolocation
//   const fetchLocation = () => {
//     if (!navigator.geolocation)
//       return alert("Geolocation not supported!");

//     setLocStatus("fetching");
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = {
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         };
//         setPosition(coords);

//         const d = haversineDistance(
//           coords.lat,
//           coords.lng,
//           OFFICE_COORDS.lat,
//           OFFICE_COORDS.lng
//         );
//         setDistance(Math.round(d));
//         setLocStatus("success");
//       },
//       (err) => {
//         setLocStatus("error");
//         alert("Location error: " + err.message);
//       },
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   // Check-In
//   const handleCheckIn = async () => {
//     if (!position) return alert("Fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const payload = {
//       employeeId,
//       employeeEmail: email,
//       latitude: position.lat,
//       longitude: position.lng,
//     };

//     try {
//       setSubmitting(true);
//       const res = await fetch(`${BASE_URL}/api/attendance/checkin`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Check-In failed");

//       alert(
//         `✅ Check-In Successful! ${
//           distance <= ONSITE_RADIUS_M ? "(Onsite)" : "(Offsite)"
//         }`
//       );
//       setCheckedIn(true);
//       localStorage.setItem(
//         storageKey,
//         JSON.stringify({ checkedIn: true, checkedOut: false })
//       );
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Check-Out
//   const handleCheckOut = async () => {
//     if (!position) return alert("Fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const payload = {
//       employeeId,
//       employeeEmail: email,
//       latitude: position.lat,
//       longitude: position.lng,
//     };

//     try {
//       setSubmitting(true);
//       const res = await fetch(`${BASE_URL}/api/attendance/checkout`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Check-Out failed");

//       alert(
//         `✅ Check-Out Successful! ${
//           distance <= ONSITE_RADIUS_M ? "(Onsite)" : "(Offsite)"
//         }`
//       );
//       setCheckedIn(false);
//       localStorage.setItem(
//         storageKey,
//         JSON.stringify({ checkedIn: true, checkedOut: true })
//       );
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100 sm:flex-row">
//       {/* Sidebar hidden on small screens */}
//       <div className="hidden sm:block">
//         <EmployeeSidebar />
//       </div>

//       <div className="flex flex-col flex-1">
//         <Navbar />
//         <div className="flex flex-col items-center justify-center flex-1 p-4 sm:p-6">
//           <div className="w-full max-w-lg p-6 text-center bg-white shadow-lg rounded-2xl sm:p-8">
//             <h2 className="mb-6 text-2xl font-semibold text-gray-800 sm:text-3xl">
//               Attendance Capture
//             </h2>

//             {/* Back Button */}
//             <button
//               onClick={() => navigate("/employeedashboard")}
//               className="w-full px-5 py-2 mb-5 text-white transition-all bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
//             >
//               ← Back to Dashboard
//             </button>

//             <div className="p-4 mb-6 rounded-lg shadow-sm bg-gray-50">
//               <h3 className="mb-2 text-lg font-medium text-gray-700">
//                 Your Location
//               </h3>

//               <button
//                 onClick={fetchLocation}
//                 className="w-full px-5 py-2 text-white bg-green-600 rounded-lg sm:w-auto hover:bg-green-700"
//                 disabled={locStatus === "fetching"}
//               >
//                 {locStatus === "fetching"
//                   ? "Fetching..."
//                   : "Get Current Location"}
//               </button>

//               {position && (
//                 <div className="mt-3 text-sm text-gray-700 sm:text-base">
//                   <p>Lat: {position.lat.toFixed(6)}</p>
//                   <p>Lng: {position.lng.toFixed(6)}</p>
//                   <p>
//                     Distance:{" "}
//                     <strong>
//                       {distance} m (
//                       {distance <= ONSITE_RADIUS_M ? (
//                         <span className="text-green-600">Onsite</span>
//                       ) : (
//                         <span className="text-red-600">Outside</span>
//                       )}
//                       )
//                     </strong>
//                   </p>
//                 </div>
//               )}
//             </div>

//             {!checkedIn ? (
//               <button
//                 onClick={handleCheckIn}
//                 disabled={submitting}
//                 className="w-full py-3 text-lg font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800"
//               >
//                 {submitting ? "Checking In..." : "Check In"}
//               </button>
//             ) : (
//               <button
//                 onClick={handleCheckOut}
//                 disabled={submitting}
//                 className="w-full py-3 text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
//               >
//                 {submitting ? "Checking Out..." : "Check Out"}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/AttendanceCapture.jsx
// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import EmployeeSidebar from "../Components/EmployeeSidebar";
// import Navbar from "../Components/Navbar";

// const OFFICE_COORDS = { lat: 17.4458661, lng: 78.3849383 };
// const ONSITE_RADIUS_M = 50;
// const BASE_URL = "https://api.timelyhealth.in/";

// // Haversine formula for distance
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000;
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// export default function AttendanceCapture() {
//   const location = useLocation();
//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [locStatus, setLocStatus] = useState("idle");
//   const [submitting, setSubmitting] = useState(false);
//   const [checkedIn, setCheckedIn] = useState(false);

//   // ✅ Read employee data from location.state or fallback to localStorage
//   const [employeeId, setEmployeeId] = useState(null);
//   const [email, setEmail] = useState(null);

//   useEffect(() => {
//     const stateId = location.state?.employeeId;
//     const stateEmail = location.state?.email;

//     if (stateId && stateEmail) {
//       setEmployeeId(stateId);
//       setEmail(stateEmail);
//       localStorage.setItem(
//         "employeeData",
//         JSON.stringify({ employeeId: stateId, email: stateEmail })
//       );
//     } else {
//       const stored = JSON.parse(localStorage.getItem("employeeData"));
//       if (stored) {
//         setEmployeeId(stored.employeeId);
//         setEmail(stored.email);
//       }
//     }
//   }, [location.state]);

//   // Restore check-in status
//   useEffect(() => {
//     const storedCheckIn = localStorage.getItem("checkedIn");
//     if (storedCheckIn === "true") setCheckedIn(true);
//   }, []);

//   // Fetch current geolocation
//   const fetchLocation = () => {
//     if (!navigator.geolocation) return alert("Geolocation not supported!");
//     setLocStatus("fetching");

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setPosition(coords);
//         const d = haversineDistance(
//           coords.lat,
//           coords.lng,
//           OFFICE_COORDS.lat,
//           OFFICE_COORDS.lng
//         );
//         setDistance(Math.round(d));
//         setLocStatus("success");
//       },
//       (err) => {
//         setLocStatus("error");
//         alert("Location error: " + err.message);
//       },
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   // ✅ Handle Check-In
//   const handleCheckIn = async () => {
//     if (!position) return alert("Fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const payload = {
//       employeeId,
//       employeeEmail: email,
//       latitude: position.lat,
//       longitude: position.lng,
//     };

//     try {
//       setSubmitting(true);
//       const res = await fetch(`${BASE_URL}/api/attendance/checkin`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Check-In failed");

//       alert(
//         `✅ Check-In Successful! ${
//           distance <= ONSITE_RADIUS_M ? "(Onsite)" : "(Outside office)"
//         }`
//       );
//       setCheckedIn(true);
//       localStorage.setItem("checkedIn", "true");
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ✅ Handle Check-Out
//   const handleCheckOut = async () => {
//     if (!position) return alert("Fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const payload = {
//       employeeId,
//       employeeEmail: email,
//       latitude: position.lat,
//       longitude: position.lng,
//     };

//     try {
//       setSubmitting(true);
//       const res = await fetch(`${BASE_URL}/api/attendance/checkout`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Check-Out failed");

//       alert(
//         `✅ Check-Out Successful! ${
//           distance <= ONSITE_RADIUS_M ? "(Onsite)" : "(Outside office)"
//         }`
//       );
//       setCheckedIn(false);
//       localStorage.removeItem("checkedIn");
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <EmployeeSidebar />

//       {/* Main Content */}
//       <div className="flex flex-col flex-1">
//         {/* Navbar */}
//         <Navbar />

//         {/* Attendance Content */}
//         <div className="max-w-lg p-6 mx-auto text-center">
//           <h2 className="mb-6 text-2xl font-semibold">Attendance Capture</h2>

//           <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
//             <h3 className="mb-2 text-lg font-medium">Your Location</h3>
//             <button
//               onClick={fetchLocation}
//               className="px-4 py-2 text-white bg-green-600 rounded"
//               disabled={locStatus === "fetching"}
//             >
//               {locStatus === "fetching" ? "Fetching..." : "Get Current Location"}
//             </button>

//             {position && (
//               <div className="mt-3 text-gray-700">
//                 <p>Lat: {position.lat.toFixed(6)}</p>
//                 <p>Lng: {position.lng.toFixed(6)}</p>
//                 <p>
//                   Distance:{" "}
//                   <strong>
//                     {distance} m ({distance <= ONSITE_RADIUS_M ? "Onsite" : "Outside"})
//                   </strong>
//                 </p>
//               </div>
//             )}
//           </div>

//           {!checkedIn ? (
//             <button
//               onClick={handleCheckIn}
//               disabled={submitting}
//               className="w-full py-3 text-lg font-semibold text-white bg-green-700 rounded-lg"
//             >
//               {submitting ? "Checking In..." : "Check In"}
//             </button>
//           ) : (
//             <button
//               onClick={handleCheckOut}
//               disabled={submitting}
//               className="w-full py-3 text-lg font-semibold text-white bg-red-600 rounded-lg"
//             >
//               {submitting ? "Checking Out..." : "Check Out"}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// const BASE_URL = "https://api.timelyhealth.in//api/attendance";
// const OFFICE_COORDS = { lat: 17.448294, lng: 78.391487 };
// const ONSITE_RADIUS_M = 600;

// // Haversine formula to calculate distance
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000; // meters
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return Math.round(R * c);
// }

// export default function AttendanceCapture() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [checkedIn, setCheckedIn] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [employeeId, setEmployeeId] = useState(null);
//   const [employeeEmail, setEmployeeEmail] = useState(null);

//   // Load employee data
//   useEffect(() => {
//     const stateId = location.state?.employeeId;
//     const stateEmail = location.state?.email;

//     if (stateId && stateEmail) {
//       setEmployeeId(stateId);
//       setEmployeeEmail(stateEmail);
//       localStorage.setItem(
//         "employeeData",
//         JSON.stringify({ employeeId: stateId, email: stateEmail })
//       );
//     } else {
//       const stored = JSON.parse(localStorage.getItem("employeeData"));
//       if (stored) {
//         setEmployeeId(stored.employeeId);
//         setEmployeeEmail(stored.email);
//       }
//     }
//   }, [location.state]);

//   // Fetch today's attendance to determine initial checkedIn state
//   useEffect(() => {
//     const fetchTodayAttendance = async () => {
//       if (!employeeId) return;

//       try {
//         const res = await fetch(`${BASE_URL}/myattendance/${employeeId}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch");

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         // Check if there's a record with status 'checked-in' today
//         const todayCheckIn = data.records.find(
//           (rec) =>
//             new Date(rec.checkInTime) >= today &&
//             rec.status === "checked-in"
//         );

//         setCheckedIn(!!todayCheckIn);
//       } catch (err) {
//         console.error("Fetch today attendance error:", err);
//       }
//     };

//     fetchTodayAttendance();
//   }, [employeeId]);

//   const fetchLocation = () => {
//     if (!navigator.geolocation)
//       return alert("Geolocation is not supported by your browser");

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setPosition(coords);
//         setDistance(
//           haversineDistance(
//             coords.lat,
//             coords.lng,
//             OFFICE_COORDS.lat,
//             OFFICE_COORDS.lng
//           )
//         );
//       },
//       (err) => alert(err.message),
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   const handleCheckIn = async () => {
//     if (!position) return alert("Get your location first");
//     if (!employeeId || !employeeEmail)
//       return alert("Employee data missing");

//     setSubmitting(true);
//     try {
//       const res = await fetch(`${BASE_URL}/checkin`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           employeeId,
//           employeeEmail,
//           latitude: position.lat,
//           longitude: position.lng,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       alert(data.message);
//       setCheckedIn(true);
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleCheckOut = async () => {
//     if (!position) return alert("Get your location first");
//     if (!employeeId) return alert("Employee data missing");

//     setSubmitting(true);
//     try {
//       const res = await fetch(`${BASE_URL}/checkout`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           employeeId,
//           latitude: position.lat,
//           longitude: position.lng,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       alert(data.message);
//       setCheckedIn(false);
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
//       <button
//         onClick={() => navigate("/employeedashboard")}
//         className="self-start mb-4 font-medium text-gray-700 hover:text-gray-900"
//       >
//         ← Back
//       </button>

//       <div className="flex flex-col w-full max-w-md gap-4 p-6 bg-white shadow-lg rounded-xl">
//         <h2 className="text-2xl font-semibold text-center">Attendance Capture</h2>

//         <div className="flex flex-col gap-3 p-4 rounded-md bg-gray-50">
//           <button
//             onClick={fetchLocation}
//             className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
//           >
//             Get Current Location
//           </button>

//           {position && (
//             <div className="text-gray-700">
//               <p>Lat: {position.lat.toFixed(6)}</p>
//               <p>Lng: {position.lng.toFixed(6)}</p>
//               <p>
//                 Distance: <strong>{distance} m</strong> (
//                 {distance <= ONSITE_RADIUS_M ? "Onsite" : "Outside"})
//               </p>
//             </div>
//           )}
//         </div>

//         {!checkedIn ? (
//           <button
//             onClick={handleCheckIn}
//             disabled={submitting || !position || !employeeId}
//             className="w-full py-3 text-lg font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             {submitting ? "Checking In..." : "Check In"}
//           </button>
//         ) : (
//           <button
//             onClick={handleCheckOut}
//             disabled={submitting || !position || !employeeId}
//             className="w-full py-3 text-lg font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
//           >
//             {submitting ? "Checking Out..." : "Check Out"}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const BASE_URL = "https://api.timelyhealth.in//api/attendance";
// const OFFICE_COORDS = { lat: 17.448294, lng: 78.391487 };
// const ONSITE_RADIUS_M = 600;

// // Haversine formula to calculate distance
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000; // meters
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return Math.round(R * c);
// }

// export default function AttendanceCapture() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [checkedIn, setCheckedIn] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [employeeId, setEmployeeId] = useState(null);
//   const [employeeEmail, setEmployeeEmail] = useState(null);

//   // Load employee data
//   useEffect(() => {
//     const stateId = location.state?.employeeId;
//     const stateEmail = location.state?.email;

//     if (stateId && stateEmail) {
//       setEmployeeId(stateId);
//       setEmployeeEmail(stateEmail);
//       localStorage.setItem(
//         "employeeData",
//         JSON.stringify({ employeeId: stateId, email: stateEmail })
//       );
//     } else {
//       const stored = JSON.parse(localStorage.getItem("employeeData"));
//       if (stored) {
//         setEmployeeId(stored.employeeId);
//         setEmployeeEmail(stored.email);
//       }
//     }
//   }, [location.state]);

//   // Fetch today's attendance to determine initial checkedIn state
//   useEffect(() => {
//     const fetchTodayAttendance = async () => {
//       if (!employeeId) return;

//       try {
//         const res = await fetch(`${BASE_URL}/myattendance/${employeeId}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch");

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         // Check if there's a record with status 'checked-in' today
//         const todayCheckIn = data.records.find(
//           (rec) =>
//             new Date(rec.checkInTime) >= today &&
//             rec.status === "checked-in"
//         );

//         setCheckedIn(!!todayCheckIn);
//       } catch (err) {
//         console.error("Fetch today attendance error:", err);
//       }
//     };

//     fetchTodayAttendance();
//   }, [employeeId]);

//   const fetchLocation = () => {
//     if (!navigator.geolocation)
//       return alert("Geolocation is not supported by your browser");

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setPosition(coords);
//         setDistance(
//           haversineDistance(
//             coords.lat,
//             coords.lng,
//             OFFICE_COORDS.lat,
//             OFFICE_COORDS.lng
//           )
//         );
//       },
//       (err) => alert(err.message),
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   const handleCheckIn = async () => {
//     if (!position) return alert("Get your location first");
//     if (!employeeId || !employeeEmail)
//       return alert("Employee data missing");

//     setSubmitting(true);
//     try {
//       const res = await fetch(`${BASE_URL}/checkin`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           employeeId,
//           employeeEmail,
//           latitude: position.lat,
//           longitude: position.lng,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       alert(data.message);
//       setCheckedIn(true);
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleCheckOut = async () => {
//     if (!position) return alert("Get your location first");
//     if (!employeeId) return alert("Employee data missing");

//     setSubmitting(true);
//     try {
//       const res = await fetch(`${BASE_URL}/checkout`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           employeeId,
//           latitude: position.lat,
//           longitude: position.lng,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       alert(data.message);
//       setCheckedIn(false);
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
//       <button
//         onClick={() => navigate("/employeedashboard")}
//         className="self-start mb-4 font-medium text-gray-700 hover:text-gray-900"
//       >
//         ← Back
//       </button>

//       <div className="flex flex-col w-full max-w-md gap-4 p-6 bg-white shadow-lg rounded-xl">
//         <h2 className="text-2xl font-semibold text-center">Attendance Capture</h2>

//         <div className="flex flex-col gap-3 p-4 rounded-md bg-gray-50">
//           <button
//             onClick={fetchLocation}
//             className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
//           >
//             Get Current Location
//           </button>

//           {position && (
//             <div className="text-gray-700">
//               <p>Lat: {position.lat.toFixed(6)}</p>
//               <p>Lng: {position.lng.toFixed(6)}</p>
//               <p>
//                 Distance: <strong>{distance} m</strong> (
//                 {distance <= ONSITE_RADIUS_M ? "Onsite" : "Outside"})
//               </p>
//             </div>
//           )}
//         </div>

//         {!checkedIn ? (
//           <button
//             onClick={handleCheckIn}
//             disabled={submitting || !position || !employeeId}
//             className="w-full py-3 text-lg font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             {submitting ? "Checking In..." : "Check In"}
//           </button>
//         ) : (
//           <button
//             onClick={handleCheckOut}
//             disabled={submitting || !position || !employeeId}
//             className="w-full py-3 text-lg font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
//           >
//             {submitting ? "Checking Out..." : "Check Out"}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }


// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const BASE_URL = "https://localhost:5000";
// const ONSITE_RADIUS_M = 50;

// // Haversine formula
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000;
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return Math.round(R * c);
// }

// export default function AttendanceCapture() {
//   const navigate = useNavigate();
//   const routerLocation = useLocation();

//   const [employeeId, setEmployeeId] = useState(null);
//   const [employeeEmail, setEmployeeEmail] = useState(null);
//   const [assignedLocation, setAssignedLocation] = useState(null);
//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [checkedIn, setCheckedIn] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [reason, setReason] = useState("");
//   const [error, setError] = useState("");

//   // Get employeeId & email
//   useEffect(() => {
//     const stateId = routerLocation.state?.employeeId;
//     const stateEmail = routerLocation.state?.email;

//     if (stateId && stateEmail) {
//       setEmployeeId(stateId);
//       setEmployeeEmail(stateEmail);
//       localStorage.setItem(
//         "employeeData",
//         JSON.stringify({ employeeId: stateId, email: stateEmail })
//       );
//     } else {
//       const stored = localStorage.getItem("employeeData");
//       if (stored) {
//         const data = JSON.parse(stored);
//         setEmployeeId(data.employeeId);
//         setEmployeeEmail(data.email);
//       }
//     }
//   }, [routerLocation.state]);

//   // Fetch Employee’s Assigned Location
//   useEffect(() => {
//     const fetchAssignedLocation = async () => {
//       if (!employeeId) return;
//       try {
//         const res = await axios.get(`${BASE_URL}/api/employees/mylocation/${employeeId}`);
//         if (res.data.success && res.data.data) {
//           setAssignedLocation(res.data.data.location);
//         } else {
//           setError("❌ No assigned location found for this employee.");
//         }
//       } catch (err) {
//         console.error("Error fetching employee location:", err);
//         setError("❌ Failed to fetch employee location.");
//       }
//     };
//     fetchAssignedLocation();
//   }, [employeeId]);

//   // Fetch today’s attendance
//   useEffect(() => {
//     const fetchTodayAttendance = async () => {
//       if (!employeeId) return;
//       try {
//         const res = await axios.get(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
//         const data = res.data;
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const todayCheckIn = data.records?.find(
//           (rec) => new Date(rec.checkInTime) >= today && rec.status === "checked-in"
//         );
//         setCheckedIn(!!todayCheckIn);
//       } catch (err) {
//         console.error("Error fetching today attendance:", err);
//       }
//     };
//     fetchTodayAttendance();
//   }, [employeeId]);

//   // Get current live location
//   const fetchLocation = () => {
//     if (!navigator.geolocation)
//       return alert("Geolocation is not supported by your browser.");

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setPosition(coords);

//         if (assignedLocation) {
//           const dist = haversineDistance(
//             coords.lat,
//             coords.lng,
//             assignedLocation.latitude,
//             assignedLocation.longitude
//           );
//           setDistance(dist);
//         } else {
//           alert("No assigned location found. Please contact admin.");
//         }
//       },
//       (err) => alert(err.message),
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   // Handle Check-In
//   // Frontend fix - always send reason
// const handleCheckIn = async () => {
//   if (!position) return alert("Please capture your current location first.");
//   if (!employeeId || !employeeEmail)
//     return alert("Employee data missing. Please login again.");
//   if (distance > ONSITE_RADIUS_M && !reason.trim())
//     return alert("You are outside the office range. Please select a reason.");

//   setSubmitting(true);
//   try {
//     const res = await axios.post(`${BASE_URL}/api/attendance/checkin`, {
//       employeeId,
//       employeeEmail,
//       latitude: position.lat,
//       longitude: position.lng,
//       reason: reason || "Onsite", // ✅ Always send reason
//     });

//     alert(res.data.message);
//     setCheckedIn(true);
//   } catch (err) {
//     alert(err.response?.data?.message || "Check-in failed.");
//   } finally {
//     setSubmitting(false);
//   }
// };

//   // Handle Check-Out
//   const handleCheckOut = async () => {
//     if (!position) return alert("Please capture your current location first.");
//     if (!employeeId) return alert("Employee data missing.");
//     if (distance > ONSITE_RADIUS_M && !reason.trim())
//       return alert("You are outside the office range. Please select a reason.");

//     setSubmitting(true);
//     try {
//       const res = await axios.post(`${BASE_URL}/api/attendance/checkout`, {
//         employeeId,
//         latitude: position.lat,
//         longitude: position.lng,
//         reason: distance > ONSITE_RADIUS_M ? reason : undefined,
//       });

//       alert(res.data.message);
//       setCheckedIn(false);
//     } catch (err) {
//       alert(err.response?.data?.message || "Check-out failed.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
//       {/* <button
//         onClick={() => navigate("/employeedashboard")}
//         className="self-start mb-4 font-medium text-gray-700 hover:text-gray-900"
//       >
//         ← Back
//       </button> */}

//       <div className="flex flex-col w-full max-w-md gap-6 p-6 bg-white shadow-lg rounded-xl">
//         <h2 className="text-2xl font-semibold text-center">Attendance Capture</h2>

//         {employeeId && (
//           <div className="p-3 rounded-md bg-green-50">
//             <p className="font-medium text-green-700">
//               Employee: {employeeId} | {employeeEmail}
//             </p>
//           </div>
//         )}

//         {assignedLocation ? (
//           <div className="p-4 rounded-md bg-blue-50">
//             <h3 className="font-medium text-blue-700">
//               Assigned Location: {assignedLocation.name}
//             </h3>
//             <p>Lat: {assignedLocation.latitude}</p>
//             <p>Lng: {assignedLocation.longitude}</p>
//             <p>Onsite Radius: {ONSITE_RADIUS_M} m</p>
//           </div>
//         ) : (
//           <p className="text-red-600">{error}</p>
//         )}

//         <div className="p-4 rounded-md bg-gray-50">
//           <button
//             onClick={fetchLocation}
//             className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
//           >
//             Get My Current Location
//           </button>

//           {position && (
//             <>
//               <p>Your Latitude: {position.lat.toFixed(6)}</p>
//               <p>Your Longitude: {position.lng.toFixed(6)}</p>

//               {distance != null && (
//                 <p>
//                   Distance from assigned location:{" "}
//                   <strong>{distance} m</strong> -{" "}
//                   <span
//                     className={
//                       distance <= ONSITE_RADIUS_M
//                         ? "text-green-600 font-semibold"
//                         : "text-red-600 font-semibold"
//                     }
//                   >
//                     {distance <= ONSITE_RADIUS_M
//                       ? "Inside Assigned Area"
//                       : "Outside Assigned Area"}
//                   </span>
//                 </p>
//               )}
//             </>
//           )}
//         </div>

//         {/* Reason Dropdown */}
//         {distance > ONSITE_RADIUS_M && (
//           <div className="flex flex-col">
//             <label className="mb-1 font-medium text-gray-700">
//               Reason (required since you’re outside the assigned area):
//             </label>
//             <select
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               className="p-2 border rounded-md"
//             >
//               <option value="">-- Select Reason --</option>
//               <option value="Field Work">Field Work</option>
//               <option value="Work From Home">Work From Home</option>
//             </select>
//           </div>
//         )}

//         {!checkedIn ? (
//           <button
//             onClick={handleCheckIn}
//             disabled={submitting || !position || !employeeId}
//             className={`w-full py-3 text-white rounded-lg text-lg font-semibold transition ${
//               submitting || !position || !employeeId
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700"
//             }`}
//           >
//             {submitting ? "Checking In..." : "Check In"}
//           </button>
//         ) : (
//           <button
//             onClick={handleCheckOut}
//             disabled={submitting || !position || !employeeId}
//             className={`w-full py-3 text-white rounded-lg text-lg font-semibold transition ${
//               submitting || !position || !employeeId
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-red-600 hover:bg-red-700"
//             }`}
//           >
//             {submitting ? "Checking Out..." : "Check Out"}
//           </button>
//         )}

//         {checkedIn && (
//           <div className="p-3 text-center rounded-md bg-yellow-50">
//             <p className="font-medium text-yellow-700">
//               ✅ You are currently checked in
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BASE_URL = "https://api.timelyhealth.in/";
const ONSITE_RADIUS_M = 50;

// Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function AttendanceCapture() {
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const [employeeId, setEmployeeId] = useState(null);
  const [employeeEmail, setEmployeeEmail] = useState(null);
  const [employeeName, setEmployeeName] = useState(null);
  const [assignedLocation, setAssignedLocation] = useState(null);
  const [position, setPosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState("");

  // Get employeeId & email
  useEffect(() => {
    const stateId = routerLocation.state?.employeeId;
    const stateEmail = routerLocation.state?.email;

    if (stateId && stateEmail) {
      setEmployeeId(stateId);
      setEmployeeEmail(stateEmail);
      localStorage.setItem(
        "employeeData",
        JSON.stringify({ employeeId: stateId, email: stateEmail })
      );
    } else {
      const stored = localStorage.getItem("employeeData");
      if (stored) {
        const data = JSON.parse(stored);
        setEmployeeId(data.employeeId);
        setEmployeeEmail(data.email);
      } else {
        navigate("/");
      }
    }
  }, [routerLocation.state, navigate]);

  // Fetch Employee's Assigned Location and Name
  useEffect(() => {
    const fetchAssignedLocation = async () => {
      if (!employeeId) return;
      
      setLoadingLocation(true);
      try {
        const res = await axios.get(`${BASE_URL}api/employees/mylocation/${employeeId}`);
        console.log("Location API Response:", res.data);
        
        if (res.data.success && res.data.data) {
          setAssignedLocation(res.data.data.location);
          
          // ✅ Extract employee name from API response
          if (res.data.data.employee && res.data.data.employee.name) {
            setEmployeeName(res.data.data.employee.name);
          } else {
            const username = employeeEmail ? employeeEmail.split('@')[0] : '';
            setEmployeeName(username);
          }
          
          setError("");
        } else {
          setError("❌ No assigned location found for this employee.");
          setAssignedLocation(null);
        }
      } catch (err) {
        console.error("Error fetching employee location:", err);
        setError("❌ Failed to fetch employee location. Please try again.");
        setAssignedLocation(null);
      } finally {
        setLoadingLocation(false);
      }
    };
    
    if (employeeId) {
      fetchAssignedLocation();
    }
  }, [employeeId, employeeEmail]);

  // Fetch today's attendance
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      if (!employeeId) return;
      try {
        const res = await axios.get(`${BASE_URL}api/attendance/myattendance/${employeeId}`);
        const data = res.data;
        
        // ✅ Get employee name from attendance API response too
        if (data.employeeName) {
          setEmployeeName(data.employeeName);
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCheckIn = data.records?.find(
          (rec) => new Date(rec.checkInTime) >= today && rec.status === "checked-in"
        );
        setCheckedIn(!!todayCheckIn);
      } catch (err) {
        console.error("Error fetching today attendance:", err);
      }
    };
    
    if (employeeId) {
      fetchTodayAttendance();
    }
  }, [employeeId]);

  // Get current live location
  const fetchLocation = () => {
    setLocationError("");
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return alert("Geolocation is not supported by your browser.");
    }

    setPosition(null);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        console.log("Geolocation captured:", coords);

        if (assignedLocation) {
          const dist = haversineDistance(
            coords.lat,
            coords.lng,
            assignedLocation.latitude,
            assignedLocation.longitude
          );
          setDistance(dist);
          console.log("Distance calculated:", dist, "meters");
        } else {
          setLocationError("No assigned location found. Please contact admin.");
        }
      },
      (err) => {
        const errorMessage = "Error getting location: " + err.message;
        setLocationError(errorMessage);
        alert(errorMessage);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000,
        maximumAge: 0 
      }
    );
  };

  // Handle Check-In
  const handleCheckIn = async () => {
    if (!position) return alert("Please capture your current location first.");
    if (!employeeId || !employeeEmail)
      return alert("Employee data missing. Please login again.");
    if (distance > ONSITE_RADIUS_M && !reason.trim())
      return alert("You are outside the office range. Please select a reason.");

    setSubmitting(true);
    try {
      const res = await axios.post(`${BASE_URL}api/attendance/checkin`, {
        employeeId,
        employeeEmail,
        latitude: position.lat,
        longitude: position.lng,
        reason: reason || "Onsite",
      });

      alert(res.data.message);
      setCheckedIn(true);
      
      // ✅ Update employee name from response
      if (res.data.employeeName) {
        setEmployeeName(res.data.employeeName);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Check-Out - ✅ Added confirmation dialog
  const handleCheckOut = async () => {
    if (!position) return alert("Please capture your current location first.");
    if (!employeeId) return alert("Employee data missing.");
    
    // ✅ CONFIRMATION DIALOG ADDED HERE
    const isConfirmed = window.confirm("Are you sure you want to check out?");
    if (!isConfirmed) return;

    if (distance > ONSITE_RADIUS_M && !reason.trim())
      return alert("You are outside the office range. Please select a reason.");

    setSubmitting(true);
    try {
      const res = await axios.post(`${BASE_URL}api/attendance/checkout`, {
        employeeId,
        latitude: position.lat,
        longitude: position.lng,
        reason: distance > ONSITE_RADIUS_M ? reason : undefined,
      });

      alert(res.data.message);
      setCheckedIn(false);
      setReason("");
      setPosition(null);
      setDistance(null);
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-2 bg-gray-100">
      <div className="flex flex-col w-full max-w-md gap-2 p-2 bg-white shadow-lg rounded-xl">
        <h2 className="text-3xl font-bold text-center">Attendance Capture</h2>

        {employeeId && (
          <div className="p-2 rounded-md bg-green-50">
            <p className="font-bold text-green-600">
              Employee ID: {employeeId}
            </p>
             {employeeName && (
              <p className="mt-1 font-bold text-green-600">Name: {employeeName}</p>
            )}
            {employeeEmail && (
              <p className="mt-1 font-bold text-green-600">Email: {employeeEmail}</p>
            )}
          </div>
        )}

        {loadingLocation ? (
          <div className="p-0 rounded-md bg-blue-50">
            <p className="text-blue-700">Loading location information...</p>
          </div>
        ) : assignedLocation ? (
          <div className="p-0 rounded-md bg-blue-50">
            <h5 className="font-bold text-blue-700">
              Assigned Location: {assignedLocation.name}
            </h5>
            <p>Onsite Radius: {ONSITE_RADIUS_M} meters</p>
          </div>
        ) : (
          <div className="p-0 rounded-md bg-red-50">
            <p className="font-medium text-red-600">{error || "Location not found"}</p>
            <p className="mt-1 text-sm text-gray-600">
              Please contact admin to assign a location for your employee account.
            </p>
          </div>
        )}

        <div className="p-4 rounded-md bg-gray-50">
          <button
            onClick={fetchLocation}
            className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition ${
              !assignedLocation ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!assignedLocation}
          >
            {!position ? "Get My Current Location" : "Update My Location"}
          </button>

          {!assignedLocation ? (
            <p className="mt-2 text-sm text-red-500">
              You need an assigned location to capture attendance.
            </p>
          ) : locationError ? (
            <p className="mt-2 text-sm text-red-500">{locationError}</p>
          ) : null}

          {position && (
            <div className="p-3 mt-4 rounded-md bg-green-50">
              <p className="font-medium text-green-700">📍 Location Captured Successfully!</p>

              {distance != null && (
                <p className="mt-2">
                  Distance from assigned location:{" "}
                  <strong>{distance} m</strong> -{" "}
                  <span
                    className={
                      distance <= ONSITE_RADIUS_M
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {distance <= ONSITE_RADIUS_M
                      ? "Inside Assigned Area"
                      : "Outside Assigned Area"}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {distance > ONSITE_RADIUS_M && (
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
              Reason (required since you're outside the assigned area):
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="">-- Select Reason --</option>
              <option value="Field Work">Field Work</option>
              <option value="Work From Home">Work From Home</option>
            </select>
          </div>
        )}

        {!checkedIn ? (
          <button
            onClick={handleCheckIn}
            disabled={submitting || !position || !employeeId || !assignedLocation}
            className={`w-full py-3 text-white rounded-lg text-lg font-semibold transition ${
              submitting || !position || !employeeId || !assignedLocation
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? "Checking In..." : "Check In"}
          </button>
        ) : (
          <button
            onClick={handleCheckOut}
            disabled={submitting || !position || !employeeId || !assignedLocation}
            className={`w-full py-3 text-white rounded-lg text-lg font-semibold transition ${
              submitting || !position || !employeeId || !assignedLocation
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {submitting ? "Checking Out..." : "Check Out"}
          </button>
        )}

        {checkedIn && (
          <div className="p-3 text-center rounded-md bg-yellow-50">
            <p className="font-medium text-yellow-700">
              ✅ You are currently checked in
            </p>
          </div>
        )}
      </div>
    </div>
  );
}