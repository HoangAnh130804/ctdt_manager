const { Subject, Course } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');

// Get all subjects with search and filter
exports.getAllSubjects = async (req, res) => {
    try {
        const { search, subject_type, course_id, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        // Build where conditions
        const where = { is_active: true };
        if (search) {
            where[Op.or] = [
                { code: { [Op.like]: `%${search}%` } },
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }
        if (subject_type) where.subject_type = subject_type;
        if (course_id) where.course_id = course_id;

        const { count, rows: subjects } = await Subject.findAndCountAll({
            where,
            include: [{
                model: Course,
                as: 'course',
                attributes: ['id', 'code', 'name', 'education_system', 'admission_year']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['course_id', 'ASC'], ['code', 'ASC']]
        });

        res.json({
            success: true,
            data: subjects,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách môn học'
        });
    }
};

// Get subject by ID
exports.getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;

        const subject = await Subject.findByPk(id, {
            include: [{
                model: Course,
                as: 'course',
                attributes: ['id', 'code', 'name', 'education_system', 'admission_year']
            }]
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy môn học'
            });
        }

        res.json({
            success: true,
            data: subject
        });

    } catch (error) {
        console.error('Get subject by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin môn học'
        });
    }
};

// Create subject
exports.createSubject = async (req, res) => {
    try {
        const {
            code,
            name,
            credits,
            subject_type,
            course_id,
            description,
            curriculum_links,
            semester
        } = req.body;

        if (!code || !name || !credits) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập mã môn, tên môn và số tín chỉ'
            });
        }

        const existingSubject = await Subject.findOne({ where: { code } });
        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: 'Mã môn học đã tồn tại'
            });
        }

        // Nếu có course_id, kiểm tra ngành tồn tại
        if (course_id) {
            const course = await Course.findByPk(course_id);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy ngành học'
                });
            }
        }

        const subject = await Subject.create({
            code,
            name,
            credits: parseInt(credits) || 3,
            subject_type: subject_type || 'Bắt buộc',
            course_id: course_id || null,
            description,
            curriculum_links,
            semester: semester ? parseInt(semester) : null,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'Tạo môn học thành công',
            data: subject
        });

    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo môn học'
        });
    }
};

// Update subject
exports.updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const subject = await Subject.findByPk(id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy môn học'
            });
        }

        // Check if updating code and code exists
        if (updateData.code && updateData.code !== subject.code) {
            const existingSubject = await Subject.findOne({
                where: { code: updateData.code }
            });
            if (existingSubject) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã môn học đã tồn tại'
                });
            }
        }

        // Nếu có course_id, kiểm tra ngành tồn tại
        if (updateData.course_id) {
            const course = await Course.findByPk(updateData.course_id);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy ngành học'
                });
            }
        }

        await subject.update(updateData);

        res.json({
            success: true,
            message: 'Cập nhật thành công',
            data: subject
        });

    } catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật môn học'
        });
    }
};

// Delete subject (soft delete)
exports.deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;

        const subject = await Subject.findByPk(id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy môn học'
            });
        }

        // Soft delete
        await subject.update({ is_active: false });

        res.json({
            success: true,
            message: 'Xóa thành công'
        });

    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa môn học'
        });
    }
};

// Get subjects by course ID
exports.getSubjectsByCourseId = async (req, res) => {
    try {
        const { course_id } = req.params;

        const subjects = await Subject.findAll({
            where: {
                course_id: course_id,
                is_active: true
            },
            order: [['semester', 'ASC'], ['code', 'ASC']],
            include: [{
                model: Course,
                as: 'course',
                attributes: ['id', 'code', 'name']
            }]
        });

        res.json({
            success: true,
            data: subjects,
            count: subjects.length
        });

    } catch (error) {
        console.error('Get subjects by course error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách môn học theo ngành'
        });
    }
};

