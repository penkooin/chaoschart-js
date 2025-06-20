import { ChartElement } from './ChartElement.js';

/**
 * <i>Chaos Chart API </i><br>
 */

/**
 * <p>Title: ChartElements class</p>
 * <p>Description:</p>
 * <p>Copyright: Copyleft (c) 2006</p>
 * <p>Company: ChaosToCosmos</p>
 * 
 * @author Kooin-Shin(9ins)
 * @version 1.0, 2001/8/13 19:30 First draft
 * @version 1.2, 2006/7/5 
 */

export class ChartElements {
    /**
     * Constructor
     * @param {string} chartType
     * @param {Array} xIndex
     * @param {Array} yIndex
     */
    constructor(xIndex = [], yIndex = [], chartType = null) {
        this.xIndex = xIndex;
        this.yIndex = yIndex;
        this.chartType = chartType;

        this.chart = null;
        this.elementMap = new Map();
        this.elementOrder = [];
        this.selectedElement = null;
        this.selectedIndex = -1;
    }

    /**
     * Get Chart object
     * @return {Chart}
     */
    getChart() {
        return this.chart;
    }

    /**
     * Set Chart object
     * @param {Chart} chart
     */
    setChart(chart) {
        this.chart = chart;
        this.elementMap.forEach(e => e.setChart(chart));
    }

    /**
     * Get maximum in array
     * @param {Array} value
     * @return {number}
     */
    calMax(value) {
        return Math.max(...value.map(v => +v));
    }

    /**
     * Get minimum in array
     * @param {Array} value
     * @return {number}
     */
    calMin(value) {
        return Math.min(...value.map(v => +v));
    }

    /**
     * Get maximum in map
     * @param {Map} map
     * @return {number}
     */
    calMaxFromMap(map) {
        let max = 0;
        map.forEach(e => {
            const subMax = Math.max(...e.getValues().map(v => +v));
            max = Math.max(max, subMax);
        });
        return max;
    }

    /**
     * Get minimum in map
     * @param {Map} map
     * @return {number}
     */
    calMinFromMap(map) {
        let min = Infinity;
        map.forEach(e => {
            const subMin = Math.min(...e.getValues().map(v => +v));
            min = Math.min(min, subMin);
        });
        return min;
    }

    /**
     * Get chart type
     * @return {string}
     */
    getChartType() {
        return this.chartType;
    }

    /**
     * Set Chart type
     * @param {*} chartType 
     */
    setChartType(chartType) {
        this.chartType = chartType;
        return this;
    }

    /**
     * Get element count
     * @returns {number}
     */
    getElementCount() {
        return this.elementMap.size;
    }

    /**
     * Get ChartElement 
     * @param {string} elementName
     * @return {ChartElement}
     */
    getChartElement(elementName) {
        return this.elementMap.get(elementName);
    }

    /**
     * Add Chart element
     * @param {ChartElement} ge
     */
    addElement(ge) {
        this.addChartElement(ge.getElementName(), ge);
    }

    /**
     * Add Chart element
     * @param {Object} elementName
     * @param {ChartElement} ge
     */
    addChartElement(elementName, ge) {
        ge.setChartType(this.chartType);
        ge.setChart(this.chart);
        this.elementMap.set(elementName, ge);
        if (!this.elementOrder.includes(elementName)) {
            this.elementOrder.push(ge.getElementName());
        }
    }

    /**
     * Remove Chart element
     * @param {Object} elementName
     * @return {ChartElement}
     */
    removeChartElement(elementName) {
        this.elementOrder = this.elementOrder.filter(o => o !== elementName);
        return this.elementMap.delete(elementName);
    }

    /**
     * Circulate elements
     * @param {boolean} forword
     */
    circulateElement(forword) {
        if (forword) {
            const o = this.elementOrder.shift();
            this.elementOrder.push(o);
        } else {
            const o = this.elementOrder.pop();
            this.elementOrder.unshift(o);
        }
    }

    /**
     * Sorting by last value of element
     */
    orderElementByLastValue() {
        this.elementOrder = Array.from(this.elementMap.values())
            .sort((e2, e1) => {
                const last1 = e1.getValues().slice(-1)[0] || 0;
                const last2 = e2.getValues().slice(-1)[0] || 0;
                return last1 - last2;
            })
            .map(e => e.getElementName());
    }

