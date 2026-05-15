# WebAssembly vs JavaScript: Gaussian Blur Benchmark

This project is a full-stack benchmarking application designed to compare the performance of C++ (compiled to WebAssembly) against pure JavaScript for image processing tasks.

## Prerequisites

Before setting up the project, ensure the following installed on system:
* **Node.js & npm**
* **Emscripten SDK (emsdk)**
* **VS Code with Live Server Extension**

---

## Setup Instructions

### 1. Compile the WebAssembly Module
* Open terminal and navigate to the `src_cpp/` directory.
* Run the build script using the following command:
  ```bash
  ./build_wasm.sh
  ```
* The script utilizes `emcc.bat` to compile `gaussian_blur.cpp`.
* Upon completion, the compiled `image_filter.js` and `image_filter.wasm` files will be automatically outputted to the `../frontend/js/wasm_build/` directory.

### 2. Initialize the Backend
* Navigate to the `backend/` directory from project root.
* Install the necessary Node.js dependencies:
  ```bash
  npm install
  ```
* Start the Express server:
  ```bash
  node server.js
  ```
* The backend server will automatically initialize a local SQLite database named `database.sqlite`.
* You should see console messages confirming that the database models synced successfully and the server is running on `http://localhost:3000`.

### 3. Launch the Frontend
The frontend provides the UI to upload images, configure the Gaussian blur, and run the benchmark.
* Open the root directory of this project in VS Code.
* Open the `frontend/index.html` file.
* Start **Live Server** (Right-click -> "Open with Live Server" or click "Go Live" in the bottom right corner).
* The `.vscode/setting.json` file is pre-configured to ignore changes in the SQLite database and backend directory, preventing Live Server from constantly reloading browser when the backend updates.

---

## Project Architecture

### Frontend
* **Vanilla JavaScript**: Handles the UI logic and orchestrates the benchmark.
* **JSProcessor**: Applies the Gaussian blur using pure JavaScript math and array manipulation.
* **WasmProcessor**: Interfaces with the Emscripten-compiled WebAssembly module by allocating memory, copying pixel data to the Wasm heap, and executing the C++ function.
* **CanvasRenderer**: Paints the processed `Uint8ClampedArray` pixel data back onto the HTML5 Canvas.

### Backend
* **Express API**: Exposes a `POST /api/benchmarks` endpoint to receive test data.
* **Sequelize ORM**: Manages the SQLite database.
* **Database Models**: 
  * `Session`: Tracks the user agent and IP address.
  * `FilterJob`: Stores details about the image dimensions and execution timestamps.
  * `BenchmarkResult`: Records the specific execution times (in milliseconds) and the calculated speedup ratio.
