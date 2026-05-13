class FilterConfig {
    constructor(kernelSize = 5, sigma = 2.0) {
        this.kernelSize = kernelSize;
        this.sigma = sigma;
    }

    // Ensures we don't pass invalid numbers to the C++ or JS engines
    validate() {
        return this.kernelSize >= 3 && 
               this.kernelSize % 2 !== 0 && 
               this.sigma > 0;
    }
}

export default FilterConfig;