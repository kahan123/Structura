// Centralized Mock Data based on database-scheema.txt

export const users = [
    { user_id: 1, name: "John Doe", email: "john@uni.edu", role: "Student", password: "hash", created_at: "2024-01-15T10:00:00" },
    { user_id: 2, name: "Sarah Smith", email: "sarah@uni.edu", role: "Faculty", password: "hash", created_at: "2024-01-10T09:30:00" },
    { user_id: 3, name: "Admin User", email: "admin@uni.edu", role: "Admin", password: "hash", created_at: "2023-11-01T08:00:00" },
    { user_id: 4, name: "Mike Ross", email: "mike@uni.edu", role: "Student", password: "hash", created_at: "2024-02-20T14:20:00" },
    { user_id: 5, name: "Bob Builder", email: "maintain@uni.edu", role: "Maintenance", password: "hash", created_at: "2023-12-05T07:00:00" }
];

export const resourceTypes = [
    { resource_type_id: 1, type_name: "Lab" },
    { resource_type_id: 2, type_name: "Lecture Hall" },
    { resource_type_id: 3, type_name: "Auditorium" },
    { resource_type_id: 4, type_name: "Conference Room" }
];

export const buildings = [
    { building_id: 1, building_name: "Main Block", building_number: "MB-01", total_floors: 5 },
    { building_id: 2, building_name: "Science Block", building_number: "SB-02", total_floors: 4 },
    { building_id: 3, building_name: "North Block", building_number: "NB-03", total_floors: 3 }
];

// Resources (Labs, Rooms, Halls)
export const resources = [
    {
        resource_id: 1,
        resource_name: "Computer Lab 1",
        resource_type_id: 1,
        building_id: 1,
        floor_number: 2,
        description: "High-spec PCs for programming sessions.",
        capacity: 30,
        image: "https://images.unsplash.com/photo-1598986646512-9330bcc4c0dc?auto=format&fit=crop&q=80&w=1000"
    },
    {
        resource_id: 2,
        resource_name: "Seminar Hall A",
        resource_type_id: 3,
        building_id: 3,
        floor_number: 0,
        description: "Large hall with stage and audio system.",
        capacity: 150,
        image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1000"
    },
    {
        resource_id: 3,
        resource_name: "Physics Lab",
        resource_type_id: 1,
        building_id: 2,
        floor_number: 1,
        description: "Equipped with workbenches and safety gear.",
        capacity: 40,
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1000"
    },
    {
        resource_id: 4,
        resource_name: "Lecture Room 101",
        resource_type_id: 2,
        building_id: 1,
        floor_number: 1,
        description: "Standard classroom with whiteboard.",
        capacity: 60,
        image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1000"
    },
    {
        resource_id: 5,
        resource_name: "Conf. Room A",
        resource_type_id: 4,
        building_id: 1,
        floor_number: 3,
        description: "Executive meeting room with video conferencing.",
        capacity: 12,
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"
    },
    {
        resource_id: 6,
        resource_name: "Projector Kit A",
        resource_type_id: 5, // Equipment
        building_id: 1,
        floor_number: 0,
        description: "Portable HD Projector with screen.",
        capacity: 1,
        image: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&q=80&w=1000"
    },
    {
        resource_id: 7,
        resource_name: "Chemistry Lab",
        resource_type_id: 1,
        building_id: 2,
        floor_number: 1,
        description: "Ventilated lab with chemical storage.",
        capacity: 25,
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1000"
    },
    {
        resource_id: 8,
        resource_name: "VR Headset Set",
        resource_type_id: 5, // Equipment
        building_id: 2,
        floor_number: 2,
        description: "Oculus Quest 2 set for VR development.",
        capacity: 5,
        image: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?auto=format&fit=crop&q=80&w=1000"
    },
    {
        resource_id: 9,
        resource_name: "3D Printer",
        resource_type_id: 5, // Equipment
        building_id: 2,
        floor_number: 2,
        description: "Prusa i3 mk3 for rapid prototyping.",
        capacity: 1,
        image: "https://images.unsplash.com/photo-1631541909061-71e349d1f203?auto=format&fit=crop&q=80&w=1000"
    },
    {
        resource_id: 10,
        resource_name: "Language Lab",
        resource_type_id: 1,
        building_id: 1,
        floor_number: 3,
        description: "Audio-visual setup for language learning.",
        capacity: 20,
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1000"
    },
    {
        resource_id: 11,
        resource_name: "Auditorium Main",
        resource_type_id: 3,
        building_id: 1,
        floor_number: 0,
        description: "Main campus auditorium for events.",
        capacity: 500,
        image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=1000"
    },
    {
        resource_id: 12,
        resource_name: "DSLR Camera Kit",
        resource_type_id: 5, // Equipment
        building_id: 1,
        floor_number: 1,
        description: "Canon 5D Mark IV with lens kit.",
        capacity: 1,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000"
    }
];

