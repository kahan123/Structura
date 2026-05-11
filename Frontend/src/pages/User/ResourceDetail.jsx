import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { ArrowLeft, MapPin, Users, Wifi, Wind, Monitor, Box, CalendarClock, Info, MessageCircle, Calendar, Archive } from 'lucide-react';
import BookingSteps from '../../components/BookingSteps';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const ResourceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResource = async () => {
            try {
                const { data } = await axios.get(`/api/resources/${id}`);
                setResource({
                    id: data._id,
                    name: data.name,
                    type: data.type,
                    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
                    capacity: data.capacity,
                    location: `${data.building}, ${data.floor} Floor`,
                    description: data.description,
                    facilities: data.facilities.map(f => ({ label: f, icon: Info })),
                    inventory: [
                        "30x Dell Optiplex (i7, 16GB RAM)",
                        "1x Instructor PC",
                        "1x Whiteboard",
                        "1x Projector Remote"
                    ]
                });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Resource not found');
                setLoading(false);
            }
        };

        fetchResource();
    }, [id]);

    const containerRef = React.useRef(null);
    useGSAP(() => {
        if (!loading && !error && resource) {
            gsap.fromTo('.detail-block',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
            );
        }
    }, [loading, error, resource]);

    if (loading) return <div className="p-10 text-center text-secondary">Loading details...</div>;
    if (error || !resource) return <div className="p-10 text-center text-secondary">Resource Not Found</div>;

    return (
        <div ref={containerRef} className="space-y-8">
            <BookingSteps currentStep={2} />
            {/* Header & Back Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/catalog')}
                    className="p-2 -ml-2 text-secondary hover:text-primary hover:bg-secondary/10 rounded-full transition-all group"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <span className="text-xs font-bold text-secondary uppercase tracking-widest">Resource Details</span>
                    <h1 className="text-3xl font-black text-ink uppercase tracking-tight">{resource.name}</h1>
                </div>
            </div>

            {/* Hero Section - No Status Overlay */}
            <div className="detail-block opacity-0 relative w-full h-64 md:h-96 bg-secondary/10 rounded-lg overflow-hidden border-2 border-dashed border-secondary/20 group">
                <img
                    src={resource.image}
                    alt={resource.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-8">
                    {/* Description */}
                    <div className="detail-block opacity-0 bg-paper p-6 border border-secondary/20 relative shadow-sm">
                        {/* "Tape" Decoration */}
                        <div className="absolute -top-3 left-6 w-24 h-4 bg-secondary/20 opacity-50 shadow-sm rotate-1" />

                        <h3 className="text-lg font-bold text-ink uppercase tracking-tight mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" /> About this Space
                        </h3>
                        <p className="text-secondary text-sm leading-relaxed font-medium">
                            {resource.description}
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-secondary">
                                <Users className="w-4 h-4" />
                                <span>Capacity: {resource.capacity}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-secondary">
                                <MapPin className="w-4 h-4" />
                                <span>{resource.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Facilities */}
                    <div className="detail-block opacity-0">
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Available Amenities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {resource.facilities.map((fac, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-center p-4 bg-paper border border-secondary/10 rounded hover:border-primary/30 transition-colors">
                                    <fac.icon className="w-6 h-6 text-primary mb-2 opacity-80" />
                                    <span className="text-[10px] font-bold text-secondary uppercase text-center">{fac.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inventory */}
                    <div className="detail-block opacity-0 opacity-80">
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Standard Inventory</h3>
                        <ul className="text-xs text-secondary font-mono bg-secondary/10 p-4 border border-secondary/10 rounded space-y-2">
                            {resource.inventory.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-secondary rounded-full" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Booking Sidebar */}
                <div className="md:col-span-1 detail-block opacity-0">
                    <div className="sticky top-8 bg-ink text-paper p-6 rounded shadow-xl relative overflow-hidden">
                        {/* Background Texture */}
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '12px 12px' }}
                        />

                        <div className="relative z-10">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-4">Check Availability</h3>
                            <p className="text-xs text-paper/70 mb-8 leading-relaxed">
                                View the daily schedule to find open slots and manage your reservations.
                            </p>

                            <button
                                onClick={() => navigate(`/resources/${id}/schedule`)}
                                className="w-full bg-primary text-paper py-4 font-bold uppercase tracking-widest hover:bg-paper hover:text-ink transition-all duration-300 flex items-center justify-center gap-2 group border-2 border-transparent hover:border-primary shadow-lg"
                            >
                                <CalendarClock className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                                View Available Slots
                            </button>

                            <p className="text-[10px] text-center text-paper/40 mt-6 mb-4">
                                * Maintenance windows are blocked automatically.
                            </p>

                            <button
                                onClick={() => navigate('/chat?thread=admin')}
                                className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-paper/50 hover:text-paper hover:bg-paper/10 rounded transition-all flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-3 h-3" />
                                Have questions? Chat with Admin
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceDetail;
