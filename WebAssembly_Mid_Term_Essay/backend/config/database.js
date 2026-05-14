// backend/config/database.js
const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite for easy local development
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false // Set to console.log to see raw SQL queries
});

// Test the connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection has been established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
}

testConnection();

module.exports = sequelize;