class WasmProcessor {
    constructor(wasmModule, config) {
        this.wasmMod = wasmModule;
        this.config = config;
    }

    apply(data, width, height) {
        const numBytes = width * height * 4;

        // 1. Allocate memory. 
        // Growth might happen here, detaching old buffers.
        const ptr = this.wasmMod._malloc(numBytes);

        // 2. Copy pixels using the CURRENT heap view
        this.wasmMod.HEAPU8.set(data, ptr);

        // 3. Call the C++ function
        // Growth could also happen inside the C++ logic
        this.wasmMod.ccall(
            'applyGaussianBlur', 
            null,                
            ['number', 'number', 'number', 'number', 'number'], 
            [ptr, width, height, this.config.kernelSize, this.config.sigma] 
        );

        // 4. Read results back.
        // CRITICAL: We access this.wasmMod.HEAPU8 AGAIN here.
        // If memory grew, this.wasmMod.HEAPU8 is the new buffer.
        // Using a local 'heap' variable from step 2 would fail here.
        const resultData = new Uint8ClampedArray(
            this.wasmMod.HEAPU8.subarray(ptr, ptr + numBytes)
        );

        // 5. Clean up
        this.wasmMod._free(ptr);

        return resultData;
    }
}

export default WasmProcessor;