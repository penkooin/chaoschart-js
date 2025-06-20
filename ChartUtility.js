import { Chart } from "./Chart.js";

/**
 * ChartUtility Class
 * Provides utility methods for image processing and Chart creation
 */
export class ChartUtility {
    /**
     * Supported codecs
     */
    static CODEC = {
        JPEG: "jpeg",
        PNG: "png",
        BMP: "bmp",
        TIFF: "tiff",
    };

    /**
     * Save image to file
     * @param {Object} imageData - Image data
     * @param {string} saveFile - File path
     * @param {string} codec - File format
     */
    // static async saveImage(imageData, saveFile, codec) {
    //     const ext = path.extname(saveFile).slice(1).toLowerCase();
    //     if (!Object.values(ChartUtility.CODEC).includes(ext)) {
    //         throw new Error('Unsupported encoding format');
    //     }

    //     const canvas = createCanvas(imageData.width, imageData.height);
    //     const ctx = canvas.getContext('2d');
    //     ctx.putImageData(imageData, 0, 0);

    //     const out = fs.createWriteStream(saveFile);
    //     const stream = canvas.createJPEGStream(); // Use codec-specific streams
    //     stream.pipe(out);
    //     out.on('finish', () => console.log('Saved image to file.'));
    // }

    /**
     * Create Chart object with JSON data
     * @param {string} json - JSON string
     * @return {Object} Chart object
     */
    static createChartWithJson(json) {
        const map = JSON.parse(json);
        return this.createChartWithMap(map);
    }

    /**
     * Round values to specified decimal places
     * @param {Array<number>} values - List of numbers
     * @param {number} places - Decimal places
     * @return {Array<number>} Rounded values
     */
    static roundValues(values, places) {
        const factor = Math.pow(10, places);
        return values.map((val) => Math.round(val * factor) / factor);
    }

    /**
     * Helper to convert a color object to CSS string
     * @param {*} color
     * @returns
     */
    static colorToString(color) {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    }

    /**
     * Helper functions
     *
     * @param {*} degrees
     * @returns
     */
    static toRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }

    /**
     * Apply round avoid
     * @param {*} value
     * @param {*} decimalPoint
     * @returns
     */
    static roundAvoid(value, decimalPoint) {
        const factor = Math.pow(10, decimalPoint);
        return Math.round(value * factor) / factor;
    }

    /**
     * Calulate center x, y of polygon
     * @param {} vertices
     * @returns
     */
    static getPolygonCenterXY(vertices) {
        let xSum = 0,
            ySum = 0,
            area = 0;
        const n = vertices.length;

        for (let i = 0; i < n; i++) {
            let j = (i + 1) % n; // Next vertex (wraps around)

            let cross = vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y;
            area += cross;
            xSum += (vertices[i].x + vertices[j].x) * cross;
            ySum += (vertices[i].y + vertices[j].y) * cross;
        }
        area *= 0.5;

        let cx = xSum / (6 * area);
        let cy = ySum / (6 * area);
        return { x: cx, y: cy };
    }

    /**
     * Split array to fit of chunk size
     * @param {*} arr
     * @param {*} chunkSize
     * @returns
     */
    static splitIntoChunks(arr, chunkSize = 4) {
        return arr.reduce((result, _, index) => {
            if (index % chunkSize === 0) {
                result.push(arr.slice(index, index + chunkSize));
            }
            return result;
        }, []);
    }
}

export default ChartUtility;