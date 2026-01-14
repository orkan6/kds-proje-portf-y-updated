
const { pool } = require('./db/connection');
const AnalysisService = require('./services/AnalysisService');

async function verify() {
    try {
        const service = new AnalysisService(pool);
        // Portfolio 47
        const result = await service.getPerformanceComparison(47);

        const lastDate = result.dates[result.dates.length - 1];
        console.log('Total Data Points:', result.dates.length);
        console.log('Start Date:', result.dates[0]);
        console.log('End Date:', lastDate);

        const end = new Date(lastDate);
        const hardCap = new Date('2024-06-30');

        if (end > hardCap) {
            console.error('FAIL: End date is after June 2024!');
            process.exit(1);
        } else {
            console.log('PASS: Date is within limit.');
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

verify();
