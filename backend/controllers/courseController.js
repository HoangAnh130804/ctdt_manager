const { Course } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');

// Get all courses with search and filter
exports.getAllCourses = async (req, res) => {
    try {
        const { search, type, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        console.log('🔵 [GET COURSES] Search params:', { search, type });

        // Build where conditions
        const where = { is_active: true };
        if (search) {
            where[Op.or] = [
                { code: { [Op.like]: `%${search}%` } },
                { name: { [Op.like]: `%${search}%` } },
                { department: { [Op.like]: `%${search}%` } }
            ];
        }
        if (type) where.education_system = type; // Sửa từ type thành education_system

        const { count, rows: courses } = await Course.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['admission_year', 'DESC'], ['code', 'ASC']] // Sắp xếp theo khóa mới nhất
        });
        console.log(`🔵 [GET COURSES] Found ${count} courses`);

        res.json({
            success: true,
            data: courses,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách ngành học'
        });
    }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khóa học'
            });
        }

        res.json({
            success: true,
            data: course
        });

    } catch (error) {
        console.error('Get course by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin khóa học'
        });
    }
};

// Create course
// Create course
exports.createCourse = async (req, res) => {
    try {
        const { code, name, education_system, admission_year, duration, description, total_credits, department } = req.body;

        if (!code || !name || !education_system || !admission_year) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập mã ngành, tên, hệ và khóa tuyển sinh'
            });
        }

        // Validate admission_year (phải là năm hợp lệ)
        const currentYear = new Date().getFullYear();
        if (admission_year < 2000 || admission_year > currentYear + 1) {
            return res.status(400).json({
                success: false,
                message: 'Khóa tuyển sinh không hợp lệ'
            });
        }

        const existingCourse = await Course.findOne({ where: { code } });
        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: 'Mã ngành đã tồn tại'
            });
        }

        const course = await Course.create({
            code,
            name,
            education_system,
            admission_year,
            duration: duration || 4,
            description,
            total_credits: total_credits || 120,
            department,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'Tạo mới ngành học thành công',
            data: course
        });

    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo ngành học'
        });
    }
};
// Update course
exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khóa học'
            });
        }

        // Check if updating code and code exists
        if (updateData.code && updateData.code !== course.code) {
            const existingCourse = await Course.findOne({
                where: { code: updateData.code }
            });
            if (existingCourse) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã khóa học đã tồn tại'
                });
            }
        }

        await course.update(updateData);

        res.json({
            success: true,
            message: 'Cập nhật thành công',
            data: course
        });

    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật khóa học'
        });
    }
};

// Delete course (soft delete)
exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khóa học'
            });
        }

        // Soft delete
        await course.update({ is_active: false });

        res.json({
            success: true,
            message: 'Xóa thành công'
        });

    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa khóa học'
        });
    }
};

// Export courses to Excel
exports.exportCoursesToExcel = async (req, res) => {
    try {
        console.log('🔵 [EXPORT] Bắt đầu xuất Excel cho ngành học...');

        const courses = await Course.findAll({
            where: { is_active: true },
            order: [['admission_year', 'DESC'], ['code', 'ASC']]
        });

        console.log(`🔵 [EXPORT] Lấy được ${courses.length} ngành học`);

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh sach Nganh hoc');

        // Define columns
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 8 },
            { header: 'MÃ NGÀNH', key: 'code', width: 15 },
            { header: 'TÊN NGÀNH', key: 'name', width: 40 },
            { header: 'HỆ ĐÀO TẠO', key: 'education_system', width: 15 },
            { header: 'KHÓA', key: 'admission_year', width: 12 },
            { header: 'THỜI GIAN (năm)', key: 'duration', width: 15 },
            { header: 'SỐ TÍN CHỈ', key: 'credits', width: 15 },
            { header: 'KHOA/PHÒNG', key: 'department', width: 25 },
            { header: 'MÔ TẢ', key: 'description', width: 50 }
        ];

        // Add data
        courses.forEach((course, index) => {
            worksheet.addRow({
                stt: index + 1,
                code: course.code,
                name: course.name,
                education_system: course.education_system,
                admission_year: course.admission_year,
                duration: course.duration,
                credits: course.total_credits,
                department: course.department || '',
                description: course.description || ''
            });
        });

        // Style header
        worksheet.getRow(1).font = { bold: true, size: 12 };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Set response headers for Excel download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=danh-sach-nganh-hoc.xlsx');

        // Send file
        await workbook.xlsx.write(res);
        res.end();

        console.log('✅ [EXPORT] Xuất Excel thành công!');

    } catch (error) {
        console.error('❌ Export Excel error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xuất Excel'
        });
    }
};