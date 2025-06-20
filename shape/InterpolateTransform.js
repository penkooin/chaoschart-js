/**
 * <i>Chaos Chart API </i><br>
 */
import * as DividedDifferenceInterpolator from './DivideDifferenceInterpolator.js';
import * as LinearInterpolator from './LinerInterpolator.js';
import * as NevilleInterpolator from './NevilleInterpolator.js';
import { Point2D } from '../coordinate/Point2D.js';

/**
 * InterpolateTransform
 * 
 * @author 9ins
 */
class InterpolateTransform {

    static transform(interpolation, x, y, xi) {
        switch (interpolation) {
            case 'NONE':
                break;
            case 'LINEAR':
                return this.linearTransform(x, y, xi);
            case 'SPLINE':
                return this.splineTransform(x, y, xi);
            case 'DIVIDED_DIFFERENCE':
                return this.dividedDifferenceTransform(x, y, xi);
            case 'NEVILLE':
                return this.nevilleTransform(x, y, xi);
            default:
                throw new Error('Not supported interpolation type: ' + interpolation);
        }
        return null;
    }

    static linearTransform(x, y, xi) {
        const interpolator = new LinearInterpolator();
        const psf = interpolator.interpolate(x, y);
        return xi.map(d => psf.value(d));
    }

    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    static dividedDifferenceTransform(x, y, xi) {
        const interpolator = new DividedDifferenceInterpolator();
        const pfnf = interpolator.interpolate(x, y);
        return xi.map(d => pfnf.value(d));
    }

    static nevilleTransform(x, y, xi) {
        const interpolator = new NevilleInterpolator();
        const pfnf = interpolator.interpolate(x, y);
        return xi.map(d => pfnf.value(d));
    }

    static populateInterpolateWithOneType(interpolateType, chartElements, interpolateScale) {
        Object.values(chartElements.getChartElementMap()).forEach(e => {
            e.interpolateScale = interpolateScale;
            e.interpolationType = interpolateType;
        });
        return this.populateInterpolate(chartElements);
    }

    static populateInterpolate(chartElements) {
        const gx = chartElements.CHART_X;
        const gy = chartElements.CHART_Y;
        const gw = chartElements.CHART_WIDTH;
        const gh = chartElements.CHART_HEIGHT;
        const lim = chartElements.LIMIT;
        const mx = chartElements.getMaximum();
        const tab = gw / chartElements.xIndexCount;
        Object.values(chartElements.getChartElementMap()).forEach(e => {
            try {
                if (e.interpolationType && e.interpolateScale !== -1) {
                    const vc = e.values.length;
                    const xv = Array.from({ length: vc }, (_, i) => i * tab + gx);
                    const yv = Array.from({ length: vc }, (d, i) =>
                        (lim < mx) ? gy - (e.values[i] * gh / mx) : gy - (e.values[i] * gh / lim)
                    );
                    const interpolateCounts = vc * e.interpolateScale;
                    const gap = (tab * vc) / interpolateCounts;
                    const xi = Array.from({ length: interpolateCounts - e.interpolateScale + 1 }, (_, i) => (gap * i) + gx);
                    const yi = InterpolateTransform.transform(e.interpolationType, xv, yv, xi);
                    e.interpolateValues = yi.map(d => d);
                    const interpolateList = xi.map((val, i) => new Point2D.Double(val, yi[i]));
                    e.interpolates = interpolateList;
                }
            } catch (e1) {
                console.error(e1);
            }
        });
        return chartElements;
    }
}

export default InterpolateTransform;