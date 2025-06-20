/**
 * Polygon object
 * 
 * @author 9ins
 */
export class Polygon {
    /**
     * constructor
     * @param {} points 
     */
    constructor(points) {
        this.points = points;  // Array of {x, y} points
        this.bounds = this.getBounds(); // Get the bounds immediately upon creation
    }

    /**
     * Get bounds (bounding box)
     * @returns 
     */
    getBounds() {
        let minX = Math.min(...this.points.map(p => p.x));
        let minY = Math.min(...this.points.map(p => p.y));
        let maxX = Math.max(...this.points.map(p => p.x));
        let maxY = Math.max(...this.points.map(p => p.y));
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    /**
     * Scale the polygon around the center
     * @param {*} scale 
     */
    scale(scale) {
        const bounds = this.getBounds();
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;

        this.points = this.points.map(p => {
            let x = p.x > centerX ? p.x + scale : p.x - scale;
            let y = p.y > centerY ? p.y + scale : p.y - scale;
            return { x, y };
        });

        this.bounds = this.getBounds(); // Update bounds after scaling
    }

    /**
     * Check if a point (x, y) is inside the polygon using the Ray-Casting Algorithm
     * 
     * @param {number} x - X coordinate of the point
     * @param {number} y - Y coordinate of the point
     * @returns {boolean} - True if point is inside, otherwise false
     */
    contains(x, y) {
        let inside = false;
        let n = this.points.length;

        for (let i = 0, j = n - 1; i < n; j = i++) {
            let xi = this.points[i].x, yi = this.points[i].y;
            let xj = this.points[j].x, yj = this.points[j].y;

            let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }
}
