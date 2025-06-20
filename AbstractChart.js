/**
 * <i>Chaos Chart API </i><br>
 */
import { Chart } from './Chart.js';
import { Polygon } from './shape/Polygon.js';
import ChartConstants from './ChartConstants.js';

/**
 * AbstractChart
 * 
 * @author 9ins
 */
export class AbstractChart extends Chart {
    /**
     * Constructor
     * @param {*} canvas 
     * @param {*} chartElements 
     * @param {*} title 
     */
    constructor(canvas = null, chartElements = null, title = '') {
        super(canvas.width, canvas.height, chartElements, title);
        if (!canvas) {
            throw new Error("Canvas is must specified on parameter of AbstractChart obejct!!!");
        }
        this.startOffsetX = 0;
        this.startOffsetY = 0;
        this.selectedElement = null;
        this.elementHover = null;
        this.colorPickerOpen = false;
        this.selectedCallback = [];

        this.mouseX = -1;
        this.mouseY = -1;

        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        if (!this.offscreenCanvas) {
            this.offscreenCanvas = document.createElement("canvas");
            this.offscreenCtx = this.offscreenCanvas.getContext("2d");
            this.offscreenCanvas.width = canvas.width;
            this.offscreenCanvas.height = canvas.height;
            this.offscreenCtx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawChartBackground(this.offscreenCtx);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        ////////////////////////////////////////////////////////////////////////////////
        // Canvas event handling
        ////////////////////////////////////////////////////////////////////////////////

        this.canvas.addEventListener('resize', (event) => {
            const rect = canvas.getBoundingClientRect();
            this.resizeImage(rect.width, rect.height);
        });

        this.canvas.addEventListener('mousedown', (event) => {
            this.mouseX = event.offsetX - 5;
            this.mouseY = event.offsetY - 5
            const element = this.isPointOnShapes(this.mouseX, this.mouseY);
            if (event.button === 0) {
                if (!this.selectedElement) {
                    if (element || (element && element.isInLegend)) {
                        this.selectedElement = element;
                    } else {
                        this.selectedElement = null;
                    }
                } else {
                    if (element && element.isInLegend) {
                        this.selectedElement = element;
                    } else {
                        // set value to element on mouse x, y
                        this.setValueToMouse(this.mouseX, this.mouseY);
                        this.selectedElement.setSelectedPoint({ x: this.mouseX, y: this.mouseY });
                        this.dispatchToSelectedCallback(this.selectedElement);
                    }
                }
            } else if (event.button === 2) {
                if (element && element.isInLegend) {
                    this.showColorPicker(event, element);
                } else {
                    this.selectedElement = null;
                }
            }
            this.drawChart();
        });

        this.canvas.addEventListener('mouseup', (event) => {
        });

        this.canvas.addEventListener('mousemove', (event) => {
            this.mouseX = event.offsetX - 5;
            this.mouseY = event.offsetY - 5
            const element = this.isPointOnShapes(this.mouseX, this.mouseY);
            if (!this.selectedElement) {
                if (element !== null) {
                    //Mouse on legend
                    if (element.isInLegend) {
                        if ((this.elementHover && this.elementHover !== element) || !this.elementHover) {
                            this.elementHover = element;
                            // this.drawChart();
                        }
                    } else {
                        //Mouse on element
                        if ((this.elementHover && this.elementHover !== element) || !this.elementHover) {
                            this.elementHover = element;
                            // this.drawChart();                    
                        }
                    }
                } else {
                    this.elementHover = null;
                }
            }
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.drawChart();
            }, 7);
        });

        //this.canvas.addEventListener('dblclick', (event) => this.mouseDoubleClicked(event));  

