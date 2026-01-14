
const express = require('express');
const router = express.Router();

const portfolioRoutes = require('./portfolioRoutes');
const marketRoutes = require('./marketRoutes');
const simulationRoutes = require('./simulationRoutes');

router.use('/portfolios', portfolioRoutes);
router.use('/', marketRoutes); // /search is at root of api i.e. /api/search
router.use('/simulation', simulationRoutes);

module.exports = router;
