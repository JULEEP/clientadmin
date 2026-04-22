// import { useState, useEffect } from 'react';
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Users,
//   Clock,
//   Building2,
//   Briefcase,
//   CalendarDays,
//   HeartPulse,
//   MessageCircle,
//   ShieldCheck,
//   Menu,
//   X,
//   Star,
//   CheckCircle,
//   ArrowRight,
//   Phone,
//   Mail,
//   MapPin,
//   Facebook,
//   Twitter,
//   Instagram,
//   Linkedin,
//   Youtube,
//   Search,
//   Calendar,
//   User,
//   Settings,
//   Bell,
//   LogIn,
//   UserPlus,
//   FileText,
//   BookOpen,
//   Home,
//   DollarSign,
//   ShoppingBag,
//   Package,
//   Activity,
//   TrendingUp,
//   Coffee,
//   Gift,
//   Award,
//   Globe,
//   Zap,
//   Smile,
//   Sparkles,
//   Rocket,
//   Shield,
//   Lock,
//   Key,
//   Heart,
//   Users as UsersIcon,
//   Calendar as CalendarIcon
// } from "lucide-react";

// const LoginPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [clientId, setClientId] = useState('');
//   const [loginType, setLoginType] = useState('email');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showProducts, setShowProducts] = useState(false);
//   const [clientData, setClientData] = useState(null);
//   const navigate = useNavigate();

//   // Check localStorage on component mount
//   useEffect(() => {
//     const storedShowProducts = localStorage.getItem('showProducts');
//     const storedClientData = localStorage.getItem('clientData');
    
//     if (storedShowProducts === 'true' && storedClientData) {
//       setShowProducts(true);
//       setClientData(JSON.parse(storedClientData));
//     }
//   }, []);

//   // Product icons mapping based on product name from database
//   const getProductIcon = (productName) => {
//     const name = productName.toLowerCase();
    
//     // Attendance System
//     if (name.includes('attendance')) {
//       return { icon: <Clock size={24} />, color: "bg-blue-100 text-blue-600", name: "Attendance System", section: "attendance" };
//     }
//     // Recruitment
//     if (name.includes('recruitment')) {
//       return { icon: <Briefcase size={24} />, color: "bg-indigo-100 text-indigo-600", name: "Recruitment", section: "recruitment" };
//     }
//     // Coworking Space
//     if (name.includes('coworking')) {
//       return { icon: <Building2 size={24} />, color: "bg-purple-100 text-purple-600", name: "Coworking Space", section: "coworking" };
//     }
//     // Training Camp
//     if (name.includes('camp') || name.includes('training')) {
//       return { icon: <UsersIcon size={24} />, color: "bg-red-100 text-red-600", name: "Training Camp", section: "camp" };
//     }
//     // HR
//     if (name.includes('hr') || name.includes('human resource')) {
//       return { icon: <Users size={24} />, color: "bg-pink-100 text-pink-600", name: "HR Management", section: "hr" };
//     }
//     // CRM
//     if (name.includes('crm')) {
//       return { icon: <Users size={24} />, color: "bg-rose-100 text-rose-600", name: "CRM System", section: "crm" };
//     }
//     // Projects
//     if (name.includes('project')) {
//       return { icon: <Briefcase size={24} />, color: "bg-orange-100 text-orange-600", name: "Project Management", section: "projects" };
//     }
//     // Appointments
//     if (name.includes('appointment')) {
//       return { icon: <CalendarDays size={24} />, color: "bg-green-100 text-green-600", name: "Appointments", section: "appointments" };
//     }
//     // Wellness
//     if (name.includes('wellness') || name.includes('health')) {
//       return { icon: <HeartPulse size={24} />, color: "bg-red-100 text-red-600", name: "Wellness", section: "wellness" };
//     }
//     // BMI
//     if (name.includes('bmi')) {
//       return { icon: <Heart size={24} />, color: "bg-red-100 text-red-600", name: "BMI Management", section: "bmi" };
//     }
//     // Support
//     if (name.includes('support')) {
//       return { icon: <MessageCircle size={24} />, color: "bg-indigo-100 text-indigo-600", name: "Support", section: "support" };
//     }
//     // Security
//     if (name.includes('security')) {
//       return { icon: <ShieldCheck size={24} />, color: "bg-teal-100 text-teal-600", name: "Security", section: "security" };
//     }
//     // Accounting
//     if (name.includes('accounting')) {
//       return { icon: <FileText size={24} />, color: "bg-amber-100 text-amber-600", name: "Accounting", section: "accounting" };
//     }
//     // Knowledge
//     if (name.includes('knowledge')) {
//       return { icon: <BookOpen size={24} />, color: "bg-cyan-100 text-cyan-600", name: "Knowledge", section: "knowledge" };
//     }
//     // POS
//     if (name.includes('pos') || name.includes('point of sale')) {
//       return { icon: <DollarSign size={24} />, color: "bg-orange-100 text-orange-600", name: "Point of Sale", section: "pos" };
//     }
//     // Inventory
//     if (name.includes('inventory')) {
//       return { icon: <Package size={24} />, color: "bg-blue-100 text-blue-600", name: "Inventory", section: "inventory" };
//     }
//     // Sales
//     if (name.includes('sales')) {
//       return { icon: <TrendingUp size={24} />, color: "bg-green-100 text-green-600", name: "Sales", section: "sales" };
//     }
//     // Dashboard
//     if (name.includes('dashboard')) {
//       return { icon: <Activity size={24} />, color: "bg-yellow-100 text-yellow-600", name: "Dashboard", section: "dashboard" };
//     }
//     // Default
//     return { icon: <Rocket size={24} />, color: "bg-gray-100 text-gray-600", name: productName, section: productName.toLowerCase() };
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       let clientPayload = {};
      
