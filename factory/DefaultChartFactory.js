import ChartConstants from '../ChartConstants.js';
import { AreaChart } from '../AreaChart.js';
import { BarChart } from '../BarChart.js';
import { BarRatioChart } from '../BarRatioChart.js';
import { CircleChart } from '../CircleChart.js';
import { LineChart } from '../LineChart.js';

/**
 * Default Chart creating object
 * 
 * @author 9ins
 */
export class DefaultChartFactory {

    /**
     * Create chart
     * @param {*} chartType 
     * @param {*} elementsJson 
     * @param {*} canvas 
     * @returns 
     */
    static createChart(chartType, elementsJson, canvas = null) {
        if (chartType === ChartConstants.CHART.BAR) {
            return new BarChart(canvas, elementsJson, "");
        } else if (chartType === ChartConstants.CHART.AREA) {
            return new AreaChart(canvas, elementsJson, "");
        } else if (chartType === ChartConstants.CHART.BAR_RATIO) {
            return new BarRatioChart(canvas, elementsJson, "");
        } else if (chartType === ChartConstants.CHART.LINE) {
            return new LineChart(canvas, elementsJson, "");
        } else if (chartType === ChartConstants.CHART.CIRCLE) {
            return new CircleChart(canvas, elementsJson, "", false);
        } else {
            throw new Error("Chart type: " + chartType + " is not supported!!!");
        }
    }
}
