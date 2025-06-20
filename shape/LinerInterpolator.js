/**
 * LinearInterpolator object
 * 
 * @author 9ins
 */
export class LinearInterpolator {

    static interpolate(x, y) {
        return {
            value: (d) => {
                // Linear interpolation formula: y = y0 + (y1 - y0) * (d - x0) / (x1 - x0)
                let idx = x.findIndex(val => val >= d);
                if (idx === -1) return y[y.length - 1]; // If d is out of range, return last value.
                let x0 = x[idx - 1], x1 = x[idx];
                let y0 = y[idx - 1], y1 = y[idx];
                return y0 + (y1 - y0) * (d - x0) / (x1 - x0);
            }
        };
    }
}
