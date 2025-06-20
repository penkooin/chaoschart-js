/**
 * <i>Chaos Chart API </i><br>
 */
import ChartConstants from './ChartConstants.js';
import InterpolateTransform from './shape/InterpolateTransform.js';
import { ChartElements } from './ChartElements.js';
import { ChartElement } from './ChartElement.js';

/**
 * Chart 
 * 
 * @author 9ins
 */
export class Chart {

    /**
     * Constructor
     * @param {*} chartElements 
     * @param {*} title 
     */
    constructor(canvasWidth, canvasHeight, chartElements = null, title = "") {
        console.log('canvas width: ' + canvasWidth + "   canvas height: " + canvasHeight);
        this.CANVAS_WIDTH = canvasWidth;
        this.CANVAS_HEIGHT = canvasHeight;

        this.TITLE = title;

        this.ORIGIN_WIDTH = 0;
        this.ORIGIN_HEIGHT = 0;
        this.SCALED_WIDTH = 8.0;
        this.SCALED_HEIGHT = 6.0;

        this.INDENT_LEFT = 50;
        this.INDENT_RIGHT = 50;
        this.INDENT_TOP = 30;
        this.INDENT_BOTTOM = 30;

        this.IS_SHOW_GRID_Y = true;
        this.IS_SHOW_GRID_X = true;
        this.IS_SHOW_INDEX_Y = true;
        this.IS_SHOW_INDEX_X = true;
        this.IS_SHOW_CHART_XY = true;
        this.IS_SHOW_TITLE = true;
        this.IS_SHOW_TITLE_SHADOW = false;
        this.IS_SHOW_BG = true;
        this.IS_SHOW_LEGEND = true;
        this.IS_SHOW_LEGEND_BACKGROUND = true;
        this.IS_SHOW_POPUP = true;
        this.IS_SHOW_POPUP_BACKGROUND = true;
        this.IS_SHOW_SHADOW = true;
        this.IS_SHOW_CANVAS_BORDER = true;
        this.IS_SHOW_CHART_BORDER = true;
        this.IS_SHOW_BORDER = true;

        this.IS_CANVAS_FIXED = true;
        this.IS_SELECTION_ENABLE = true;
        this.IS_SHOW_PEAK = true;
        this.IS_SHOW_ELEMENT_NAME = false;

        this.CHART_ALPHA = 1.0;
        this.CHART_BG_ALPHA = 1.0;
        this.CHART_XY_ALPHA = 0.5;
        this.CHART_BORDER_ALPHA = 0.8;
        this.CHART_XY_COLOR = "rgb(50,50,50)"; // Color of Chart xy axis
        this.CHART_BG_COLOR = "rgb(255,255,255)"; // Color of Chart background
        this.CHART_BORDER_COLOR = "rgb(73, 72, 72)"; // Color of Chart border
        this.CHART_WIDTH = this.CANVAS_WIDTH - (this.INDENT_LEFT + this.INDENT_RIGHT);
        this.CHART_HEIGHT = this.CANVAS_HEIGHT - (this.INDENT_TOP + this.INDENT_BOTTOM);
        this.CHART_BORDER_SIZE = 1.5;
        this.CHART_XY_SIZE = 3.0;

        this.LEGEND_BG_ALPHA = 0.3;
        this.LEGEND_FONT_ALPHA = 1.0;
        this.LEGEND_FONT_SIZE = 10;
        this.LEGEND_BG_COLOR = "rgb(200,200,220)"; // Color of legend background

        this.TITLE_FONT_ALPHA = 0.3;
        this.TITLE_FONT_SIZE = 15;
        this.TITLE_FONT_COLOR = "rgb(120,120,170)"; // Color of title font

        this.CANVAS_BG_ALPHA = 1.0;
        this.CANVAS_BORDER_SIZE = 2.0;
        this.CANVAS_BG_COLOR = "rgb(255, 255, 255)"; // Color of image object background
        this.CANVAS_BORDER_COLOR = "rgb(200,200,230)"; // Color of image object border

        this.INDEX_Y_UNIT = "";
        this.INDEX_FONT_COLOR = "rgb(100,100,100)"; // Color of index font
        this.INDEX_FONT_ALPHA = 0.7;
        this.INDEX_FONT_SIZE = 10;

        this.GRID_ALPHA = 0.3;
        this.GRID_SIZE = 0.3;
        this.GRID_STYLE = ChartConstants.GRID.LINE;
        this.GRID_X_COLOR = "rgb(100,120,100)"; // Color of grid x
        this.GRID_Y_COLOR = "rgb(100,120,100)"; // Color of grid y

        this.SHADOW_ALPHA = 0.3;
        this.SHADOW_DIST = 5;
        this.SHADOW_ANGLE = 300;
        this.SHADOW_COLOR = "rgb(107, 105, 105)"; // Color of shadow

        this.POPUP = ChartConstants.POPUP_STYLE.ROUND;
        this.POPUP_BG_ALPHA = 0.6;
        this.POPUP_BG_COLOR = "rgb(255, 255, 255)";
        this.POPUP_FONT_COLOR = "rgb(100,100,100)";

        this.BORDER_SIZE = 2;
        this.BORDER_COLOR = "hsl(0, 1.20%, 52.00%)"; // Color of border

        this.SEL_BORDER = ChartConstants.SELECTION_BORDER.LINE;
        this.VALUE_DIVISION_RATIO = 1.0;
        this.FONT_NAME = "Arial";
        this.FONT_SIZE = 10;
        this.FONT_WEIGHT = "bold";
        this.WHEEL_DELTA = 0.9;
        this.SELECTED_COLOR_DENSITY = 10;

        this.listenerList = [];
        this.INTERPOLATE_TYPE = null;
        this.INTERPOLATE_SCALE = 0.3;

        this.ROUND_PLACE = ChartConstants.ROUND_PLACE;

        this.DEFAULT_COLOR = "rgb(220,220,220)"; // Default color for temporary use
        this.PEEK_COLOR = "grey";

        if (this.ORIGIN_WIDTH === 0 && this.ORIGIN_HEIGHT === 0) {
            this.ORIGIN_WIDTH = this.CANVAS_WIDTH;
            this.ORIGIN_HEIGHT = this.CANVAS_WIDTH;
        }

        this.X_INDEX = [];
        this.Y_INDEX = [];
        this.CHART_TYPE = null;
        this.PEEK_STYLE = ChartConstants.PEEK_STYLE.RECTANGLE;
        this.LIMIT = 0;

        try {
            if (chartElements instanceof ChartElements) {
                this.CHART_ELEMENTS = chartElements;
            } else {
                Object.keys(chartElements).forEach(k => {
                    //console.log(k.toUpperCase()+"   "+elements[k]);    
                    this[k.toUpperCase()] = chartElements[k];
                })
                this.CHART_ELEMENTS = new ChartElements(chartElements.xIndex, chartElements.yIndex);

                if (chartElements.elements) {
                    if (chartElements.elements) {
                        Object.entries(chartElements.elements).forEach(([key, value]) => {
                            const element = new ChartElement(key, value.color, value.values);
                            this.CHART_ELEMENTS.addElement(element);
                        });
                    }
                }
            }
            this.LIMIT = this.LIMIT < this.CHART_ELEMENTS.getMaximum() ? this.CHART_ELEMENTS.getMaximum() : this.LIMIT;
            this.CHART_ELEMENTS.setChart(this);
        } catch (error) {
            throw new Error(error.message);
        }
        console.log("Chart is initialized...........................................");
    }

