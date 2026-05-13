class BenchmarkResult {
    constructor(wasmTime, jsTime) {
        this.wasmTime = wasmTime;
        this.jsTime = jsTime;
        // Calculate speedup multiplier
        this.speedup = jsTime > 0 ? (jsTime / wasmTime).toFixed(2) : 0;
    }

    getSummary() {
        return `WebAssembly was ${this.speedup}x faster than pure JavaScript.`;
    }
}

export default BenchmarkResult;