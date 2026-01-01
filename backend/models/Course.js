const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Mã ngành (chỉ cho ngành học)'
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: 'Tên đầy đủ của ngành'
    },
    education_system: {
        type: DataTypes.ENUM('Đại học', 'Cao đẳng', 'Chất lượng cao', 'Liên thông', 'Vừa học vừa làm'),
        defaultValue: 'Đại học',
        comment: 'Hệ đào tạo'
    },
    admission_year: {
        type: DataTypes.INTEGER,
        defaultValue: new Date().getFullYear(),
        comment: 'Khóa tuyển sinh (năm)'
    },
    duration: {
        type: DataTypes.INTEGER,
        defaultValue: 4,
        comment: 'Thời gian đào tạo (năm)'
    },
    description: {
        type: DataTypes.TEXT,
        comment: 'Mô tả chi tiết'
    },
    total_credits: {
        type: DataTypes.INTEGER,
        defaultValue: 120
    },
    department: {
        type: DataTypes.STRING(100),
        comment: 'Khoa/Phòng quản lý'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'courses',
    timestamps: true,
    comment: 'Bảng lưu thông tin ngành học (kết hợp Hệ và Khóa)'
});
// Thêm dòng này để chắc chắn model được export
module.exports = Course;