// import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
// import { useNavigate } from "react-router-dom";

// const Navbar = ({ setIsCollapsed, isCollapsed }) => {
// const navigate = useNavigate();
// const totalNotifications = 5; // Dummy count

// const handleNotificationsClick = () => {
// navigate("/notifications");
// };

// return ( <nav className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 text-white bg-blue-800 shadow-md">
// {/* Sidebar toggle button (left) */}
// <button
// onClick={() => setIsCollapsed(!isCollapsed)}
// className="p-2 text-2xl transition rounded-md hover:bg-blue-700"
// >
// {isCollapsed ? ( <RiMenu2Line className="text-[#AAAAAA]" />
// ) : ( <RiMenu3Line className="text-[#AAAAAA]" />
// )} 
// </button>
//   {/* Center spacer for balance on desktop */}
//   <div className="flex-grow hidden md:block"></div>

//   {/* Notifications (middle on small screens, left on desktop if needed) */}
//   {/* <div className="relative flex items-center md:order-2">
//     <button
//       onClick={handleNotificationsClick}
//       className="relative p-2 transition rounded-full hover:bg-blue-700"
//     >
//       <MdNotificationsNone className="text-2xl text-white" />
//       {totalNotifications > 0 && (
//         <span className="absolute flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
//           {totalNotifications}
//         </span>
//       )}
//     </button>
//   </div> */}

//   {/* Logo + Title (right side) */}
//   <div className="flex items-center gap-2 md:ml-4 md:order-3">
//     <img
//       src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
//       alt="Vendor Logo"
//       className="object-cover w-10 h-10"
//     />
//     <span className="text-lg font-semibold sm:text-xl">Attendance</span>
//   </div>
// </nav>
// );
// };

// export default Navbar;


// import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
// import { useLocation, useNavigate } from "react-router-dom";

// const Navbar = ({ setIsCollapsed, isCollapsed }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleMenuClick = () => {
//     console.log("Navbar: Toggling sidebar");
//     setIsCollapsed(!isCollapsed);
//   };

//   const getPageTitle = () => {
//     const path = location.pathname;
//     const routes = {
//       '/dashboard': 'Dashboard',
//       '/addemployee': 'Add Employee',
//       '/employeelist': 'Employee List',
//       '/attendancelist': 'All Employee Attendance',
//       '/attedancesummary': 'Attendance Summary',
//       '/today-attendance': "Today's Attendance",
//       '/late-today': 'Late Today',
//       '/absent-today': 'Absent Today',
//       '/leavelist': 'Leave Requests',
//       '/leaves-report': 'Leave Reports',
//       '/payroll': 'Payroll Management',
//       '/role-management': 'Role Management',
//       '/permission-settings': 'Permission Settings',
//       '/addlocation': 'Add Location',
//       '/locationlist': 'Location List',
//       '/shift': 'Shift Management',
//       '/shiftlist': 'Shift List',
//     };
    
//     return routes[path] || 'Dashboard';
//   };

//   return (
//     <nav className="sticky top-0 z-40 flex items-center justify-between w-full px-4 text-white bg-blue-800 shadow-md h-14">
      
//       {/* Left Section - Menu Button & Page Title */}
//       <div className="flex items-center gap-4">
//         {/* Sidebar toggle button */}
//         <button
//           onClick={handleMenuClick}
//           className="p-2 text-2xl transition rounded-md hover:bg-blue-700"
//         >
//           {isCollapsed ? (
//             <RiMenu2Line className="text-white" />
//           ) : (
//             <RiMenu3Line className="text-white" />
//           )}
//         </button>

//         {/* Page Title - Show on all screens */}
//         <div className="px-3 py-1 bg-blue-700 rounded-md">
//           <span className="text-sm font-semibold md:text-base">
//             {getPageTitle()}
//           </span>
//         </div>
//       </div>

//       {/* Logo + Title (right side) */}
//       <div className="flex items-center gap-2">
//         <img
//           src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
//           alt="Vendor Logo"
//           className="object-cover w-10 h-10 rounded-lg"
//         />
//         <span className="hidden text-lg font-semibold sm:text-xl sm:block">Attendance</span>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = () => {
    console.log("Navbar: Toggling sidebar");
    setIsCollapsed(!isCollapsed);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const routes = {
      // Attendance routes
      '/dashboard': 'Dashboard',
      '/addemployee': 'Add Employee',
      '/employeelist': 'Employee List',
      '/attendancelist': 'All Employee Attendance',
      '/attedancesummary': 'Attendance Summary',
      '/today-attendance': "Today's Attendance",
      '/late-today': 'Late Today',
      '/absent-today': 'Absent Today',
      '/leavelist': 'Leave Requests',
      '/leaves-report': 'Leave Reports',
      '/payroll': 'Payroll Management',
      '/role-management': 'Role Management',
      '/permission-settings': 'Permission Settings',
      '/addlocation': 'Add Location',
      '/locationlist': 'Location List',
      '/shift': 'Shift Management',
      '/shiftlist': 'Shift List',
      
      // BMI/Health routes
      '/bmi-dashboard': 'BMI Dashboard',
      '/health-camps': 'Health Camps',
      '/camp-registrations': 'Camp Registrations',
      '/camp-attendance': 'Camp Attendance',
      '/bmi-records': 'BMI Records',
      '/health-reports': 'Health Reports',
      '/wellness-programs': 'Wellness Programs',
      '/health-tips': 'Health Tips',
      
      // Recruitment routes
      '/recruitment-dashboard': 'Recruitment Dashboard',
      '/job-post': 'Jobs',
      '/post-new-job': 'Post New Job',
      '/job-positions-status': 'Job Positions Status',
      '/job-applicants': 'Job Applicants',
      '/score': 'Score Board',
      '/assessment-manager': 'Assessments',
      '/new-assessment': 'New Assessment',
      '/personal-documents': 'Personal Documents',
      '/employee-journey': 'Employee Journey',
      '/employee-resignation': 'Resignations',
      '/all-medical-certificates': 'Medical Certificates',
    };
    
    return routes[path] || 'Dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between w-full px-4 text-white bg-blue-800 shadow-md h-14">
      
      {/* Left Section - Menu Button & Page Title */}
      <div className="flex items-center gap-4">
        {/* Sidebar toggle button */}
        <button
          onClick={handleMenuClick}
          className="p-2 text-2xl transition rounded-md hover:bg-blue-700"
        >
          {isCollapsed ? (
            <RiMenu2Line className="text-white" />
          ) : (
            <RiMenu3Line className="text-white" />
          )}
        </button>

        {/* Page Title - Show on all screens */}
        <div className="px-3 py-1 bg-blue-700 rounded-md">
          <span className="text-sm font-semibold md:text-base">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Logo + Title (right side) */}
      <div className="flex items-center gap-2">
        <img
          src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
          alt="Vendor Logo"
          className="object-cover w-10 h-10 rounded-lg"
        />
        <span className="hidden text-lg font-semibold sm:text-xl sm:block">Attendance</span>
      </div>
    </nav>
  );
};

export default Navbar;