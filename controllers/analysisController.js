
const { pool } = require('../db/connection');
const PortfolioService = require('../services/PortfolioService');
const MarketDataService = require('../services/MarketDataService');
const AnalysisService = require('../services/AnalysisService');
const OptimizationService = require('../services/OptimizationService');
const MarketData = require('../models/MarketData');

const portfolioService = new PortfolioService(pool);
const marketDataService = new MarketDataService(pool);
const analysisService = new AnalysisService(pool);
const optimizationService = new OptimizationService(pool);

class AnalysisController {

    static async getAnalysis(req, res) {
        try {
            const portfolioId = req.params.id;
            const portfolio = await portfolioService.getPortfolioDetails(portfolioId);

            const symbols = portfolio.assets.map(asset => asset.asset_symbol);
            const prices = await marketDataService.getBulkAssetPrices(symbols);
            const marketData = await marketDataService.getSP500Data();

            const metrics = await analysisService.calculateRiskMetrics(portfolioId);
            const returns = await analysisService.calculateReturn(portfolioId);
            const volatility = await analysisService.calculateVolatility(portfolioId);

            const portfolio_details = portfolio.assets.map(asset => ({
                asset_symbol: asset.asset_symbol,
                weight: asset.weight / 100,
                prices: prices[asset.asset_symbol] || [],
                sector: asset.sector
            }));

            res.json({
                metrics,
                expectedReturn: returns.expectedReturn || 0,
                totalReturn: returns.totalReturn || 0,
                volatility: volatility.volatility || 0,
                sharpeRatio: (returns.expectedReturn - 0.02) / (volatility.volatility || 1),
                treynorRatio: (returns.expectedReturn - 0.02) / (metrics.beta || 1),
                portfolio_details,
                market_data: {
                    prices: marketData.prices
                }
            });

        } catch (err) {
            console.error('Analiz hatası:', err);
            res.status(500).json({ error: err.message });
        }
    }