//       if (loginType === 'email') {
//         clientPayload = { email, password };
//       } else {
//         clientPayload = { clientId, password };
//       }

//       const clientResponse = await fetch('http://localhost:5005/api/clients/clientlogin', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(clientPayload),
//       });

//       const clientDataResponse = await clientResponse.json();

//       if (clientResponse.ok) {
//         // Format the client data properly
//         const formattedClient = {
//           ...clientDataResponse.client,
//           accessibleProducts: clientDataResponse.client.accessibleProducts.map(product => ({
//             ...product,
//             displayName: product.name || (product.productId?.name) || "Unknown Product",
//             productCode: product.code || product.productId?.code || "N/A"
//           }))
//         };
        
//         // Store client data
//         setClientData(formattedClient);
//         localStorage.setItem('clientToken', clientDataResponse.token);
//         localStorage.setItem('clientId', formattedClient._id);
//         localStorage.setItem('clientCustomId', formattedClient.clientId);
//         localStorage.setItem('clientName', formattedClient.name);
//         localStorage.setItem('clientEmail', formattedClient.email);
//         localStorage.setItem('clientData', JSON.stringify(formattedClient));
//         localStorage.setItem('userRole', 'client');
//         localStorage.setItem('showProducts', 'true');
        
//         // Show products page instead of directly navigating
//         setShowProducts(true);
//         return;
//       }

//       throw new Error(clientDataResponse.message || 'Invalid credentials');

//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleProductClick = (product) => {
//     // Get the product info
//     const productInfo = getProductIcon(product.displayName || product.name);
//     const sectionToNavigate = productInfo.section;
    
//     // Navigate to dashboard with product info
//     localStorage.removeItem('showProducts'); // Clear products page flag
//     navigate('/dashboard', { 
//       state: { 
//         client: clientData,
//         selectedProduct: sectionToNavigate,
//         selectedProductName: productInfo.name,
//         userType: 'client'
//       } 
//     });
//   };

//   const handleBackToLogin = () => {
//     setShowProducts(false);
//     setClientData(null);
//     localStorage.removeItem('showProducts');
//     localStorage.removeItem('clientData');
//   };

//   // If showing products page
//   if (showProducts && clientData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
//         {/* Animated background */}
//         <div className="fixed inset-0 overflow-hidden">
//           <div className="absolute bg-purple-300 rounded-full top-20 left-10 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
//           <div className="absolute bg-pink-300 rounded-full top-40 right-10 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
//           <div className="absolute bg-blue-300 rounded-full bottom-20 left-1/2 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
//         </div>

