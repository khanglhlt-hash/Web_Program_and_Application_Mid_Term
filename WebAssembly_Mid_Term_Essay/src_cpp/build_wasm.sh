#!/bin/bash

# 1. Create the output directory if it doesn't exist yet
mkdir -p ../frontend/js/wasm_build

# 2. Compile the C++ file into Wasm and JS glue code
echo "Compiling C++ to WebAssembly..."

emcc.bat gaussian_blur.cpp \
    -O3 \
    -s WASM=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s EXPORT_ES6=1 \
    -s EXPORT_NAME="ImageFilterModule" \
    -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' \
    -o ../frontend/js/wasm_build/image_filter.js

echo "✅ Build complete! Check frontend/js/wasm_build/ for image_filter.js and image_filter.wasm"