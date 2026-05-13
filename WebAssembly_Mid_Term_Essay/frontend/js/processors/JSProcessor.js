class JSProcessor {
    constructor(config) {
        // config should be an instance of FilterConfig (has kernelSize and sigma)
        this.config = config;
    }

    // Mirrors the C++ createGaussianKernel
    createGaussianKernel(kernelSize, sigma) {
        const kernel = new Float32Array(kernelSize * kernelSize);
        let sum = 0;
        const halfSize = Math.floor(kernelSize / 2);

        for (let y = -halfSize; y <= halfSize; y++) {
            for (let x = -halfSize; x <= halfSize; x++) {
                const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma)) / (2 * Math.PI * sigma * sigma);
                kernel[(y + halfSize) * kernelSize + (x + halfSize)] = value;
                sum += value;
            }
        }

        // Normalize
        for (let i = 0; i < kernel.length; i++) {
            kernel[i] /= sum;
        }

        return kernel;
    }

    // The main processing function
    apply(data, width, height) {
        let { kernelSize, sigma } = this.config;
        
        // Edge cases
        if (kernelSize <= 1 || sigma <= 0) return data;
        if (kernelSize % 2 === 0) kernelSize++; 

        const halfSize = Math.floor(kernelSize / 2);
        const kernel = this.createGaussianKernel(kernelSize, sigma);

        // We use Uint8ClampedArray because that is what HTML Canvas uses natively for ImageData
        const tempData = new Uint8ClampedArray(data);
        const resultData = new Uint8ClampedArray(data); // Pre-fill with original data (preserves alpha)

        // Loop through every pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                
                let r = 0, g = 0, b = 0;
                
                // Apply the kernel
                for (let ky = -halfSize; ky <= halfSize; ky++) {
                    for (let kx = -halfSize; kx <= halfSize; kx++) {
                        
                        // Clamp coordinates to edges
                        const neighborX = Math.max(0, Math.min(width - 1, x + kx));
                        const neighborY = Math.max(0, Math.min(height - 1, y + ky));
                        
                        const pixelIndex = (neighborY * width + neighborX) * 4;
                        const kernelIndex = (ky + halfSize) * kernelSize + (kx + halfSize);
                        const weight = kernel[kernelIndex];

                        r += tempData[pixelIndex] * weight;
                        g += tempData[pixelIndex + 1] * weight;
                        b += tempData[pixelIndex + 2] * weight;
                    }
                }

                const currentIndex = (y * width + x) * 4;
                resultData[currentIndex] = r;
                resultData[currentIndex + 1] = g;
                resultData[currentIndex + 2] = b;
                // Alpha remains untouched as we pre-filled resultData
            }
        }

        return resultData;
    }
}

// Export for use in the controller
export default JSProcessor;