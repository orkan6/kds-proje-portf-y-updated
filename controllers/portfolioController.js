
const { pool } = require('../db/connection');
const PortfolioService = require('../services/PortfolioService');

const portfolioService = new PortfolioService(pool);

class PortfolioController {

    static async getAllPortfolios(req, res) {
        try {
            const portfolios = await portfolioService.getAllPortfolios();
            res.json(portfolios);
        } catch (err) {
            console.error('Portföy listesi hatası:', err);
            res.status(500).json({ error: err.message });
        }
    }

    static async getPortfolioById(req, res) {
        try {
            const portfolio = await portfolioService.getPortfolioDetails(req.params.id);
            const summary = await portfolioService.getPortfolioSummary(req.params.id);
            res.json({ portfolio, summary });
        } catch (err) {
            console.error('Portföy detayları hatası:', err);
            res.status(500).json({ error: err.message });
        }
    }

    static async createPortfolio(req, res) {
        try {
            const portfolioData = req.body;
            console.log('Gelen portföy verisi:', portfolioData);
            const newPortfolio = await portfolioService.createPortfolio(portfolioData);
            res.json({
                success: true,
                portfolio_id: newPortfolio.portfolio_id
            });
        } catch (err) {
            console.error('Portföy oluşturma hatası:', err);
            res.status(500).json({ error: 'Portföy oluşturulamadı', details: err.message });
        }
    }

    static async updatePortfolio(req, res) {
        try {
            const updatedPortfolio = await portfolioService.updatePortfolio(
                req.params.id,
                req.body
            );
            res.json(updatedPortfolio);
        } catch (err) {
            console.error('Portföy güncelleme hatası:', err);
            res.status(500).json({ error: err.message });
        }
    }

    static async deletePortfolio(req, res) {
        try {
            await portfolioService.deletePortfolio(req.params.id);
            res.json({ success: true });
        } catch (err) {
            console.error('Portföy silme hatası:', err);
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = PortfolioController;