//         <div className="relative max-w-6xl px-4 py-12 mx-auto">
//           {/* Welcome Header */}
//           <motion.div 
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="mb-8 text-center"
//           >
//             <div className="inline-flex items-center px-4 py-2 mb-4 rounded-full shadow-sm bg-white/80 backdrop-blur-sm">
//               <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
//               <span className="text-sm text-gray-600">Welcome back, {clientData.name}!</span>
//             </div>
            
//             <h1 className="mb-2 text-3xl font-bold text-gray-800 md:text-4xl">
//               Your <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Purchased Products</span>
//             </h1>
//             <p className="text-gray-600">Select a product to access your dashboard</p>
//           </motion.div>

//           {/* Client Info Card */}
//           <motion.div 
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             className="p-6 mb-8 border border-gray-100 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl"
//           >
//             <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
//               <div className="text-center">
//                 <p className="text-xs text-gray-500">Client ID</p>
//                 <p className="text-sm font-medium text-gray-800">{clientData.clientId}</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-xs text-gray-500">Email</p>
//                 <p className="text-sm font-medium text-gray-800 truncate">{clientData.email}</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-xs text-gray-500">Company</p>
//                 <p className="text-sm font-medium text-gray-800">{clientData.companyName || 'N/A'}</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-xs text-gray-500">Location</p>
//                 <p className="text-sm font-medium text-gray-800">
//                   {clientData.location ? (typeof clientData.location === 'string' ? 
//                     JSON.parse(clientData.location)?.city || 'N/A' : 
//                     clientData.location.city || 'N/A') : 'N/A'}
//                 </p>
//               </div>
//             </div>
//           </motion.div>

//           {/* Products Grid */}
//           {clientData.accessibleProducts && clientData.accessibleProducts.length > 0 ? (
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5, delay: 0.4 }}
//               className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
//             >
//               {clientData.accessibleProducts.map((product, index) => {
//                 // Get product name from the response
//                 const productName = product.name || product.displayName || "Unknown Product";
//                 const productInfo = getProductIcon(productName);
                
//                 return (
//                   <motion.div
//                     key={index}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.3, delay: index * 0.1 }}
//                     whileHover={{ scale: 1.05, y: -5 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => handleProductClick(product)}
//                     className="relative p-4 overflow-hidden text-center transition-all duration-300 bg-white shadow-sm cursor-pointer rounded-xl hover:shadow-xl group"
//                   >
//                     {/* Gradient overlay on hover */}
//                     <div className={`absolute inset-0 bg-gradient-to-br ${productInfo.color.replace('100', '500')} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
//                     <div className={`w-14 h-14 mx-auto mb-3 flex items-center justify-center rounded-xl ${productInfo.color} group-hover:scale-110 transition-transform duration-300`}>
//                       {productInfo.icon}
//                     </div>
                    
//                     <p className="text-sm font-medium text-gray-700 group-hover:text-[#714b67] transition">
//                       {productInfo.name}
//                     </p>
                    
//                     {product.price > 0 && (
//                       <p className="mt-1 text-xs font-semibold text-green-600">
//                         ₹{product.price}
//                       </p>
//                     )}
                    
//                     <p className="text-[10px] text-gray-400 mt-1">
//                       Click to access
//                     </p>

//                     {/* Shine effect on hover */}
//                     <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
//                       <div className="absolute top-0 block w-1/2 h-full transform -skew-x-12 -inset-full z-5 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </motion.div>
//           ) : (
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5 }}
//               className="py-12 text-center"
//             >
//               <div className="max-w-md p-8 mx-auto bg-white/80 backdrop-blur-sm rounded-xl">
//                 <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
//                 <h3 className="mb-2 text-lg font-medium text-gray-800">No Products Found</h3>
//                 <p className="mb-4 text-sm text-gray-500">
//                   You haven't purchased any products yet.
//                 </p>
//                 <button
//                   onClick={handleBackToLogin}
//                   className="px-4 py-2 text-sm text-white transition-all rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg"
//                 >
//                   Back to Login
//                 </button>
//               </div>
//             </motion.div>
//           )}

