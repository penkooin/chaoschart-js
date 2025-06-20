/**
 * <i>Chaos Chart API </i><br>
 */

import ChartConstants from './ChartConstants.js';
import { AbstractChart } from './AbstractChart.js';
import INTERPOLATE from './shape/INTERPOLATE.js';

/**
 * LineChart object
 * 
 * @author 9ins
 */
export class LineChart extends AbstractChart {
    /**
     * constructor
     * @param {*} canvas 
     * @param {*} elements 
     * @param {*} title 
     */
    constructor(canvas = null, elements, title = "", interpolateType = INTERPOLATE.LINEAR) {
        super(canvas, elements, title);
        this.CHART_ELEMENTS.setChartType(ChartConstants.CHART.LINE);
        this.LINE_SIZE = 2.0;
        this.INTERPOLATE_TYPE = interpolateType;
    }

    /**
     * Draw line Chart on an HTML5 canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     */
    drawChart(ctx = this.ctx) {

        //this.drawChartBackground(ctx);
        ctx.globalAlpha = this.CHART_ALPHA;
        ctx.drawImage(this.offscreenCanvas, 0, 0);

        if (this.CHART_ELEMENTS.getChartElementMap().size < 1) {
            return;
        }
        const xIndex = this.CHART_ELEMENTS.getXIndex();
        const minXIndex = this.CHART_ELEMENTS.getMinXIndex();

        if (minXIndex > xIndex.length) {
            for (let i = 0; i < minXIndex - xIndex.length; i++) {
                xIndex.push(null);
            }
        }

        let maxXIndex = this.CHART_ELEMENTS.getMaxXIndex() - 1;
        const elements = Object.values(this.CHART_ELEMENTS.getChartElementMap());
        const maximum = this.CHART_ELEMENTS.getMaximum();
        const tab = this.CHART_WIDTH / maxXIndex;

        ctx.beginPath();
        ctx.rect(this.CHART_X, this.CHART_Y - this.CHART_HEIGHT, this.CHART_WIDTH, this.CHART_HEIGHT);
        ctx.clip();

        this.CHART_ELEMENTS.getElementOrder().forEach((elementName) => {
            const element = this.CHART_ELEMENTS.getChartElement(elementName);
            const values = element.getValues().map((v) => Math.round(v, this.ROUND_PLACE));

            ctx.lineWidth = this.IS_SELECTION_ENABLE && this.elementHover === element
                ? this.LINE_SIZE * 1.3
                : this.LINE_SIZE;
            ctx.strokeStyle = element.getElementColor();

            if (this.IS_SELECTION_ENABLE && this.elementHover) {
                ctx.strokeStyle = element.getElementColor();
                if (this.elementHover.getElementName() === element.getElementName()) {
                    ctx.globalAlpha = 1.0;
                } else {
                    ctx.globalAlpha = 0.3;
                }
            } else {
                ctx.globalAlpha = this.CHART_ALPHA;
            }

            ctx.beginPath();
            const points = [];
            const points1 = [];

            points.push({ x: this.CHART_X, y: this.CHART_Y });
            for (let i = 0; i < values.length; i++) {
                const x = i * tab + this.CHART_X;
                const y = (maximum > this.LIMIT)
                    ? this.CHART_Y - (values[i] * this.CHART_HEIGHT) / maximum
                    : this.CHART_Y - (values[i] * this.CHART_HEIGHT) / this.LIMIT;

                points.push({ x: x, y: y });
                points1.push({ x: x + this.LINE_SIZE * 4, y: y - this.LINE_SIZE * 2 });
            }
            points.push({ x: this.CHART_X + this.CHART_WIDTH, y: this.CHART_Y - this.CHART_BORDER_SIZE })

            const path = new Path2D();
            if (this.INTERPOLATE_TYPE !== INTERPOLATE.LINEAR) {
                this.applyBezierCurve(path, points);
            } else {
                for (const point of points) {
                    path.lineTo(point.x, point.y);
                }
            }
            points1.reverse().forEach((point) => points.push(point));
            element.setShapes(points);

            ctx.stroke(path);
            ctx.closePath();

            // Draw peaks
            if (this.INTERPOLATE_TYPE === INTERPOLATE.LINEAR
                && this.IS_SHOW_PEAK
                && this.IS_SELECTION_ENABLE
                && this.elementHover
                && element.getElementName() === this.elementHover.getElementName()) {
                points.forEach((point, i) => {
                    if (this.INTERPOLATE_TYPE && i % this.INTERPOLATE_SCALE !== 0) {
                        return;
                    }
                    //peekStyle, peekPoint, thickness, radius, color, context
                    super.drawPeak(ChartConstants.PEEK_STYLE.CIRCLE, point, 2, 4, element.getElementColor(), ctx);
                });
            }
        });

        ctx.save();
        if (this.IS_SHOW_POPUP && this.elementHover) {
            this.drawPopup(this.elementHover, this.elementHover.getSelectedPoint(), ctx);
        }
        if (this.IS_SHOW_LEGEND && this.elementHover) {
            this.drawLegendHover(this.elementHover, ctx);
        }
        // if(this.mouseX !== -1 && this.mouseY !== -1) {
        //     ctx.fillText("mX: "+this.mouseX.toFixed(2)+"  mY: "+this.mouseY.toFixed(2) +" ("+this.CHART_X+":"+this.CHART_Y+")", this.mouseX, this.mouseY);
        // }
        ctx.restore();
    }

    /**
     * Check if specific position is in Chart element shapes.
     * 
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    isPointOnShapes(x, y) {
        const elements = Array.from(this.CHART_ELEMENTS.getChartElementMap().values()).reverse();
        for (const element of elements) {
            const polygon = new Path2D();
            element.getShapes().forEach(p => polygon.lineTo(p.x, p.y));
            polygon.closePath();

            let legendPoly = super.getPolygon(element.getLegendShapes(), false);

            if (legendPoly.contains(x, y)) {
                element.isInLegend = true;
                return element;
            } else if (this.ctx.isPointInPath(polygon, x, y)) {
                const unit = this.CHART_WIDTH / this.CHART_ELEMENTS.getXIndex().length;
                const index = parseInt((x - this.CHART_X) / unit);
                if (index < element.getValues().length) {
                    element.setSelectedValue(element.getValues()[index]);
                    element.setSelectedValueIndex(index);
                    element.setSelectedPoint({ x: x, y: y });
                    element.isInLegend = false;
                    return element;
                }
            } else {
                element.setSelectedValue(-1);
                element.setSelectedValueIndex(-1);
                element.setSelectedPoint(null);
                element.isInLegend = false;
            }
        }
        return null;
    }

    /**
     * Set line thickness
     * @param {number} size
     */
    setLineSize(size) {
        this.LINE_SIZE = size;
    }
}
