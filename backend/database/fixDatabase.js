const { sequelize, Course, TrainingProgram, Subject } = require('../models');
const fs = require('fs');
const path = require('path');

const fixDatabase = async () => {
    try {
        console.log('🔧 Fixing database issues...');
        
        // 1. Drop và tạo lại database nếu cần
        console.log('1. Syncing database...');
        await sequelize.sync({ force: false, alter: true });
        
        // 2. Kiểm tra và sửa cột education_system
        console.log('2. Checking Course table...');
        const queryInterface = sequelize.getQueryInterface();
        
        try {
            const tableInfo = await queryInterface.describeTable('courses');
            console.log('Course table columns:', Object.keys(tableInfo));
            
            // Nếu còn cột type, đổi tên thành education_system
            if (tableInfo.type && !tableInfo.education_system) {
                console.log('Renaming type column to education_system...');
                await queryInterface.renameColumn('courses', 'type', 'education_system');
            }
            
            // Thêm admission_year nếu chưa có
            if (!tableInfo.admission_year) {
                console.log('Adding admission_year column...');
                await queryInterface.addColumn('courses', 'admission_year', {
                    type: 'INTEGER',
                    defaultValue: new Date().getFullYear()
                });
            }
            
        } catch (error) {
            console.log('Table might not exist yet, will be created by sync');
        }
        
        // 3. Kiểm tra subjects table
        console.log('3. Checking Subject table...');
        try {
            const subjectTable = await queryInterface.describeTable('subjects');
            console.log('Subject table exists with columns:', Object.keys(subjectTable));
        } catch (error) {
            console.log('Subject table does not exist, will be created');
        }
        
        console.log('✅ Database fix completed!');
        console.log('\n👉 Now run: npm run seed');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Fix database error:', error);
        console.error('Error stack:', error.stack);
        process.exit(1);
    }
};

fixDatabase();