//           {/* Bottom actions */}
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5, delay: 0.6 }}
//             className="mt-8 text-center"
//           >
//             <button
//               onClick={handleBackToLogin}
//               className="flex items-center justify-center mx-auto text-sm text-gray-500 transition hover:text-gray-700"
//             >
//               <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
//               Back to Login
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   // Login Page - Client Only
//   return (
//     <div className="relative flex items-center justify-center min-h-screen px-4 py-6 overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <motion.div 
//           animate={{ 
//             x: [0, 100, 0],
//             y: [0, 50, 0],
//           }}
//           transition={{ 
//             duration: 20,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//           className="absolute w-64 h-64 bg-blue-300 rounded-full top-20 left-10 mix-blend-multiply filter blur-xl opacity-20"
//         ></motion.div>
//         <motion.div 
//           animate={{ 
//             x: [0, -100, 0],
//             y: [0, 80, 0],
//           }}
//           transition={{ 
//             duration: 25,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//           className="absolute w-64 h-64 bg-purple-300 rounded-full top-40 right-10 mix-blend-multiply filter blur-xl opacity-20"
//         ></motion.div>
//         <motion.div 
//           animate={{ 
//             x: [0, 50, 0],
//             y: [0, -50, 0],
//           }}
//           transition={{ 
//             duration: 18,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//           className="absolute w-64 h-64 bg-pink-300 rounded-full bottom-20 left-1/2 mix-blend-multiply filter blur-xl opacity-20"
//         ></motion.div>
//       </div>

//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="relative z-10 grid w-full max-w-4xl grid-cols-1 overflow-hidden shadow-2xl bg-white/90 backdrop-blur-md rounded-2xl md:grid-cols-2"
//       >
//         {/* Left Side - Login Form */}
//         <div className="flex flex-col justify-center p-6 md:p-8">
//           <motion.div 
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             className="mb-4 text-center"
//           >
//             <div className="inline-flex items-center px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
//               <Lock className="w-3 h-3 mr-1 text-blue-600" />
//               <span className="text-xs text-gray-600">Client Portal</span>
//             </div>
//             <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
//               Client Login
//             </h1>
//             <p className="mt-1 text-xs text-gray-500">Sign in to access your products</p>
//           </motion.div>

//           {/* Login Type Toggle */}
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5, delay: 0.3 }}
//             className="flex justify-center mb-4"
//           >
//             <div className="inline-flex p-1 bg-gray-100 rounded-lg">
//               <button
//                 type="button"
//                 onClick={() => setLoginType('email')}
//                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
//                   loginType === 'email' 
//                     ? 'bg-white shadow text-blue-600 scale-105' 
//                     : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 Email Login
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setLoginType('clientId')}
//                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
//                   loginType === 'clientId' 
//                     ? 'bg-white shadow text-purple-600 scale-105' 
//                     : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 Client ID
//               </button>
//             </div>
//           </motion.div>

//           <AnimatePresence>
//             {error && (
//               <motion.div 
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0 }}
//                 className="p-2 mb-3 text-xs text-red-600 border border-red-100 rounded-md bg-red-50"
//               >
//                 {error}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <AnimatePresence mode="wait">
//               {loginType === 'email' ? (
//                 <motion.div
//                   key="email-field"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <label className="block mb-1 text-xs font-medium text-gray-700" htmlFor="email">
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="you@domain.com"
//                     className="w-full px-3 py-2 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   />
//                 </motion.div>
//               ) : (
//                 <motion.div
//                   key="clientid-field"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <label className="block mb-1 text-xs font-medium text-gray-700" htmlFor="clientId">
//                     Client ID
//                   </label>
//                   <input
//                     type="text"
//                     id="clientId"
//                     value={clientId}
//                     onChange={(e) => setClientId(e.target.value)}
//                     placeholder="CLIENT-XXXXXX"
//                     className="w-full px-3 py-2 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                     required
//                   />
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5, delay: 0.4 }}
//             >
//               <label className="block mb-1 text-xs font-medium text-gray-700">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="••••••••"
//                   className="w-full px-3 py-2 pr-10 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 flex items-center text-gray-500 transition right-3 hover:text-blue-600"
//                 >
//                   {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
//                 </button>
//               </div>
//             </motion.div>

//             <motion.button
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.5 }}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               type="submit"
//               disabled={isLoading}
//               className={`w-full py-2.5 text-white text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center ${
//                 isLoading ? 'opacity-70 cursor-not-allowed' : ''
//               }`}
//             >
//               {isLoading ? (
//                 <>
//                   <motion.div
//                     animate={{ rotate: 360 }}
//                     transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                     className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent"
//                   />
//                   Verifying...
//                 </>
//               ) : (
//                 <>
//                   <LogIn size={14} className="mr-2" />
//                   Sign In
//                 </>
//               )}
//             </motion.button>

