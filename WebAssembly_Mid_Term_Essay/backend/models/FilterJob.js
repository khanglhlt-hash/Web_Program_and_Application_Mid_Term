// backend/models/FilterJob.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Session = require('./Session');

const FilterJob = sequelize.define('FilterJob', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    sessionId: {
        type: DataTypes.UUID,
        references: {
            model: Session,
            key: 'id'
        }
    },
    inputImageName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    widthPx: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    heightPx: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    engine: {
        type: DataTypes.ENUM('WASM', 'JS', 'COMPARISON'),
        allowNull: false
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    finishedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'FILTER_JOB',
    timestamps: false // Using custom startedAt/finishedAt per ERD
});

// Define Association (1 Session has Many FilterJobs)
Session.hasMany(FilterJob, { foreignKey: 'sessionId' });
FilterJob.belongsTo(Session, { foreignKey: 'sessionId' });

module.exports = FilterJob;