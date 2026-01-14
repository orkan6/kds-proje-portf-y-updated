
const { pool } = require('../db/connection');

class MarketData {
    static async searchStocks(searchTerm) {
        const [stocks] = await pool.query(`
            SELECT 
                Symbol, 
                Shortname, 
                Sector,
                Industry,
                Currentprice 
            FROM sp500_companies 
            WHERE LOWER(Symbol) LIKE ? 
                OR LOWER(Shortname) LIKE ?
                OR LOWER(Sector) LIKE ?
            LIMIT 10
        `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
        return stocks;
    }

    static async getLatestCommodities() {

        const [commodities] = await pool.query(`
            SELECT *
            FROM commodity_futures cf1
            WHERE Date = (
                SELECT MAX(Date)
                FROM commodity_futures cf2
            )
        `);
        return commodities;
    }

    static async searchCommodities(searchTerm) {

        const [commodities] = await pool.query(`
            SELECT *
            FROM commodity_futures cf1
            WHERE Date = (
                SELECT MAX(Date)
                FROM commodity_futures cf2
            )
            AND (
                EXISTS (
                    SELECT 1
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'commodity_futures'
                    AND COLUMN_NAME != 'Date'
                    AND LOWER(COLUMN_NAME) LIKE ?
                )
            )
        `, [`%${searchTerm}%`]);
        return commodities;
    }

    static async getStockPrices(symbol) {
        const [stockData] = await pool.query(`
            SELECT \`${symbol}\` as price, Date as date 
            FROM sp500veri
            WHERE \`${symbol}\` IS NOT NULL 
            ORDER BY Date ASC
        `);
        return stockData;
    }

    static async getCommodityPrices(commodityColumn) {
        const [commodityData] = await pool.query(`
            SELECT \`${commodityColumn}\` as price, Date as date 
            FROM commodity_futures
            WHERE \`${commodityColumn}\` IS NOT NULL 
            ORDER BY Date ASC
        `);
        return commodityData;
    }

    static async getMarketIndexData() {
        const [marketData] = await pool.query(`
            SELECT \`S&P500\` as price, Date as date
            FROM sp500_index
            WHERE Date >= DATE_SUB(CURDATE(), INTERVAL 3 YEAR)
            ORDER BY Date ASC
        `);
        return marketData;
    }
}

module.exports = MarketData;