//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5, delay: 0.6 }}
//               className="text-center"
//             >
//               <p className="text-xs text-gray-400">
//                 Need help? <a href="mailto:support@domain.com" className="text-blue-600 hover:underline">support@domain.com</a>
//               </p>
//             </motion.div>
//           </form>
//         </div>

//         {/* Right Side - Info Panel */}
//         <motion.div 
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5, delay: 0.3 }}
//           className="flex flex-col items-center justify-center p-6 text-white bg-gradient-to-br from-blue-600 to-purple-600 md:p-8"
//         >
//           <motion.img
//             initial={{ scale: 0.9 }}
//             animate={{ scale: 1 }}
//             transition={{ duration: 0.5, delay: 0.4 }}
//             src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
//             alt="Client Portal Illustration"
//             className="object-contain h-40 max-w-full mb-4 rounded-lg shadow-xl"
//           />
          
//           <motion.div 
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.5 }}
//             className="text-center"
//           >
//             <h3 className="mb-3 text-lg font-semibold">Client Portal Guide</h3>
//             <div className="space-y-2">
//               <motion.div 
//                 whileHover={{ scale: 1.02, x: 5 }}
//                 className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
//               >
//                 <Mail size={14} />
//                 <p className="text-xs">Login with your registered email</p>
//               </motion.div>
              
//               <motion.div 
//                 whileHover={{ scale: 1.02, x: 5 }}
//                 className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
//               >
//                 <Key size={14} />
//                 <p className="text-xs">Or use your unique Client ID</p>
//               </motion.div>
              
//               <motion.div 
//                 whileHover={{ scale: 1.02, x: 5 }}
//                 className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
//               >
//                 <Package size={14} />
//                 <p className="text-xs">Access all your purchased products</p>
//               </motion.div>

//               <motion.div 
//                 whileHover={{ scale: 1.02, x: 5 }}
//                 className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
//               >
//                 <Shield size={14} />
//                 <p className="text-xs">Secure & encrypted access</p>
//               </motion.div>
//             </div>
//           </motion.div>
//         </motion.div>
//       </motion.div>

//       <style>{`
//         @keyframes blob {
//           0%, 100% { transform: translate(0px, 0px) scale(1); }
//           33% { transform: translate(30px, -50px) scale(1.1); }
//           66% { transform: translate(-20px, 20px) scale(0.9); }
//         }
//         .animate-blob {
//           animation: blob 7s infinite;
//         }
//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }
//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }
//         @keyframes shine {
//           100% { left: 150%; }
//         }
//         .animate-shine {
//           animation: shine 1s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default LoginPage;


