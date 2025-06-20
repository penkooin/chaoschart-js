import InterpolateTransform from "./shape/InterpolateTransform.js";
import INTERPOLATE from "./shape/INTERPOLATE.js";


/**
 * ChartElement object
 * 
 * @author 9ins
 */
export class ChartElement {
    /**
     * constructor
     * @param {*} elementName 
     * @param {*} elementColor 
     * @param {*} values 
     */
    constructor(elementName = null, elementColor = "black", values = []) {
        this.elementName = elementName;
        this.elementColor = elementColor;
        this.legend = elementName;
        this.legendColor = elementColor;

        this.values = values.length < 1 ? [0] : values; // If no values are provided, initialize with 0

        this.shapes = [];
        this.legendShapes = [];

        this.selectedValueIndex = -1;
        this.selectedValue = null;
        this.selectedPoint = null;

        this.interpolationType = INTERPOLATE.LINEAR;
        this.interpolateScale = -1;
        this.interpolateValues = [];
        this.interpolates = [];

        this.chart = null; // Placeholder for Chart instance
        this.chartType = null; // Placeholder for CHART type

        this.mouseIndex = -1;
    }

    getElementName() {
        return this.elementName;
    }

    setElementName(elementName) {
        this.elementName = elementName;
    }

    getElementColor() {
        return this.elementColor;
    }

    setElementColor(elementColor) {
        this.elementColor = elementColor;
    }

    getLabel() {
        return this.legend;
    }

    setLabel(legend) {
        this.legend = legend;
    }

    getLabelColor() {
        return this.legendColor;
    }

    setLabelColor(legendColor) {
        this.legendColor = legendColor;
    }

    getValues() {
        return this.values;
    }

    setValues(values) {
        this.values = values;
    }

    setValue(index, value) {
        this.values[index] = value;
    }

    getShapes() {
        return this.shapes;
    }

    setShapes(shapes) {
        this.shapes = shapes;
    }

    getLegendShapes() {
        return this.legendShapes;
    }

    setLegendShapes(legendShapes) {
        this.legendShapes = legendShapes;
    }

    addValue(value) {
        this.values.push(value);
    }

    deleteValue(index) {
        this.values.splice(index, 1);
    }

    getSelectedValueIndex() {
        return this.selectedValueIndex;
    }

    setSelectedValueIndex(selectedValueIndex) {
        this.selectedValueIndex = selectedValueIndex;
    }

    getSelectedValue() {
        return this.selectedValue;
    }

    setSelectedValue(selectedValue) {
        this.selectedValue = selectedValue;
    }

    getMouseIndex() {
        return this.chart.mouseIndex;
    }

    setMouseIndex(index) {
        this.chart.mouseIndex = index;
    }

    getChartType() {
        return this.chartType;
    }

    setChartType(chartType) {
        this.chartType = chartType;
    }

    getChart() {
        return this.chart;
    }

    setChart(chart) {
        this.chart = chart;
    }

    getSelectedPoint() {
        return this.selectedPoint;
    }

    setSelectedPoint(selectedPoint) {
        this.selectedPoint = selectedPoint;
    }

    getInterpolateScale() {
        return this.interpolateScale;
    }

    setInterpolateScale(interpolateScale) {
        this.interpolateScale = interpolateScale;
    }

    getInterpolateValues() {
        return this.interpolateValues;
    }

    setInterpolateValues(interpolateValues) {
        this.interpolateValues = interpolateValues;
    }

    getInterpolates() {
        return this.interpolates;
    }

    setInterpolates(interpolates) {
        this.interpolates = interpolates;
    }

    getInterpolationType() {
        return this.interpolationType;
    }

    setInterpolationType(interpolationType) {
        this.interpolationType = interpolationType;
    }

    getMax() {
        return Math.max(...this.values);
    }

    toString() {
        return `ChartElement [elementName=${this.elementName}, elementColor=${this.elementColor}, legend=${this.legend}, legendColor=${this.legendColor}, values=${this.values}, shapes=${this.shapes}, legendShapes=${this.legendShapes}, selectedValueIndex=${this.selectedValueIndex}, selectedValue=${this.selectedValue}, selectedPoint=${this.selectedPoint}, chartType=${this.chartType}, graph=${this.chart}, interpolateScale=${this.interpolateScale}, interpolateValues=${this.interpolateValues}, interpolates=${this.interpolates}, interpolationType=${this.interpolationType}]`;
    }
}
