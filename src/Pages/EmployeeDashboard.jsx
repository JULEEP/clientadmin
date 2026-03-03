// import { useEffect, useState } from "react";
// import { FiCalendar, FiCamera, FiCheckCircle, FiClock, FiTrendingUp, FiUser, FiXCircle } from "react-icons/fi";
// import { useLocation, useNavigate } from "react-router-dom";
// import EmployeeSidebar from "../Components/EmployeeSidebar";
// import Navbar from "../Components/Navbar";

// const EmployeeDashboard = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const email = location.state?.email;

//   const [profile, setProfile] = useState(null);

//   useEffect(() => {
//     if (!email) return;
//     const fetchEmployee = async () => {
//       try {
//         const res = await fetch(`https://api.timelyhealth.in/api/employees/get-employee?email=${email}`);
//         const data = await res.json();
//         setProfile(data);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchEmployee();
//   }, [email]);

//   if (!profile) return <p className="p-6">Loading...</p>;

//   return (
//     <div className="flex h-screen overflow-hidden bg-gray-100">
//       {/* Sidebar: fixed height, scrollable */}
//       <div className="flex-shrink-0 h-full overflow-y-auto">
//         <EmployeeSidebar />
//       </div>

//       {/* Main content area */}
//       <div className="flex flex-col flex-1 overflow-hidden">
//         {/* Navbar */}
//         <div className="flex-shrink-0">
//           <Navbar />
//         </div>

//         {/* Scrollable page content */}
//         <main className="flex-1 p-6 overflow-y-auto">
//           <h1 className="text-2xl font-bold text-gray-800">Employee Dashboard</h1>
//           <p className="text-gray-500">Welcome back, {profile.name} 👋</p>

//           {/* Profile Card */}
//           <div className="p-6 mt-6 mb-6 bg-white shadow-md rounded-xl">
//             <div className="flex items-center gap-4">
//               <div className="p-4 text-blue-600 bg-blue-100 rounded-full">
//                 <FiUser className="text-3xl" />
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold">{profile.name}</h2>
//                 <p className="text-sm text-gray-500">{profile.role} — {profile.department}</p>
//                 <p className="mt-1 text-xs text-gray-400">
//                   Employee ID: {profile.employeeId} | Joined: {new Date(profile.joinDate).toLocaleDateString()}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Action Cards */}
//           <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">
//             <DashboardCard
//               icon={<FiCamera className="text-3xl text-green-600" />}
//               title="Mark Attendance"
//               subtitle="Capture photo & location"
//               onClick={() => navigate("/attendance-capture")}
//             />
//             <DashboardCard
//               icon={<FiClock className="text-3xl text-blue-600" />}
//               title="My Attendance"
//               subtitle="View attendance records"
//               onClick={() => navigate("/myattendance")}
//             />
//             <DashboardCard
//               icon={<FiCalendar className="text-3xl text-purple-600" />}
//               title="Leave Request"
//               subtitle="Apply for leave"
//               onClick={() => navigate("/leave-application")}
//             />
//           </div>

//           {/* Attendance Summary */}
//           <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-4">
//             <StatCard label="Total Days" value={profile.totalDays || 0} icon={<FiCalendar />} color="blue" />
//             <StatCard label="Present Days" value={profile.presentDays || 0} icon={<FiCheckCircle />} color="green" />
//             <StatCard label="Absent Days" value={profile.absentDays || 0} icon={<FiXCircle />} color="red" />
//             <StatCard label="Attendance Rate" value={`${profile.attendanceRate || 0}%`} icon={<FiTrendingUp />} color="purple" />
//           </div>

// {/* My Leave Requests */}
// <div
//   onClick={() => navigate("/myleaves")}
//   className="p-6 mt-10 transition bg-white shadow-md cursor-pointer rounded-xl hover:shadow-lg"
// >
//   <h3 className="flex items-center gap-2 text-lg font-semibold">
//     <FiCalendar /> My Leave Requests
//   </h3>
//   <p className="text-sm text-gray-500">Track your leave applications and their status</p>
//   <div className="flex justify-center mt-10 text-gray-400">
//     <FiCalendar className="text-4xl" />
//   </div>
// </div>

//         </main>
//       </div>
//     </div>
//   );
// };

