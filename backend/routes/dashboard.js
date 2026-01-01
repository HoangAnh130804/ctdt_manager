const express = require('express');
const router = express.Router();

// Giả sử bạn có model
const Course = require('../models/Course');
const Program = require('../models/Program');

router.get('/', async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments();
        const programs = await Program.find();

        const pending = programs.filter(p => p.status === 'pending').length;
        const approved = programs.filter(p => p.status === 'approved').length;

        res.json({
            success: true,
            data: {
                courses: totalCourses,
                programs: programs.length,
                pendingPrograms: pending,
                approvedPrograms: approved
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi dashboard'
        });
    }
});

module.exports = router;
