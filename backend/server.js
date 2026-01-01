const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import models to sync database
require('./models');

// Test route - kiểm tra server hoạt động
app.get('/test', (req, res) => {
    res.json({
        message: 'Server is working!',
        timestamp: new Date().toISOString()
    });
});

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/course');
const programRoutes = require('./routes/program');
const subjectRoutes = require('./routes/subject');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/subjects', subjectRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
// Test Excel export
app.get('/api/test/excel', (req, res) => {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test');
    
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 30 }
    ];
    
    worksheet.addRow({ id: 1, name: 'Test Program 1' });
    worksheet.addRow({ id: 2, name: 'Test Program 2' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=test.xlsx');
    
    workbook.xlsx.write(res)
        .then(() => {
            res.end();
            console.log('✅ Test Excel sent');
        })
        .catch(error => {
            console.error('❌ Test Excel error:', error);
            res.status(500).send('Error creating Excel');
        });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    ========================================
    🚀 UNIVERSITY MANAGEMENT SYSTEM
    ========================================
    🌐 Frontend: http://localhost:${PORT}
    🔧 API Test: http://localhost:${PORT}/test
    📊 Health: http://localhost:${PORT}/api/health
    
    🔑 Test Accounts:
       👨‍💼 Admin:     admin / admin123
       👩‍💼 Manager:   manager / admin123  
       👤 User:       user1 / admin123
    ========================================
    `);
});
const ExcelJS = require('exceljs');
console.log('ExcelJS version:', ExcelJS.version);