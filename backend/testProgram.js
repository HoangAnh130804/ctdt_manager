const { TrainingProgram, Course } = require('./models');

const testProgram = async () => {
    try {
        console.log('🔵 Testing program API...');
        
        // Test 1: Get all programs
        console.log('\n1. Testing getAllPrograms:');
        const programs = await TrainingProgram.findAll({
            limit: 2,
            include: [{
                model: Course,
                as: 'course'
            }]
        });
        
        console.log(`Found ${programs.length} programs`);
        
        if (programs.length > 0) {
            // Test 2: Get program by ID
            console.log('\n2. Testing getProgramById:');
            const programId = programs[0].id;
            console.log(`Testing with program ID: ${programId}`);
            
            const program = await TrainingProgram.findByPk(programId, {
                include: [{
                    model: Course,
                    as: 'course'
                }]
            });
            
            if (program) {
                console.log('✅ Success! Program found:');
                console.log(`   Code: ${program.program_code}`);
                console.log(`   Name: ${program.program_name}`);
                console.log(`   Course: ${program.course ? program.course.name : 'N/A'}`);
            } else {
                console.log('❌ Program not found');
            }
        }
        
        // Test 3: Check database columns
        console.log('\n3. Checking database structure:');
        const queryInterface = require('./config/database').getQueryInterface();
        const programTable = await queryInterface.describeTable('training_programs');
        const courseTable = await queryInterface.describeTable('courses');
        
        console.log('TrainingProgram columns:', Object.keys(programTable));
        console.log('Course columns:', Object.keys(courseTable));
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Error stack:', error.stack);
    }
};

testProgram();