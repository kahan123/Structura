import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, MessageCircle, AlertTriangle, FileText } from 'lucide-react';
import axios from '../../api/axiosConfig';
import { useSocket } from '../../context/SocketContext';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import CustomAlert from '../../components/CustomAlert';

const BookingManagement = () => {
    const { socket } = useSocket();
    const containerRef = React.useRef(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [approvedFilter, setApprovedFilter] = useState('active'); // 'active' | 'past'
    const [selectedRequest, setSelectedRequest] = useState(null); // For rejection modal
    const [rejectionReason, setRejectionReason] = useState("");
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success',
        confirmText: 'OK',
        onConfirm: () => {}
    });

    const triggerAlert = (title, message, type = 'success') => {
        setAlertConfig({
            isOpen: true,
            title,
            message,
            type,
            confirmText: 'OK',
            onConfirm: () => {
                setAlertConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const fetchBookings = async () => {
        try {
            const { data } = await axios.get('/api/admin/bookings');
            // Transform data to match UI expectations
            const formatted = data.map(b => ({
                id: b._id,
                user: b.user ? b.user.name : 'Unknown User',
                role: b.user ? b.user.role : 'N/A', // Assuming role is populated
                resource: b.resource ? b.resource.name : 'Unknown Resource',
                date: new Date(b.startTime).toLocaleDateString(),
                time: `${new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                purpose: b.purpose || "No Purpose Specified",
                status: b.status.toLowerCase(),
                conflict: false, // You might want to calculate this or have backend send it
                rawStart: b.startTime, // Keep for sorting if needed
                rawEnd: b.endTime // Added for active/past filtering
            }));
            setRequests(formatted);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch bookings", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Socket Listener for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleNewBooking = (data) => {
            console.log("BookingManagement: New booking received", data);
            fetchBookings(); // Simplest strategy: re-fetch to get full details
        };

        socket.on('new_booking', handleNewBooking);
        return () => socket.off('new_booking', handleNewBooking);
    }, [socket]);


    const handleApprove = async (id) => {
        try {
            await axios.patch(`/api/admin/bookings/${id}/status`, { status: 'Approved' });
            // Optimistic update
            setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'approved' } : req));
            triggerAlert("Approved", "The booking request has been approved successfully.", "success");
        } catch (err) {
            console.error("Failed to approve booking", err);
            triggerAlert("Approval Failed", "Failed to approve booking. Please check your network connection.", "danger");
        }
    };

    const openRejectModal = (req) => {
        setSelectedRequest(req);
        setRejectionReason("");
    };

    const confirmReject = async () => {
        if (!selectedRequest) return;
        try {
            await axios.patch(`/api/admin/bookings/${selectedRequest.id}/status`, {
                status: 'Rejected',
                remarks: rejectionReason
            });

            setRequests(prev => prev.map(req => req.id === selectedRequest.id ? { ...req, status: 'rejected' } : req));
            setSelectedRequest(null);
            triggerAlert("Rejected", "The booking request has been rejected.", "info");
        } catch (err) {
            console.error("Failed to reject booking", err);
            triggerAlert("Rejection Failed", "Failed to reject booking. Please try again.", "danger");
        }
    };

    const filteredRequests = requests.filter(r => {
        if (activeTab === 'approved') {
            if (r.status !== 'approved') return false;

            const now = new Date();
            const end = new Date(r.rawEnd); // We will add rawEnd in fetchBookings

            if (approvedFilter === 'active') return end >= now;
            if (approvedFilter === 'past') return end < now;
        }
        return r.status === activeTab;
    });

    useGSAP(() => {
        if (!loading) {
            gsap.fromTo('.booking-card',
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }, [loading, activeTab, approvedFilter, filteredRequests.length]);

    return (
        <div ref={containerRef} className="space-y-[var(--density-space)] relative h-full flex flex-col">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-ink uppercase tracking-tight">Booking Management</h2>
                <div className="h-[2px] w-12 bg-primary mt-2 mb-6"></div>

                <div className="flex gap-4 border-b border-secondary/10 items-center justify-between">
                    <div className="flex gap-4">
                        {['pending', 'approved', 'rejected'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 px-2 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === tab ? 'text-primary' : 'text-secondary hover:text-ink'
                                    }`}
                            >
                                {tab} ({requests.filter(r => r.status === tab).length})
                                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full" />}
                            </button>
                        ))}
                    </div>

                    {/* Sub-filter for Approved Tab */}
                    {activeTab === 'approved' && (
                        <div className="flex bg-secondary/5 rounded-lg p-1 gap-1 mb-2">
                            <button
                                onClick={() => setApprovedFilter('active')}
                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${approvedFilter === 'active'
                                    ? 'bg-paper shadow text-ink'
                                    : 'text-secondary hover:text-ink'
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setApprovedFilter('past')}
                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${approvedFilter === 'past'
                                    ? 'bg-paper shadow text-ink'
                                    : 'text-secondary hover:text-ink'
                                    }`}
                            >
                                Past
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {filteredRequests.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-secondary border-2 border-dashed border-secondary/10 rounded-lg booking-card opacity-0">
                        <FileText className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-bold uppercase tracking-widest text-xs">No {activeTab} requests found</p>
                    </div>
                ) : (
                    filteredRequests.map(req => (
                        <div key={req.id} className="booking-card opacity-0 bg-paper border border-secondary/20 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Left Border Status Indicator */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${req.status === 'pending' ? 'bg-amber-500' :
                                req.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
                                }`} />

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Date Box */}
                                <div className="hidden md:flex flex-col items-center justify-center p-4 bg-secondary/5 rounded border border-secondary/10 min-w-[100px]">
                                    <span className="text-xs font-bold text-secondary uppercase opacity-70 mb-1">{req.date.split('-')[0]}</span>
                                    <span className="text-2xl font-black text-ink">{req.date.split('-')[2]}</span>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Mar</span> {/* Hardcoded month for mock */}
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-ink uppercase tracking-tight flex items-center gap-2">
                                                {req.resource}
                                                {req.conflict && (
                                                    <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1 animate-pulse">
                                                        <AlertTriangle className="w-3 h-3" /> Conflict Detected
                                                    </span>
                                                )}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-secondary font-mono">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {req.time}</span>
                                                <span className="hidden md:flex items-center gap-1"><MapPin className="w-3 h-3" /> North Block</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-secondary/5 p-3 rounded text-sm text-ink italic border-l-2 border-secondary/20">
                                        "{req.purpose}"
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-secondary mt-2">
                                        <div className="w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center font-bold text-[10px]">
                                            {req.user.charAt(0)}
                                        </div>
                                        <span className="font-bold text-ink">{req.user}</span>
                                        <span className="bg-secondary/10 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">{req.role}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {req.status === 'pending' && (
                                    <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-secondary/10 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                        <button
                                            onClick={() => handleApprove(req.id)}
                                            className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-wider hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                        <button
                                            onClick={() => openRejectModal(req)}
                                            className="flex-1 bg-paper border border-red-500/30 text-red-500 px-4 py-2 rounded font-bold text-xs uppercase tracking-wider hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                        <button className="flex-1 bg-secondary/5 text-secondary px-4 py-2 rounded font-bold text-xs uppercase tracking-wider hover:bg-secondary/10 transition-colors flex items-center justify-center gap-2">
                                            <MessageCircle className="w-4 h-4" /> Message
                                        </button>
                                    </div>
                                )}
                                {req.status !== 'pending' && (
                                    <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-secondary/10 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                        <div className="text-center">
                                            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
                                                }`}>
                                                {req.status}
                                            </span>
                                            <p className="text-[10px] text-secondary mt-2">Processed just now</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Rejection Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
                    <div className="bg-paper p-6 rounded-lg max-w-md w-full shadow-2xl border-2 border-secondary/10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-black text-ink uppercase tracking-tight">Reject Request?</h3>
                            <button onClick={() => setSelectedRequest(null)} className="text-secondary hover:text-ink">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-secondary mb-4">
                            You are about to reject the booking for <span className="font-bold text-ink">{selectedRequest.resource}</span>.
                            Please provide a reason for the user.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., Use conflict with scheduled maintenance..."
                            className="w-full h-24 bg-secondary/5 border border-secondary/20 rounded p-3 text-sm focus:border-red-500 focus:outline-none mb-4 resize-none"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={confirmReject}
                                disabled={!rejectionReason.trim()}
                                className="flex-1 bg-red-500 text-white py-2 rounded font-bold uppercase text-xs tracking-widest hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Rejection
                            </button>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-4 py-2 border border-secondary/20 rounded font-bold uppercase text-xs tracking-widest hover:bg-secondary/5"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Premium Alert Dialog */}
            <CustomAlert {...alertConfig} />
        </div>
    );
};

export default BookingManagement;
