const Resource = require('../models/Resource');

// @desc    Fetch all resources
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
    try {
        const resources = await Resource.find({});
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Fetch single resource
// @route   GET /api/resources/:id
// @access  Private
const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (resource) {
            res.json(resource);
        } else {
            res.status(404).json({ message: 'Resource not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a resource
// @route   POST /api/resources
// @access  Private/Admin
const createResource = async (req, res) => {
    try {
        const { name, type, building, floor, capacity, facilities, description } = req.body;

        const resource = new Resource({
            name,
            type,
            building,
            floor,
            capacity,
            facilities,
            description
        });

        const createdResource = await resource.save();
        res.status(201).json(createdResource);
    } catch (error) {
        res.status(400).json({ message: 'Invalid resource data' });
    }
};

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Private/Admin
const updateResource = async (req, res) => {
    try {
        const { name, type, building, floor, capacity, facilities, description } = req.body;
        const resource = await Resource.findById(req.params.id);

        if (resource) {
            resource.name = name || resource.name;
            resource.type = type || resource.type;
            resource.building = building || resource.building;
            resource.floor = floor || resource.floor;
            resource.capacity = capacity || resource.capacity;
            resource.facilities = facilities || resource.facilities;
            resource.description = description || resource.description;

            const updatedResource = await resource.save();
            res.json(updatedResource);
        } else {
            res.status(404).json({ message: 'Resource not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (resource) {
            await resource.deleteOne();
            res.json({ message: 'Resource removed' });
        } else {
            res.status(404).json({ message: 'Resource not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource
};
