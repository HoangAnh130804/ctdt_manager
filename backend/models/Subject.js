const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define('Subject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Mã môn học'
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: 'Tên môn học'
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        comment: 'Số tín chỉ'
    },
    subject_type: {
        type: DataTypes.ENUM('Bắt buộc', 'Tự chọn'),
        defaultValue: 'Bắt buộc',
        comment: 'Loại môn học'
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Thuộc ngành (có thể để trống)',
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        comment: 'Mô tả môn học'
    },
    curriculum_links: {
        type: DataTypes.TEXT,
        comment: 'Link tài liệu giáo trình (mỗi link trên 1 dòng)'
    },
    semester: {
        type: DataTypes.INTEGER,
        comment: 'Học kỳ (nếu có)',
        validate: {
            min: 1,
            max: 16
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'subjects',
    timestamps: true,
    comment: 'Bảng lưu thông tin môn học'
});

module.exports = Subject;