// // Dashboard Card
// const DashboardCard = ({ icon, title, subtitle, onClick }) => (
//   <div
//     onClick={onClick}
//     className="flex flex-col items-center justify-center p-6 transition transform bg-white shadow-md cursor-pointer rounded-xl hover:scale-105 hover:shadow-lg"
//   >
//     <div className="p-4 mb-3 bg-gray-100 rounded-full">{icon}</div>
//     <h4 className="font-semibold text-gray-800">{title}</h4>
//     <p className="text-sm text-gray-500">{subtitle}</p>
//   </div>
// );

// // Stat Card
// const StatCard = ({ label, value, icon, color }) => {
//   const colorMap = {
//     blue: "text-blue-600 bg-blue-100",
//     green: "text-green-600 bg-green-100",
//     red: "text-red-600 bg-red-100",
//     purple: "text-purple-600 bg-purple-100",
//   };

//   return (
//     <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
//       <div className={`p-3 rounded-full ${colorMap[color]}`}>{icon}</div>
//       <div className="text-right">
//         <p className="text-sm text-gray-500">{label}</p>
//         <p className="text-xl font-bold">{value}</p>
//       </div>
//     </div>
//   );
// };

// export default EmployeeDashboard;




import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCamera,
  FiClock,
  FiUser,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import EmployeeNavbar from "../Components/EmployeeNavbar"; // ✅ Updated import
import EmployeeSidebar from "../Components/EmployeeSidebar";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Sidebar state (for responsiveness)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ Email from location or localStorage
  const email = location.state?.email || localStorage.getItem("employeeEmail");
  const [profile, setProfile] = useState(null);

  // ✅ Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fetch employee details
  useEffect(() => {
    if (!email) return;
    const fetchEmployee = async () => {
      try {
        const res = await fetch(
          `https://api.timelyhealth.in/api/employees/get-employee?email=${email}`
        );
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching employee:", err);
      }
    };
    fetchEmployee();
  }, [email]);

  if (!profile) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <EmployeeSidebar
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Overlay for mobile */}
      {isMobile && !isCollapsed && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* ✅ Employee Navbar */}
        <EmployeeNavbar
          setIsCollapsed={setIsCollapsed}
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          toggleMobileSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* ✅ Main Dashboard Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-800">
            Employee Dashboard
          </h1>
          <p className="text-gray-500">
            Welcome back, {profile.name} 👋
          </p>

          {/* Profile Card */}
          <div className="p-4 mt-6 bg-white shadow-md rounded-xl md:p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="p-4 text-blue-600 bg-blue-100 rounded-full">
                <FiUser className="text-3xl" />
              </div>
              <div>
                <h2 className="text-lg font-semibold md:text-xl">
                  {profile.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {profile.role} — {profile.department}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  ID: {profile.employeeId} | Joined:{" "}
                  {new Date(profile.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              icon={<FiCamera className="text-3xl text-green-600" />}
              title="Mark Attendance"
              subtitle="Capture photo & location"
              onClick={() => navigate("/attendance-capture")}
            />
            <DashboardCard
              icon={<FiClock className="text-3xl text-blue-600" />}
              title="My Attendance"
              subtitle="View attendance records"
              onClick={() => navigate("/myattendance")}
            />
            <DashboardCard
              icon={<FiCalendar className="text-3xl text-purple-600" />}
              title="Leave Request"
              subtitle="Apply for leave"
              onClick={() => navigate("/leave-application")}
            />
          </div>

          {/* My Leave Requests Section */}
          <div
            onClick={() => navigate("/myleaves")}
            className="p-6 mt-10 transition bg-white shadow-md cursor-pointer rounded-xl hover:shadow-lg"
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <FiCalendar /> My Leave Requests
            </h3>
            <p className="text-sm text-gray-500">
              Track your leave applications and their status
            </p>
            <div className="flex justify-center mt-10 text-gray-400">
              <FiCalendar className="text-4xl" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// ✅ DashboardCard Component
const DashboardCard = ({ icon, title, subtitle, onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 transition transform bg-white shadow-md cursor-pointer rounded-xl hover:scale-105 hover:shadow-lg"
  >
    <div className="p-4 mb-3 bg-gray-100 rounded-full">{icon}</div>
    <h4 className="font-semibold text-gray-800">{title}</h4>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);

export default EmployeeDashboard;
