
const express = require('express');
const router = express.Router();
const PortfolioController = require('../controllers/portfolioController');
const AnalysisController = require('../controllers/analysisController');

// Standard Portfolio CRUD
router.get('/', PortfolioController.getAllPortfolios);
router.post('/', PortfolioController.createPortfolio);
router.get('/:id', PortfolioController.getPortfolioById);
router.put('/:id', PortfolioController.updatePortfolio);
router.delete('/:id', PortfolioController.deletePortfolio);

// Portfolio Analysis Routes
router.get('/:id/analysis', AnalysisController.getAnalysis);
router.get('/:id/performance', AnalysisController.getPerformance);
router.get('/:id/correlation', AnalysisController.getCorrelation);
router.get('/:id/optimization', AnalysisController.getOptimization);
router.get('/:id/recommendations', AnalysisController.getRecommendations);

module.exports = router;
