#include <stdint.h>
#include <cmath>
#include <vector>
#include <emscripten/emscripten.h>

// Helper function to generate a 2D Gaussian kernel
std::vector<float> createGaussianKernel(int kernelSize, float sigma) {
    std::vector<float> kernel(kernelSize * kernelSize);
    float sum = 0.0f;
    int halfSize = kernelSize / 2;

    for (int y = -halfSize; y <= halfSize; y++) {
        for (int x = -halfSize; x <= halfSize; x++) {
            // Gaussian formula
            float value = exp(-(x * x + y * y) / (2 * sigma * sigma)) / (2 * 3.14159265f * sigma * sigma);
            kernel[(y + halfSize) * kernelSize + (x + halfSize)] = value;
            sum += value;
        }
    }

    // Normalize the kernel so the image doesn't get brighter or darker
    for (int i = 0; i < kernelSize * kernelSize; i++) {
        kernel[i] /= sum;
    }

    return kernel;
}

// We use extern "C" to prevent C++ name mangling, ensuring the JS side can find this exact function name.
extern "C" {

// EMSCRIPTEN_KEEPALIVE tells the compiler not to strip this function out, even if it looks unused in C++.
EMSCRIPTEN_KEEPALIVE
void applyGaussianBlur(uint8_t* data, int width, int height, int kernelSize, float sigma) {
    // Edge case handling
    if (kernelSize <= 1 || sigma <= 0.0f) return;
    
    // Ensure kernelSize is odd so we have a distinct center pixel
    if (kernelSize % 2 == 0) kernelSize++; 

    int halfSize = kernelSize / 2;
    std::vector<float> kernel = createGaussianKernel(kernelSize, sigma);

    // We need a copy of the original image data to read from. 
    // If we read from and write to the same array simultaneously, the blur will bleed incorrectly.
    int totalBytes = width * height * 4; // 4 channels: R, G, B, A
    std::vector<uint8_t> tempData(data, data + totalBytes);

    // Loop through every pixel
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            
            float r = 0, g = 0, b = 0;
            
            // Apply the kernel to the current pixel's neighbors
            for (int ky = -halfSize; ky <= halfSize; ky++) {
                for (int kx = -halfSize; kx <= halfSize; kx++) {
                    
                    // Calculate neighbor pixel coordinates (clamp to edges to prevent out-of-bounds)
                    int neighborX = std::max(0, std::min(width - 1, x + kx));
                    int neighborY = std::max(0, std::min(height - 1, y + ky));
                    
                    // Find the 1D index for the 2D coordinate (4 bytes per pixel)
                    int pixelIndex = (neighborY * width + neighborX) * 4;
                    int kernelIndex = (ky + halfSize) * kernelSize + (kx + halfSize);
                    float weight = kernel[kernelIndex];

                    r += tempData[pixelIndex] * weight;
                    g += tempData[pixelIndex + 1] * weight;
                    b += tempData[pixelIndex + 2] * weight;
                }
            }

            // Write the new values back to the original array (Linear Memory shared with JS)
            int currentIndex = (y * width + x) * 4;
            data[currentIndex] = (uint8_t)std::min(std::max((int)r, 0), 255);
            data[currentIndex + 1] = (uint8_t)std::min(std::max((int)g, 0), 255);
            data[currentIndex + 2] = (uint8_t)std::min(std::max((int)b, 0), 255);
            // Alpha channel (data[currentIndex + 3]) is left untouched
        }
    }
}

} // end extern "C"