const { TrainingProgram, Course } = require('./models');
const ExcelJS = require('exceljs');

const debugExcel = async () => {
    try {
        console.log('🔵 Debugging Excel export...');
        
        // 1. Kiểm tra dữ liệu
        console.log('\n1. Checking data...');
        const programs = await TrainingProgram.findAll({
            include: [{
                model: Course,
                as: 'course'
            }],
            limit: 5
        });
        
        console.log(`Found ${programs.length} programs`);
        
        programs.forEach((program, index) => {
            console.log(`${index + 1}. ${program.program_code} - ${program.program_name}`);
            console.log(`   Course: ${program.course ? program.course.name : 'N/A'}`);
            console.log(`   Status: ${program.status}`);
        });
        
        // 2. Kiểm tra ExcelJS
        console.log('\n2. Testing ExcelJS...');
        console.log('ExcelJS version:', ExcelJS.version);
        
        // 3. Tạo test workbook
        console.log('\n3. Creating test workbook...');
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'University System';
        workbook.created = new Date();
        
        const worksheet = workbook.addWorksheet('Test Sheet');
        
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Program Code', key: 'code', width: 20 },
            { header: 'Program Name', key: 'name', width: 40 }
        ];
        
        programs.forEach((program, index) => {
            worksheet.addRow({
                id: program.id,
                code: program.program_code,
                name: program.program_name
            });
        });
        
        // 4. Save to file
        console.log('\n4. Saving test file...');
        const filename = 'debug-test.xlsx';
        await workbook.xlsx.writeFile(filename);
        
        console.log(`✅ Test file saved: ${filename}`);
        console.log(`📊 Worksheet: ${worksheet.name}`);
        console.log(`📈 Rows: ${worksheet.rowCount}`);
        
        // 5. Check file size
        const fs = require('fs');
        const stats = fs.statSync(filename);
        console.log(`📦 File size: ${stats.size} bytes`);
        
        if (stats.size > 0) {
            console.log('✅ Excel file created successfully');
        } else {
            console.log('❌ Excel file is empty');
        }
        
    } catch (error) {
        console.error('❌ Debug error:', error);
        console.error('Error stack:', error.stack);
    }
};

debugExcel();