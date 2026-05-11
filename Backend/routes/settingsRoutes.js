const express = require('express');
const router = express.Router();
const { getSystemSettings, updateSystemSettings } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/system')
    .get(getSystemSettings)
    .post(protect, admin, updateSystemSettings);

module.exports = router;
