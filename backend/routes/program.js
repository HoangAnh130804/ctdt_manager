const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', programController.getAllPrograms);
router.get('/:id', programController.getProgramById);
router.get('/export/excel', programController.exportProgramsToExcel);
router.get('/export/test', programController.exportProgramsTest); // Thêm route test

// Protected routes
router.use(authMiddleware);
router.post('/', programController.createProgram);
router.put('/:id', programController.updateProgram);
router.delete('/:id', programController.deleteProgram);

module.exports = router;