class CanvasRenderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
    }

    render(dataArray, width, height) {
        if (!dataArray || width === 0 || height === 0) {
            console.error("CanvasRenderer: Invalid image data or dimensions.");
            return;
        }

        // 1. Snap the HTML canvas size to match the exact image resolution
        this.canvas.width = width;
        this.canvas.height = height;

        // 2. Wrap the raw memory array into an official browser ImageData object
        // The dataArray must be a Uint8ClampedArray for this to work natively
        const imageData = new ImageData(dataArray, width, height);

        // 3. Paint the pixels to the screen
        this.ctx.putImageData(imageData, 0, 0);
    }
}

export default CanvasRenderer;