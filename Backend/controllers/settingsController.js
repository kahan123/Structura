const SystemSetting = require('../models/SystemSetting');

// @desc    Get all system settings
// @route   GET /api/settings/system
// @access  Public or Private
const getSystemSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.find();
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        // Default settings if empty
        if (Object.keys(settingsObj).length === 0) {
            return res.json({
                maintenanceMode: false,
                allowNewBookings: true,
                autoApproveStudents: false,
                maxBookingDuration: 4
            });
        }
        res.json(settingsObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update system settings
// @route   POST /api/settings/system
// @access  Private/Admin
const updateSystemSettings = async (req, res) => {
    try {
        const updates = req.body; // e.g., { maintenanceMode: true, allowNewBookings: false }

        for (const [key, value] of Object.entries(updates)) {
            await SystemSetting.findOneAndUpdate(
                { key },
                { value },
                { upsert: true, new: true }
            );
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSystemSettings,
    updateSystemSettings
};
