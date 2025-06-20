/**
 * <i>Chaos Chart API </i><br>
 */

import { Polygon } from './shape/Polygon.js';
import { AbstractChart } from './AbstractChart.js';
import ChartConstants from './ChartConstants.js';

/**
 * BarChart object
 * 
 * @author 9ins
 */
export class BarChart extends AbstractChart {
    /**
     * constructor
     * @param {} canvas 
     * @param {*} elements 
     * @param {*} title 
     */
    constructor(canvas, elements, title = "",) {
        super(canvas, elements, title);
        this.CHART_ELEMENTS.setChartType(ChartConstants.CHART.BAR);
    }

    /**
     * Draw the bar Chart on the canvas
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

        while (xIndex.length < minXIndex) {
            xIndex.push(null);
        }
        const elementMap = this.CHART_ELEMENTS.getChartElementMap();
        const maximum = this.CHART_ELEMENTS.getMaximum();

        const indexWidth = this.CHART_WIDTH / (this.CHART_ELEMENTS.getMaxXIndex());
        const barWidth = indexWidth / (this.CHART_ELEMENTS.getElementCount() + 2);

        ctx.rect(this.CHART_X, this.CHART_Y - this.CHART_HEIGHT, this.CHART_WIDTH, this.CHART_HEIGHT);
        ctx.clip();

        ctx.beginPath();
        ctx.lineWidth = this.BORDER_SIZE;

        this.CHART_ELEMENTS.getElementOrder().forEach((elementName, i) => {
            const element = elementMap.get(elementName);
            const values = element.getValues().map(v => Math.round(v));
            const shapes = [];

            values.forEach((value, j) => {
                const x = (this.CHART_X + (j * indexWidth) + barWidth) + i * barWidth;
                const height = (this.LIMIT < maximum) ? value * this.CHART_HEIGHT / maximum : (value * this.CHART_HEIGHT) / this.LIMIT;
                const y = this.CHART_Y - height;

                if (this.IS_SELECTION_ENABLE && this.elementHover) {
                    if (this.elementHover.getElementName() === element.getElementName()) {
                        ctx.globalAlpha = this.CHART_ALPHA;
                        //ctx.fillText("("+x.toFixed(2)+":"+y.toFixed(2)+")", x, y-3);
                    } else {
                        ctx.globalAlpha = 0.2;
                    }
                } else {
                    ctx.globalAlpha = this.CHART_ALPHA;
                }
                ctx.fillStyle = element.getElementColor();
                ctx.fillRect(x, y, barWidth, height);

                if (this.IS_SHOW_BORDER) {
                    ctx.lineWidth = this.BORDER_SIZE;
                    ctx.fillStyle = this.CHART_BORDER_COLOR;
                    //ctx.globalAlpha = this.CHART_BORDER_ALPHA;
                    ctx.strokeRect(x, y, barWidth, height);
                }
                shapes.push([{ x: x, y: y }, { x: x + barWidth, y: y }, { x: x + barWidth, y: y + height }, { x: x, y: y + height }]);
            });
            element.setShapes(shapes);
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
     * Processs chart shape related with x, y
     * @param {} x 
     * @param {*} y 
     * @returns 
     */
    isPointOnShapes(x, y) {
        const elements = Array.from(this.CHART_ELEMENTS.getChartElementMap().values());
        for (const element of elements) {
            const shapes = element.getShapes();
            for (let j = 0; j < shapes.length; j++) {
                let elementPoly = new Polygon(shapes[j]);
                let legendPoly = this.getPolygon(element.getLegendShapes(), false);

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