    /**
     * Get element order
     * @return {Array}
     */
    getElementOrder() {
        return this.elementOrder;
    }

    /**
     * Get x indexes
     * @return {Array}
     */
    getXIndex() {
        return this.xIndex;
    }

    /**
     * Get minimum size of index
     * @return {number}
     */
    getMinXIndex() {
        if (this.elementMap.size === 0) {
            return 0;
        }
        return Math.min(...Array.from(this.elementMap.values()).map(e => e.getValues().length));
    }

    /**
     * Get maximum size of index
     * @returns {number}
     */
    getMaxXIndex() {
        if (this.elementMap.size === 0) {
            return 0;
        }
        return Math.max(...Array.from(this.elementMap.values()).map(e => e.getValues().length));
    }

    /**
     * Get y indexes
     * @return {Array}
     */
    getYIndex() {
        return this.yIndex;
    }

    /**
     * Get Chart element value to double value
     * @param {string} elementName
     * @param {number} valueIndex
     * @return {number}
     */
    getChartElementValue(elementName, valueIndex) {
        const values = this.elementMap.get(elementName).getValues();
        if (values.length > valueIndex) {
            return values[valueIndex];
        } else {
            throw new Error("Given index value is over than element value size.");
        }
    }

    /**
     * Get Chart element map
     * @return
     */
    getChartElementMap() {
        return this.elementMap;
    }


    /**
     * Get maximum value of elements
     * @return {number}
     */
    getMaximum() {
        return this.calMaxFromMap(this.elementMap);
    }

    /**
     * Get minimum value of elements
     * @return {number}
     */
    getMin() {
        return this.calMinFromMap(this.elementMap);
    }

    /**
     * Set element values
     * @param {string} elementName
     * @param {Array} values
     */
    setValues(elementName, values) {
        this.elementMap.get(elementName).setValues(values);
    }

    /**
     * Set X index
     * @param {Array} xIndex
     */
    setXIndex(xIndex) {
        this.xIndex = xIndex;
    }

    /**
     * Set y index
     * @param {Array} yIndex
     */
    setYIndex(yIndex) {
        this.yIndex = yIndex;
    }

    /**
     * Get selected Chart element
     * @return {ChartElement}
     */
    getSelectedElement() {
        return this.selectedElement;
    }

    /**
     * Set selected Chart element
     * @param {ChartElement} selectedElement
     */
    setSelectedElement(selectedElement) {
        this.selectedElement = selectedElement;
    }

    /**
     * Get selected index
     * @return {number}
     */
    getSelectedIndex() {
        return this.selectedIndex;
    }

    /**
     * Set selected index
     * @param {number} index
     */
    setSelectedIndex(index) {
        this.selectedIndex = index;
    }

    /**
     * Create and get sample ChartElements object
     * @param {string} type
     * @return {ChartElements}
     */
    static newSimpleChartElements(type) {
        const xIndex = [];
        for (let i = 0; i < 17; i++) {
            xIndex.push(i % 2 === 0 ? `${i}` : null);
        }
        const yIndex = [50, 80, 500];
        const elements = ["Kafa", "elastic search", "Oracle", "Maria", "S3"];
        const colors = [
            { r: 130, g: 180, b: 130 },
            { r: 180, g: 130, b: 130 },
            { r: 180, g: 180, b: 140 },
            { r: 150, g: 150, b: 150 },
            { r: 150, g: 200, b: 158 }
        ];
        const values = [
            [44, 35, 0, 32, 0, 33, 29, 43, 25, 22, 32, 43, 23],
            [43, 25, 10, 32, 0, 23, 52, 32, 32, 23, 54, 23, 48, 20, 60, 140, 500, 10],
            [500, 93, 0, 49, 0, 24, 93, 63, 92, 84, 69, 46, 28],
            [300, 25, 0, 32, 0, 23, 9, 19, 32, 70, 93, 29, 15],
            [20, 36, 0, 24, 22, 37, 33, 54, 23, 48, 53, 150, 22]
        ];

        const chartElements = new ChartElements(type, xIndex, yIndex);
        elements.forEach((element, i) => {
            const ge = new ChartElement(element, colors[i], element, colors[i], values[i]);
            chartElements.addElement(ge);
        });
        return chartElements;
    }
}
