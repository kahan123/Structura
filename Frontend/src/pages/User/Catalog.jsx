import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { Search, Filter, MapPin, Users, ArrowRight, LayoutGrid, List, Sparkles, Monitor, Armchair, Box } from 'lucide-react';
import BookingSteps from '../../components/BookingSteps';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const Catalog = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo'))?.token; // Assuming token is stored
                const { data } = await axios.get('/api/resources', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const mappedResources = data.map(r => ({
                    id: r._id,
                    name: r.name,
                    type: r.type,
                    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', // Placeholder
                    capacity: r.capacity,
                    location: `${r.building}, ${r.floor} Floor`,
                    facilities: r.facilities
                }));
                setResources(mappedResources);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching resources:", error);
                setLoading(false);
            }
        };

        fetchResources();
    }, []);

    const filterTypes = [
        { id: "all", label: "All Resources" },
        { id: "Lab", label: "Labs", icon: Monitor }, // Changed ID case to match Seed Data
        { id: "Classroom", label: "Classrooms", icon: Armchair },
        { id: "Auditorium", label: "Auditoriums", icon: Box },
        { id: "Conference", label: "Conference", icon: Users },
    ];

    const filteredResources = resources.filter(res => {
        const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === "all" || res.type === selectedType;
        return matchesSearch && matchesType;
    });

    const containerRef = React.useRef(null);
    useGSAP(() => {
        if (!loading) {
            gsap.fromTo('.resource-card',
                { opacity: 0, scale: 0.95, y: 10 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }, [filteredResources.length, loading, selectedType]);

    if (loading) {
        return <div className="p-10 text-center text-secondary">Loading resources...</div>;
    }

    return (
        <div ref={containerRef} className="space-y-6">
            <BookingSteps currentStep={1} />
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-ink uppercase tracking-tight">Resource Catalog</h2>
                    <p className="text-xs text-secondary font-mono mt-1">BROWSE & BOOK FACILITIES</p>
                </div>

                {/* Search Bar - "Blueprint" Style */}
                <div className="relative w-full md:w-80 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200" />
                    <div className="relative flex items-center bg-paper border-2 border-dashed border-secondary/30 rounded-lg p-1 focus-within:border-primary focus-within:border-solid transition-all shadow-sm">
                        <div className="p-2 text-secondary">
                            <Search className="w-5 h-5" />
                        </div>
                        <div className="h-6 w-[1px] bg-secondary/20 mx-1" />
                        <input
                            type="text"
                            placeholder="Search protocol credentials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none p-2 text-ink font-mono text-sm focus:ring-0 placeholder:text-secondary/40"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] bg-secondary/10 px-1.5 py-0.5 rounded text-secondary font-bold">/</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters - Desktop */}
                <aside className="w-full md:w-48 flex-shrink-0 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Filter className="w-3 h-3" /> Filter By Type
                        </h3>
                        <div className="space-y-1">
                            {filterTypes.map(type => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${selectedType === type.id
                                            ? 'bg-ink text-paper shadow-md'
                                            : 'text-secondary hover:bg-secondary/10 hover:text-ink'
                                            }`}
                                    >
                                        {Icon && <Icon className="w-3.5 h-3.5" />}
                                        {type.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* Resource Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map(res => (
                        <div key={res.id} className="resource-card opacity-0 group relative bg-paper border border-secondary/20 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                            {/* Image / Thumbnail */}
                            <div className="h-32 w-full bg-secondary/10 relative overflow-hidden">
                                <img src={res.image} alt={res.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                                {/* Status badge removed as per request */}
                            </div>

                            {/* Info */}
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-md font-bold text-ink uppercase tracking-tight mb-1">{res.name}</h3>
                                <div className="flex items-center gap-1 text-[10px] text-secondary font-mono mb-4">
                                    <MapPin className="w-3 h-3" />
                                    {res.location}
                                </div>

                                <div className="mt-auto pt-3 border-t border-dashed border-secondary/20 flex justify-between items-center text-[10px] font-bold text-secondary uppercase">
                                    <span>Capacity: {res.capacity}</span>
                                    <Link
                                        to={`/resources/${res.id}`}
                                        className="text-primary hover:underline decoration-wavy underline-offset-2"
                                    >
                                        View Details &rarr;
                                    </Link>
                                </div>
                            </div>

                            {/* Corner Accents */}
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary/20" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary/20" />
                        </div>
                    ))}

                    {filteredResources.length === 0 && (
                        <div className="col-span-full py-12 text-center text-secondary border-2 border-dashed border-secondary/10">
                            <p>No resources found matching criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Catalog;
