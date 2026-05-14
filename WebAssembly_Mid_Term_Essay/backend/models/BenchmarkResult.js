// backend/models/BenchmarkResult.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const FilterJob = require('./FilterJob');

const BenchmarkResult = sequelize.define('BenchmarkResult', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    jobId: {
        type: DataTypes.UUID,
        references: {
            model: FilterJob,
            key: 'id'
        }
    },
    wasmTimeMs: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    jsTimeMs: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    speedupRatio: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    summary: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'BENCHMARK_RESULT',
    timestamps: false
});

// Define Association (1 FilterJob has 1 BenchmarkResult)
FilterJob.hasOne(BenchmarkResult, { foreignKey: 'jobId' });
BenchmarkResult.belongsTo(FilterJob, { foreignKey: 'jobId' });

module.exports = BenchmarkResult;