// Export subjects to Excel
exports.exportSubjectsToExcel = async (req, res) => {
    try {
        const subjects = await Subject.findAll({
            where: { is_active: true },
            include: [{
                model: Course,
                as: 'course',
                attributes: ['code', 'name']
            }],
            order: [['course_id', 'ASC'], ['code', 'ASC']]
        });

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh sach mon hoc');

        // Define columns
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 8 },
            { header: 'MÃ MÔN', key: 'code', width: 15 },
            { header: 'TÊN MÔN', key: 'name', width: 40 },
            { header: 'SỐ TÍN CHỈ', key: 'credits', width: 12 },
            { header: 'LOẠI MÔN', key: 'type', width: 15 },
            { header: 'MÃ NGÀNH', key: 'course_code', width: 15 },
            { header: 'TÊN NGÀNH', key: 'course_name', width: 30 },
            { header: 'HỌC KỲ', key: 'semester', width: 10 },
            { header: 'MÔ TẢ', key: 'description', width: 40 },
            { header: 'TÀI LIỆU', key: 'links', width: 50 }
        ];

        // Add data
        subjects.forEach((subject, index) => {
            worksheet.addRow({
                stt: index + 1,
                code: subject.code,
                name: subject.name,
                credits: subject.credits,
                type: subject.subject_type,
                course_code: subject.course?.code || 'Không xác định',
                course_name: subject.course?.name || '',
                semester: subject.semester || '',
                description: subject.description || '',
                links: subject.curriculum_links ? subject.curriculum_links.replace(/\n/g, ', ') : ''
            });
        });

        // Style header
        worksheet.getRow(1).font = { bold: true, size: 12 };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Set response headers for Excel download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=danh-sach-mon-hoc.xlsx');

        // Send file
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Export subjects Excel error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xuất Excel'
        });
    }
};
// Export subjects by course to Excel
exports.exportSubjectsByCourseToExcel = async (req, res) => {
    try {
        const { course_id } = req.params;

        console.log('🔵 [EXPORT SUBJECTS BY COURSE] Course ID:', course_id);

        // Tìm ngành học để lấy thông tin
        const course = await Course.findByPk(course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy ngành học'
            });
        }

        const subjects = await Subject.findAll({
            where: {
                course_id: course_id,
                is_active: true
            },
            order: [['semester', 'ASC'], ['code', 'ASC']]
        });

        console.log(`🔵 [EXPORT SUBJECTS BY COURSE] Found ${subjects.length} subjects for course ${course.code}`);

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'University Management System';
        workbook.created = new Date();

        // Tạo worksheet với tên ngành
        const worksheet = workbook.addWorksheet(`Mon hoc - ${course.code}`, {
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        // Define columns
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 8 },
            { header: 'MÃ MÔN', key: 'code', width: 15 },
            { header: 'TÊN MÔN', key: 'name', width: 40 },
            { header: 'SỐ TÍN CHỈ', key: 'credits', width: 12 },
            { header: 'LOẠI MÔN', key: 'type', width: 15 },
            { header: 'HỌC KỲ', key: 'semester', width: 10 },
            { header: 'MÔ TẢ', key: 'description', width: 40 },
            { header: 'TÀI LIỆU', key: 'links', width: 50 }
        ];

        // Add header row với thông tin ngành
        worksheet.addRow([`Ngành: ${course.code} - ${course.name}`]);
        worksheet.addRow([`Hệ: ${course.education_system}, Khóa: ${course.admission_year}`]);
        worksheet.addRow([]); // Empty row

        // Start data from row 4
        let currentRow = 4;

        // Add column headers
        const headerRow = worksheet.getRow(currentRow);
        headerRow.values = ['STT', 'MÃ MÔN', 'TÊN MÔN', 'SỐ TÍN CHỈ', 'LOẠI MÔN', 'HỌC KỲ', 'MÔ TẢ', 'TÀI LIỆU'];

        // Add data
        subjects.forEach((subject, index) => {
            const row = worksheet.addRow({
                stt: index + 1,
                code: subject.code,
                name: subject.name,
                credits: subject.credits,
                type: subject.subject_type,
                semester: subject.semester || '',
                description: subject.description || '',
                links: subject.curriculum_links ? subject.curriculum_links.replace(/\n/g, ', ') : ''
            });
        });

        // Merge header rows
        worksheet.mergeCells('A1:H1');
        worksheet.mergeCells('A2:H2');

        // Style header
        const titleRow1 = worksheet.getRow(1);
        titleRow1.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
        titleRow1.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4472C4' }
        };
        titleRow1.alignment = { horizontal: 'center', vertical: 'middle' };
        titleRow1.height = 30;

        const titleRow2 = worksheet.getRow(2);
        titleRow2.font = { bold: true, size: 12 };
        titleRow2.alignment = { horizontal: 'center' };

        // Style column headers
        const headerRowStyle = worksheet.getRow(currentRow);
        headerRowStyle.font = { bold: true, size: 11, color: { argb: 'FFFFFF' } };
        headerRowStyle.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '5B9BD5' }
        };
        headerRowStyle.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRowStyle.height = 25;

        // Style data rows
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > currentRow) {
                row.alignment = { vertical: 'middle' };
                // Zebra striping
                if (rowNumber % 2 === 0) {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'F2F2F2' }
                    };
                }
            }
        });

        // Auto fit columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const cellLength = cell.value ? cell.value.toString().length : 0;
                if (cellLength > maxLength) {
                    maxLength = cellLength;
                }
            });
            column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="danh-sach-mon-hoc-${course.code}.xlsx"`);

        // Send file
        await workbook.xlsx.write(res);

        console.log(`✅ [EXPORT SUBJECTS BY COURSE] Excel exported successfully for course ${course.code}`);

    } catch (error) {
        console.error('❌ [EXPORT SUBJECTS BY COURSE] Error:', error);
        console.error('Error stack:', error.stack);

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xuất Excel danh sách môn học',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};