    static async getPerformance(req, res) {
        try {
            const performance = await analysisService.getPerformanceComparison(req.params.id);
            res.json(performance);
        } catch (error) {
            console.error('Performans karşılaştırma hatası:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getCorrelation(req, res) {
        try {
            const correlationMatrix = await analysisService.getCorrelationMatrix(req.params.id);
            res.json(correlationMatrix);
        } catch (error) {
            console.error('Korelasyon matrisi hatası:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getOptimization(req, res) {
        try {
            const optimizationData = await optimizationService.getOptimizationData(req.params.id);
            res.json(optimizationData);
        } catch (error) {
            console.error('Optimizasyon verisi alma hatası:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getRecommendations(req, res) {
        try {
            const recommendations = await optimizationService.getRecommendations(req.params.id);
            res.json(recommendations);
        } catch (error) {
            console.error('Öneriler alma hatası:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async runSimulation(req, res) {
        try {
            const portfolio = req.body.portfolio;

            if (!portfolio || !Array.isArray(portfolio)) {
                throw new Error('Geçersiz portföy verisi');
            }

            const portfolioData = await Promise.all(portfolio.map(async asset => {
                let prices = [];
                const cleanSymbol = asset.asset_symbol.split('(')[0].trim();

                try {
                    if (asset.asset_type === 'STOCK') {
                        const stockData = await MarketData.getStockPrices(cleanSymbol);
                        prices = stockData.map(row => row.price);
                    } else {
                        let commodityColumn = cleanSymbol;
                        if (cleanSymbol === 'GOLD') commodityColumn = 'GOLD';
                        if (cleanSymbol === 'SILVER') commodityColumn = 'SILVER';

                        const commodityData = await MarketData.getCommodityPrices(commodityColumn);
                        prices = commodityData.map(row => row.price);
                    }
                } catch (error) {
                    console.warn(`${cleanSymbol} için fiyat verisi alınamadı:`, error);
                    prices = [];
                }

                if (prices.length === 0) {
                    console.warn(`${cleanSymbol} için fiyat verisi bulunamadı, varsayılan değerler kullanılıyor`);
                    prices = [100];
                }

                return {
                    ...asset,
                    symbol: cleanSymbol,
                    weight: asset.weight / 100,
                    prices: prices
                };
            }));

            const marketData = await MarketData.getMarketIndexData();



            const results = {
                expectedReturn: calculatePortfolioReturn(portfolioData),
                estimatedRisk: calculatePortfolioRisk(portfolioData),
                correlationMatrix: {
                    assets: portfolioData.map(p => p.symbol),
                    matrix: calculateCorrelationMatrix(portfolioData)
                },
                performance: {
                    portfolio: calculatePerformance(portfolioData),
                    market: marketData.map(d => d.price),
                    dates: marketData.map(d => d.date)
                }
            };

            res.json(results);

        } catch (error) {
            console.error('Simülasyon hatası:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async optimizeSimulation(req, res) {
        try {
            const results = await optimizationService.optimizeSimulatedPortfolio(
                req.body.portfolio,
                req.body.riskTolerance
            );
            res.json(results);
        } catch (error) {
            console.error('Optimizasyon hatası:', error);
            res.status(500).json({ error: error.message });
        }
    }
}


function calculatePortfolioReturn(portfolio) {
    if (!portfolio || portfolio.length === 0) return 0;
    let totalReturn = 0;
    let totalWeight = 0;
    portfolio.forEach(asset => {
        const prices = asset.prices;
        if (!prices || prices.length < 2) return;
        const lookbackPeriod = Math.min(30, prices.length - 1);
        const lastPrice = prices[prices.length - 1];
        const startPrice = prices[prices.length - 1 - lookbackPeriod];
        if (!lastPrice || !startPrice || startPrice === 0) return;
        const return_ = (lastPrice - startPrice) / startPrice;
        totalReturn += return_ * asset.weight;
        totalWeight += asset.weight;
    });
    if (totalWeight > 0) totalReturn = totalReturn * (1 / totalWeight);
    return Math.pow(1 + totalReturn, 252 / 30) - 1;
}

function calculatePortfolioRisk(portfolio) {
    if (!portfolio || portfolio.length === 0) return 0;
    const dailyReturns = portfolio.map(asset => {
        const prices = asset.prices;
        if (!prices || prices.length < 2) return [];
        return prices.slice(1).map((price, i) => {
            const prevPrice = prices[i];
            if (!prevPrice || prevPrice === 0) return 0;
            return (price - prevPrice) / prevPrice;
        }).filter(return_ => isFinite(return_));
    });
    const minLength = Math.min(...dailyReturns.map(returns => returns.length));
    if (minLength === 0) return 0;
    const portfolioDailyReturns = Array(minLength).fill(0).map((_, day) => {
        return portfolio.reduce((sum, asset, i) => {
            if (!dailyReturns[i][day]) return sum;
            return sum + (dailyReturns[i][day] * asset.weight);
        }, 0);
    });
    const validReturns = portfolioDailyReturns.filter(r => isFinite(r) && Math.abs(r) < 1);
    if (validReturns.length < 2) return 0;
    const mean = validReturns.reduce((a, b) => a + b, 0) / validReturns.length;
    const variance = validReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / (validReturns.length - 1);
    return Math.sqrt(variance) * Math.sqrt(252);
}

function calculateCorrelationMatrix(portfolio) {
    if (!portfolio || portfolio.length === 0) return [];
    const n = portfolio.length;
    const matrix = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const returns1 = calculateReturns(portfolio[i].prices);
            const returns2 = calculateReturns(portfolio[j].prices);
            matrix[i][j] = calculateCorrelation(returns1, returns2);
        }
    }
    return matrix;
}

function calculatePerformance(portfolio) {
    if (!portfolio || portfolio.length === 0) return [];
    const maxDays = Math.min(30, ...portfolio.map(asset => asset.prices.length));
    const performance = [100];
    for (let day = 1; day < maxDays; day++) {
        const dailyReturn = portfolio.reduce((sum, asset) => {
            const todayPrice = asset.prices[asset.prices.length - maxDays + day] || 0;
            const yesterdayPrice = asset.prices[asset.prices.length - maxDays + day - 1] || 0;
            if (!yesterdayPrice) return sum;
            const dailyReturn = (todayPrice - yesterdayPrice) / yesterdayPrice;
            return sum + (dailyReturn * asset.weight);
        }, 0);
        const todayValue = performance[day - 1] * (1 + (isFinite(dailyReturn) ? dailyReturn : 0));
        performance.push(isFinite(todayValue) ? todayValue : performance[day - 1]);
    }
    return performance;
}

function calculateReturns(prices) {
    if (!prices || prices.length < 2) return [];
    return prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
}

function calculateCorrelation(returns1, returns2) {
    if (returns1.length !== returns2.length || returns1.length < 2) return 0;
    const mean1 = returns1.reduce((a, b) => a + b, 0) / returns1.length;
    const mean2 = returns2.reduce((a, b) => a + b, 0) / returns2.length;
    let numerator = 0;
    let denom1 = 0;
    let denom2 = 0;
    for (let i = 0; i < returns1.length; i++) {
        const diff1 = returns1[i] - mean1;
        const diff2 = returns2[i] - mean2;
        numerator += diff1 * diff2;
        denom1 += diff1 * diff1;
        denom2 += diff2 * diff2;
    }
    return numerator / Math.sqrt(denom1 * denom2);
}

module.exports = AnalysisController;
