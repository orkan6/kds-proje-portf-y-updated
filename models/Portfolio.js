
const { pool } = require('../db/connection');

class Portfolio {
    static async create(name, initialValue) {
        const [result] = await pool.query(
            `INSERT INTO portfolios (portfolio_name, initial_value, creation_date) 
             VALUES (?, ?, CURDATE())`,
            [name, initialValue]
        );
        return result.insertId;
    }

    static async getAll() {
        const [results] = await pool.query(`
            SELECT 
                p.*,
                pd.detail_id,
                pd.asset_type,
                pd.asset_symbol,
                pd.quantity,
                pd.weight,
                pd.purchase_price,
                pd.purchase_date
            FROM portfolios p
            LEFT JOIN portfolio_details pd ON p.portfolio_id = pd.portfolio_id
            ORDER BY p.creation_date DESC
        `);
        return results;
    }

    static async getById(id) {

        const [results] = await pool.query(`
            SELECT 
                p.*,
                pd.detail_id,
                pd.asset_type,
                pd.asset_symbol,
                pd.quantity,
                pd.weight,
                pd.purchase_price,
                pd.purchase_date,
                pd.sector
            FROM portfolios p
            LEFT JOIN portfolio_details pd ON p.portfolio_id = pd.portfolio_id
            WHERE p.portfolio_id = ?
        `, [id]);
        return results;
    }

    static async update(id, data) {

        if (data.portfolio_name) {
            await pool.query(
                `UPDATE portfolios SET portfolio_name = ? WHERE portfolio_id = ?`,
                [data.portfolio_name, id]
            );
        }
    }

    static async delete(id) {
        await pool.query('DELETE FROM portfolios WHERE portfolio_id = ?', [id]);
    }
}

module.exports = Portfolio;
