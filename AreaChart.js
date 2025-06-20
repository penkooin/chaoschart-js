/**
 * <i>Chaos Chart API </i><br>
 */

import { AbstractChart } from './AbstractChart.js';
import { ChartUtility } from './ChartUtility.js';
import { INTERPOLATE } from './shape/INTERPOLATE.js';
import ChartConstants from './ChartConstants.js';

/**
 * AreaChart object
 * 
 * @author 9ins
 */
export class AreaChart extends AbstractChart {
    /**
     * constructor
     * @param {*} canvas 
     * @param {*} elements 
     * @param {*} title 
     */
    constructor(canvas, elements, title = "", interpolateType = INTERPOLATE.LINEAR) {
        super(canvas, elements, title);

        this.CHART_ELEMENTS.setChartType(ChartConstants.CHART.AREA);
        this.INTERPOLATE_TYPE = interpolateType;
    }

    /**
     * Draw the area Chart on the canvas
     */
    drawChart(ctx = this.ctx) {

        ctx.globalAlpha = this.CHART_ALPHA;
        ctx.drawImage(this.offscreenCanvas, 0, 0);

        if (this.CHART_ELEMENTS.getChartElementMap().size < 1) {
            return;
        }

        const elementMap = this.CHART_ELEMENTS.getChartElementMap();
        const maximum = this.CHART_ELEMENTS.getMaximum();
        const maxXIndex = this.CHART_ELEMENTS.getMaxXIndex() - 1;
        const intent = this.CHART_WIDTH / maxXIndex;

        ctx.rect(this.CHART_X, this.CHART_Y - this.CHART_HEIGHT, this.CHART_WIDTH, this.CHART_HEIGHT);
        ctx.clip();

        ctx.beginPath();

        ctx.lineWidth = this.BORDER_SIZE;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        this.CHART_ELEMENTS.getElementOrder().forEach((elementName, i) => {
            const element = elementMap.get(elementName);
            const valueList = element.getValues().map(v => ChartUtility.roundAvoid(v, this.ROUND_PLACE));

            const points = [];
            const path = new Path2D();
            path.moveTo(this.CHART_X, this.CHART_Y);
            points.push({ x: this.CHART_X, y: this.CHART_Y });
            valueList.forEach((value, i) => {
                if (value < 0) {
                    return;
                }
                const x = i * intent + this.CHART_X;
                const y = this.getCoordinateY(value);
                points.push({ x: x, y: y });

                if (this.INTERPOLATE_TYPE === INTERPOLATE.LINEAR) {
                    path.lineTo(x, y);
                }
            });
            points.push({ x: this.CHART_X + this.CHART_WIDTH, y: this.CHART_Y - this.CHART_BORDER_SIZE })

            if (this.INTERPOLATE_TYPE !== INTERPOLATE.LINEAR) {
                this.applyBezierCurve(path, points);
            }

            path.lineTo(this.CHART_X + this.CHART_WIDTH, this.CHART_Y - this.CHART_BORDER_SIZE);
            path.closePath();

            // Handle selection
            if (this.IS_SELECTION_ENABLE && this.elementHover && this.elementHover.elementName === element.getElementName()) {
                if (this.SEL_BORDER === ChartConstants.SELECTION_BORDER.LINE) {
                    ctx.lineWidth = this.BORDER_SIZE;
                } else if (this.SEL_BORDER === this.SELECTION_BORDER.DOT) {
                    ctx.setLineDash([this.BORDER_SIZE * 2]);
                }
                ctx.globalAlpha = 1.0;
                ctx.strokeStyle = element.getElementColor();
            } else {
                ctx.globalAlpha = this.elementHover ? 0.1 : this.CHART_ALPHA;
                ctx.strokeStyle = element.getElementColor();
            }
            let x = 0;
            let y = 0;
            points.push({ x: x, y: this.CHART_Y + this.CHART_HEIGHT });
            points.push({ x: this.CHART_X, y: this.CHART_Y + this.CHART_HEIGHT });
            element.setShapes(points);

            path.lineTo(x, this.CHART_Y);
            path.closePath();

            // Fill the Chart element
            ctx.fillStyle = element.getElementColor();
            ctx.fill(path);

            // Draw border
            if (this.IS_SHOW_BORDER) {
                ctx.lineWidth = this.BORDER_SIZE;
                //ctx.globalAlpha = this.CHART_BORDER_ALPHA;
                ctx.strokeStyle = this.CHART_BORDER_COLOR;
                ctx.stroke(path);
            }
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
        if (this.IS_SHOW_POPUP && this.selectedElement) {
            this.drawPopup(this.selectedElement, this.selectedElement.getSelectedPoint(), ctx);
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
     * Checks if a specific point is on chart element shapes
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    isPointOnShapes(x, y, ctx = this.ctx) {
        const elements = Array.from(this.CHART_ELEMENTS.getChartElementMap().values());
        for (const element of elements) {
            const polygon = new Path2D();
            element.getShapes().forEach(p => polygon.lineTo(p.x, p.y));
            polygon.closePath();
            const legendPoly = this.getPolygon(element.getLegendShapes(), false);
            if (legendPoly.contains(x, y)) {
                element.isInLegend = true;
                return element;

            } else if (ctx.isPointInPath(polygon, x, y)) {
                const unit = this.CHART_WIDTH / this.CHART_ELEMENTS.getXIndex().length;
                const index = parseInt((x - this.CHART_X) / unit);
                if (index < element.getValues().length) {
                    element.setSelectedValue(element.getValues()[index]);
                    element.setSelectedPoint({ x: x, y: y });
                    element.setSelectedValueIndex(index);
                    element.isInLegend = false;
                    return element;
                }
            } else {
                if (this.selectedElement != null) {
                    return this.selectedElement;
                } else {
                    element.setSelectedValue(-1);
                    element.setSelectedValueIndex(-1);
                    element.setSelectedPoint(null);
                    element.isInLegend = false;
                }
            }
        }
        return null;
    }
}
