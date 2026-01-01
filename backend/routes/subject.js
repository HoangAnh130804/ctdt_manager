const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', subjectController.getAllSubjects);
router.get('/:id', subjectController.getSubjectById);
router.get('/export/excel', subjectController.exportSubjectsToExcel);
router.get('/course/:course_id', subjectController.getSubjectsByCourseId);
router.get('/course/:course_id/export/excel', subjectController.exportSubjectsByCourseToExcel);

// Protected routes
router.use(authMiddleware);
router.post('/', subjectController.createSubject);
router.put('/:id', subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);

module.exports = router;
