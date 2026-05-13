class CanvasRenderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    render(data, width, height) {
        // Snap the canvas dimensions to match the image precisely
        this.canvas.width = width;
        this.canvas.height = height;

        // Construct an ImageData object from the raw pixel array
        const imageData = new ImageData(data, width, height);

        // Paint the pixels onto the canvas
        this.ctx.putImageData(imageData, 0, 0);
    }

    // Fulfills the +download() method from your Class Diagram
    download(filename = 'filtered_image.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

export default CanvasRenderer;