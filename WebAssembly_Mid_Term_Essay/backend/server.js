// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');

// Import controllers
const benchmarkController = require('./controllers/benchmarkController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(bodyParser.json()); 

// API Routes
app.post('/api/benchmarks', benchmarkController.saveBenchmark);

app.get('/api/status', (req, res) => {
    res.json({ status: 'Online', message: 'Wasm Benchmark API is running' });
});

// Database Sync and Server Initialization
sequelize.sync({ force: false }) 
    .then(() => {
        console.log('✅ All database models synced successfully.');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Failed to sync database models:', error);
    });