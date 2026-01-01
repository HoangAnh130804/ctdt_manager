const { TrainingProgram, Course } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');

// Get all programs with search and filter
exports.getAllPrograms = async (req, res) => {
    try {
        const { search, status, course_id, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        console.log('🔵 [GET PROGRAMS] Params:', { search, status, course_id, page, limit });

        // Build where conditions
        const where = { is_active: true };
        if (search) {
            where[Op.or] = [
                { program_code: { [Op.like]: `%${search}%` } },
                { program_name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }
        if (status) where.status = status;
        if (course_id) where.course_id = course_id;
        console.log('🔵 [GET PROGRAMS] Where clause:', where);

        const { count, rows: programs } = await TrainingProgram.findAndCountAll({
            where,
            include: [{
                model: Course,
                as: 'course',
                attributes: ['id', 'code', 'name', 'education_system', 'admission_year', 'duration']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });
        console.log(`🔵 [GET PROGRAMS] Found ${count} programs`);

        res.json({
            success: true,
            data: programs,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Get programs error:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách chương trình đào tạo',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get program by ID
exports.getProgramById = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('🔵 [GET PROGRAM BY ID] ID:', id);

        const program = await TrainingProgram.findByPk(id, {
            include: [{
                model: Course,
                as: 'course',
                attributes: ['id', 'code', 'name', 'education_system', 'admission_year', 'duration', 'total_credits', 'department']
            }]
        });

        console.log('🔵 [GET PROGRAM BY ID] Found program:', program ? 'Yes' : 'No');

        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chương trình đào tạo'
            });
        }

        res.json({
            success: true,
            data: program
        });

    } catch (error) {
        console.error('❌ Get program by ID error:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin chương trình đào tạo',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create program
exports.createProgram = async (req, res) => {
    try {
        const {
            program_code,
            program_name,
            course_id,
            academic_year,
            total_semesters,
            total_credits,
            description,
            status
        } = req.body;

        if (!program_code || !program_name || !course_id || !academic_year) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
            });
        }

        const existingProgram = await TrainingProgram.findOne({
            where: { program_code }
        });

        if (existingProgram) {
            return res.status(400).json({
                success: false,
                message: 'Mã chương trình đào tạo đã tồn tại'
            });
        }

        // Check if course exists
        const course = await Course.findByPk(course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy ngành học'
            });
        }

        const program = await TrainingProgram.create({
            program_code,
            program_name,
            course_id,
            academic_year,
            total_semesters: total_semesters || 8,
            total_credits: total_credits || 120,
            description,
            status: status || 'draft',
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'Tạo chương trình đào tạo thành công',
            data: program
        });

    } catch (error) {
        console.error('Create program error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo chương trình đào tạo'
        });
    }
};

// Update program
exports.updateProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const program = await TrainingProgram.findByPk(id);
        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chương trình đào tạo'
            });
        }

        // Check if updating program code
        if (updateData.program_code && updateData.program_code !== program.program_code) {
            const existingProgram = await TrainingProgram.findOne({
                where: { program_code: updateData.program_code }
            });
            if (existingProgram) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã chương trình đào tạo đã tồn tại'
                });
            }
        }

        await program.update(updateData);

        res.json({
            success: true,
            message: 'Cập nhật thành công',
            data: program
        });

    } catch (error) {
        console.error('Update program error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật chương trình đào tạo'
        });
    }
};

// Delete program (soft delete)
exports.deleteProgram = async (req, res) => {
    try {
        const { id } = req.params;

        const program = await TrainingProgram.findByPk(id);
        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chương trình đào tạo'
            });
        }

        // Soft delete
        await program.update({ is_active: false });

        res.json({
            success: true,
            message: 'Xóa thành công'
        });

    } catch (error) {
        console.error('Delete program error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa chương trình đào tạo'
        });
    }
};

