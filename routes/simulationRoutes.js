
const express = require('express');
const router = express.Router();
const AnalysisController = require('../controllers/analysisController');

router.post('/', AnalysisController.runSimulation);
router.post('/optimize', AnalysisController.optimizeSimulation);

module.exports = router;
