export class DividedDifferenceInterpolator {
    static interpolate(x, y) {
        const n = x.length;
        let diffTable = new Array(n);

        // Build the divided difference table
        for (let i = 0; i < n; i++) {
            diffTable[i] = [y[i]];
        }
        for (let j = 1; j < n; j++) {
            for (let i = 0; i < n - j; i++) {
                diffTable[i].push((diffTable[i + 1][j - 1] - diffTable[i][j - 1]) / (x[i + j] - x[i]));
            }
        }

        return {
            value: (d) => {
                let result = diffTable[0][0];
                let prod = 1;
                for (let i = 1; i < n; i++) {
                    prod *= (d - x[i - 1]);
                    result += prod * diffTable[0][i];
                }
                return result;
            }
        };
    }
}
