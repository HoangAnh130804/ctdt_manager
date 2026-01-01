const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Course = require('./Course');
const TrainingProgram = require('./TrainingProgram');
const Subject = require('./Subject');

// Define relationships
Course.hasMany(TrainingProgram, {
    foreignKey: 'course_id',
    as: 'programs'
});

TrainingProgram.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
});
Course.hasMany(Subject, {
    foreignKey: 'course_id',
    as: 'subjects'
});
Subject.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
});
// Test database connection và sync
const initDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');
        
        // Sync database (alter: true để cập nhật schema)
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced successfully');
    } catch (error) {
        console.error('❌ Database error:', error);
    }
};

initDatabase();

module.exports = {
    sequelize,
    User,
    Course,
    TrainingProgram,
    Subject
};
