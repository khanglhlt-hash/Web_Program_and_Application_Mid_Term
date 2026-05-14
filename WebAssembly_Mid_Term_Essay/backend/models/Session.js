// backend/models/Session.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userAgent: {
        type: DataTypes.STRING,
        allowNull: false
    },
    clientIp: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'SESSION',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false // ERD only specifies createdAt
});

module.exports = Session;