// Facilities (AC, Projector, etc)
export const facilities = [
    { facility_id: 1, resource_id: 1, facility_name: "AC", details: "Split ACs" },
    { facility_id: 2, resource_id: 1, facility_name: "Projector", details: "HD Projector" },
    { facility_id: 3, resource_id: 1, facility_name: "PCs", details: "30x i7 Workstations" },
    { facility_id: 4, resource_id: 2, facility_name: "Sound System", details: "Surround speakers" },
    { facility_id: 5, resource_id: 2, facility_name: "Stage", details: "Wooden platform" },
    { facility_id: 6, resource_id: 3, facility_name: "Workbenches", details: "Granite tops" },
    { facility_id: 7, resource_id: 5, facility_name: "Video Conf", details: "Polycom System" },
    { facility_id: 8, resource_id: 5, facility_name: "AC", details: "Central AC" },
    { facility_id: 9, resource_id: 8, facility_name: "Controllers", details: "Touch controllers inc" },
    { facility_id: 10, resource_id: 9, facility_name: "Filament", details: "PLA/ABS available" },
    { facility_id: 11, resource_id: 10, facility_name: "Headphones", details: "Noise cancelling" },
    { facility_id: 12, resource_id: 11, facility_name: "Light Rig", details: "Professional Lighting" }
];

// Bookings
export const bookings = [
    {
        booking_id: 101,
        resource_id: 1,
        user_id: 1,
        start_datetime: "2024-03-20T10:00:00",
        end_datetime: "2024-03-20T12:00:00",
        status: "Pending",
        approver_id: null,
        created_at: "2024-03-18T09:00:00",
        purpose: "Final Year Project Work"
    },
    {
        booking_id: 102,
        resource_id: 2,
        user_id: 2,
        start_datetime: "2024-03-21T14:00:00",
        end_datetime: "2024-03-21T16:00:00",
        status: "Pending",
        approver_id: null,
        created_at: "2024-03-19T10:30:00",
        purpose: "Guest Lecture Series"
    },
    {
        booking_id: 103,
        resource_id: 4,
        user_id: 4,
        start_datetime: "2024-03-20T11:00:00",
        end_datetime: "2024-03-20T12:00:00",
        status: "Approved",
        approver_id: 3,
        created_at: "2024-03-15T14:00:00",
        purpose: "Group Study"
    },
    {
        booking_id: 104,
        resource_id: 2,
        user_id: 3,
        start_datetime: "2024-03-18T09:00:00",
        end_datetime: "2024-03-18T17:00:00",
        status: "Rejected",
        approver_id: 3,
        created_at: "2024-03-10T09:00:00",
        purpose: "Orientation"
    },
    // Historical Data for Reports
    { booking_id: 105, resource_id: 1, user_id: 1, start_datetime: "2024-02-15T10:00:00", end_datetime: "2024-02-15T12:00:00", status: "Completed", approver_id: 3, created_at: "2024-02-10T10:00:00", purpose: "Lab Session" },
    { booking_id: 106, resource_id: 3, user_id: 2, start_datetime: "2024-02-16T09:00:00", end_datetime: "2024-02-16T11:00:00", status: "Completed", approver_id: 3, created_at: "2024-02-12T09:00:00", purpose: "Physics Exp" },
    { booking_id: 107, resource_id: 2, user_id: 4, start_datetime: "2024-02-20T14:00:00", end_datetime: "2024-02-20T16:00:00", status: "Rejected", approver_id: 3, created_at: "2024-02-18T14:00:00", purpose: "Club Meet" },
    { booking_id: 108, resource_id: 1, user_id: 1, start_datetime: "2024-01-10T10:00:00", end_datetime: "2024-01-10T12:00:00", status: "Completed", approver_id: 3, created_at: "2024-01-05T10:00:00", purpose: "Coding Practice" },
    { booking_id: 109, resource_id: 4, user_id: 2, start_datetime: "2024-01-12T13:00:00", end_datetime: "2024-01-12T15:00:00", status: "Completed", approver_id: 3, created_at: "2024-01-10T13:00:00", purpose: "Lectures" },
    { booking_id: 110, resource_id: 2, user_id: 3, start_datetime: "2024-02-28T09:00:00", end_datetime: "2024-02-28T17:00:00", status: "Completed", approver_id: 3, created_at: "2024-02-25T09:00:00", purpose: "Workshop" }
];

