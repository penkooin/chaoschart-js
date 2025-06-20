/**
 * <i>Chaos Chart API </i><br>
 */
import ChartUtility from "./ChartUtility.js";
import { AbstractChart } from "./AbstractChart.js";
import ChartConstants from './ChartConstants.js';

/**
 * CircleChart object
 * 
 * @author 9ins
 */
export class CircleChart extends AbstractChart {
    /**
     * constructor
     * @param {*} canvas 
     * @param {*} elements 
     * @param {*} title 
     * @param {*} isOval 
     */
    constructor(canvas = null, elements = null, title = "", isOval = false) {
        super(canvas, elements, title);
        this.CHART_ELEMENTS.setChartType(ChartConstants.CHART.CIRCLE);

        this.isShowPercent = false;
        this.isShowValue = true;
        this.isOval = isOval;

        super.setShowChartXY(false);
        super.setShowGridX(false);
        super.setShowGridY(false);
        super.setShowIndexX(false);
        super.setShowIndexY(false);
    }

    /**
     * Draw circle chart
     * @param {*} ctx 
     * @returns 
     */
    drawChart(ctx = this.ctx) {

        //this.drawChartBackground(ctx);
        ctx.globalAlpha = this.CHART_ALPHA;
        ctx.drawImage(this.offscreenCanvas, 0, 0);

        if (this.CHART_ELEMENTS.getChartElementMap().size < 1) {
            return;
        }

        const elementMap = this.CHART_ELEMENTS.getChartElementMap();
        const elements = Object.keys(elementMap);
        const xIndex = this.CHART_ELEMENTS.getXIndex();
        const minXIndex = this.CHART_ELEMENTS.getMinXIndex();

        // Initialize dimensions
        const circleWidth = this.CHART_WIDTH - (this.INDENT_LEFT + this.INDENT_RIGHT);
        const circleHeight = this.CHART_HEIGHT - (this.INDENT_TOP + this.INDENT_BOTTOM);
        const x = this.CHART_X + this.INDENT_LEFT;
        const y = this.CHART_Y - this.CHART_HEIGHT + this.INDENT_BOTTOM;

        // Calculate total value
        const values = elementMap.values().map(e => e.getValues()[0]);
        const total = values.reduce((acc, v) => acc + v, 0);

        let tempAngle = 90;

        ctx.beginPath();
        ctx.rect(this.CHART_X, this.CHART_Y - this.CHART_HEIGHT, this.CHART_WIDTH, this.CHART_HEIGHT);
        ctx.clip();

        // Draw shadow if enabled
        // if (this.IS_SHOW_SHADOW) {
        //     const shadowX = x + Math.cos((-this.SHADOW_ANGLE * Math.PI) / 180) * 30;//this.SHADOW_DIST;
        //     const shadowY = y + Math.sin((-this.SHADOW_ANGLE * Math.PI) / 180) * this.SHADOW_DIST;

        //     ctx.fillStyle = this.SHADOW_COLOR;
        //     ctx.globalAlpha = this.SHADOW_ALPHA;
        //     if(this.isOval) {
        //         ctx.ellipse(shadowX + circleWidth / 2, shadowY + circleHeight / 2, circleWidth / 2, circleHeight / 2, 0, 0, 2 * Math.PI);
        //     } else {
        //         ctx.arc(shadowX + circleWidth / 2, shadowY + circleHeight / 2, (circleHeight > circleWidth ?  circleWidth / 2 : circleHeight / 2), 0, 0, 2 * Math.PI);
        //     }
        //     ctx.fill();     
        // }

        ctx.lineWidth = this.BORDER_SIZE;
        // Draw Chart elements
        this.CHART_ELEMENTS.getElementOrder().forEach((elementName, idx) => {
            const element = elementMap.get(elementName);
            const value = element.getValues()[0];
            if (value < 0) {
                return;
            }
            const angle = (value * 360) / total * -1;

            ctx.beginPath();
            ctx.moveTo(x + circleWidth / 2, y + circleHeight / 2);

            // Draw arc
            ctx.fillStyle = element.getElementColor();

            const start = this.toRadians(tempAngle);
            const end = this.toRadians(tempAngle + angle);
            const cx = x + circleWidth / 2;
            const cy = y + circleHeight / 2;
            const rx = circleWidth / 2;
            const ry = circleHeight / 2;
            const r = (circleHeight > circleWidth ? rx : ry);
            const unit = angle / 10;
            const shapes = [];

            if (this.IS_SELECTION_ENABLE && this.elementHover) {
                if (this.elementHover.getElementName() === element.getElementName()) {
                    ctx.setLineDash(this.SEL_BORDER == 'DOT' ? [this.BORDER_SIZE * 2] : []);
                    ctx.globalAlpha = this.CHART_ALPHA;
                } else {
                    ctx.setLineDash([]);
                    ctx.strokeStyle = element.getElementColor();
                    ctx.globalAlpha = this.CHART_ALPHA - 0.6;
                }
            } else {
                ctx.globalAlpha = this.CHART_ALPHA;
            }

            let x1, y1;
            for (let i = 0; i < 10; i++) {
                const ang = (tempAngle + unit * i) / 180.0 * Math.PI * -1;
                x1 = cx + Math.cos(-ang) * (this.isOval ? rx : r);
                y1 = cy + Math.sin(-ang) * (this.isOval ? ry : r);
                shapes.push({ x: x1, y: y1 });
            }
            if (this.isOval) {
                ctx.ellipse(cx, cy, rx, ry, 0, start, end, true);
            } else {
                ctx.arc(cx, cy, r, start, end, true);
            }
            shapes.push({ x: cx, y: cy });
            element.setShapes(shapes);
            ctx.fill();
            ctx.lineTo(cx, cy);
            ctx.strokeStyle = this.CHART_BORDER_COLOR;
            ctx.lineWidth = this.CHART_BORDER_SIZE + 1;
            ctx.globalAlpha = this.CHART_BORDER_ALPHA - 0.2;
            ctx.stroke();
            ctx.beginPath();

            tempAngle += angle;
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
     * Whether x, y is in shape
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
            const legendPoly = this.getPolygon(element.getLegendShapes(), false);

            if (legendPoly.contains(x, y)) {
                element.isInLegend = true;
                return element;
            } else if (this.ctx.isPointInPath(polygon, x, y)) {
                //console.log(element.getShapes());   
                //console.log("   x: "+x+"   y: "+y);                
                const center = ChartUtility.getPolygonCenterXY(element.getShapes());
                element.setSelectedValue(element.getValues()[0]);
                element.setSelectedPoint(center);
                element.setSelectedValueIndex(0);
                element.isInLegend = false;
                return element;
            } else {
                element.setSelectedValue(-1);
                element.setSelectedPoint(null);
                element.setSelectedValueIndex(-1);
                element.isInLegend = false;
            }
        }
        return null;
    }

    /**
     * To change value to radian
     * @param {*} degrees 
     * @returns 
     */
    toRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }

    /**
     * Whether rectangle is in arc
     * @param {*} arc 
     * @param {*} rect 
     * @returns 
     */
    isInArc(arc, rect) {
        return arc.contains(rect);
    }

    /**
     * Set whether percentage string be shown
     * @param {*} is 
     */
    setShowPercent(is) {
        this.isShowPercent = is;
    }

    /**
     * Set whether value string be shown
     * @param {*} is 
     */
    setShowValue(is) {
        this.isShowValue = is;
    }
}
