import FilterConfig from '../models/FilterConfig.js';
import BenchmarkResult from '../models/BenchmarkResult.js';
import JSProcessor from '../processors/JSProcessor.js';
import WasmProcessor from '../processors/WasmProcessor.js';
import CanvasRenderer from '../renderers/CanvasRenderer.js';
// Import the Emscripten generated ES6 module
import ImageFilterModule from '../wasm_build/image_filter.js'; 

// --- DOM Elements ---
const imageUpload = document.getElementById('imageUpload');
const fileNameDisplay = document.getElementById('fileName');
const kernelSizeInput = document.getElementById('kernelSize');
const kernelValueDisplay = document.getElementById('kernelValue');
const sigmaInput = document.getElementById('sigma');
const sigmaValueDisplay = document.getElementById('sigmaValue');
const runBenchmarkBtn = document.getElementById('runBenchmark');

// --- Renderers ---
const originalCanvas = new CanvasRenderer(document.getElementById('originalCanvas'));
const wasmCanvas = new CanvasRenderer(document.getElementById('wasmCanvas'));
const jsCanvas = new CanvasRenderer(document.getElementById('jsCanvas'));

// --- State ---
let currentImageData = null;
let imageWidth = 0;
let imageHeight = 0;
let wasmModuleInstance = null;

// --- Initialize WebAssembly ---
async function initWasm() {
    try {
        // Instantiate the Wasm module from Emscripten
        wasmModuleInstance = await ImageFilterModule();
        console.log("✅ Wasm Module Loaded Successfully");
    } catch (error) {
        console.error("❌ Failed to load Wasm Module:", error);
    }
}

// --- Event Listeners ---

// Update UI slider numbers
kernelSizeInput.addEventListener('input', (e) => kernelValueDisplay.textContent = e.target.value);
sigmaInput.addEventListener('input', (e) => sigmaValueDisplay.textContent = e.target.value);

// Handle Image Upload
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileNameDisplay.textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            imageWidth = img.width;
            imageHeight = img.height;
            
            // We use a hidden temporary canvas to extract the raw pixel data from the uploaded image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imageWidth;
            tempCanvas.height = imageHeight;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Store the raw Uint8ClampedArray
            currentImageData = ctx.getImageData(0, 0, imageWidth, imageHeight).data;
            
            // Draw it to the visible original canvas
            originalCanvas.render(currentImageData, imageWidth, imageHeight);
            
            // Unlock the benchmark button
            runBenchmarkBtn.disabled = false; 
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Run the Benchmark
runBenchmarkBtn.addEventListener('click', () => {
    if (!currentImageData || !wasmModuleInstance) return;

    // 1. Gather configuration
    const config = new FilterConfig(
        parseInt(kernelSizeInput.value),
        parseFloat(sigmaInput.value)
    );

    if (!config.validate()) {
        alert("Invalid configuration. Kernel size must be an odd number.");
        return;
    }

    // Lock UI and give visual feedback
    runBenchmarkBtn.disabled = true;
    runBenchmarkBtn.textContent = "Processing (Heavy load)...";

    // We use setTimeout so the browser has a split second to update the button text 
    // before the heavy synchronous math locks up the main thread
    setTimeout(() => {
        try {
            // 2. Execute JavaScript Baseline
            const jsProcessor = new JSProcessor(config);
            const jsStart = performance.now();
            const jsResult = jsProcessor.apply(currentImageData, imageWidth, imageHeight);
            const jsEnd = performance.now();
            const jsTimeMs = jsEnd - jsStart;

            // 3. Execute WebAssembly Processing
            const wasmProcessor = new WasmProcessor(wasmModuleInstance, config);
            const wasmStart = performance.now();
            const wasmResult = wasmProcessor.apply(currentImageData, imageWidth, imageHeight);
            const wasmEnd = performance.now();
            const wasmTimeMs = wasmEnd - wasmStart;

            // 4. Render Results to screen
            jsCanvas.render(jsResult, imageWidth, imageHeight);
            wasmCanvas.render(wasmResult, imageWidth, imageHeight);

            // 5. Calculate Stats and update Dashboard
            const benchmark = new BenchmarkResult(wasmTimeMs, jsTimeMs);
            document.getElementById('jsTime').textContent = `${jsTimeMs.toFixed(2)} ms`;
            document.getElementById('wasmTime').textContent = `${wasmTimeMs.toFixed(2)} ms`;
            document.getElementById('speedup').textContent = `${benchmark.speedup} x`;
            
        } catch (error) {
            console.error("Error during processing:", error);
            alert("An error occurred during the benchmark.");
        } finally {
            // Restore UI
            runBenchmarkBtn.disabled = false;
            runBenchmarkBtn.textContent = "🚀 Run Benchmark";
        }
    }, 50);
});

// Boot up
initWasm();