// Export programs to Excel - FIXED VERSION
exports.exportProgramsToExcel = async (req, res) => {
    let workbook;
    try {
        console.log('🔵 [EXPORT PROGRAMS] Bắt đầu xuất Excel CTĐT...');

        // 1. Lấy dữ liệu
        const programs = await TrainingProgram.findAll({
            where: { is_active: true },
            include: [{
                model: Course,
                as: 'course',
                required: false // LEFT JOIN để không bị mất dữ liệu
            }],
            order: [['academic_year', 'DESC'], ['program_code', 'ASC']],
            raw: false // Giữ nguyên instance
        });

        console.log(`🔵 [EXPORT PROGRAMS] Lấy được ${programs.length} CTĐT`);

        if (programs.length === 0) {
            console.log('⚠️ [EXPORT PROGRAMS] Không có dữ liệu để xuất');
            return res.status(404).json({
                success: false,
                message: 'Không có dữ liệu để xuất Excel'
            });
        }

        // 2. Tạo workbook với metadata
        workbook = new ExcelJS.Workbook();
        workbook.creator = 'University Management System';
        workbook.created = new Date();
        workbook.modified = new Date();
        workbook.lastPrinted = new Date();

        // 3. Tạo worksheet với tên đơn giản
        const worksheet = workbook.addWorksheet('CTDT', {
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        // 4. Định nghĩa cột
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 8, style: { font: { bold: true } } },
            { header: 'MÃ CTĐT', key: 'program_code', width: 25 },
            { header: 'TÊN CTĐT', key: 'program_name', width: 50 },
            { header: 'MÃ NGÀNH', key: 'course_code', width: 15 },
            { header: 'TÊN NGÀNH', key: 'course_name', width: 30 },
            { header: 'HỆ ĐÀO TẠO', key: 'education_system', width: 15 },
            { header: 'KHÓA', key: 'admission_year', width: 10 },
            { header: 'NĂM HỌC', key: 'academic_year', width: 15 },
            { header: 'SỐ HỌC KỲ', key: 'semesters', width: 12 },
            { header: 'SỐ TÍN CHỈ', key: 'credits', width: 15 },
            { header: 'TRẠNG THÁI', key: 'status', width: 15 },
            { header: 'NGÀY TẠO', key: 'created_at', width: 15 }
        ];

        // 5. Thêm dữ liệu
        programs.forEach((program, index) => {
            const statusText = {
                'draft': 'Nháp',
                'pending': 'Chờ duyệt',
                'approved': 'Đã duyệt',
                'inactive': 'Ngừng hoạt động'
            }[program.status] || program.status;

            // Format ngày tạo
            const createdDate = program.created_at
                ? new Date(program.created_at).toLocaleDateString('vi-VN')
                : '';

            worksheet.addRow({
                stt: index + 1,
                program_code: program.program_code || '',
                program_name: program.program_name || '',
                course_code: program.course?.code || 'N/A',
                course_name: program.course?.name || 'N/A',
                education_system: program.course?.education_system || 'N/A',
                admission_year: program.course?.admission_year || 'N/A',
                academic_year: program.academic_year || '',
                semesters: program.total_semesters || 0,
                credits: program.total_credits || 0,
                status: statusText,
                created_at: createdDate
            });
        });

        // 6. Style header
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 12 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4472C4' } // Màu xanh đậm
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;

        // 7. Style dữ liệu
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.alignment = { vertical: 'middle', horizontal: 'left' };
                // Zebra stripe
                if (rowNumber % 2 === 0) {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'F2F2F2' } // Màu xám nhẹ
                    };
                }
            }
        });

        // 8. Auto-fit columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const cellLength = cell.value ? cell.value.toString().length : 0;
                if (cellLength > maxLength) {
                    maxLength = cellLength;
                }
            });
            column.width = Math.min(Math.max(maxLength + 2, 10), 60);
        });

        // 9. Đặt header response TRƯỚC KHI write
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="danh-sach-chuong-trinh-dao-tao.xlsx"');
        res.setHeader('Content-Transfer-Encoding', 'binary');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        console.log('✅ [EXPORT PROGRAMS] Headers đã được set, bắt đầu ghi file...');

        // 10. Ghi file vào response
        await workbook.xlsx.write(res);

        console.log('✅ [EXPORT PROGRAMS] Đã ghi xong, kết thúc response');

        // KHÔNG gọi res.end() vì write() đã tự động xử lý

    } catch (error) {
        console.error('❌ [EXPORT PROGRAMS] Lỗi xuất Excel:', error);
        console.error('❌ Error stack:', error.stack);

        // Chỉ gửi error response nếu chưa gửi headers
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xuất Excel: ' + error.message
            });
        } else {
            console.error('⚠️ [EXPORT PROGRAMS] Headers đã được gửi, không thể gửi error response');
            // Có thể ghi log thêm vào file nếu cần
            if (workbook) {
                const errorWorksheet = workbook.addWorksheet('Error Log');
                errorWorksheet.addRow(['Lỗi xuất Excel:', error.message]);
                errorWorksheet.addRow(['Thời gian:', new Date().toISOString()]);
            }
        }
    }
};
// Simple test export for debugging
exports.exportProgramsTest = async (req, res) => {
    try {
        console.log('🔵 [EXPORT TEST] Testing Excel export...');

        // Tạo workbook đơn giản
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Test Data');

        // Thêm vài dòng test
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Date', key: 'date', width: 20 }
        ];

        worksheet.addRow({ id: 1, name: 'Test Program 1', date: new Date().toLocaleDateString() });
        worksheet.addRow({ id: 2, name: 'Test Program 2', date: new Date().toLocaleDateString() });
        worksheet.addRow({ id: 3, name: 'Test Program 3', date: new Date().toLocaleDateString() });

        // Set headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="test-export.xlsx"');

        // Write to response
        await workbook.xlsx.write(res);

        console.log('✅ [EXPORT TEST] Test export successful');

    } catch (error) {
        console.error('❌ [EXPORT TEST] Error:', error);
        res.status(500).send('Test export failed: ' + error.message);
    }
};