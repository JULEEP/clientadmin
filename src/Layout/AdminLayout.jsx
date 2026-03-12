// import { useState, useEffect, Children } from "react";
// import { FiMenu } from "react-icons/fi";
// import { FaHome, FaUser, FaCog } from "react-icons/fa";
// import Sidebar from "../Components/Sidebar";
// import Navbar from "../Components/Navbar";

// export default function AdminLayout({children}) {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <Sidebar isCollapsed={isCollapsed} isMobile={isMobile} setIsCollapsed={setIsCollapsed}/>

//       {/* Main Content */}
//       <div className="flex flex-col flex-1">
//         {/* Navbar */}
//        <Navbar setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed}/>
//         <div className="p-4 overflow-y-scroll no-scrollbar bg-[#EFF0F1]">{children}</div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import Sidebar from '../Components/Sidebar';

const AdminLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto collapse on mobile, keep open on desktop by default
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false); // Desktop pe by default open
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle sidebar close function - FOR ALL DEVICES
  const handleSidebarClose = () => {
    console.log("Layout: Closing sidebar");
    setIsCollapsed(true);
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-gray-100 admin-layout">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          onLinkClick={handleSidebarClose}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Main Content - Fixed space calculation */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 main-content ${
          isMobile 
            ? 'ml-0' 
            : isCollapsed 
              ? 'lg:ml-16' 
              : 'lg:ml-52' /* Changed from ml-60 to ml-52 to match sidebar width */
        }`}>
          {/* Navbar */}
          <Navbar
            setIsCollapsed={setIsCollapsed}
            isCollapsed={isCollapsed}
          />

          {/* Page Content */}
          <main className="flex-1 p-0 overflow-auto bg-gray-100 md:p-2">
            {children}
          </main>
        </div>
      </div>

      {/* CSS to fix white gap issue */}
      <style jsx>{`
        /* Fix for the white gap issue */
        .admin-layout {
          margin: 0;
          padding: 0;
          background-color: #f3f4f6; /* bg-gray-100 */
          position: relative;
          width: 100vw;
          max-width: 100%;
        }

        /* Ensure no white gaps on body */
        :global(body) {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background-color: #f3f4f6;
        }

        :global(#root) {
          min-height: 100vh;
          background-color: #f3f4f6;
        }

        /* Main content area fix */
        .main-content {
          background-color: #f3f4f6;
          position: relative;
          width: 100%;
        }

        /* Sidebar transition optimization */
        :global(.fixed.top-0.left-0) {
          will-change: transform, width;
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* Remove any unwanted margins/padding */
        * {
          box-sizing: border-box;
        }

        /* Mobile specific fixes */
        @media (max-width: 767px) {
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
          }
          
          .admin-layout {
            overflow-x: hidden;
          }
        }

        /* Desktop specific fixes */
        @media (min-width: 768px) {
          .main-content {
            transition: margin-left 0.3s ease-in-out;
          }
        }

        /* Fix for the white space when sidebar is collapsed */
        .lg\\:ml-16 {
          margin-left: 4rem !important; /* 16 = 4rem = 64px */
        }

        .lg\\:ml-52 {
          margin-left: 13rem !important; /* 52 = 13rem = 208px */
        }

        /* Ensure background color consistency */
        .bg-gray-100 {
          background-color: #f3f4f6 !important;
        }

        /* Fix for any potential overflow issues */
        .overflow-auto {
          -webkit-overflow-scrolling: touch;
        }

        /* Smooth transitions */
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 300ms;
        }
      `}</style>
    </>
  );
};

export default AdminLayout;