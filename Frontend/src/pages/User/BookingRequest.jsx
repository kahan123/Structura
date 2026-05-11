import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle, FileText, AlertCircle, Loader } from 'lucide-react';
import BookingSteps from '../../components/BookingSteps';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const BookingRequest = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { startSlot, endSlot, date, resource } = location.state || {};

    const [purpose, setPurpose] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Format Helpers
    const formatTime = (slotIdx) => {
        if (slotIdx === undefined) return "--:--";
        const h = Math.floor(slotIdx / 2);
        const m = (slotIdx % 2) * 30;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const startTime = formatTime(startSlot);
    const endTime = formatTime(endSlot + 1);
    const duration = ((endSlot - startSlot + 1) * 0.5) + " Hours";
    const dateObj = new Date(date);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        try {
            // Reconstruct Date objects for backend using Local Time
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const startDateTime = new Date(`${dateStr}T${startTime}:00`);
            const endDateTime = new Date(`${dateStr}T${endTime}:00`);

            await axios.post('/api/bookings', {
                resourceId: id,
                userId: userInfo._id,
                startTime: startDateTime,
                endTime: endDateTime,
                purpose: purpose
            });

            // Success redirect
            navigate('/bookings');

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit booking request.');
            setSubmitting(false);
        }
    };

    if (!location.state) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <p className="text-secondary font-mono">No booking selection found.</p>
                <button
                    onClick={() => navigate(`/resources/${id}/schedule`)}
                    className="text-primary hover:underline"
                >
                    Go back to Schedule
                </button>
            </div>
        );
    }

    const containerRef = React.useRef(null);
    useGSAP(() => {
        gsap.fromTo('.booking-card',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );
    }, []);

    return (
        <div ref={containerRef} className="max-w-3xl mx-auto space-y-8 pb-20">
            <BookingSteps currentStep={4} />
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-secondary hover:text-primary hover:bg-white/50 rounded-full transition-all group"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <span className="text-xs font-bold text-secondary uppercase tracking-widest">Final Step</span>
                    <h1 className="text-2xl font-black text-ink uppercase tracking-tight">Confirm Booking Request</h1>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Summary Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="booking-card opacity-0 bg-paper border-2 border-primary rounded-lg p-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Summary</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-secondary/50 uppercase block mb-1">Resource</label>
                                <p className="font-bold text-ink text-lg leading-tight">{resource?.name || "Unknown Resource"}</p>
                                <div className="flex items-center gap-1 text-xs text-secondary mt-1">
                                    <MapPin className="w-3 h-3" /> {resource?.building || "Unknown Building"}, Floor {resource?.floor || "-"}
                                </div>
                            </div>

                            <div className="w-full h-[1px] bg-secondary/10" />

                            <div>
                                <label className="text-[10px] font-bold text-secondary/50 uppercase block mb-1">Date & Time</label>
                                <div className="flex items-center gap-2 font-mono text-sm text-ink mb-1">
                                    <Calendar className="w-3 h-3 text-primary" />
                                    <span>{dateObj.toDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 font-mono text-sm text-ink">
                                    <Clock className="w-3 h-3 text-primary" />
                                    <span>{startTime} - {endTime}</span>
                                </div>
                                <span className="inline-block mt-2 text-[10px] bg-secondary/10 px-2 py-0.5 rounded text-secondary font-bold uppercase">
                                    Duration: {duration}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="booking-card opacity-0 bg-paper border border-secondary/20 rounded-lg p-8 space-y-6 shadow-sm">

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-ink uppercase tracking-wide mb-3">
                                <FileText className="w-4 h-4 text-primary" />
                                Purpose of Booking
                            </label>
                            <textarea
                                required
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                placeholder="e.g., Conducting a workshop for CS101 students..."
                                className="w-full h-32 bg-secondary/5 border border-secondary/20 rounded p-4 text-sm focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-secondary/30"
                            />
                            <p className="text-[10px] text-secondary mt-2 text-right">
                                Please be specific to ensure quick approval.
                            </p>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-secondary/5 border border-secondary/10 rounded">
                            <input
                                type="checkbox"
                                id="agree"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 accent-primary cursor-pointer"
                            />
                            <label htmlFor="agree" className="text-xs text-secondary leading-relaxed cursor-pointer select-none">
                                I verify that I will be responsible for the equipment in this facility during the booked time. I will leave the space in the same condition as found.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={!agreed || !purpose || submitting}
                            className="w-full bg-ink text-paper py-4 font-bold uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" /> Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" /> Submit Request
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingRequest;
