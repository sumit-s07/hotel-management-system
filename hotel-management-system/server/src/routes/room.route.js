const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Room routes
router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoom);
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);
router.get('/:id/availability', roomController.checkAvailability);

module.exports = router;
