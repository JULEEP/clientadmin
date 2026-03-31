import { countries } from 'countries-list';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Building, Lock, MapPin, 
  CreditCard, FileText, CheckCircle, AlertCircle,
  ArrowRight, ArrowLeft, ShoppingBag, Star,
  Shield, Award, Sparkles, TrendingUp, Zap,
  Users, Briefcase, Globe, Home, Search, 
  Upload, Image as ImageIcon, FileCheck
} from 'lucide-react';



const API_BASE_URL = 'http://localhost:5001/api'
// Add Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Add CSS for animations
const styles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
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
`;

const RegisterPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobileNumber: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        numberOfEmployees: '',
        address: '',
        pincode: '',
        city: '',
        state: '',
        country: null,
    });
    
    const [documents, setDocuments] = useState({
        aadhaarCard: null,
        panCard: null
    });
    
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPincodeLoading, setIsPincodeLoading] = useState(false);
    const [isProductsLoading, setIsProductsLoading] = useState(false);
    const [showSuccessPage, setShowSuccessPage] = useState(false);
    const [registrationData, setRegistrationData] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({ aadhaarCard: 0, panCard: 0 });
    const navigate = useNavigate();

    // Add styles to head
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            setIsProductsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/clients/products`);
                const data = await response.json();
                
                if (data.success && data.products) {
                    const sortedProducts = [...data.products].sort((a, b) => {
                        if (a.price === 0 && b.price !== 0) return -1;
                        if (a.price !== 0 && b.price === 0) return 1;
                        return a.price - b.price;
                    });
                    setProducts(sortedProducts);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products');
            } finally {
                setIsProductsLoading(false);
            }
        };
        
        fetchProducts();
    }, []);

    // Prepare country options
    const countryOptions = Object.entries(countries).map(([code, country]) => ({
        value: code,
        label: country.name,
        phone: country.phone
    })).sort((a, b) => a.label.localeCompare(b.label));

    const handleChange = (e) => {
        const { name, value } = e.target;
        // For mobile number, only allow numbers and limit to 10 digits
        if (name === 'mobileNumber') {
            const numbersOnly = value.replace(/[^0-9]/g, '');
            if (numbersOnly.length <= 10) {
                setFormData({ ...formData, [name]: numbersOnly });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleCountryChange = (selectedOption) => {
        setFormData({ ...formData, country: selectedOption });
    };
    
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            const file = files[0];
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                setError('File size should be less than 5MB');
                return;
            }
            
            setDocuments({
                ...documents,
                [name]: file
            });
            
            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                setUploadProgress(prev => ({ ...prev, [name]: progress }));
                if (progress >= 100) clearInterval(interval);
            }, 100);
        }
    };

    const handleProductToggle = (product) => {
        setSelectedProducts(prev => {
            if (prev.find(p => p._id === product._id)) {
                return prev.filter(p => p._id !== product._id);
            } else {
                return [...prev, product];
            }
        });
    };

    // Fetch location details from pincode
    const fetchPincodeDetails = async (pincode) => {
        if (pincode.length === 6) {
            setIsPincodeLoading(true);
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                const data = await response.json();
                
                if (data[0].Status === 'Success') {
                    const postOffice = data[0].PostOffice[0];
                    setFormData(prev => ({
                        ...prev,
                        city: postOffice.District,
                        state: postOffice.State
                    }));
                    setError('');
                } else {
                    setError('Invalid Pincode');
                }
            } catch (err) {
                console.error('Error fetching pincode details:', err);
                setError('Failed to fetch location details');
            } finally {
                setIsPincodeLoading(false);
            }
        }
    };

    // Handle pincode change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.pincode && formData.pincode.length === 6) {
                fetchPincodeDetails(formData.pincode);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.pincode]);

    // Validate step 1
    const validateStep1 = () => {
        if (!formData.fullName) {
            setError('Please enter full name');
            return false;
        }
        if (!formData.email) {
            setError('Please enter email');
            return false;
        }
        if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return false;
        }
        if (!formData.password || formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (!formData.companyName) {
            setError('Please enter company name');
            return false;
        }
        if (!formData.numberOfEmployees) {
            setError('Please select number of employees');
            return false;
        }
        if (!formData.country) {
            setError('Please select country');
            return false;
        }
        if (!formData.address) {
            setError('Please enter address');
            return false;
        }
        if (!formData.pincode || formData.pincode.length !== 6) {
            setError('Please enter valid 6-digit pincode');
            return false;
        }
        if (!formData.city || !formData.state) {
            setError('Please enter a valid pincode to fetch city and state');
            return false;
        }
        if (!documents.aadhaarCard) {
            setError('Please upload Aadhaar Card');
            return false;
        }
        if (!documents.panCard) {
            setError('Please upload PAN Card');
            return false;
        }
        return true;
    };

    const nextStep = () => {
        setError('');
        if (validateStep1()) {
            setCurrentStep(2);
        }
    };

    const prevStep = () => {
        setCurrentStep(1);
        setError('');
    };

    // Process payment with Razorpay
    const processPayment = async (orderData, clientData) => {
        const res = await loadRazorpayScript();
        
        if (!res) {
            setError('Failed to load Razorpay. Please check your internet connection.');
            return false;
        }

        const options = {
            key: 'rzp_test_BxtRNvflG06PTV',
            amount: orderData.razorpayOrder.amount,
            currency: orderData.razorpayOrder.currency,
            name: 'Client Registration',
            description: `Payment for ${selectedProducts.length} product(s)`,
            order_id: orderData.razorpayOrder.id,
            handler: async function(response) {
                await completeRegistrationWithPayment(clientData, response.razorpay_payment_id);
            },
            prefill: {
                name: formData.fullName,
                email: formData.email,
                contact: formData.mobileNumber
            },
            notes: {
                clientId: clientData._id,
                products: selectedProducts.map(p => p.name).join(', ')
            },
            theme: {
                color: '#3B82F6'
            },
            modal: {
                ondismiss: function() {
                    setError('Payment cancelled');
                    setIsLoading(false);
                }
            }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
        return true;
    };

    // Complete registration with payment
    const completeRegistrationWithPayment = async (clientData, transactionId) => {
        setIsLoading(true);
        
        const employeesCountNumber = getEmployeesCount();
        const locationObj = getLocationObj();
        
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.fullName);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('mobile', formData.mobileNumber);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('companyName', formData.companyName);
        formDataToSend.append('noOfEmployees', employeesCountNumber);
        formDataToSend.append('location', JSON.stringify(locationObj));
        
        const accessibleProducts = selectedProducts.map(product => product.name);
        formDataToSend.append('accessibleProducts', JSON.stringify(accessibleProducts));
        formDataToSend.append('transactionId', transactionId);
        
        formDataToSend.append('aadhaarCard', documents.aadhaarCard);
        formDataToSend.append('panCard', documents.panCard);
        
        try {
            const response = await fetch(`${API_BASE_URL}/clients/addclient`, {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await response.json();

            if (response.ok) {
                setRegistrationData(data.client);
                setShowSuccessPage(true);
                setSuccess(data.message);
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate employees count number
    const getEmployeesCount = () => {
        switch(formData.numberOfEmployees) {
            case '1-10': return 5;
            case '11-50': return 30;
            case '51-200': return 125;
            case '201-500': return 350;
            case '501-1000': return 750;
            case '1000+': return 1500;
            default: return 0;
        }
    };

    // Prepare location object
    const getLocationObj = () => ({
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country ? formData.country.label : ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (selectedProducts.length === 0) {
            setError('Please select at least one product to continue');
            return;
        }
        
        setError('');
        setSuccess('');
        setIsLoading(true);

        const employeesCountNumber = getEmployeesCount();
        const locationObj = getLocationObj();
        
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.fullName);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('mobile', formData.mobileNumber);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('companyName', formData.companyName);
        formDataToSend.append('noOfEmployees', employeesCountNumber);
        formDataToSend.append('location', JSON.stringify(locationObj));
        
        const accessibleProducts = selectedProducts.map(product => product.name);
        formDataToSend.append('accessibleProducts', JSON.stringify(accessibleProducts));
        
        formDataToSend.append('aadhaarCard', documents.aadhaarCard);
        formDataToSend.append('panCard', documents.panCard);
        
        try {
            const response = await fetch(`${API_BASE_URL}/clients/addclient`, {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await response.json();

            if (response.ok) {
                if (data.requiresPayment) {
                    await processPayment(data, data.client);
                } else {
                    setRegistrationData(data.client);
                    setShowSuccessPage(true);
                    setSuccess(data.message);
                    
                    setFormData({
                        fullName: '',
                        email: '',
                        mobileNumber: '',
                        password: '',
                        confirmPassword: '',
                        companyName: '',
                        numberOfEmployees: '',
                        address: '',
                        pincode: '',
                        city: '',
                        state: '',
                        country: null,
                    });
                    setDocuments({
                        aadhaarCard: null,
                        panCard: null
                    });
                    setSelectedProducts([]);
                    setUploadProgress({ aadhaarCard: 0, panCard: 0 });
                    
                    const fileInputs = document.querySelectorAll('input[type="file"]');
                    fileInputs.forEach(input => {
                        input.value = '';
                    });
                }
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Success Page Component with stunning design
    const SuccessPage = () => (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50"
        >
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="relative bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 p-8 text-center">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 shadow-lg"
                    >
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </motion.div>
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-white"
                    >
                        Congratulations!
                    </motion.h1>
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/90 mt-2"
                    >
                        Welcome to our platform
                    </motion.p>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                </div>
                
                <div className="p-8">
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-6"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
                        <p className="text-gray-600">
                            Thank you for registering with us. Your account has been created successfully.
                        </p>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg"
                    >
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong className="font-semibold">Account Under Review</strong><br />
                                    Your account is currently pending admin approval. Our team will verify your documents and activate your account within 2-3 working days.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6"
                    >
                        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Next Steps:
                        </h3>
                        <ul className="space-y-3 text-sm text-blue-800">
                            {[
                                "Our admin team will review your documents and registration details",
                                "You will receive an email confirmation once your account is activated",
                                "After activation, you can login and access your selected products"
                            ].map((step, idx) => (
                                <li key={idx} className="flex items-start group">
                                    <motion.span 
                                        whileHover={{ scale: 1.2 }}
                                        className="inline-flex items-center justify-center w-6 h-6 bg-blue-200 rounded-full text-blue-600 text-xs font-bold mr-3 mt-0.5 group-hover:bg-blue-300 transition"
                                    >
                                        {idx + 1}
                                    </motion.span>
                                    <span className="flex-1">{step}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="bg-gray-50 rounded-xl p-5 mb-6"
                    >
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <FileCheck className="w-5 h-5" />
                            Registration Details:
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="font-medium text-gray-600">Client ID:</span>
                                <span className="text-gray-800 font-mono">{registrationData?.clientId || 'Pending'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="font-medium text-gray-600">Name:</span>
                                <span className="text-gray-800">{formData.fullName}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="font-medium text-gray-600">Email:</span>
                                <span className="text-gray-800">{formData.email}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="font-medium text-gray-600">Mobile:</span>
                                <span className="text-gray-800">{formData.mobileNumber}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="font-medium text-gray-600">Company:</span>
                                <span className="text-gray-800">{formData.companyName}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="font-medium text-gray-600">Selected Products:</span>
                                <span className="text-gray-800 text-right max-w-[200px]">{selectedProducts.map(p => p.name).join(', ')}</span>
                            </div>
                            {registrationData?.totalPaidAmount > 0 && (
                                <div className="flex justify-between py-1">
                                    <span className="font-medium text-green-600">Amount Paid:</span>
                                    <span className="text-green-600 font-bold">₹{registrationData.totalPaidAmount}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="flex gap-4"
                    >
                        <button
                            onClick={() => navigate('/login')}
                            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            Go to Login
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                        >
                            Register Another Account
                        </button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );

    const formatPrice = (price) => {
        if (price === 0) return 'Free';
        return `₹${price}`;
    };

    // Show success page if registration is complete
    if (showSuccessPage) {
        return <SuccessPage />;
    }

    // Render registration form
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative container mx-auto px-4 py-8">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-6xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header with Progress Steps */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                        <div className="flex items-center justify-between max-w-3xl mx-auto">
                            <div className="flex-1 text-center">
                                <div className={`relative flex items-center justify-center w-12 h-12 mx-auto rounded-full transition-all duration-500 ${
                                    currentStep >= 1 ? 'bg-white text-blue-600 shadow-lg transform scale-110' : 'bg-white/30 text-white'
                                }`}>
                                    <span className="text-xl font-bold">1</span>
                                    {currentStep >= 1 && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                                        >
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        </motion.div>
                                    )}
                                </div>
                                <p className={`mt-2 text-sm font-medium ${currentStep >= 1 ? 'text-white' : 'text-white/70'}`}>
                                    Personal Details
                                </p>
                            </div>
                            <div className={`flex-1 h-0.5 ${currentStep >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
                            <div className="flex-1 text-center">
                                <div className={`relative flex items-center justify-center w-12 h-12 mx-auto rounded-full transition-all duration-500 ${
                                    currentStep >= 2 ? 'bg-white text-purple-600 shadow-lg transform scale-110' : 'bg-white/30 text-white'
                                }`}>
                                    <span className="text-xl font-bold">2</span>
                                    {currentStep >= 2 && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                                        >
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        </motion.div>
                                    )}
                                </div>
                                <p className={`mt-2 text-sm font-medium ${currentStep >= 2 ? 'text-white' : 'text-white/70'}`}>
                                    Select Products
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        {/* Error and Success Messages */}
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-xl border-l-4 border-red-500"
                                >
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>{error}</span>
                                    </div>
                                </motion.div>
                            )}
                            {success && !showSuccessPage && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="p-4 mb-6 text-sm text-green-700 bg-green-100 rounded-xl border-l-4 border-green-500"
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>{success}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 50 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        {/* Personal Information Section */}
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <User className="w-5 h-5 text-blue-600" />
                                                Personal Information
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            name="fullName"
                                                            value={formData.fullName}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                            placeholder="Enter your full name"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                            placeholder="Enter your email"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="tel"
                                                            name="mobileNumber"
                                                            value={formData.mobileNumber}
                                                            onChange={handleChange}
                                                            required
                                                            maxLength="10"
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                            placeholder="Enter 10-digit mobile number"
                                                        />
                                                    </div>
                                                    {formData.mobileNumber && formData.mobileNumber.length > 0 && formData.mobileNumber.length !== 10 && (
                                                        <p className="mt-1 text-xs text-red-500">Mobile number must be 10 digits</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Company Information Section */}
                                        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <Building className="w-5 h-5 text-green-600" />
                                                Company Information
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                                                    <div className="relative">
                                                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            name="companyName"
                                                            value={formData.companyName}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                                            placeholder="Enter company name"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Employees *</label>
                                                    <div className="relative">
                                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <select
                                                            name="numberOfEmployees"
                                                            value={formData.numberOfEmployees}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none"
                                                        >
                                                            <option value="">Select range</option>
                                                            <option value="1-10">1-10 employees</option>
                                                            <option value="11-50">11-50 employees</option>
                                                            <option value="51-200">51-200 employees</option>
                                                            <option value="201-500">201-500 employees</option>
                                                            <option value="501-1000">501-1000 employees</option>
                                                            <option value="1000+">1000+ employees</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Security Section */}
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <Lock className="w-5 h-5 text-purple-600" />
                                                Security
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="password"
                                                            name="password"
                                                            value={formData.password}
                                                            onChange={handleChange}
                                                            required
                                                            minLength="6"
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                                            placeholder="Create password (min 6 characters)"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="password"
                                                            name="confirmPassword"
                                                            value={formData.confirmPassword}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                                            placeholder="Confirm password"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Section */}
                                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-orange-600" />
                                                Address Information
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                                                    <div className="relative">
                                                        <Home className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            name="address"
                                                            value={formData.address}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                                                            placeholder="Street address"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                name="pincode"
                                                                value={formData.pincode}
                                                                onChange={handleChange}
                                                                required
                                                                maxLength="6"
                                                                pattern="[0-9]{6}"
                                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                                                                placeholder="Enter 6-digit pincode"
                                                            />
                                                        </div>
                                                        {isPincodeLoading && (
                                                            <p className="mt-1 text-xs text-gray-500 animate-pulse">Fetching location...</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                                        <input
                                                            type="text"
                                                            name="city"
                                                            value={formData.city}
                                                            onChange={handleChange}
                                                            required
                                                            readOnly
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none"
                                                            placeholder="Auto-filled"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                                                        <input
                                                            type="text"
                                                            name="state"
                                                            value={formData.state}
                                                            onChange={handleChange}
                                                            required
                                                            readOnly
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none"
                                                            placeholder="Auto-filled"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                                                    <Select
                                                        options={countryOptions}
                                                        value={formData.country}
                                                        onChange={handleCountryChange}
                                                        isSearchable={true}
                                                        placeholder="Search country..."
                                                        className="text-sm"
                                                        styles={{
                                                            control: (base) => ({
                                                                ...base,
                                                                borderRadius: '0.75rem',
                                                                borderColor: '#d1d5db',
                                                                minHeight: '42px',
                                                                '&:hover': {
                                                                    borderColor: '#f97316'
                                                                }
                                                            })
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Document Upload Section */}
                                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-cyan-600" />
                                                Required Documents
                                            </h3>
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Card *</label>
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            name="aadhaarCard"
                                                            onChange={handleFileChange}
                                                            required
                                                            accept=".jpg,.jpeg,.png,.pdf"
                                                            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                                                        />
                                                        {uploadProgress.aadhaarCard > 0 && uploadProgress.aadhaarCard < 100 && (
                                                            <div className="mt-2">
                                                                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                                                    <motion.div 
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${uploadProgress.aadhaarCard}%` }}
                                                                        className="h-full bg-cyan-500 rounded-full"
                                                                    />
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress.aadhaarCard}%</p>
                                                            </div>
                                                        )}
                                                        {documents.aadhaarCard && uploadProgress.aadhaarCard === 100 && (
                                                            <div className="mt-2 flex items-center gap-1 text-green-600">
                                                                <CheckCircle className="w-4 h-4" />
                                                                <span className="text-xs">Uploaded successfully</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">Upload JPG, PNG, or PDF (Max 5MB)</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card *</label>
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            name="panCard"
                                                            onChange={handleFileChange}
                                                            required
                                                            accept=".jpg,.jpeg,.png,.pdf"
                                                            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                                                        />
                                                        {uploadProgress.panCard > 0 && uploadProgress.panCard < 100 && (
                                                            <div className="mt-2">
                                                                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                                                    <motion.div 
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${uploadProgress.panCard}%` }}
                                                                        className="h-full bg-cyan-500 rounded-full"
                                                                    />
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress.panCard}%</p>
                                                            </div>
                                                        )}
                                                        {documents.panCard && uploadProgress.panCard === 100 && (
                                                            <div className="mt-2 flex items-center gap-1 text-green-600">
                                                                <CheckCircle className="w-4 h-4" />
                                                                <span className="text-xs">Uploaded successfully</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">Upload JPG, PNG, or PDF (Max 5MB)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div className="text-center mb-8">
                                            <motion.h2 
                                                initial={{ y: -20 }}
                                                animate={{ y: 0 }}
                                                className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                                            >
                                                Choose Your Products
                                            </motion.h2>
                                            <p className="text-gray-600 mt-2">Select the products and services you want to access</p>
                                            {selectedProducts.length > 0 && (
                                                <motion.p 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="inline-block mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold"
                                                >
                                                    {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                                                    {selectedProducts.some(p => p.price > 0) && (
                                                        <span className="block text-green-600 font-bold mt-1">
                                                            Total: ₹{selectedProducts.reduce((sum, p) => sum + p.price, 0)}
                                                        </span>
                                                    )}
                                                </motion.p>
                                            )}
                                        </div>
                                        
                                        {isProductsLoading ? (
                                            <div className="flex justify-center items-center py-20">
                                                <motion.div 
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                                    {products.map((product, index) => (
                                                        <motion.div
                                                            key={product._id}
                                                            initial={{ opacity: 0, y: 50 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            whileHover={{ scale: 1.05 }}
                                                            onClick={() => handleProductToggle(product)}
                                                            className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 ${
                                                                selectedProducts.find(p => p._id === product._id)
                                                                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl transform scale-105'
                                                                    : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl'
                                                            }`}
                                                        >
                                                            <div className="flex justify-between items-start mb-4">
                                                                <h3 className={`text-xl font-bold ${selectedProducts.find(p => p._id === product._id) ? 'text-white' : 'text-gray-800'}`}>
                                                                    {product.name}
                                                                </h3>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                                    product.price === 0 
                                                                        ? 'bg-green-500 text-white' 
                                                                        : selectedProducts.find(p => p._id === product._id)
                                                                            ? 'bg-white text-purple-600'
                                                                            : 'bg-blue-100 text-blue-600'
                                                                }`}>
                                                                    {formatPrice(product.price)}
                                                                </span>
                                                            </div>
                                                            
                                                            {product.code && (
                                                                <p className={`text-xs mb-2 ${selectedProducts.find(p => p._id === product._id) ? 'text-white/80' : 'text-gray-500'}`}>
                                                                    Code: {product.code}
                                                                </p>
                                                            )}
                                                            
                                                            <p className={`text-sm mb-3 ${selectedProducts.find(p => p._id === product._id) ? 'text-white/90' : 'text-gray-600'}`}>
                                                                {product.description}
                                                            </p>
                                                            
                                                            {product.price === 0 && (
                                                                <div className="mt-3">
                                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
                                                                        <Zap className="w-3 h-3" />
                                                                        Free Access
                                                                    </span>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="mt-4 flex justify-end">
                                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                                    selectedProducts.find(p => p._id === product._id)
                                                                        ? 'border-white bg-white'
                                                                        : 'border-gray-300'
                                                                }`}>
                                                                    {selectedProducts.find(p => p._id === product._id) && (
                                                                        <CheckCircle className="w-4 h-4 text-purple-600" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                                
                                                {products.length === 0 && !isProductsLoading && (
                                                    <div className="text-center py-12">
                                                        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                        <p className="text-gray-500">No products available at the moment.</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
                                        >
                                            <p className="text-sm text-blue-800 text-center flex items-center justify-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                <strong>Note:</strong> Free products are marked with "Free" badge. Paid products require payment to activate.
                                            </p>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-between mt-8 gap-4">
                                {currentStep === 2 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={prevStep}
                                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 font-medium"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </motion.button>
                                )}
                                
                                {currentStep === 1 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={nextStep}
                                        className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
                                    >
                                        Next: Select Products
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                )}
                                
                                {currentStep === 2 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className={`ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium ${
                                            isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                                        }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Complete Registration
                                            </>
                                        )}
                                    </motion.button>
                                )}
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;