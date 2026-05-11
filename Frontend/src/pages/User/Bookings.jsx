import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Calendar, Clock, MapPin, Check, Timer, X, AlertCircle } from 'lucide-react';
import CustomAlert from '../../components/CustomAlert';
import axios from '../../api/axiosConfig';
import { useSocket } from '../../context/SocketContext';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const getStatusColor = (status) => {
    switch (status) {
        case 'Approved': return 'text-green-600 bg-green-50 border-green-200';
        case 'Rejected': return 'text-red-600 bg-red-50 border-red-200';
        case 'Cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
        default: return 'text-amber-600 bg-amber-50 border-amber-200';
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'Approved': return <Check className="w-3 h-3" />;
        case 'Rejected': return <X className="w-3 h-3" />;
        case 'Cancelled': return <X className="w-3 h-3" />;
        default: return <Timer className="w-3 h-3" />;
    }
};

const Bookings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [currentFilter, setCurrentFilter] = useState(searchParams.get('filter') || 'All');

    const filters = [
        { id: 'All', label: 'All' },
        { id: 'Approved', label: 'Active' }, // Mapping 'Approved' to 'Active' label for user
        { id: 'Pending', label: 'Pending' },
        { id: 'History', label: 'History' } // Could be past bookings or Rejected/Cancelled
    ];

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch Bookings
    useEffect(() => {
        const fetchBookings = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) {
                navigate('/login');
                return;
            }

            try {
                const { data } = await axios.get(`/api/bookings/mybookings/${userInfo._id}`);

                // Transform API data to UI format
                const formattedBookings = data.map(b => {
                    const startDate = new Date(b.startTime);
                    const endDate = new Date(b.endTime);
                    const isPast = new Date() > endDate;

                    // Determine display status
                    let displayStatus = b.status;
                    if (isPast && b.status === 'Approved') displayStatus = 'History';
                    if (b.status === 'Rejected' || b.status === 'Cancelled') displayStatus = 'History';

                    return {
                        id: b._id,
                        title: b.resource?.name || 'Unknown Resource',
                        type: 'Resource', // Generic type or fetch specific
                        date: startDate.toLocaleDateString(),
                        time: `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                        rawEndTime: endDate, // Store for periodic checks
                        status: b.status, // Keep original status for logic
                        displayStatus: displayStatus, // For filtering
                        location: `${b.resource?.building || ''}, Floor ${b.resource?.floor || ''}`,
                        purpose: b.purpose
                    };
                });

                setBookings(formattedBookings);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch bookings.');
                setLoading(false);
            }
        };

        fetchBookings();
    }, [navigate]);

    // Periodic check for expired bookings
    useEffect(() => {
        const checkExpiry = () => {
            setBookings(prev => prev.map(b => {
                if (b.displayStatus === 'History' || !b.rawEndTime) return b;

                const isPast = new Date() > new Date(b.rawEndTime);
                if (isPast && b.status === 'Approved') {
                    return { ...b, displayStatus: 'History' };
                }
                return b;
            }));
        };

        const intervalId = setInterval(checkExpiry, 30000); // Check every 30 seconds
        return () => clearInterval(intervalId);
    }, []);

    // Socket Listener for status updates
    useEffect(() => {
        if (!socket) return;

        const handleBookingUpdate = (data) => {
            console.log("[BookingsPage] Real-time update received:", data);

            setBookings(prev => prev.map(b => {
                if (b.id === data.bookingId || b.title === data.resourceName) {
                    // Update original status and recalculate display status
                    // We need to re-evaluate based on the potentially new status and existing time
                    const isPast = new Date() > new Date(b.rawEndTime);
                    let newDisplayStatus = data.status;

                    if (isPast && data.status === 'Approved') newDisplayStatus = 'History';
                    if (data.status === 'Rejected' || data.status === 'Cancelled') newDisplayStatus = 'History';

                    return {
                        ...b,
                        status: data.status,
                        displayStatus: newDisplayStatus
                    };
                }
                return b;
            }));
        };

        socket.on('booking_status_update', handleBookingUpdate);

        return () => {
            socket.off('booking_status_update', handleBookingUpdate);
        };
    }, [socket]);


    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        bookingId: null,
        title: "",
        message: ""
    });

    const initiateCancel = (id) => {
        const booking = bookings.find(b => b.id === id);
        setAlertConfig({
            isOpen: true,
            bookingId: id,
            title: "Cancel Reservation?",
            message: `Are you sure you want to cancel your booking for "${booking?.title}"? This action cannot be undone.`
        });
    };

    const confirmCancel = async () => {
        try {
            await axios.patch(`/api/bookings/${alertConfig.bookingId}/cancel`);

            // Update local state to reflect change
            setBookings(prev => prev.map(b =>
                b.id === alertConfig.bookingId ? { ...b, status: 'Cancelled', displayStatus: 'History' } : b
            ));

        } catch (err) {
            console.error("Failed to cancel booking", err);
            // Optionally set an error state to show in UI
        } finally {
            closeAlert();
        }
    };

    const closeAlert = () => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
    };

    // Filter Logic
    const getFilteredBookings = () => {
        if (currentFilter === 'All') return bookings;
        // Filter by displayStatus to ensure 'History' items don't show up in 'Approved' (Active)
        return bookings.filter(b => b.displayStatus === currentFilter);
    };

    const filteredBookings = getFilteredBookings();

    const containerRef = React.useRef(null);
    useGSAP(() => {
        if (!loading && !error) {
            gsap.fromTo('.res-card',
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }, [filteredBookings.length, loading, error, currentFilter]);

    if (loading) return <div className="p-10 text-center">Loading reservations...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

    return (
        <div ref={containerRef} className="space-y-6">
            <CustomAlert
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                onConfirm={confirmCancel}
                onCancel={closeAlert}
                confirmText="Yes, Cancel It"
            />

            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 -ml-2 text-secondary hover:text-primary hover:bg-secondary/10 rounded-full transition-all group"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-ink uppercase tracking-tight">My Reservations</h2>
                    <p className="text-xs text-secondary font-mono">MANAGE YOUR RESERVATIONS</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b-2 border-dashed border-secondary/20 pb-4 overflow-x-auto">
                {filters.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => {
                            setSearchParams({ filter: filter.id });
                            setCurrentFilter(filter.id);
                        }}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all relative ${currentFilter === filter.id
                            ? 'text-primary'
                            : 'text-secondary hover:text-ink'
                            }`}
                    >
                        {filter.label}
                        {currentFilter === filter.id && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary -mb-1.5" />
                        )}
                    </button>
                ))}
            </div>

            {/* Booking List */}
            <div className="grid gap-4">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map(booking => (
                        <div key={booking.id} className="res-card opacity-0 group relative p-6 bg-paper border border-secondary/20 hover:border-primary/50 transition-all rounded-sm hover:shadow-sm">
                            {/* Left Accent Border based on status */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg ${booking.displayStatus === 'Approved' ? 'bg-green-500' :
                                booking.displayStatus === 'Pending' ? 'bg-amber-500' : 'bg-gray-400'
                                }`} />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-ink uppercase">{booking.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${getStatusColor(booking.displayStatus === 'History' ? 'Cancelled' : booking.status)}`}>
                                            {getStatusIcon(booking.status)}
                                            {booking.displayStatus === 'History' && booking.status === 'Approved' ? 'Completed' : booking.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs text-secondary font-mono">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {booking.date}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.time}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {booking.location}</span>
                                    </div>
                                    <p className="mt-2 text-xs text-ink/70 italic">"{booking.purpose}"</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {booking.status === 'Approved' && booking.displayStatus !== 'History' && (
                                        <>
                                            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" /> Active</div>
                                            <button
                                                onClick={() => initiateCancel(booking.id)}
                                                className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded border border-red-200 transition-colors"
                                            >
                                                CANCEL
                                            </button>
                                        </>
                                    )}
                                    {booking.status === 'Pending' && <div className="text-xs font-bold text-amber-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-current rounded-full" /> Pending Approval</div>}
                                    {(booking.displayStatus === 'History') &&
                                        <div className="text-xs font-bold text-secondary">
                                            {booking.status === 'Approved' ? 'Completed' : booking.status}
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-secondary/10 rounded-sm">
                        <Filter className="w-8 h-8 mx-auto text-secondary/30 mb-2" />
                        <p className="text-sm text-secondary font-medium">No {currentFilter} bookings found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bookings;
