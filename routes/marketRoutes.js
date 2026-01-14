
const express = require('express');
const router = express.Router();
const MarketController = require('../controllers/marketController');

router.get('/search', MarketController.search);

module.exports = router;