        this.canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.mouseX = event.offsetX - 5;
            this.mouseY = event.offsetY - 5
            const delta = event.deltaY > 0 ? -this.WHEEL_DELTA : this.WHEEL_DELTA;
            if (this.selectedElement) {
                const index = this.getMouseIndex(this.mouseX, this.mouseY);
                const idx = this.getChartType() === ChartConstants.CHART.CIRCLE ? 0 : index;
                const value = this.selectedElement.getValues()[idx] + delta;
                if (value > 0) {
                    this.selectedElement.getValues()[idx] = value;
                    this.selectedElement.setSelectedValue(value);
                    this.selectedElement.setSelectedPoint({ x: this.mouseX, y: this.mouseY });
                    this.dispatchToSelectedCallback(this.selectedElement);
                }
            }
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.drawChart();

            }, 7);
        }, { passive: false });

        this.canvas.addEventListener('dblclick', (event) => {
        });

        this.canvas.addEventListener('visibilitychange', (event) => () => {
            if (document.visibilityState === "visible") {
                this.drawChart();
            }
        });

        this.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    /**
     * Draw basic chart elements
     * @param {*} offscreenCtx 
     */
    drawChartBackground(offscreenCtx) {
        this.initChart(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.sweepCanvas(this.CANVAS_WIDTH, this.CANVAS_HEIGHT, offscreenCtx);

        const maxValue = this.CHART_ELEMENTS.getMaximum();
        const xIndex = this.CHART_ELEMENTS.getXIndex();
        const yIndex = this.CHART_ELEMENTS.getYIndex();

        if (this.IS_SHOW_BG_GRID) {
            this.drawGraphBackground(this.CHART_WIDTH, this.CHART_HEIGHT, 12, offscreenCtx);
        }
        if (this.IS_SHOW_BG) {
            this.drawChartBg(offscreenCtx);
        }
        if (this.IS_SHOW_CANVAS_BORDER) {
            this.drawBgBorder(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT, offscreenCtx);
        }
        if (this.IS_SHOW_CHART_BORDER) {
            this.drawChartBorder(this.CHART_X, this.CHART_Y, this.CHART_WIDTH, this.CHART_HEIGHT, offscreenCtx);
        }
        if (this.IS_SHOW_CHART_XY) {
            this.drawXY(this.CHART_X, this.CHART_Y, offscreenCtx); // draw x/y axis
        }
        if (this.IS_SHOW_INDEX_X) {
            this.drawLabelX(xIndex, offscreenCtx); // draw x indexes
        }
        if (this.IS_SHOW_INDEX_Y) {
            this.drawLabelY(this.CHART_ELEMENTS.getYIndex(), maxValue, offscreenCtx);
        }
        if (this.IS_SHOW_GRID_X) {
            this.drawGridX(xIndex, this.GRID_STYLE, offscreenCtx);
        }
        if (this.IS_SHOW_GRID_Y) {
            this.drawGridY(yIndex, this.GRID_STYLE, maxValue, offscreenCtx);
        }
        if (this.IS_SHOW_GRID_Y) {
            this.drawGridY(this.CHART_ELEMENTS.getYIndex(), ChartConstants.GRID.DOT, maxValue, offscreenCtx);
        }
        if (this.IS_SHOW_TITLE) {
            this.drawTitle(this.CHART_X, this.CHART_Y, this.TITLE, this.TITLE_FONT_SIZE, offscreenCtx);
            this.drawRight(offscreenCtx);
        }
        if (this.IS_SHOW_LEGEND) {
            const elements = this.CHART_ELEMENTS.getElementOrder().map(n => this.CHART_ELEMENTS.getChartElementMap().get(n));
            this.drawLegend(elements, offscreenCtx);
        }
    }

    /**
     * Show color picker
     * @param {*} event 
     * @param {*} element 
     */
    showColorPicker(event, element) {
        this.colorDiv = document.createElement('div');
        this.colorDiv.style.position = 'absolute';
        this.colorDiv.style.padding = '5px';
        this.colorDiv.style.border = '2px solid black';
        this.colorDiv.style.borderRadius = '5px';
        this.colorDiv.style.backgroundColor = '#fff';
        this.colorDiv.style.boxShadow = '0px 0px 5px rgba(0,0,0,0.3)';
        this.colorDiv.style.display = 'none'; // Initially hidden

        this.colorInput = document.createElement('input');
        this.colorInput.setAttribute("type", "color");
        this.colorInput.style.border = 'none';
        this.colorInput.style.width = '40px';
        this.colorInput.style.height = '40px';
        this.colorInput.style.cursor = 'pointer';
        this.colorInput.value = this.toHexColorString(this.extractRGB(element.getElementColor()));

        this.colorDiv.appendChild(this.colorInput);
        document.body.appendChild(this.colorDiv); // Append to document

        this.colorDiv.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
        this.colorInput.addEventListener('change', (event) => {
            this.colorDiv.style.display = 'none'; // Hide after selection
            element.setElementColor(event.target.value);
            for (const callback of this.selectedCallback) {
                callback(element);
            }
            this.drawChart();
        });
        this.colorDiv.addEventListener('mouseout', () => {
            this.colorDiv.style.display = 'none';
            this.colorPickerOpen = false;
        });
        this.colorDiv.style.left = `${event.pageX - 10}px`;
        this.colorDiv.style.top = `${event.pageY - 10}px`;
        this.colorDiv.style.display = 'block'; // Make visible
    }


    /**
     * Initialize Chart
     * @param {*} width 
     * @param {*} height 
     * @returns 
     */
    initChart(width, height) {
        if (width <= 0 || height <= 0) {
            return;
        }
        this.setImgSize(width, height);
        this.CHART_WIDTH = this.CANVAS_WIDTH - (this.INDENT_LEFT + this.INDENT_RIGHT);
        this.CHART_HEIGHT = this.CANVAS_HEIGHT - (this.INDENT_TOP + this.INDENT_BOTTOM);
        this.CHART_X = this.CANVAS_WIDTH - (this.INDENT_RIGHT + this.CHART_WIDTH);
        this.CHART_Y = this.CANVAS_HEIGHT - this.INDENT_BOTTOM;
        this.LEGEND_X = this.CHART_X + this.CHART_WIDTH - this.LEGEND_FONT_SIZE;
        this.LEGEND_Y = this.CHART_Y - this.CHART_HEIGHT + this.LEGEND_FONT_SIZE;
        this.setElementsInterpolates(this.INTERPOLATE_TYPE, this.INTERPOLATE_SCALE);
    }

    /**
     * Sweep background
     * @param {*} width 
     * @param {*} height 
     */
    sweepCanvas(width, height, ctx = this.ctx) {
        ctx.beginPath();
        ctx.globalAlpha = this.CHART_BG_ALPHA;
        ctx.fillStyle = this.CANVAS_BG_COLOR;
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Spread row col dots
     * @param {*} width 
     * @param {*} height 
     * @param {*} ctx 
     */
    drawGraphBackground(width, height, dotIndent = 12, ctx = this.ctx) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = this.BORDER_COLOR;
        ctx.globalAlpha = this.BG_GRID_ALPHA;

        const col = (this.CHART_WIDTH / dotIndent * Math.pow(10, 2)) / Math.pow(10, 2);
        const row = (this.CHART_HEIGHT / dotIndent * Math.pow(10, 2)) / Math.pow(10, 2);
        for (let i = 0; i < row; i++) {
            ctx.moveTo(this.CHART_X, this.CHART_Y - i * dotIndent);
            ctx.lineTo(this.CHART_X + this.CHART_WIDTH, this.CHART_Y - i * dotIndent);
        }
        for (let j = 0; j < col; j++) {
            ctx.moveTo(this.CHART_X + j * dotIndent, this.CHART_Y);
            ctx.lineTo(this.CHART_X + j * dotIndent, this.CHART_Y - this.CHART_HEIGHT);
        }
        ctx.setLineDash([]);
        ctx.stroke();
    }

    /**
     * Draw background rectangle
     * @param {*} x 
     * @param {*} y 
     * @param {*} width 
     * @param {*} height 
     * @param {*} bgColor 
     */
    drawChartBg(x, y, width, height, ctx = this.ctx) {
        ctx.beginPath();
        ctx.globalAlpha = this.CHART_BG_ALPHA;
        ctx.fillStyle = this.CHART_BG_COLOR;
        ctx.fillRect(x, y, width, height);
    }

    /**
     * Draw background border
     * @param {*} x 
     * @param {*} y 
     * @param {*} width 
     * @param {*} height 
     */
    drawBgBorder(x, y, width, height, ctx = this.ctx) {
        ctx.beginPath();
        ctx.globalAlpha = this.CANVAS_BG_ALPHA;
        ctx.strokeStyle = this.CANVAS_BORDER_COLOR;
        ctx.lineWidth = this.CANVAS_BORDER_SIZE;
        ctx.strokeRect(x + ctx.lineWidth / 2, y - ctx.lineWidth / 2, width - ctx.lineWidth, height - ctx.lineWidth);
    }

    /**
     * Draw chart border
     * @param {*} x 
     * @param {*} y 
     * @param {*} width 
     * @param {*} height 
     */
    drawChartBorder(x, y, width, height, ctx = this.ctx) {
        ctx.beginPath();
        ctx.globalAlpha = this.CHART_BORDER_ALPHA;
        ctx.strokeStyle = this.CHART_BG_COLOR;
        ctx.lineWidth = this.CHART_BORDER_SIZE;
        ctx.strokeRect(x, y - height, width - ctx.lineWidth, height - ctx.lineWidth);
    }

    /**
     * Draw X, Y axis
     * @param {*} x 
     * @param {*} y 
     */
    drawXY(x, y, ctx = this.ctx) {
        ctx.beginPath();
        ctx.globalAlpha = this.CHART_XY_ALPHA;
        ctx.strokeStyle = this.CHART_XY_COLOR;
        ctx.lineWidth = this.CHART_XY_SIZE;
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - this.CHART_HEIGHT);
        ctx.moveTo(x, y);
        ctx.lineTo(x + this.CHART_WIDTH, y);
        ctx.stroke();
    }

    /**
     * To draw title
     * @param {string} title
     * @param {number} fontSize
     */
    drawTitle(x, y, title, fontSize, ctx = this.ctx) {
        ctx.beginPath();
        ctx.globalAlpha = this.TITLE_FONT_ALPHA;
        const scale = this.CHART_WIDTH * (this.SCALED_WIDTH) / (this.CANVAS_WIDTH * 6);
        const fm = this.setFont(title, scale * fontSize, 'bold', this.FONT_NAME, ctx);
        const ascent = fm.actualBoundingBoxAscent * 2;
        ctx.fillStyle = this.TITLE_FONT_COLOR;
        if (this.IS_SHOW_TITLE_SHADOW) {
            ctx.strokeStyle = this.TITLE_FONT_COLOR;
            ctx.fillText(title, this.CHART_X + 17, this.CHART_Y - this.CHART_HEIGHT + ascent + 2);
        }
        ctx.fillText(title, this.CHART_X + 15, this.CHART_Y - this.CHART_HEIGHT + ascent);
    }

    /**
     * Interpolate path points
     * @param {} points 
     * @param {*} interpolateMethod 
     */
    applyBezierCurve(path, points) {
        for (let i = 1; i < points.length; i++) {
            let prev = points[i - 1];
            let curr = points[i];

            const cp1X = prev.x + (curr.x - prev.x) * 0.2;
            const cp1Y = prev.y - 50;  // Adjust height                
            const cp2X = prev.x + (curr.x - prev.x) * 0.45;
            const cp2Y = curr.y + 50;

            path.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, curr.x - (curr.x - prev.x) * 0.2, curr.y);
        }
    }

    /**
     * Draw half algorithm curve
     * @param {*} path 
     * @param {*} shape 
     */
    drawHalfCurve(path, shape) {
        for (let i = 1; i < shape.length - 2; i++) {
            for (let t = 0; t <= 1; t += 0.1) { // Adjust step for smoothness
                let x = this.catmullRom(shape[i - 1].x, shape[i].x, shape[i + 1].x, shape[i + 2].x, t);
                let y = this.catmullRom(shape[i - 1].y, shape[i].y, shape[i + 1].y, shape[i + 2].y, t);
                path.lineTo(x, y);
            }
        }
    }

    /**
     * Interpolate function
     * @param {*} p0 
     * @param {*} p1 
     * @param {*} p2 
     * @param {*} p3 
     * @param {*} t 
     * @returns 
     */
    catmullRom(p0, p1, p2, p3, t) {
        return 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
        );
    }

    /**
     * Set value on mouse pointer
     * @param {*} mx 
     * @param {*} my 
     */
    setValueToMouse(mx, my) {
        if (this.selectedElement) {
            const index = this.getMouseIndex(mx, my);
            const newValue = (this.CHART_HEIGHT - my) / (this.CHART_HEIGHT / this.LIMIT);
            this.selectedElement.getValues()[index] = newValue;
            this.selectedElement.setSelectedValue(newValue);
        }
    }

    /**
     * Get mouse point value
     * @param {*} mx 
     * @param {*} my 
     * @returns 
     */
    getMouseValue(mx, my) {
        // const index = this.getMouseIndex(mx, my);
        // const indexValue = this.elementHover.getValues()[index] * (this.CHART_HEIGHT / this.LIMIT) ;
        const mouseValue = (this.CHART_HEIGHT - my) / (this.CHART_HEIGHT / this.LIMIT);
        //const delta =  indexValue - mouseValue;
        return mouseValue;
    }

    /**
     * Get index on mouse position
     * @param {*} cx 
     * @param {*} cy 
     */
    getMouseIndex(cx, cy) {
        const indexCnt = this.CHART_ELEMENTS.getMaxXIndex();
        const indexWidth = this.CHART_WIDTH / indexCnt;
        for (let i = 0; i < indexCnt; i++) {
            const x1 = this.CHART_X + i * indexWidth;
            const y1 = this.CHART_Y;
            const w = indexWidth;
            const h = this.CHART_HEIGHT;
            const polygon = new Polygon([{ x: x1, y: y1 }, { x: x1, y: y1 - h }, { x: x1 + w, y: y1 - h }, { x: x1 + w, y: y1 }]);
            if (polygon.contains(cx, cy)) {
                return i;
            }
        }
        return -1;
    };

    /**
     * Get y coordinate for value
     * @param {*} value 
     * @returns 
     */
    getCoordinateY(value) {
        const maximum = this.CHART_ELEMENTS.getMaximum();
        const y = (this.LIMIT < maximum)
            ? this.CHART_Y - (value / maximum) * this.CHART_HEIGHT
            : this.CHART_Y - (value / this.LIMIT) * this.CHART_HEIGHT;
        return y;
    }

    /**
     * Dispatch element to callback function of registered object
     * @param {*} selectedElement 
     */
    dispatchToSelectedCallback(selectedElement) {
        for (const callback of this.selectedCallback) {
            callback(selectedElement);
        }
    }

    /**
     * Draw peek point shape on element value
     * @param {string} peekStyle
     * @param {{x: number, y: number}} peekPoint
     * @param {number} thickness
     * @param {number} radius
     * @param {string} color
     */
    drawPeak(peekStyle, peekPoint, thickness, radius, color, ctx = this.ctx) {
        ctx.beginPath();
        ctx.globalAlpha = this.LEGEND_BG_ALPHA;
        ctx.fillStyle = color;
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        ctx.beginPath();
        if (peekStyle === 'CIRCLE') {
            ctx.arc(peekPoint.x, peekPoint.y, radius, 0, Math.PI * 2);
        } else if (peekStyle === 'RECTANGLE') {
            ctx.rect(peekPoint.x - radius, peekPoint.y - radius / 2, radius * 2, radius * 2);
        }
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    /**
     * Draw pop up
     * @param {Object} element
     * @param {{x: number, y: number}} popPoint
     */
    drawPopup(element = this.elementHover, popPoint = this.elementHover.getSelectedPoint(), ctx = this.ctx) {
        if (element.getSelectedValue() === -1) {
            return;
        }
        const longText = element.getElementName();
        const valueStr = element.getSelectedValue().toFixed(this.ROUND_PLACE);
        const scale = this.CHART_WIDTH * (this.SCALED_WIDTH) / (this.CHART_WIDTH * (this.SCALED_WIDTH / 12));
        const fm = this.setFont(longText, scale, 'bold', this.FONT_NAME, ctx);
        const fm2 = this.setFont(valueStr, scale, 'bold', this.FONT_NAME, ctx);
        const ascent = fm.fontBoundingBoxAscent;
        const width = (fm.width > fm2.width ? fm.width : fm2.width) * 2;
        const height = fm.fontBoundingBoxAscent * 2 + ascent;

        let x = popPoint.x - width;
        if (x < this.CHART_X) x += width;
        let y = popPoint.y - height;

        ctx.beginPath();
        if (this.IS_SHOW_POPUP_BACKGROUND) {
            ctx.fillStyle = this.POPUP_BG_COLOR;
            ctx.strokeStyle = this.BORDER_COLOR;
            ctx.lineWidth = 2;
            ctx.roundRect(x, y, width, height, 10);
            ctx.fill();
            ctx.stroke();
        }
        ctx.fillStyle = element.getElementColor();
        ctx.globalAlpha = this.LEGEND_FONT_ALPHA;
        ctx.fillText(element.getElementName(), x + ascent, Math.round(y + ascent * 1.5));
        if (element.getSelectedValue() > 0) {
            ctx.fillText(valueStr, x + ascent, Math.round(y + ascent * 2.5));
        }
    }

    /**
     * To draw legend hover shape
     * @param {*} element 
     */
    drawLegendHover(element, ctx = this.ctx) {
        const shape = element.getLegendShapes();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = this.CHART_BG_COLOR;
        ctx.fillRect(shape[0].x, shape[0].y, shape[1].x - shape[0].x, shape[2].y - shape[1].y);
    }

    /**
     * To draw legen
     * @param {*} elements 
     * @param {*} ctx 
     */
    drawLegend(elements = this.CHART_ELEMENTS, ctx = this.ctx) {
        let longStr = "";
        let tmp = "";
        elements.forEach((element) => {
            if (element) {
                tmp = element.getLabel();
                if (!tmp) return;
                if (tmp.length > longStr.length) longStr = tmp;
            }
        });
        const scale = this.CHART_WIDTH * (this.SCALED_WIDTH) / (this.CHART_WIDTH * (this.SCALED_WIDTH / 10));
        const longestString = elements.map(e => e.getElementName()).reduce((max, current) => {
            return current.length > max.length ? current : max;
        }, "");
        const fm = this.setFont(longestString, scale, 'bold', this.FONT_NAME, ctx);
        const ascent = fm.actualBoundingBoxAscent;
        const itemHeight = ascent * 2;
        const spacing = 20;
        const legendWidth = fm.width + spacing;
        const legendHeight = itemHeight * elements.length;
        const legendX = this.LEGEND_X - legendWidth;
        const legendY = this.LEGEND_Y;

        if (this.IS_SHOW_LEGEND_BACKGROUND) {
            ctx.globalAlpha = this.LEGEND_BG_ALPHA;
            ctx.fillStyle = this.LEGEND_BG_COLOR;
            ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
            ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
            ctx.lineWidth = 1;
        }
        elements.forEach((element, i) => {
            if (element) {
                const legendShapes = [
                    { x: legendX, y: legendY + itemHeight * i },
                    { x: legendX + legendWidth, y: legendY + itemHeight * i },
                    { x: legendX + legendWidth, y: legendY + (itemHeight * (i + 1)) },
                    { x: legendX, y: legendY + itemHeight * (i + 1) }
                ];
                element.setLegendShapes(legendShapes);
                //const polygon = this.getScalePolygon(legendShapes, 1);
                if (this.elementHover && this.elementHover.elementName === element.getElementName()) {
                    ctx.fillStyle = this.CHART_BG_COLOR;
                    ctx.globalAlpha = 1.0;
                    ctx.fillRect(legendShapes[0].x + ctx.lineWidth, legendShapes[0].y + ctx.lineWidth, legendWidth - ctx.lineWidth * 2, itemHeight - ctx.lineWidth * 2);
                }
                ctx.fillStyle = this.INDEX_FONT_COLOR;
                ctx.globalAlpha = this.LEGEND_FONT_ALPHA;
                const legend = element.getLabel() || element.elementName;
                ctx.fillText(legend, legendX + spacing / 2, legendY + (legendHeight / elements.length) * i + itemHeight - ascent / 2);
            }
        });
        ctx.restore();
    }

    /**
     * Draw indexes of x axis
     * @param {Array} xIndex
     */
    drawLabelX(xIndex, ctx = this.ctx) {
        ctx.beginPath();
        ctx.globalAlpha = this.INDEX_FONT_ALPHA;
        ctx.fillStyle = this.INDEX_FONT_COLOR;
        let max = this.CHART_ELEMENTS.getMaxXIndex();
        let isLineOrArea = (this.CHART_ELEMENTS.getChartType() === ChartConstants.CHART.AREA || this.CHART_ELEMENTS.getChartType() === ChartConstants.CHART.LINE ? true : false);
        const indexWidth = this.CHART_WIDTH / (isLineOrArea ? max - 1 : max);
        for (let i = 0; i < max; i++) {
            if (xIndex[i]) {
                const str = xIndex[i] ? String(xIndex[i]) : '';
                const fm = this.setFont(str, this.INDEX_FONT_SIZE, 'bold', this.FONT_NAME, ctx);
                const indent = fm.width;
                const ascent = fm.actualBoundingBoxAscent;
                const x = this.CHART_X + i * indexWidth + (isLineOrArea ? 0 : indexWidth / 2) + fm.width / 2;
                const y = this.CHART_Y + 1;
                ctx.fillText(xIndex[i], x - indent, y + ascent + 3);
            }
        }
    }

    /**
     * Draw Y index
     * @param {*} yIndex 
     * @param {*} maxValue 
     */
    drawLabelY(yIndex, maxValue, ctx = this.ctx) {
        ctx.beginPath();
        ctx.globalAlpha = this.INDEX_FONT_ALPHA;
        ctx.fillStyle = this.INDEX_FONT_COLOR;
        const cnt = yIndex.length;
        for (let i = 0; i < cnt; i++) {
            const obj = yIndex[i];
            let y = 0;
            if (typeof obj === "number") {
                y = Number(obj);
            } else {
                throw new Error("Y index value must be decimal value.");
            }
            if (this.LIMIT < maxValue) {
                y = (this.CHART_Y - y * this.CHART_HEIGHT / maxValue);
            } else {
                y = (this.CHART_Y - y * this.CHART_HEIGHT / this.LIMIT);
            }
            const fm = this.setFont(obj, this.FONT_SIZE, 'bold', this.FONT_NAME, ctx);
            ctx.fillText(obj, this.CHART_X - fm.width - this.INDEX_FONT_SIZE, y);
        }
    }

    /**
     * Draw grid x 
     * @param {Array} xIndex
     * @param {number} style
     */
    drawGridX(xIndex, style, ctx = this.ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.GRID_X_COLOR;
        ctx.lineWidth = this.GRID_SIZE;
        ctx.globalAlpha = this.GRID_ALPHA;
        let max = this.CHART_ELEMENTS.getMaxXIndex();
        let isLineOrArea = (this.CHART_ELEMENTS.getChartType() === ChartConstants.CHART.AREA || this.CHART_ELEMENTS.getChartType() === ChartConstants.CHART.LINE ? true : false);
        const indexWidth = this.CHART_WIDTH / (isLineOrArea ? max - 1 : max);
        for (let i = 0; i < max; i++) {
            const x = (this.CHART_X + (i * indexWidth));
            const xv = xIndex[i];
            if (xv) {
                this.drawGrid('X', style, x, this.CHART_Y - this.CHART_BORDER_SIZE, x, (this.CHART_Y + 1) - this.CHART_HEIGHT + this.CHART_BORDER_SIZE, ctx);
            }
        }
    }

    /**
     * Draw grid y
     * @param {Array} yIndex
     * @param {number} style
     * @param {number} maxValue
     */
    drawGridY(yIndex, style, maxValue, ctx = this.ctx) {
        const cnt = yIndex.length;
        ctx.beginPath();
        ctx.globalAlpha = this.CHART_ALPHA;
        ctx.fillStyle = this.GRID_Y_COLOR;
        for (let i = 0; i < cnt; i++) {
            const obj = yIndex[i];
            let y = 0;
            if (typeof obj === "number") {
                y = Number(obj);
            } else {
                throw new Error("Y index value must be decimal value.");
            }
            if (this.LIMIT < maxValue) {
                y = (this.CHART_Y - y * this.CHART_HEIGHT / maxValue);
            } else {
                y = (this.CHART_Y - y * this.CHART_HEIGHT / this.LIMIT);
            }
            const x = this.CHART_X + this.CHART_WIDTH - this.CHART_BORDER_SIZE;
            if (y !== 0 && y > this.CHART_Y - this.CHART_HEIGHT) {
                this.drawGrid('Y', style, this.CHART_X, parseInt(y), x, parseInt(y), ctx);
            }
        }
    }

    /**
     * Draw grid
     * @param {string} xy - 'X' or 'Y' representing the visibility of the grid
     * @param {string} gridStyle - 'LINE' or 'DOT' for the style of the grid
     * @param {number} x1 - x-coordinate of the start point
     * @param {number} y1 - y-coordinate of the start point
     * @param {number} x2 - x-coordinate of the end point
     * @param {number} y2 - y-coordinate of the end point
     */
    drawGrid(xy, gridStyle, x1, y1, x2, y2, ctx = this.ctx) {
        ctx.beginPath();
        ctx.lineWidth = this.GRID_SIZE;
        ctx.globalAlpha = this.GRID_ALPHA;
        if (gridStyle === 'LINE') {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        } else if (gridStyle === 'DOT') {
            if (xy === 'X') {
                for (let a = 0; y1 - a * 5 > y2; a++) {
                    ctx.moveTo(x1, y1 - a * 5);
                    ctx.lineTo(x1, y1 - a * 5 - 3);
                }
            } else if (xy === 'Y') {
                for (let b = 0; x1 + b * 5 < x2; b++) {
                    ctx.moveTo(x1 + b * 5, y1);
                    ctx.lineTo(x1 + b * 5 + 3, y1);
                }
            }
        }
        ctx.stroke();
    }

    /**
     * Draw dash gridY
     * @param {*} chartY 
     * @param {*} chartHeight 
     * @param {*} maximum 
     */
    drawDashGridY(chartY, chartHeight, maximum, ctx = this.ctx) {
        const gridCount = 10;
        const step = chartHeight / gridCount;
        const valueStep = maximum / gridCount;
        ctx.strokeStyle = this.BORDER_COLOR;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        for (let i = 0; i <= gridCount; i++) {
            const y = chartY - i * step;
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(this.width - 50, y);
            ctx.stroke();
            ctx.fillStyle = this.GRID_Y_COLOR;
            ctx.fillText((i * valueStep).toFixed(2), 10, y + 5);
        }
        ctx.setLineDash([]);
    }

    /**
     * Draw water mark with 9ins
     * @param {CanvasRenderingContext2D} ctx - the rendering context to draw on
     */
    drawRight(ctx) {
        ctx.beginPath();
        const logo = "© 2025 ChaosToCosmos";
        let fm = this.setFont(logo, 9, 'bold', this.FONT_NAME, ctx);
        const width = fm.width; // Calculate text width
        const ascent = 9; // Approximate ascent for 9px font
        ctx.globalAlpha = 0.3; // Set opacity
        ctx.fillText(logo, this.CANVAS_WIDTH - width - 5, this.CANVAS_HEIGHT - ascent);
    }

    /**
     * Resize and drawing current context object
     * @param {number} width - new width
     * @param {number} height - new height
     */
    resizeImage(width, height, ctx = this.ctx) {
        const MIN_SIZE = 100;
        if (width < MIN_SIZE || height < MIN_SIZE) {
            return;
        }
        this.canvas.width = width;
        this.canvas.height = height;
        ctx = this.canvas.getContext('2d');
        this.initChart(width, height);
        this.drawChart();
    }

    /**
     * Get a buffered image painted chart
     * @param {number} width - image width
     * @param {number} height - image height
     * @returns {HTMLCanvasElement} - the canvas element representing the chart
     */
    getBufferedImage(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        this.resizeImage(width, height); // Call resize
        return canvas; // Return the canvas as the buffered image
    }

    /**
     * Add element value and redraw chart
     * If element does not exist, create new element with given name and value
     * @param {*} elementName 
     * @param {*} value 
     */
    addElementValue(elementName, value) {
        const element = this.CHART_ELEMENTS.getChartElementMap().get(elementName);
        if (element) {
            element.addValue(value);
            this.drawChart();
        } else {
            this.CHART_ELEMENTS.addChartElement(elementName, new ChartElement(elementName, [value]));
        }
        this.drawChart();
    }

    /**
     * Push element value and redraw chart
     * If element does not exist, create new element with given name and value
     * @param {*} elementName 
     * @param {*} value 
     */
    pushElementValue(elementName, value) {
        const element = this.CHART_ELEMENTS.getChartElementMap().get(elementName);
        if (element) {
            element.pushValue(value);
        } else {
            this.CHART_ELEMENTS.addChartElement(elementName, new ChartElement(elementName, [value]));
        }
        this.drawChart();
    }

    /**
     * Set element value on index and redraw chart
     * If element does not exist, create new element with given name and value
     * @param {*} elementName 
     * @param {*} index 
     * @param {*} value 
     */
    setElementValue(elementName, index, value) {
        const element = this.CHART_ELEMENTS.getChartElementMap().get(elementName);
        if (element) {
            element.setValue(index, value);
        } else {
            this.CHART_ELEMENTS.addChartElement(elementName, new ChartElement(elementName, []));
            this.CHART_ELEMENTS.getChartElementMap().get(elementName).setValue(index, value);
        }
        this.drawChart();
    }

    /**
     * Get element values
     * @param {*} elementName 
     * @param {*} values
     * @returns 
     */
    setElementValues(elementName, values) {
        this.CHART_ELEMENTS.getChartElementMap().get(elementName).setValues(values);
        this.drawChart();
    }

    /**
     * Scale In, Out chart
     * @param {*} scale 
     * @returns 
     */
    scaleChart(scale) {
        const width = super.getImageWidth() * scale;
        const height = super.getImageHeight() * scale;
        if (width <= super.getIndentLeft() + super.getIndentRight() + 100 || width > window.innerWidth) {
            return;
        }
        this.resizeImage(width, height);
    }

    /**
     * Add value callback 
     * @param {*} callback 
     */
    addSelectedCallback(callback) {
        this.selectedCallback.push(callback);
    }

    /**
     * Set selected element
     * @param {} elementName 
     */
    setSelectedElement(elementName) {
        this.elementHover = this.CHART_ELEMENTS.getChartElementMap().get(elementName);
        this.drawChart();
    }

    /**
     * Check x, y is exists in Chart area
     * @param {} x 
     * @param {*} y 
     * @returns 
     */
    existInChartArea(x, y) {
        const graphArea = new Polygon([{ x: this.CHART_X, y: this.CHART_Y },
        { x: this.CHART_X, y: this.CHART_Y + this.CHART_HEIGHT },
        { x: this.CHART_X + this.CHART_WIDTH, y: this.CHART_Y + this.CHART_HEIGHT },
        { x: this.CHART_X + this.CHART_WIDTH, y: this.CHART_Y }
        ]);
        return graphArea.contains(x, y);
    }

    /**
     * Translate canvas coordinate
     * @param {*} event 
     * @param {*} canvas 
     * @returns 
     */
    translateCanvasXY(clientX, clientY, canvas = this.canvas) {
        const rect = canvas.getBoundingClientRect();
        // Convert mouse position to relative coordinates (0 to 1)
        const relativeX = (clientX - rect.left) / rect.width;
        const relativeY = (clientY - rect.top) / rect.height;
        // Convert back to actual canvas coordinates
        const canvasX = relativeX * this.canvas.width;
        const canvasY = relativeY * this.canvas.height;
        return { x: canvasX, y: canvasY };
    }

    /**
     * Get polygon object by shapes point list
     * @param {Array<{x: number, y: number}>} shapes
     * @param {boolean} isReverse
     * @return {Array<number>} 
     */
    getPolygon(shapes, isReverse) {
        if (isReverse) {
            shapes.reverse();
        }
        if (shapes) {
            const points = shapes.map(p => ({ x: p.x, y: p.y }));
            const polygon = new Polygon(points);
            return polygon;
        }
        return null;
    }

    /**
     * Get polygon been scaled
     * @param {Array<{x: number, y: number}>} shapes
     * @param {number} scale
     * @return {Array<number>} 
     */
    getScalePolygon(shapes, scale) {
        const polygon = this.getPolygon(shapes, false);
        const centerX = polygon.bounds.x + polygon.bounds.width / 2;
        const centerY = polygon.bounds.y + polygon.bounds.height / 2;
        shapes.forEach((p, i) => {
            const x = Math.round(p.x > centerX ? p.x + scale : p.x - scale);
            const y = Math.round(p.y > centerY ? p.y + scale : p.y - scale);
            shapes[i] = { x, y };
        });
        return this.getPolygon(shapes, false);
    }

    /**
     * Adjust color lightness
     * @param {*} color 
     * @param {*} delta 
     * @returns 
     */
    adjustLightness(color, delta) {
        if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl')) {
            color = this.extractRGB(color);
        }
        const hsl = this.toHSLColorObject(color);
        hsl.l += delta;
        return 'hsl(' + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)";
    }

    /**
     * Contrast color
     * @param {*} color 
     * @param {*} contrast 
     * @returns 
     */
    adjustContrast(color, contrast) {
        if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl')) {
            color = this.extractRGB(color);
        }
        const hsl = this.toHSLColorObject(color);
        const contrastL = hsl.l < 50 ? 80 : 20;
        hsl.l = contrastL;
        return this.toHSLColorObject(hsl);
    }

    /**
     * Set color value with density
     * @param {*} color 
     * @param {*} density 
     * @param {*} ctx
     */
    colorWithDensity(color, density, ctx = this.ctx) {
        let r = Math.min(255, Math.max(0, color.r + density));
        let g = Math.min(255, Math.max(0, color.g + density));
        let b = Math.min(255, Math.max(0, color.b + density));
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Extract r, g, b color from color string
     * @param {*} color 
     * @returns 
     */
    extractRGB(color) {
        let r, g, b;
        // Match Hex (#RRGGBB or #RGB)
        let hexMatch = color.match(/^#([a-fA-F0-9]{3,6})$/);
        if (hexMatch) {
            let hex = hexMatch[1];
            if (hex.length === 3) {
                // Convert #RGB to #RRGGBB
                hex = hex.split('').map(c => c + c).join('');
            }
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
            return { r, g, b };
        }
        // Match RGB (rgb(r, g, b))
        let rgbMatch = color.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3])
            };
        }
        // Match HSL (hsl(h, s%, l%)) → Convert to RGB
        let hslMatch = color.match(/^hsl\s*\(\s*(\d{1,3})\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/);
        if (hslMatch) {
            let h = parseInt(hslMatch[1, 10]) / 360;
            let s = parseFloat(hslMatch[2]) / 100;
            let l = parseFloat(hslMatch[3]) / 100;
            let hueToRGB = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            const rgb = {
                r: Math.round(hueToRGB(p, q, h + 1 / 3) * 255),
                g: Math.round(hueToRGB(p, q, h) * 255),
                b: Math.round(hueToRGB(p, q, h - 1 / 3) * 255)
            };
            return rgb;
        }
        return null; // Not a valid color format
    }

    /**
     * Convert r, g, b color to Hex color
     * @param {*} color
     * @returns 
     */
    toHexColorString(color) {
        const hex = ((1 << 24) | (color.r << 16) | (color.g << 8) | color.b).toString(16).slice(1).toUpperCase();
        return "#" + hex;
    }

    /**
     * Convert to HSL color
     * @param {*} color
     * @returns 
     */
    toHSLColorObject(color) {
        const r = color.r / 255;
        const g = color.g / 255;
        const b = color.b / 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0; // Achromatic (gray)
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
                default:
            }
            h *= 60;
        }
        const hsl = { h: h, s: s, l: l };
        return hsl;
    }

    /**
     * Convert to HSL color string
     * @param {*} color 
     * @returns 
     */
    toHSLColorString(color) {
        const hsl = this.toHSLColorObject(color);
        return "hsl(" + hsl.h + ", " + hsl.s + "% , " + hsl.l + "%)";
    }

    /**
     * Convert to RGB color
     * @param {*} color
     * @returns 
     */
    toRGBColorString(color) {
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    /**
     * To set font
     * @param {string} text
     * @param {number} fontSize
     * @return {TextMetrics}
     */
    setFont(text, fontSize, fontWeight, fontName, ctx = this.ctx) {
        ctx.font = `${fontWeight} ${fontSize}px ${fontName}`;
        return ctx.measureText(text);
    }

    /**
     * To convert double value to integer
     * @param {number} doubleValue
     * @return {number}
     */
    intValue(doubleValue) {
        return Math.round(doubleValue);
    }

    /**
     * To get whether color is dark
     * @param {string} color
     * @return {boolean}
     */
    isDarkColor(color) {
        const c = color;
        return c.r < 90 && c.g < 90 && c.b < 90;
    }
}
