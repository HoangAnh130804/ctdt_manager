const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrainingProgram = sequelize.define('TrainingProgram', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    program_code: {
        type: DataTypes.STRING(50), // Tăng độ dài từ 20 lên 50
        allowNull: false,
        unique: true
    },
    program_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    academic_year: {
        type: DataTypes.STRING(9),
        allowNull: false
    },
    total_semesters: {
        type: DataTypes.INTEGER,
        defaultValue: 8
    },
    total_credits: {
        type: DataTypes.INTEGER,
        defaultValue: 120
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('draft', 'pending', 'approved', 'inactive'),
        defaultValue: 'draft'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'training_programs',
    timestamps: true,
    indexes: [
        {
            fields: ['course_id']
        },
        {
            fields: ['program_code']
        }
    ]
});

module.exports = TrainingProgram;