    /**
     * Get 
     * @param {*} chartType 
     * @returns 
     */
    static getChartTypeString(chartType) {
        let type;
        switch (chartType) {
            case ChartConstants.CHART.LINE:
                type = "LINE CHART";
                break;
            case ChartConstants.CHART.BAR:
                type = "BAR CHART";
                break;
            case ChartConstants.BAR_RATIO_CHART:
                type = "BAR RATIO CHART";
                break;
            case ChartConstants.CHART.CIRCLE:
                type = "CIRCLE CHART";
                break;
            case ChartConstants.CHART.AREA:
                type = "AREA CHART";
                break;
            default:
                throw new Error("Specified Chart type does not exist!!!");
        }
        return type;
    }

    /**
     * Set elements interpolation setting
     * @param {*} interpolateType 
     * @param {*} interpolateScale 
     */
    setElementsInterpolates(interpolateType, interpolateScale) {
        this.INTERPOLATE_TYPE = interpolateType;
        this.INTERPOLATE_SCALE = interpolateScale;
        InterpolateTransform.populateInterpolateWithOneType(interpolateType, this.CHART_ELEMENTS, interpolateScale);
    }

    /**
     * Get contrast color 
     * @param {*} color 
     * @returns 
     */
    getContrastColor(color) {
        const r = Math.min(255, 255 - color.r);
        const g = Math.min(255, 255 - color.g);
        const b = Math.min(255, 255 - color.b);
        return { r, g, b };
    }

    setInterpolateType(interpolateType) {
        this.INTERPOLATE_TYPE = interpolateType;
    }

    setInterPolateScale(interpolateScale) {
        this.INTERPOLATE_SCALE = interpolateScale;
    }

    getChartType() {
        return this.CHART_ELEMENTS.getChartType();
    }

    getChartX() {
        return this.CHART_X;
    }

    getChartY() {
        return this.CHART_Y;
    }

    getImageWidth() {
        return this.CANVAS_WIDTH;
    }

    getImageHeight() {
        return this.CANVAS_HEIGHT;
    }

    getLabelX() {
        return this.LEGEND_X;
    }

    getLabelY() {
        return this.LEGEND_Y;
    }

    getTitle() {
        return this.TITLE;
    }

    getShowTitleShadow() {
        return this.IS_SHOW_TITLE_SHADOW;
    }

    getChartWidth() {
        return this.CHART_WIDTH;
    }

    getChartHeight() {
        return this.CHART_HEIGHT;
    }

    isImgFixed() {
        return this.IS_CANVAS_FIXED;
    }

    getRoundDigits() {
        return this.ROUND_PLACE;
    }

    setRoundDigits(digits) {
        this.ROUND_PLACE = digits;
    }

    setShowGridY(is) {
        this.IS_SHOW_GRID_Y = is;
    }

    setShowGridX(is) {
        this.IS_SHOW_GRID_X = is;
    }

    setShowIndexX(is) {
        this.IS_SHOW_INDEX_X = is;
    }

    setShowIndexY(is) {
        this.IS_SHOW_INDEX_Y = is;
    }

    setShowChartXY(is) {
        this.IS_SHOW_CHART_XY = is;
    }

    setShowTitle(is) {
        this.IS_SHOW_TITLE = is;
    }

    setShowTitleShadow(is) {
        this.IS_SHOW_TITLE_SHADOW = is;
    }

    setShowBg(is) {
        this.IS_SHOW_BG = is;
    }

    setShowLabel(is) {
        this.IS_SHOW_LEGEND = is;
    }

    setShowLabelBackground(is) {
        this.IS_SHOW_LEGEND_BACKGROUND = is;
    }

    setShowPopup(is) {
        this.IS_SHOW_POPUP = is;
    }

    setShowPopupBackgraound(is) {
        this.IS_SHOW_POPUP_BACKGROUND = is;
    }

    setShowShadow(is) {
        this.IS_SHOW_SHADOW = is;
    }

    setShowImgBorder(is) {
        this.IS_SHOW_CANVAS_BORDER = is;
    }

    setShowChartBorder(is) {
        this.IS_SHOW_CHART_BORDER = is;
    }

    setShowBorder(is) {
        this.IS_SHOW_BORDER = is;
    }

    setImgFixed(is) {
        this.IS_CANVAS_FIXED = is;
    }

    setSelectionEnable(is) {
        this.IS_SELECTION_ENABLE = is;
    }

    getSelectionEnable() {
        return this.IS_SELECTION_ENABLE;
    }

    setShowPeak(is) {
        this.IS_SHOW_PEAK = is;
    }

    getShowPeak() {
        return this.IS_SHOW_PEAK;
    }

    setPeakStyle(style) {
        this.PEAK_STYLE = style;
    }

    getPeakStyle() {
        return this.PEAK_STYLE;
    }

    setShowElementName(is) {
        this.IS_SHOW_ELEMENT_NAME = is;
    }

    getShowElementName() {
        return this.IS_SHOW_ELEMENT_NAME;
    }

    setImgBgAlpha(alpha) {
        this.CANVAS_BG_ALPHA = alpha;
    }

    setChartBgAlpha(alpha) {
        this.CHART_BG_ALPHA = alpha;
    }

    setTitleFontAlpha(alpha) {
        this.TITLE_FONT_ALPHA = alpha;
    }

    setChartXYAlpha(alpha) {
        this.CHART_XY_ALPHA = alpha;
    }

    setIndexFontAlpha(alpha) {
        this.INDEX_FONT_ALPHA = alpha;
    }

    setGridAlpha(alpha) {
        this.GRID_ALPHA = alpha;
    }

    setShadowAlpha(alpha) {
        this.SHADOW_ALPHA = alpha;
    }

    setChartAlpha(alpha) {
        this.CHART_ALPHA = alpha;
    }

    setLabelBgAlpha(alpha) {
        this.LEGEND_BG_ALPHA = alpha;
    }

    setTitleFontSize(size) {
        this.TITLE_FONT_SIZE = size;
    }

    setLabelFontSize(size) {
        this.LEGEND_FONT_SIZE = size;
    }

    setIndexFontSize(size) {
        this.INDEX_FONT_SIZE = size;
    }

    setShadowDist(size) {
        this.SHADOW_DIST = size;
    }

    setShadowAngle(size) {
        this.SHADOW_ANGLE = size;
    }

    setImgBorderSize(size) {
        this.CANVAS_BORDER_SIZE = size;
    }

    setChartBorderSize(size) {
        this.CHART_BORDER_SIZE = size;
    }

    setBorderSize(size) {
        this.BORDER_SIZE = size;
    }

    setChartXYSize(size) {
        this.CHART_XY_SIZE = size;
    }

    setGridSize(size) {
        this.GRID_SIZE = size;
    }

    setSelectionColorDensity(density) {
        this.SELECTED_COLOR_DENSITY = density;
    }

    getSelectionColorDensity() {
        return this.SELECTED_COLOR_DENSITY;
    }

    setGridStyle(style) {
        this.GRID_STYLE = style;
    }

    setTitle(title) {
        this.TITLE = title;
    }

    getLimit() {
        return this.LIMIT;
    }

    setLimit(valueLimit) {
        this.LIMIT = valueLimit;
    }

    getIndentTop() {
        return this.INDENT_TOP;
    }

    getIndentLeft() {
        return this.INDENT_LEFT;
    }

    getIndentBottom() {
        return this.INDENT_BOTTOM;
    }

    getIndentRight() {
        return this.INDENT_RIGHT;
    }

    setValueDivisionRatio(ratio) {
        this.VALUE_DIVISION_RATIO = ratio;
    }

    getValueDivisionRatio() {
        return this.VALUE_DIVISION_RATIO;
    }

    setUnit(unit) {
        this.INDEX_Y_UNIT = unit;
    }

    setIndent(top, left, bottom, right) {
        this.INDENT_TOP = top;
        this.INDENT_LEFT = left;
        this.INDENT_BOTTOM = bottom;
        this.INDENT_RIGHT = right;
        this.CHART_WIDTH = this.CANVAS_WIDTH - (this.INDENT_LEFT + this.INDENT_RIGHT);
        this.CHART_HEIGHT = this.CANVAS_HEIGHT - (this.INDENT_TOP + this.INDENT_BOTTOM);
        this.CHART_X = this.CANVAS_WIDTH - (this.INDENT_RIGHT + this.CHART_WIDTH);
        this.CHART_Y = this.CANVAS_HEIGHT - this.INDENT_BOTTOM;
    }

