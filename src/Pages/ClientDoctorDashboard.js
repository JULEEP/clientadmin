import axios from "axios";
import { Building2, Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import React, { useEffect, useState } from "react";

const ClientDoctorDashboard = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    const clientId = localStorage.getItem('clientId') || '';

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                if (!clientId) return;
                const res = await axios.get(`http://localhost:5001/api/auth/partners?clientId=${clientId}`);
                setPartners(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPartners();
    }, []);

    return (
        <div className="p-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6 rounded-xl mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <ShieldCheck size={20} /> Partners
                    </h1>
                    <p className="text-xs text-indigo-100 mt-1">Verified clinics</p>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-lg text-center">
                    <div className="text-2xl font-bold">{partners.length}</div>
                    <div className="text-[10px] uppercase">Total</div>
                </div>
            </div>

            {/* Body */}
            {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : partners.length === 0 ? (
                <div className="bg-white p-8 rounded-xl text-center border">
                    <p className="text-gray-500">No partners found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {partners.map(p => (
                        <div key={p._id} className="bg-white rounded-xl border p-4 hover:shadow-md">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Building2 size={18} className="text-blue-600" />
                                </div>
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>
                            </div>
                            
                            <h3 className="font-semibold">{p.clinicName || p.organizationName || "Clinic"}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <User size={12} /> {p.name || p.contactPerson || "Dr."}
                            </p>
                            
                            <div className="mt-3 text-xs space-y-1.5 text-gray-600">
                                <div className="flex items-center gap-2"><Mail size={12} />{p.email || "N/A"}</div>
                                <div className="flex items-center gap-2"><Phone size={12} />{p.mobile || p.phone || "N/A"}</div>
                                <div className="flex items-start gap-2"><MapPin size={12} className="mt-0.5" />{p.address || "N/A"}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientDoctorDashboard;