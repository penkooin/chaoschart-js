/**
 * NevilleInterpolator object
 * 
 * @author 9ins
 */
export class NevilleInterpolator {
    interpolate(x, y) {
        return {
            value: (d) => {
                let n = x.length;
                let Q = Array(n);
                for (let i = 0; i < n; i++) {
                    Q[i] = [y[i]];
                }
                for (let i = 1; i < n; i++) {
                    for (let j = 0; j < n - i; j++) {
                        Q[j][i] = ((d - x[j + i]) * Q[j][i - 1] - (d - x[j]) * Q[j + 1][i - 1]) / (x[j + i] - x[j]);
                    }
                }
                return Q[0][n - 1];  // Return the final interpolated value
            }
        };
    }
}