// Maintenance Logs
export const maintenance = [
    { maintenance_id: 1, resource_id: 3, maintenance_type: "Repair", scheduled_date: "2024-03-22", status: "Scheduled", notes: "Sink leakage check" },
    { maintenance_id: 2, resource_id: 1, maintenance_type: "Inspection", scheduled_date: "2024-03-23", status: "Pending", notes: "Routine PC hardware check" },
    { maintenance_id: 3, resource_id: 2, maintenance_type: "Cleaning", scheduled_date: "2024-03-21", status: "Completed", notes: "Deep cleaning of carpets" },
    { maintenance_id: 4, resource_id: 6, maintenance_type: "Repair", scheduled_date: "2024-03-20", status: "In Progress", notes: "Projector bulb replacement" },
    { maintenance_id: 5, resource_id: 11, maintenance_type: "Inspection", scheduled_date: "2024-03-25", status: "Scheduled", notes: "Fire safety equipment check" }
];

// Cupboards
export const cupboards = [
    { cupboard_id: 1, resource_id: 1, cupboard_name: "Storage Unit A", total_shelves: 3 },
    { cupboard_id: 2, resource_id: 1, cupboard_name: "Side Cabinet", total_shelves: 2 },
    { cupboard_id: 3, resource_id: 3, cupboard_name: "Chemical Storage", total_shelves: 4 },
];

// Shelves
export const shelves = [
    { shelf_id: 1, cupboard_id: 1, shelf_number: 1, capacity: 10, description: "Spare Keyboards" },
    { shelf_id: 2, cupboard_id: 1, shelf_number: 2, capacity: 10, description: "Mouse & Cables" },
    { shelf_id: 3, cupboard_id: 2, shelf_number: 1, capacity: 5, description: "Manuals" },
    { shelf_id: 4, cupboard_id: 3, shelf_number: 1, capacity: 20, description: "Beakers (Glass)" },
];

// Helper to get relation data (Mimics JOINs)
export const getFullBookingDetails = (booking) => {
    const resource = resources.find(r => r.resource_id === booking.resource_id);
    const user = users.find(u => u.user_id === booking.user_id);
    const building = buildings.find(b => b.building_id === resource?.building_id);

    return {
        ...booking,
        resourceName: resource?.resource_name || "Unknown Resource",
        buildingName: building?.building_name || "Unknown Building",
        userName: user?.name || "Unknown User",
        userRole: user?.role || "User"
    };
};

export const getFullResourceDetails = (resource) => {
    const type = resourceTypes.find(t => t.resource_type_id === resource.resource_type_id);
    const building = buildings.find(b => b.building_id === resource.building_id);
    const resFacilities = facilities.filter(f => f.resource_id === resource.resource_id).map(f => f.facility_name);

    return {
        ...resource,
        typeName: type?.type_name || "Unknown",
        buildingName: building?.building_name || "Unknown",
        facilityList: resFacilities
    };
};

export const getInventoryForResource = (resourceId) => {
    const resCupboards = cupboards.filter(c => c.resource_id === resourceId);
    return resCupboards.map(c => ({
        ...c,
        shelves: shelves.filter(s => s.cupboard_id === c.cupboard_id)
    }));
};
