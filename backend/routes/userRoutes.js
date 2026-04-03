const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
    getProfile,
    updateBio,
    addCareer,
    updateCareer,
    deleteCareer,
    addEducation,
    updateEducation,
    deleteEducation
} = require('../controllers/userController');

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile/bio', authenticateToken, updateBio);

router.post('/career', authenticateToken, addCareer);
router.put('/career/:id', authenticateToken, updateCareer);
router.delete('/career/:id', authenticateToken, deleteCareer);

router.post('/education', authenticateToken, addEducation);
router.put('/education/:id', authenticateToken, updateEducation);
router.delete('/education/:id', authenticateToken, deleteEducation);

module.exports = router;