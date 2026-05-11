import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import BookingSteps from '../../components/BookingSteps';
import axios from '../../api/axiosConfig';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const ResourceSchedule = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Drag Selection State
    const [isDragging, setIsDragging] = useState(false);
    const [selectionStart, setSelectionStart] = useState(null); // Slot index
    const [selectionEnd, setSelectionEnd] = useState(null); // Slot index

    const [bookings, setBookings] = useState([]);

    // Fetch Bookings for Resource
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const [resResponse, bookingsResponse] = await Promise.all([
                    axios.get(`/api/resources/${id}`),
                    axios.get(`/api/bookings/resource/${id}`)
                ]);
                setBookings(bookingsResponse.data);
            } catch (err) {
                console.error("Failed to fetch resource bookings", err);
            }
        };
        fetchBookings();
    }, [id]);

    // Filter and Map Bookings to Slots for Selected Date
    const getScheduleForDate = (dateStr) => {
        const selectedStart = new Date(dateStr);
        selectedStart.setHours(0, 0, 0, 0);
        const selectedEnd = new Date(dateStr);
        selectedEnd.setHours(23, 59, 59, 999);

        return bookings.filter(b => {
            const bStart = new Date(b.startTime);
            return bStart >= selectedStart && bStart <= selectedEnd;
        }).map((b, index) => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);

            // Calculate start slot (0-47)
            const startSlot = (start.getHours() * 2) + (start.getMinutes() === 30 ? 1 : 0);

            // Calculate duration in slots
            const durationMs = end - start;
            const durationSlots = Math.ceil(durationMs / (30 * 60 * 1000));

            const isMaintenance = b.status === 'Maintenance';

            return {
                id: b._id,
                startSlot,
                durationSlots,
                type: isMaintenance ? 'maintenance' : 'booked',
                title: isMaintenance ? b.purpose : (b.purpose || 'Reserved'),
                user: isMaintenance ? 'Maintenance Staff' : (b.user?.name || 'User')
            };
        });
    };

    const events = getScheduleForDate(selectedDate);
    const TOTAL_SLOTS = 48; // 24 hours * 2
    const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => i);

    const getEventAtSlot = (slotIdx) => events.find(e => e.startSlot === slotIdx);
    const isSlotOccupied = (slotIdx) => events.some(e => slotIdx >= e.startSlot && slotIdx < e.startSlot + e.durationSlots);

    // Helper to format time
    const formatTime = (slotIdx) => {
        const h = Math.floor(slotIdx / 2);
        const m = (slotIdx % 2) * 30;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    // ----- Drag Handlers -----

    // ----- Selection Handlers (Click/Tap) -----

    const handleSlotClick = (slotIdx) => {
        if (isSlotOccupied(slotIdx)) return;

        // Mode 1: Start New Selection (If nothing selected or fully selected)
        if (selectionStart === null || (selectionStart !== null && selectionEnd !== null)) {
            setSelectionStart(slotIdx);
            setSelectionEnd(null); // Reset end to prompt for second click
        }
        // Mode 2: Complete Selection (If start is set but end is not)
        else {
            // Ensure end is after start, otherwise flip
            if (slotIdx < selectionStart) {
                setSelectionEnd(selectionStart);
                setSelectionStart(slotIdx);
            } else {
                setSelectionEnd(slotIdx);
            }
        }
    };

    // Selection Range Logic
    let selectionRange = null;
    if (selectionStart !== null && selectionEnd !== null) {
        const start = Math.min(selectionStart, selectionEnd);
        const end = Math.max(selectionStart, selectionEnd);
        selectionRange = { start, end, duration: end - start + 1 };
    }

    const containerRef = React.useRef(null);
    useGSAP(() => {
        gsap.fromTo('.schedule-anim',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );
    }, [bookings.length]);

    return (
        <>
            <div ref={containerRef} className="space-y-6 select-none pb-20">
                <BookingSteps currentStep={3} />
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/resources/${id}`)}
                            className="p-2 -ml-2 text-secondary hover:text-primary hover:bg-secondary/10 rounded-full transition-all group"
                        >
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <span className="text-xs font-bold text-secondary uppercase tracking-widest">Availability</span>
                            <h1 className="text-2xl font-black text-ink uppercase tracking-tight">Daily Schedule</h1>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-secondary/10 to-primary/10 rounded blur opacity-25 group-hover:opacity-75 transition-opacity" />
                        <div className="relative flex items-center bg-paper border border-secondary/20 rounded px-3 py-2 shadow-sm">
                            <Calendar className="w-4 h-4 text-primary mr-2" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent text-sm font-bold text-ink uppercase tracking-wider focus:outline-none"
                            />
                        </div>
                    </div>
                </div>



                {/* Grid Visualization */}
                <div className="schedule-anim opacity-0 bg-paper border-2 border-dashed border-secondary/20 rounded-lg p-6 relative overflow-x-auto">
                    <p className="absolute top-2 right-4 text-[10px] text-secondary font-mono flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {selectionStart !== null && selectionEnd === null ? "TAP END TIME" : "TAP START TIME"}
                    </p>

                    <div className="grid grid-cols-[60px_1fr] auto-rows-[50px] relative mt-4 min-w-[300px]">
                        {/* Background Grid Lines & Labels Container */}
                        <div className="contents pointer-events-none">
                            {slots.map(s => {
                                const isHour = s % 2 === 0;
                                return (
                                    <React.Fragment key={`grid-${s}`}>
                                        {/* Horizontal Line */}
                                        <div
                                            className={`col-start-2 w-full border-b ${isHour ? 'border-dashed border-secondary/20' : 'border-dotted border-secondary/10'}`}
                                            style={{ gridRow: `${s + 1}`, alignSelf: 'start' }}
                                        />

                                        {/* Time Label (Aligned to Top of Row = Start Time) */}
                                        <div
                                            className="col-start-1 text-right pr-4 relative"
                                            style={{ gridRow: `${s + 1}` }}
                                        >
                                            <span className={`block -translate-y-1/2 ${isHour ? 'text-xs font-mono text-secondary font-bold' : 'text-[10px] font-mono text-secondary/40'}`}>
                                                {formatTime(s)}
                                            </span>
                                        </div>
                                    </React.Fragment>
                                );
                            })}

                            {/* Final 24:00 Line & Label */}
                            <div
                                className="col-start-2 w-full border-b border-dashed border-secondary/20 h-0"
                                style={{ gridRow: `${TOTAL_SLOTS + 1}`, alignSelf: 'start' }}
                            />
                            <div
                                className="col-start-1 text-right pr-4 relative h-0"
                                style={{ gridRow: `${TOTAL_SLOTS + 1}` }}
                            >
                                <span className="block -translate-y-1/2 text-xs font-mono text-secondary font-bold">
                                    00:00
                                </span>
                            </div>

                            {/* Vertical Divider */}
                            <div className="col-start-1 col-end-1 row-start-1 row-end-[49] border-r border-secondary/10 w-full h-full absolute right-0 top-0" />
                        </div>

                        {/* Content Layer */}
                        {slots.map(slotIdx => {
                            const event = getEventAtSlot(slotIdx);
                            const isOccupiedSlot = isSlotOccupied(slotIdx);

                            return (
                                <React.Fragment key={slotIdx}>
                                    {/* Event Block */}
                                    {event && (
                                        <div
                                            className={`col-start-2 m-0.5 rounded px-2 py-1 shadow-sm border-l-4 relative overflow-hidden transition-transform hover:-translate-y-0.5 z-20 ${event.type === 'maintenance'
                                                ? 'bg-secondary/20 border-secondary text-secondary'
                                                : 'bg-paper border-primary text-ink'
                                                }`}
                                            style={{
                                                gridRow: `${event.startSlot + 1} / span ${event.durationSlots}`,
                                                marginTop: '1px', marginBottom: '1px' // Slight gap
                                            }}
                                        >
                                            {event.type === 'maintenance' && (
                                                <div className="absolute inset-0 opacity-10"
                                                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}
                                                />
                                            )}

                                            <div className="relative z-10 flex justify-between items-start">
                                                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 truncate leading-tight py-1">
                                                    {event.type === 'maintenance' ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {event.title}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Interactive Slot Layer */}
                                    {!isOccupiedSlot && !event && (
                                        <div
                                            className="col-start-2 z-10 cursor-pointer hover:bg-secondary/10 transition-colors"
                                            style={{ gridRow: `${slotIdx + 1}` }}
                                            onClick={() => handleSlotClick(slotIdx)}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}

                        {/* Drag Selection Overlay */}
                        {/* Case 1: Range Selected */}
                        {selectionRange && (
                            <div
                                className="col-start-2 mx-1 bg-emerald-500/20 border-l-2 border-r-2 border-emerald-500 text-emerald-700 z-30 pointer-events-none flex items-center justify-center animate-pulse"
                                style={{
                                    gridRow: `${selectionRange.start + 1} / span ${selectionRange.duration}`,
                                }}
                            >
                                <span className="bg-paper/90 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3" />
                                    {formatTime(selectionRange.start)} - {formatTime(selectionRange.end + 1)} ({selectionRange.duration / 2}h)
                                </span>
                            </div>
                        )}

                        {/* Case 2: Only Start Selected (Show Preview Indicator at start slot) */}
                        {selectionStart !== null && selectionEnd === null && (
                            <div
                                className="col-start-2 mx-1 bg-emerald-500/10 border-t-2 border-emerald-500 z-30 pointer-events-none"
                                style={{
                                    gridRow: `${selectionStart + 1} / span 1`,
                                }}
                            />
                        )}
                    </div>
                </div>

            </div >
            {/* Selection Actions - Placed outside animated container to preserve fixed positioning */}
            {
                !isDragging && selectionRange && (
                    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto bg-paper border-2 border-primary rounded-lg shadow-2xl p-4 flex flex-col md:flex-row items-center gap-4 md:gap-6 animate-bounce-in z-50">
                        <div className="text-center md:text-left">
                            <p className="text-[10px] uppercase font-bold text-secondary">Selected Time</p>
                            <p className="text-sm md:text-lg font-black text-ink">
                                {formatTime(selectionRange.start)} - {formatTime(selectionRange.end + 1)}
                            </p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={() => navigate(`/resources/${id}/book`, {
                                    state: {
                                        startSlot: selectionRange.start,
                                        endSlot: selectionRange.end,
                                        date: selectedDate
                                    }
                                })}
                                className="flex-1 md:flex-none bg-primary text-paper px-6 py-3 md:py-2 rounded font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors text-xs md:text-sm"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => { setSelectionStart(null); setSelectionEnd(null); }}
                                className="md:hidden px-4 py-3 bg-secondary/10 text-ink rounded font-bold uppercase text-xs"
                            >
                                Cancel
                            </button>
                        </div>
                        <button
                            onClick={() => { setSelectionStart(null); setSelectionEnd(null); }}
                            className="hidden md:block text-secondary hover:text-red-500 p-2"
                        >
                            ✕
                        </button>
                    </div>
                )
            }
        </>
    );
};

export default ResourceSchedule;