import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  DollarSign,
  FileText,
  Heart,
  HeartPulse,
  Key,
  Lock,
  LogIn,
  Mail,
  MessageCircle,
  Package,
  Rocket,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Users as UsersIcon
} from "lucide-react";
import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientId, setClientId] = useState('');
  const [loginType, setLoginType] = useState('email');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [clientData, setClientData] = useState(null);
  const navigate = useNavigate();

  // Safe JSON parse function - FIXES THE ERROR
  const safeJSONParse = (data) => {
    if (!data) return null;
    if (typeof data !== 'string') return data;
    
    try {
      return JSON.parse(data);
    } catch(e) {
      // If parsing fails, return as object with city property
      return { city: data };
    }
  };

  // Safe location display function
  const getLocationCity = (location) => {
    if (!location) return 'N/A';
    
    if (typeof location === 'string') {
      const parsed = safeJSONParse(location);
      return parsed?.city || location;
    }
    
    return location.city || location || 'N/A';
  };

  // Check localStorage on component mount
  useEffect(() => {
    const storedShowProducts = localStorage.getItem('showProducts');
    const storedClientData = localStorage.getItem('clientData');
    
    if (storedShowProducts === 'true' && storedClientData) {
      setShowProducts(true);
      try {
        setClientData(JSON.parse(storedClientData));
      } catch(e) {
        console.error('Error parsing stored client data:', e);
      }
    }
  }, []);

  // Product icons mapping based on product name from database
  const getProductIcon = (productName) => {
    const name = productName.toLowerCase();
    
    // Attendance System
    if (name.includes('attendance')) {
      return { icon: <Clock size={24} />, color: "bg-blue-100 text-blue-600", name: "Attendance System", section: "attendance" };
    }
    // Recruitment
    if (name.includes('recruitment')) {
      return { icon: <Briefcase size={24} />, color: "bg-indigo-100 text-indigo-600", name: "Recruitment", section: "recruitment" };
    }
    // Coworking Space
    if (name.includes('coworking')) {
      return { icon: <Building2 size={24} />, color: "bg-purple-100 text-purple-600", name: "Coworking Space", section: "coworking" };
    }
    // Training Camp
    if (name.includes('camp') || name.includes('training')) {
      return { icon: <UsersIcon size={24} />, color: "bg-red-100 text-red-600", name: "Training Camp", section: "camp" };
    }
    // HR
    if (name.includes('hr') || name.includes('human resource')) {
      return { icon: <Users size={24} />, color: "bg-pink-100 text-pink-600", name: "HR Management", section: "hr" };
    }
    // CRM
    if (name.includes('crm')) {
      return { icon: <Users size={24} />, color: "bg-rose-100 text-rose-600", name: "CRM System", section: "crm" };
    }
    // Projects
    if (name.includes('project')) {
      return { icon: <Briefcase size={24} />, color: "bg-orange-100 text-orange-600", name: "Project Management", section: "projects" };
    }
    // Appointments
    if (name.includes('appointment')) {
      return { icon: <CalendarDays size={24} />, color: "bg-green-100 text-green-600", name: "Appointments", section: "appointments" };
    }
    // Wellness
    if (name.includes('wellness') || name.includes('health')) {
      return { icon: <HeartPulse size={24} />, color: "bg-red-100 text-red-600", name: "Wellness", section: "wellness" };
    }
    // BMI
    if (name.includes('bmi')) {
      return { icon: <Heart size={24} />, color: "bg-red-100 text-red-600", name: "BMI Management", section: "bmi" };
    }
    // Support
    if (name.includes('support')) {
      return { icon: <MessageCircle size={24} />, color: "bg-indigo-100 text-indigo-600", name: "Support", section: "support" };
    }
    // Security
    if (name.includes('security')) {
      return { icon: <ShieldCheck size={24} />, color: "bg-teal-100 text-teal-600", name: "Security", section: "security" };
    }
    // Accounting
    if (name.includes('accounting')) {
      return { icon: <FileText size={24} />, color: "bg-amber-100 text-amber-600", name: "Accounting", section: "accounting" };
    }
    // Knowledge
    if (name.includes('knowledge')) {
      return { icon: <BookOpen size={24} />, color: "bg-cyan-100 text-cyan-600", name: "Knowledge", section: "knowledge" };
    }
    // POS
    if (name.includes('pos') || name.includes('point of sale')) {
      return { icon: <DollarSign size={24} />, color: "bg-orange-100 text-orange-600", name: "Point of Sale", section: "pos" };
    }
    // Inventory
    if (name.includes('inventory')) {
      return { icon: <Package size={24} />, color: "bg-blue-100 text-blue-600", name: "Inventory", section: "inventory" };
    }
    // Sales
    if (name.includes('sales')) {
      return { icon: <TrendingUp size={24} />, color: "bg-green-100 text-green-600", name: "Sales", section: "sales" };
    }
    // Dashboard
    if (name.includes('dashboard')) {
      return { icon: <Activity size={24} />, color: "bg-yellow-100 text-yellow-600", name: "Dashboard", section: "dashboard" };
    }
    // Default
    return { icon: <Rocket size={24} />, color: "bg-gray-100 text-gray-600", name: productName, section: productName.toLowerCase() };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let clientPayload = {};
      
      if (loginType === 'email') {
        clientPayload = { email, password };
      } else {
        clientPayload = { clientId, password };
      }

      const clientResponse = await fetch('http://localhost:5005/api/clients/clientlogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientPayload),
      });

      const clientDataResponse = await clientResponse.json();

      if (clientResponse.ok) {
        // Format the client data properly
        const formattedClient = {
          ...clientDataResponse.client,
          accessibleProducts: clientDataResponse.client.accessibleProducts.map(product => ({
            ...product,
            displayName: product.name || (product.productId?.name) || "Unknown Product",
            productCode: product.code || product.productId?.code || "N/A"
          }))
        };
        
        // Store client data
        setClientData(formattedClient);
        localStorage.setItem('clientToken', clientDataResponse.token);
        localStorage.setItem('clientId', formattedClient._id);
        localStorage.setItem('clientCustomId', formattedClient.clientId);
        localStorage.setItem('clientName', formattedClient.name);
        localStorage.setItem('clientEmail', formattedClient.email);
        localStorage.setItem('clientData', JSON.stringify(formattedClient));
        localStorage.setItem('userRole', 'client');
        localStorage.setItem('showProducts', 'true');
        
        // Show products page instead of directly navigating
        setShowProducts(true);
        return;
      }

      throw new Error(clientDataResponse.message || 'Invalid credentials');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
