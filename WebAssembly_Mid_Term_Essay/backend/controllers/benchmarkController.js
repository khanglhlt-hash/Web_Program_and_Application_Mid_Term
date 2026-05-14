// backend/controllers/benchmarkController.js
const Session = require('../models/Session');
const FilterJob = require('../models/FilterJob');
const BenchmarkResult = require('../models/BenchmarkResult');

exports.saveBenchmark = async (req, res) => {
    try {
        // The frontend will send an object containing job and result data
        const { jobData, resultData } = req.body;

        // 1. Create the Session record
        // We can extract the userAgent and IP directly from the Express request object
        const session = await Session.create({
            userAgent: req.headers['user-agent'] || 'Unknown',
            clientIp: req.ip || req.connection.remoteAddress
        });

        // 2. Create the FilterJob record linked to the Session
        const job = await FilterJob.create({
            sessionId: session.id,
            inputImageName: jobData.inputImageName,
            widthPx: jobData.widthPx,
            heightPx: jobData.heightPx,
            engine: jobData.engine || 'COMPARISON', // Comparing JS vs WASM
            startedAt: jobData.startedAt,
            finishedAt: jobData.finishedAt
        });

        // 3. Create the BenchmarkResult record linked to the FilterJob
        const result = await BenchmarkResult.create({
            jobId: job.id,
            wasmTimeMs: resultData.wasmTimeMs,
            jsTimeMs: resultData.jsTimeMs,
            speedupRatio: resultData.speedupRatio,
            summary: resultData.summary
        });

        // Respond with success
        res.status(201).json({
            success: true,
            message: 'Benchmark results successfully saved to database.',
            data: { session, job, result }
        });

    } catch (error) {
        console.error('❌ Error saving benchmark data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save benchmark results.',
            error: error.message
        });
    }
};