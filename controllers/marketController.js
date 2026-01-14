
const MarketData = require('../models/MarketData');

class MarketController {

    static async search(req, res) {
        try {
            const searchTerm = req.query.q.toLowerCase();
            console.log('Aranan terim:', searchTerm);

            const stocks = await MarketData.searchStocks(searchTerm);


            const commodityResult = await MarketData.searchCommodities(searchTerm);

            let commodityList = [];
            if (commodityResult.length > 0) {
                const commodityData = commodityResult[0];
                Object.entries(commodityData).forEach(([key, value]) => {
                    if (key !== 'Date' && value !== null && value > 0) {
                        if (key.toLowerCase().includes(searchTerm)) {
                            commodityList.push({
                                name: key,
                                price: parseFloat(value)
                            });
                        }
                    }
                });
            }

            res.json({
                stocks: stocks.map(stock => ({
                    symbol: stock.Symbol,
                    name: stock.Shortname,
                    sector: stock.Sector,
                    industry: stock.Industry,
                    price: parseFloat(stock.Currentprice)
                })),
                commodities: commodityList
            });

        } catch (error) {
            console.error('Arama hatası:', error);
            res.status(500).json({ error: 'Arama hatası', details: error.message });
        }
    }
}

module.exports = MarketController;
