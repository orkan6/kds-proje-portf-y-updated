
const { pool } = require('./db/connection');
const AnalysisService = require('./services/AnalysisService');

async function dump() {
    try {
        const service = new AnalysisService(pool);
        // Portfolio 47 (from list_portfolios.js)
        const result = await service.getPerformanceComparison(47);

        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

dump();
