const { sequelize, User, Course, TrainingProgram,Subject } = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Sync database với force: true để xóa và tạo lại các bảng
        // Dùng { alter: true } thay vì { force: true } để giữ dữ liệu nếu có
        await sequelize.sync({ alter: true });
        console.log('✅ Database tables recreated');
        // Create users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const users = await User.bulkCreate([
            {
                username: 'admin',
                email: 'admin@university.edu.vn',
                password: hashedPassword,
                full_name: 'Nguyễn Văn Admin',
                role: 'admin',
                department: 'Phòng Đào tạo',
                phone: '0912345678'
            },
            {
                username: 'manager',
                email: 'manager@university.edu.vn',
                password: hashedPassword,
                full_name: 'Trần Thị Quản lý',
                role: 'manager',
                department: 'Khoa CNTT',
                phone: '0923456789'
            },
            {
                username: 'user1',
                email: 'user1@university.edu.vn',
                password: hashedPassword,
                full_name: 'Lê Văn Người dùng',
                role: 'user',
                department: 'Khoa Kinh tế',
                phone: '0934567890'
            }
        ]);
        
        console.log('✅ Created 3 users');
        
        // Create courses
const courses = await Course.bulkCreate([
    {
        code: 'CNTT',
        name: 'Công nghệ Thông tin',
        education_system: 'Đại học',
        admission_year: 2023,
        duration: 4,
        description: 'Ngành Công nghệ Thông tin hệ Đại học',
        total_credits: 130,
        department: 'Khoa CNTT'
    },
    {
        code: 'KT',
        name: 'Kế toán',
        education_system: 'Đại học',
        admission_year: 2023,
        duration: 4,
        description: 'Ngành Kế toán hệ Đại học',
        total_credits: 125,
        department: 'Khoa Kinh tế'
    },
    {
        code: 'QTKD',
        name: 'Quản trị Kinh doanh',
        education_system: 'Cao đẳng',
        admission_year: 2022,
        duration: 3,
        description: 'Ngành Quản trị Kinh doanh hệ Cao đẳng',
        total_credits: 110,
        department: 'Khoa Kinh tế'
    }
]);
        
        console.log('✅ Created 3 courses');
        
// Create training programs
const programs = await TrainingProgram.bulkCreate([
    {
        program_code: 'CTDT-CNTT-DH-2023',
        program_name: 'Chương trình đào tạo CNTT Đại học Khóa 2023',
        course_id: courses[0].id, // CNTT
        academic_year: '2023-2027',
        total_semesters: 8,
        total_credits: 130,
        description: 'Chương trình đào tạo Công nghệ Thông tin hệ Đại học',
        status: 'approved',
        is_active: true
    },
    {
        program_code: 'CTDT-KT-DH-2023',
        program_name: 'Chương trình đào tạo Kế toán Đại học Khóa 2023',
        course_id: courses[1].id, // KT
        academic_year: '2023-2027',
        total_semesters: 8,
        total_credits: 125,
        description: 'Chương trình đào tạo Kế toán hệ Đại học',
        status: 'pending',
        is_active: true
    },
    {
        program_code: 'CTDT-QTKD-CD-2022',
        program_name: 'Chương trình đào tạo QTKD Cao đẳng Khóa 2022',
        course_id: courses[2].id, // QTKD
        academic_year: '2022-2025',
        total_semesters: 6,
        total_credits: 110,
        description: 'Chương trình đào tạo Quản trị Kinh doanh hệ Cao đẳng',
        status: 'approved',
        is_active: true
    }
], { validate: true }); // Thêm validate: true để kiểm tra dữ liệu
        console.log('✅ Created 3 training programs');
        
    // Create subjects
const subjects = await Subject.bulkCreate([
    {
        code: 'CT101',
        name: 'Nhập môn Lập trình',
        credits: 3,
        subject_type: 'Bắt buộc',
        course_id: courses[0].id, // CNTT
        description: 'Môn học cơ bản về lập trình',
        curriculum_links: 'https://example.com/ct101-syllabus.pdf\nhttps://example.com/ct101-slides.zip',
        semester: 1
    },
    {
        code: 'CT102',
        name: 'Cấu trúc dữ liệu và Giải thuật',
        credits: 4,
        subject_type: 'Bắt buộc',
        course_id: courses[0].id, // CNTT
        description: 'Môn học về cấu trúc dữ liệu và thuật toán',
        curriculum_links: 'https://example.com/ct102-book.pdf',
        semester: 2
    },
    {
        code: 'KT201',
        name: 'Nguyên lý Kế toán',
        credits: 3,
        subject_type: 'Bắt buộc',
        course_id: courses[1].id, // KT
        description: 'Môn học cơ bản về kế toán',
        semester: 1
    },
    {
        code: 'TC001',
        name: 'Kỹ năng mềm',
        credits: 2,
        subject_type: 'Tự chọn',
        course_id: null, // Môn chung không thuộc ngành nào
        description: 'Môn học kỹ năng mềm cho tất cả sinh viên'
    }
]);

console.log('✅ Created 4 subjects');
        console.log('\n🎉 Database seeding completed!');
        console.log('\n🔑 Test accounts:');
        console.log('   👨‍💼 Admin: username=admin, password=admin123');
        console.log('   👩‍💼 Manager: username=manager, password=admin123');
        console.log('   👤 User: username=user1, password=admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        console.error('❌ Error stack:', error.stack);
        process.exit(1);
    }
};

seedDatabase();