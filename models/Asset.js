
const { pool } = require('../db/connection');

class Asset {
    static async addBulk(portfolioId, assets, connection = null) {
        const conn = connection || pool;

        for (const asset of assets) {
            await conn.query(`
                INSERT INTO portfolio_details 
                (portfolio_id, asset_type, asset_symbol, quantity, weight, purchase_price, purchase_date, sector) 
                VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
                [
                    portfolioId,
                    asset.type || asset.asset_type,
                    asset.symbol || asset.asset_symbol,
                    asset.quantity,
                    asset.weight,
                    asset.price || asset.purchase_price,
                    asset.sector || null
                ]
            );
        }
    }

    static async deleteByPortfolioId(portfolioId, connection = null) {
        const conn = connection || pool;
        await conn.query('DELETE FROM portfolio_details WHERE portfolio_id = ?', [portfolioId]);
    }
}

module.exports = Asset;
