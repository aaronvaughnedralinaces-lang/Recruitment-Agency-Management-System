const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');
const router = express.Router();

// Get user's notifications
router.get('/', authenticateToken, notificationController.getNotifications);

// Get unread count
router.get('/unread/count', authenticateToken, notificationController.getUnreadCount);

// Mark notification as read
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);

// Delete notification
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

module.exports = router;
