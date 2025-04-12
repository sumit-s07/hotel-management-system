const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

// Dashboard statistics
router.get('/stats', 
    auth, 
    authorize('staff', 'manager', 'admin'), 
    dashboardController.getDashboardStats
);

module.exports = router;