    setTopIndent(top) {
        this.setIndent(top, this.INDENT_LEFT, this.INDENT_BOTTOM, this.INDENT_RIGHT);
    }

    setLeftIndent(left) {
        this.setIndent(this.INDENT_TOP, left, this.INDENT_BOTTOM, this.INDENT_RIGHT);
    }

    setBottomIndent(bottom) {
        this.setIndent(this.INDENT_TOP, this.INDENT_LEFT, bottom, this.INDENT_RIGHT);
    }

    setRightIndent(right) {
        this.setIndent(this.INDENT_TOP, this.INDENT_LEFT, this.INDENT_BOTTOM, right);
    }

    setImgSize(width, height) {
        this.CANVAS_WIDTH = width;
        this.CANVAS_HEIGHT = height;
    }

    getWheelDelta() {
        return this.WHEEL_DELTA;
    }

    setWheelDelta(delta) {
        this.WHEEL_DELTA = delta;
    }

    getPopupStyle() {
        return this.POPUP;
    }

    setPopupStyle(popup) {
        this.POPUP = popup;
    }

    getSelectionBorder() {
        return this.SEL_BORDER;
    }

    setSelectionBorder(border) {
        this.SEL_BORDER = border;
    }

    getChartElements() {
        return this.CHART_ELEMENTS;
    }

    // Setters
    setImgBgColor(color) {
        this.CANVAS_BG_COLOR = color;
    }

    setImgBorderColor(color) {
        this.CANVAS_BORDER_COLOR = color;
    }

    setChartBgColor(color) {
        this.CHART_BG_COLOR = color;
    }

    setChartBorderColor(color) {
        this.CHART_BORDER_COLOR = color;
    }

    setBorderColor(color) {
        this.BORDER_COLOR = color;
    }

    setLabelBgColor(color) {
        this.LEGEND_BG_COLOR = color;
    }

    setTitleFontColor(color) {
        this.TITLE_FONT_COLOR = color;
    }

    setIndexFontColor(color) {
        this.INDEX_FONT_COLOR = color;
    }

    setChartXYColor(color) {
        this.CHART_XY_COLOR = color;
    }

    setGridXColor(color) {
        this.GRID_X_COLOR = color;
    }

    setGridYColor(color) {
        this.GRID_Y_COLOR = color;
    }

    setShadowColor(color) {
        this.SHADOW_COLOR = color;
    }

    setDefaultColor(color) {
        this.DEFAULT_COLOR = color;
    }

    setPeekColor(color) {
        this.PEEK_COLOR = color;
    }

    // Getters
    getImgBgColor() {
        return this.CANVAS_BG_COLOR;
    }

    getImgBorderColor() {
        return this.CANVAS_BORDER_COLOR;
    }

    getChartBgColor() {
        return this.CHART_BG_COLOR;
    }

    getChartBorderColor() {
        return this.CHART_BORDER_COLOR;
    }

    getBorderColor() {
        return this.BORDER_COLOR;
    }

    getLabelBgColor() {
        return this.LEGEND_BG_COLOR;
    }

    getTitleFontColor() {
        return this.TITLE_FONT_COLOR;
    }

    getIndexFontColor() {
        return this.INDEX_FONT_COLOR;
    }

    getChartXYColor() {
        return this.CHART_XY_COLOR;
    }

    getGirdXColor() {
        return this.GRID_X_COLOR;
    }

    getGridYColor() {
        return this.GRID_Y_COLOR;
    }

    getShadowColor() {
        return this.SHADOW_COLOR;
    }

    getDefaultColor() {
        return this.DEFAULT_COLOR;
    }

    getPeekColor() {
        return this.PEEK_COLOR;
    }

    getChartSelectionListenerList() {
        return this.listenerList;
    }

    addChartSelectionListener(listener) {
        if (this.listenerList.includes(listener)) {
            this.removeChartSelectionListener(listener);
        }
        this.listenerList.push(listener);
    }

    removeChartSelectionListener(listener) {
        this.listenerList = this.listenerList.filter(l => l !== listener);
    }
}