const handleProductClick = (product) => {
  // Get the product info
  const productInfo = getProductIcon(product.displayName || product.name);
  const sectionToNavigate = productInfo.section;
  
  // Store in localStorage for Sidebar to read
  localStorage.setItem('userRole', 'client');
  localStorage.setItem('selectedProduct', sectionToNavigate);
  localStorage.setItem('activeProductType', sectionToNavigate);
  localStorage.setItem('activeProductName', productInfo.name);
  localStorage.removeItem('showProducts');

  // Navigate based on product
  let dashboardPath = '/dashboard';
  if (sectionToNavigate === 'coworking') {
    dashboardPath = '/coworking-dashboard';
  } else if (sectionToNavigate === 'recruitment') {
    dashboardPath = '/recruitment-dashboard';
  }

  navigate(dashboardPath, { 
    state: { 
      client: clientData,
      selectedProduct: sectionToNavigate,
      selectedProductName: productInfo.name,
      userType: 'client'
    } 
  });
}; // <-- ADD THIS CLOSING BRACE

const handleBackToLogin = () => {
  setShowProducts(false);
  setClientData(null);
  localStorage.removeItem('showProducts');
  localStorage.removeItem('clientData');
};
  // If showing products page
  if (showProducts && clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute bg-purple-300 rounded-full top-20 left-10 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute bg-pink-300 rounded-full top-40 right-10 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bg-blue-300 rounded-full bottom-20 left-1/2 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-6xl px-4 py-12 mx-auto">
          {/* Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center px-4 py-2 mb-4 rounded-full shadow-sm bg-white/80 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
              <span className="text-sm text-gray-600">Welcome back, {clientData.name}!</span>
            </div>
            
            <h1 className="mb-2 text-3xl font-bold text-gray-800 md:text-4xl">
              Your <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Purchased Products</span>
            </h1>
            <p className="text-gray-600">Select a product to access your dashboard</p>
          </motion.div>

          {/* Client Info Card - FIXED LOCATION DISPLAY */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 mb-8 border border-gray-100 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl"
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Client ID</p>
                <p className="text-sm font-medium text-gray-800">{clientData.clientId}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-800 truncate">{clientData.email}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Company</p>
                <p className="text-sm font-medium text-gray-800">{clientData.companyName || 'N/A'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-800">
                  {getLocationCity(clientData.location)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          {clientData.accessibleProducts && clientData.accessibleProducts.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            >
              {clientData.accessibleProducts.map((product, index) => {
                // Get product name from the response
                const productName = product.name || product.displayName || "Unknown Product";
                const productInfo = getProductIcon(productName);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleProductClick(product)}
                    className="relative p-4 overflow-hidden text-center transition-all duration-300 bg-white shadow-sm cursor-pointer rounded-xl hover:shadow-xl group"
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${productInfo.color.replace('100', '500')} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    <div className={`w-14 h-14 mx-auto mb-3 flex items-center justify-center rounded-xl ${productInfo.color} group-hover:scale-110 transition-transform duration-300`}>
                      {productInfo.icon}
                    </div>
                    
                    <p className="text-sm font-medium text-gray-700 group-hover:text-[#714b67] transition">
                      {productInfo.name}
                    </p>
                    
                    {product.price > 0 && (
                      <p className="mt-1 text-xs font-semibold text-green-600">
                        ₹{product.price}
                      </p>
                    )}
                    
                    <p className="text-[10px] text-gray-400 mt-1">
                      Click to access
                    </p>

                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                      <div className="absolute top-0 block w-1/2 h-full transform -skew-x-12 -inset-full z-5 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="py-12 text-center"
            >
              <div className="max-w-md p-8 mx-auto bg-white/80 backdrop-blur-sm rounded-xl">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-800">No Products Found</h3>
                <p className="mb-4 text-sm text-gray-500">
                  You haven't purchased any products yet.
                </p>
                <button
                  onClick={handleBackToLogin}
                  className="px-4 py-2 text-sm text-white transition-all rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg"
                >
                  Back to Login
                </button>
              </div>
            </motion.div>
          )}

          {/* Bottom actions */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <button
              onClick={handleBackToLogin}
              className="flex items-center justify-center mx-auto text-sm text-gray-500 transition hover:text-gray-700"
            >
              <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
              Back to Login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Login Page - Client Only
  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-6 overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-64 h-64 bg-blue-300 rounded-full top-20 left-10 mix-blend-multiply filter blur-xl opacity-20"
        ></motion.div>
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, 80, 0],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-64 h-64 bg-purple-300 rounded-full top-40 right-10 mix-blend-multiply filter blur-xl opacity-20"
        ></motion.div>
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-64 h-64 bg-pink-300 rounded-full bottom-20 left-1/2 mix-blend-multiply filter blur-xl opacity-20"
        ></motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 grid w-full max-w-4xl grid-cols-1 overflow-hidden shadow-2xl bg-white/90 backdrop-blur-md rounded-2xl md:grid-cols-2"
      >
        {/* Left Side - Login Form */}
        <div className="flex flex-col justify-center p-6 md:p-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4 text-center"
          >
            <div className="inline-flex items-center px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
              <Lock className="w-3 h-3 mr-1 text-blue-600" />
              <span className="text-xs text-gray-600">Client Portal</span>
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              Client Login
            </h1>
            <p className="mt-1 text-xs text-gray-500">Sign in to access your products</p>
          </motion.div>

          {/* Login Type Toggle */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-4"
          >
            <div className="inline-flex p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginType('email')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
                  loginType === 'email' 
                    ? 'bg-white shadow text-blue-600 scale-105' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Email Login
              </button>
              <button
                type="button"
                onClick={() => setLoginType('clientId')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
                  loginType === 'clientId' 
                    ? 'bg-white shadow text-purple-600 scale-105' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Client ID
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-2 mb-3 text-xs text-red-600 border border-red-100 rounded-md bg-red-50"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {loginType === 'email' ? (
                <motion.div
                  key="email-field"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block mb-1 text-xs font-medium text-gray-700" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3 py-2 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="clientid-field"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block mb-1 text-xs font-medium text-gray-700" htmlFor="clientId">
                    Client ID
                  </label>
                  <input
                    type="text"
                    id="clientId"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="CLIENT-XXXXXX"
                    className="w-full px-3 py-2 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label className="block mb-1 text-xs font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 flex items-center text-gray-500 transition right-3 hover:text-blue-600"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 text-white text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent"
                  />
                  Verifying...
                </>
              ) : (
                <>
                  <LogIn size={14} className="mr-2" />
                  Sign In
                </>
              )}
            </motion.button>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center"
            >
              <p className="text-xs text-gray-400">
                Need help? <a href="mailto:support@domain.com" className="text-blue-600 hover:underline">support@domain.com</a>
              </p>
            </motion.div>
          </form>
        </div>

        {/* Right Side - Info Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center justify-center p-6 text-white bg-gradient-to-br from-blue-600 to-purple-600 md:p-8"
        >
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
            alt="Client Portal Illustration"
            className="object-contain h-40 max-w-full mb-4 rounded-lg shadow-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <h3 className="mb-3 text-lg font-semibold">Client Portal Guide</h3>
            <div className="space-y-2">
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
              >
                <Mail size={14} />
                <p className="text-xs">Login with your registered email</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
              >
                <Key size={14} />
                <p className="text-xs">Or use your unique Client ID</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
              >
                <Package size={14} />
                <p className="text-xs">Access all your purchased products</p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
              >
                <Shield size={14} />
                <p className="text-xs">Secure & encrypted access</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shine {
          100% { left: 150%; }
        }
        .animate-shine {
          animation: shine 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;