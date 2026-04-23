const db = require('../config/database');

// Get user's notifications
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 100
        `;

        const [notifications] = await db.query(query, [userId]);
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await db.query('UPDATE notifications SET `read` = 1 WHERE id = ? AND user_id = ?', [id, userId]);
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Error marking notification as read' });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await db.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [id, userId]);
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Error deleting notification' });
    }
};

// Create notification (internal use)
exports.createNotification = async (userId, type, title, message) => {
    try {
        const query = `
            INSERT INTO notifications (user_id, type, title, message, \`read\`)
            VALUES (?, ?, ?, ?, 0)
        `;
        await db.query(query, [userId, type, title, message]);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = 'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND `read` = 0';
        
        const [results] = await db.query(query, [userId]);
        res.json(results[0]);
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: 'Error fetching unread count' });
    }
};
