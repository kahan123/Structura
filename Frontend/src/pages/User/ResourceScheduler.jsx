import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { Calendar, Clock, CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight, Info, ArrowLeft } from 'lucide-react';
import BookingSteps from '../../components/BookingSteps';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const ResourceScheduler = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- State ---
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [resource, setResource] = useState(null);
    const [bookings, setBookings] = useState([]); // Raw API bookings
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [purpose, setPurpose] = useState('');

    // --- Grid / Selection State ---
    const [selectionStart, setSelectionStart] = useState(null); // Slot index
    const [selectionEnd, setSelectionEnd] = useState(null); // Slot index

    // --- Date Picker Refs & Logic ---
    const dateInputRef = React.useRef(null);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);

    const handleDateChange = (e) => {
        if (!e.target.value) return;
        const newDate = new Date(e.target.value);
        setSelectedDate(newDate);
        setSelectionStart(null);
        setSelectionEnd(null);
    };

    // --- Constants ---
    const TOTAL_SLOTS = 48; // 24 hours * 2 (30 min slots)
    const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => i);

    // --- Helpers ---
    const formatTime = (slotIdx) => {
        const h = Math.floor(slotIdx / 2);
        const m = (slotIdx % 2) * 30;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    // Convert Date object to Slot Index (0-47)
    const getSlotFromDate = (dateObj) => {
        const h = dateObj.getHours();
        const m = dateObj.getMinutes();
        return (h * 2) + (m >= 30 ? 1 : 0);
    };

    // --- Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resResponse, bookingsResponse] = await Promise.all([
                    axios.get(`/api/resources/${id}`),
                    axios.get(`/api/bookings/resource/${id}`)
                ]);
                setResource(resResponse.data);
                setBookings(bookingsResponse.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load data');
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // --- Derive Occupied Slots for Selected Date ---
    const getOccupiedSlots = () => {
        // Filter bookings for the selected date
        const dayBookings = bookings.filter(b =>
            new Date(b.startTime).toDateString() === selectedDate.toDateString()
        );

        // Map to slot ranges
        return dayBookings.map(b => {
            const startObj = new Date(b.startTime);
            const endObj = new Date(b.endTime);
            const startSlot = getSlotFromDate(startObj);
            // Calculate duration in slots
            // Difference in minutes / 30
            const durationMins = (endObj - startObj) / 60000;
            const durationSlots = Math.ceil(durationMins / 30);

            return {
                id: b._id,
                startSlot,
                durationSlots,
                title: b.status === 'Maintenance' ? 'Maintenance' : (b.status === 'Pending' ? 'Requested' : 'Booked'),
                type: b.status === 'Maintenance' ? 'maintenance' : (b.status === 'Pending' ? 'pending' : 'booked'),
                status: b.status,
                user: b.status === 'Maintenance' ? 'Maintenance Staff' : b.user?.name
            };
        });
    };

    const events = getOccupiedSlots();
    const getEventAtSlot = (slotIdx) => events.find(e => e.startSlot === slotIdx);
    const isSlotOccupied = (slotIdx) => events.some(e => slotIdx >= e.startSlot && slotIdx < e.startSlot + e.durationSlots);

    // --- Helper for Past Slots ---
    const isSlotPast = (slotIdx) => {
        const now = new Date();
        // Check if selected date is today
        if (selectedDate.toDateString() !== now.toDateString()) {
            // If selected date is in the past (yesterday etc), all slots are past
            if (selectedDate < new Date(now.setHours(0, 0, 0, 0))) return true;
            return false;
        }

        // Calculate current slot index based on current time
        const currentSlot = getSlotFromDate(now);
        return slotIdx < currentSlot;
    };

    // --- Interaction Handlers ---
    const [isDragging, setIsDragging] = useState(false);

    const handleSlotMouseDown = (slotIdx) => {
        if (isSlotOccupied(slotIdx) || isSlotPast(slotIdx)) return;

        setError('');
        setIsDragging(true);

        // If waiting for second click (Mode 2): treat as potential end slot
        if (selectionStart !== null && selectionEnd === null) {
            setSelectionEnd(slotIdx);
        } else {
            // Start fresh selection (Mode 1)
            // Reset end to null to allow second click to define range end
            setSelectionStart(slotIdx);
            setSelectionEnd(null);
        }
    };

    const handleSlotMouseEnter = (slotIdx) => {
        if (!isDragging) return;
        // Don't allowing dragging INTO a past slot, though starting one is already blocked
        if (isSlotPast(slotIdx)) return;
        setSelectionEnd(slotIdx);
    };

    const handleSlotMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        // Validation happens on Render or Booking Click mostly, 
        // but we should ideally snap/validate here.
        if (selectionStart !== null && selectionEnd !== null) {
            const start = Math.min(selectionStart, selectionEnd);
            const end = Math.max(selectionStart, selectionEnd);

            let hasOverlap = false;
            for (let i = start; i <= end; i++) {
                if (isSlotOccupied(i) || isSlotPast(i)) hasOverlap = true;
            }

            if (hasOverlap) {
                setError('Selection overlaps with unavailable slots');
                setSelectionStart(null);
                setSelectionEnd(null);
            }
        }
    };

    // Global listener for mouse up in case they release outside
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) setIsDragging(false);
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDragging]);

    const handleSlotClick = (slotIdx) => {
        if (isSlotOccupied(slotIdx) || isSlotPast(slotIdx)) return;
        // Logic handled in MouseDown mostly. 
        // We removed the "Reset to null" logic to allow single click = 30 min slot.
    };

    // Calculate selection range object
    let selectionRange = null;

    // If we have a start, we interpret that as a selection.
    // If End is null, it means we are "anchored" at Start, effectively [Start, Start].
    // If End is set, we use [Start, End].
    if (selectionStart !== null) {
        const effectiveEnd = selectionEnd !== null ? selectionEnd : selectionStart;

        const start = Math.min(selectionStart, effectiveEnd);
        const end = Math.max(selectionStart, effectiveEnd);

        // Final overlap check for display safety
        let hasOverlap = false;
        for (let i = start; i <= end; i++) {
            if (isSlotOccupied(i) || isSlotPast(i)) hasOverlap = true;
        }

        if (!hasOverlap) {
            selectionRange = { start, end, duration: end - start + 1 };
        }
    }

    // --- Navigation to Booking Request ---
    const handleProceed = () => {
        if (!selectionRange) return;

        navigate(`/resources/${id}/book`, {
            state: {
                startSlot: selectionRange.start,
                endSlot: selectionRange.end,
                date: selectedDate.toISOString(), // Standardize date format
                resource: resource // Pass resource details to avoid re-fetching
            }
        });
    };

    // --- Date Picker Logic (Moved Up) ---

    const containerRef = React.useRef(null);
    useGSAP(() => {
        if (!loading && resource) {
            gsap.fromTo('.scheduler-anim',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
            );
        }
    }, [loading, resource]);

    if (loading) return <div className="p-10 text-center">Loading scheduler...</div>;
    if (!resource) return <div className="p-10 text-center">Resource not found</div>;

    // Change date handler
    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
        setSelectionStart(null);
        setSelectionEnd(null);
    };

    return (
        <div ref={containerRef} className="space-y-6 pb-20">
            <BookingSteps currentStep={3} />

            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-secondary hover:text-primary hover:bg-white/50 rounded-full transition-all group"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <span className="text-xs font-bold text-secondary uppercase tracking-widest">Availability</span>
                    <h2 className="text-2xl font-black text-ink uppercase">Schedule: {resource.name}</h2>
                </div>
            </div>

            {/* Helper Hint */}
            <div className="scheduler-anim opacity-0 bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-start gap-3 text-xs text-secondary">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p>
                    <span className="font-bold text-ink">How to Select:</span> Tap a slot to select a 30-min block. To select a range, tap the start time, then tap the end time.
                </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-50 text-green-600 text-xs font-bold border border-green-200 flex items-center gap-2">
                    <Info className="w-4 h-4" /> {success}
                </div>
            )}

            {/* Date Picker Header */}
            <div className="scheduler-anim opacity-0 flex items-center justify-between bg-paper p-4 border border-secondary/20 rounded shadow-sm">
                <button onClick={() => changeDate(-1)} className="p-2 hover:bg-secondary/10 rounded"><ChevronLeft className="w-5 h-5" /></button>

                <div
                    className="flex items-center gap-2 font-bold text-lg uppercase cursor-pointer hover:text-primary transition-colors relative"
                    onClick={() => dateInputRef.current?.showPicker()}
                >
                    <Calendar className="w-5 h-5 text-primary" />
                    {selectedDate.toDateString()}

                    {/* Hidden Date Input */}
                    <input
                        type="date"
                        ref={dateInputRef}
                        className="absolute inset-0 opacity-0 cursor-pointer w-0 h-0"
                        min={today.toISOString().split('T')[0]}
                        max={maxDate.toISOString().split('T')[0]}
                        onChange={handleDateChange}
                    />
                </div>

                <button onClick={() => changeDate(1)} className="p-2 hover:bg-secondary/10 rounded"><ChevronRight className="w-5 h-5" /></button>
            </div>

            {/* Grid Visualization */}
            <div className="scheduler-anim opacity-0 bg-paper border-2 border-dashed border-secondary/10 rounded-lg p-6 relative overflow-x-auto select-none">
                <p className="absolute top-2 right-4 text-[10px] text-secondary font-mono flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectionStart !== null ? 'bg-emerald-500 animate-pulse' : 'bg-secondary/30'}`}></span>
                    {selectionStart !== null && selectionEnd === null ? "TAP END TIME" : "TAP TO SELECT"}
                </p>

                <div className="grid grid-cols-[60px_1fr] auto-rows-[50px] relative mt-4 min-w-[300px]">
                    {/* Background Grid */}
                    <div className="contents pointer-events-none">
                        {slots.map(s => {
                            const isHour = s % 2 === 0;
                            return (
                                <React.Fragment key={`grid-${s}`}>
                                    <div className={`col-start-2 w-full border-b ${isHour ? 'border-dashed border-secondary/20' : 'border-dotted border-secondary/10'}`} style={{ gridRow: `${s + 1}`, alignSelf: 'start' }} />
                                    <div className="col-start-1 text-right pr-4 relative" style={{ gridRow: `${s + 1}` }}>
                                        <span className={`block -translate-y-1/2 ${isHour ? 'text-xs font-mono text-secondary font-bold' : 'text-[10px] font-mono text-secondary/40'}`}>
                                            {formatTime(s)}
                                        </span>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Content Layer */}
                    {slots.map(slotIdx => {
                        const event = getEventAtSlot(slotIdx);
                        const occupied = isSlotOccupied(slotIdx);
                        const past = isSlotPast(slotIdx);

                        return (
                            <React.Fragment key={slotIdx}>
                                {/* Booked Event Block */}
                                {event && (
                                    <div
                                        className={`col-start-2 m-0.5 rounded px-2 py-1 shadow-sm border-l-4 relative overflow-hidden z-20 
                                            ${event.status === 'Maintenance'
                                                ? 'bg-amber-50/90 border-l-amber-600 text-amber-800 border border-dashed border-amber-200'
                                                : (event.status === 'Pending'
                                                    ? 'bg-amber-50 border-l-amber-400 text-amber-700'
                                                    : 'bg-secondary/10 border-l-secondary text-secondary')
                                            }`}
                                        style={{ gridRow: `${event.startSlot + 1} / span ${event.durationSlots}` }}
                                    >
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                                            {event.status === 'Maintenance' ? <AlertCircle className="w-3 h-3 text-amber-600" /> : (event.status === 'Pending' ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />)}
                                            {event.title}
                                        </div>
                                        <div className="text-[9px] truncate opacity-70 font-bold">
                                            {event.status === 'Maintenance' ? 'Offline: Scheduled Service' : (event.status === 'Pending' ? 'Pending Approval' : `User: ${event.user || 'Unknown'}`)}
                                        </div>
                                    </div>
                                )}

                                {/* Interactive Slot */}
                                {!occupied && !event && (
                                    <div
                                        className={`col-start-2 z-10 border-b border-transparent transition-colors
                                            ${past
                                                ? 'bg-ink/10 dark:bg-ink/20 cursor-not-allowed pattern-diagonal-lines'
                                                : 'cursor-pointer hover:bg-primary/5'
                                            }`}
                                        style={{ gridRow: `${slotIdx + 1}` }}
                                        onMouseDown={() => !past && handleSlotMouseDown(slotIdx)}
                                        onMouseEnter={() => !past && handleSlotMouseEnter(slotIdx)}
                                        onMouseUp={handleSlotMouseUp}
                                        onClick={() => !past && handleSlotClick(slotIdx)}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}

                    {/* Selection Overlay */}
                    {selectionRange && (
                        <div
                            className="col-start-2 mx-1 bg-emerald-500/20 border-l-2 border-r-2 border-emerald-500 text-emerald-700 z-30 pointer-events-none flex items-center justify-center animate-pulse"
                            style={{ gridRow: `${selectionRange.start + 1} / span ${selectionRange.duration}` }}
                        >
                            <div className="bg-paper/90 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm flex items-center gap-2">
                                <CheckCircle className="w-3 h-3" />
                                {formatTime(selectionRange.start)} - {formatTime(selectionRange.end + 1)}
                            </div>
                        </div>
                    )}

                    {/* Start Selection Indicator */}
                    {selectionStart !== null && selectionEnd === null && (
                        <div className="col-start-2 mx-1 bg-emerald-500/10 border-t-2 border-emerald-500 z-30 pointer-events-none" style={{ gridRow: `${selectionStart + 1} / span 1` }} />
                    )}
                </div>
            </div>

            {/* Bottom Action Bar */}
            {selectionRange && (
                <div className="fixed bottom-24 left-4 right-4 md:bottom-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto bg-paper border-2 border-primary rounded-lg shadow-2xl p-3 md:p-4 flex items-center justify-between md:gap-8 animate-slide-up z-50">
                    <div className="text-left">
                        <p className="text-[10px] uppercase font-bold text-secondary">Selected</p>
                        <p className="text-base md:text-lg font-black text-ink leading-tight">
                            {formatTime(selectionRange.start)} - {formatTime(selectionRange.end + 1)}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setSelectionStart(null); setSelectionEnd(null); }}
                            className="px-3 py-2 text-ink rounded font-bold uppercase text-[10px] hover:bg-secondary/10"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleProceed}
                            className="bg-primary text-paper px-4 py-2 rounded font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors text-xs md:text-sm flex items-center gap-2"
                        >
                            Proceed <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceScheduler;
