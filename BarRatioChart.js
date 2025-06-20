import { Polygon } from './shape/Polygon.js';
import { AbstractChart } from './AbstractChart.js';
import ChartConstants from './ChartConstants.js';

/**
 * BarRatioChart object
 * 
 * @author 9ins
 */
export class BarRatioChart extends AbstractChart {
    /**
     * constructor
     * @param {*} canvas 
     * @param {*} elements 
     * @param {*} title 
     */
    constructor(canvas, elements, title = "") {
        super(canvas, elements, title);
        this.CHART_ELEMENTS.setChartType(ChartConstants.CHART.BAR_RATIO);
    }

    /**
     * Draw bar ratio Chart
     * @param {context} ctx 
     */
    drawChart(ctx = this.ctx) {

        //this.drawChartBackground(ctx);
        ctx.globalAlpha = this.CHART_ALPHA;
        ctx.drawImage(this.offscreenCanvas, 0, 0);

        if (this.CHART_ELEMENTS.getChartElementMap().size < 1) {
            return;
        }

        const maximum = this.CHART_ELEMENTS.getMaximum();
        const minXIndex = this.CHART_ELEMENTS.getMinXIndex();
        const xIndex = [...this.CHART_ELEMENTS.getXIndex()];
        const elements = [...this.CHART_ELEMENTS.getElementOrder()].reverse();

        const indexWidth = this.CHART_WIDTH / (this.CHART_ELEMENTS.getMaxXIndex());
        const indent = indexWidth / (this.CHART_ELEMENTS.getElementCount() + 2);
        const unit = this.CHART_WIDTH / xIndex.length;
        const width = indexWidth - indent * 2;

        ctx.lineWidth = this.BORDER_SIZE;

        ctx.beginPath();
        ctx.rect(this.CHART_X, this.CHART_Y - this.CHART_HEIGHT, this.CHART_WIDTH, this.CHART_HEIGHT);
        ctx.clip();

        for (let i = 0; i < this.CHART_ELEMENTS.getXIndex().length; i++) {
            let x = i * indexWidth + indent + this.CHART_X;
            let y = this.CHART_Y;
            const shapes = [];
            let cnt = 0;
            elements.forEach((elementName, j) => {
                const element = this.CHART_ELEMENTS.getChartElementMap().get(elementName);
                let sum = element.getValues().reduce((acc, curr) => acc + curr, 0);
                const value = (element.getValues()[i] * this.VALUE_DIVISION_RATIO).toFixed(this.ROUND_PLACE);
                if (value < 0) {
                    return;
                }
                const height = maximum < this.LIMIT ? (value * this.CHART_HEIGHT) / this.LIMIT : (value * this.CHART_HEIGHT) / maximum;
                y -= height;

                ctx.beginPath();

                if (this.IS_SHOW_SHADOW) {
                    const shadowX = Math.cos((-this.SHADOW_ANGLE * Math.PI) / 180) * this.SHADOW_DIST + x;
                    const shadowY = Math.sin((-this.SHADOW_ANGLE * Math.PI) / 180) * this.SHADOW_DIST + y;

                    ctx.globalAlpha = this.SHADOW_ALPHA;
                    ctx.fillStyle = this.SHADOW_COLOR;
                    ctx.fillRect(shadowX, shadowY, width, height - this.SHADOW_DIST);
                }
                if (this.IS_SELECTION_ENABLE && this.elementHover) {
                    ctx.strokeStyle = element.getElementColor();
                    if (this.elementHover.getElementName() === element.getElementName()) {
                        ctx.globalAlpha = this.CHART_ALPHA;
                    } else {
                        ctx.globalAlpha = 0.2;
                    }

                } else {
                    ctx.globalAlpha = this.CHART_ALPHA;
                }

                ctx.fillStyle = element.getElementColor();
                ctx.fillRect(x, y, width, height);
                ctx.lineWidth = this.CHART_BORDER_SIZE;
                ctx.strokeStyle = this.CHART_BORDER_COLOR;
                ctx.strokeRect(x, y, width, height);
                ctx.stroke();

                if (this.IS_SHOW_BORDER) {
                    ctx.strokeRect(x, y, width, height);
                }

                const shapes = element.getShapes();
                shapes.push([{ x: x, y: y }, { x: x, y: y + height }, { x: x + width, y: y + height }, { x: x + width, y: y }]);
                while (shapes.length > element.getValues().length) {
                    shapes.shift();
                }
            });
        }

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
     * Whether x, y is in Polygon
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    isPointOnShapes(x, y) {
        const elements = Array.from(this.CHART_ELEMENTS.getChartElementMap().values());
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            const shapes = element.getShapes();

            for (let j = 0; j < shapes.length; j++) {
                let elementPoly = new Polygon(shapes[j]);
                let legendPoly = super.getPolygon(element.getLegendShapes(), false);

                if (legendPoly.contains(x, y)) {
                    element.isInLegend = true;
                    return element;
                } else if (elementPoly.contains(x, y)) {
                    element.setSelectedValue(element.getValues()[j]);
                    element.setSelectedValueIndex(j);
                    element.setSelectedPoint({ x: x, y: y });
                    element.isInLegend = false;
                    return element;
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
