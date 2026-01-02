/**
 * server.js – Production-ready
 * Backend: Express + Sequelize
 * Deploy: Render
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const ExcelJS = require('exceljs');

const app = express();

/* ================= ENV ================= */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const BASE_URL =
    process.env.BASE_URL || `http://localhost:${PORT}`;

/* ================= MIDDLEWARE ================= */
app.use(cors({
    origin: NODE_ENV === 'production'
        ? [
            'https://hoanganh130804.github.io'
        ]
        : '*',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= DATABASE ================= */
require('./models'); // sync sequelize

/* ================= ROUTES ================= */
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/course');
const programRoutes = require('./routes/program');
const subjectRoutes = require('./routes/subject');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/subjects', subjectRoutes);

/* ================= HEALTH ================= */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        env: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

/* ================= DEV ONLY ================= */
if (NODE_ENV === 'development') {

    // Test route
    app.get('/test', (req, res) => {
        res.json({
            message: 'Server is working!',
            timestamp: new Date().toISOString()
        });
    });

    // Serve frontend locally
    app.use(express.static(path.join(__dirname, '../frontend')));
    app.get('*', (req, res) => {
        res.sendFile(
            path.join(__dirname, '../frontend/index.html')
        );
    });
}

/* ================= TEST EXCEL ================= */
app.get('/api/test/excel', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Test');

        sheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Name', key: 'name', width: 30 }
        ];

        sheet.addRow({ id: 1, name: 'Test Program 1' });
        sheet.addRow({ id: 2, name: 'Test Program 2' });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=test.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Excel error:', err);
        res.status(500).json({
            success: false,
            message: 'Error creating Excel'
        });
    }
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
    console.error('Server error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(NODE_ENV === 'development' && { stack: err.stack })
    });
});

/* ================= START ================= */
app.listen(PORT, () => {
    console.log(`
========================================
🚀 UNIVERSITY MANAGEMENT SYSTEM
========================================
🌍 Environment: ${NODE_ENV}
🌐 Base URL:    ${BASE_URL}
📊 Health:      ${BASE_URL}/api/health
========================================
    `);
    console.log('📦 ExcelJS version:', ExcelJS.version);
});
