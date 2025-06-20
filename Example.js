import { DefaultChartFactory } from "./factory/DefaultChartFactory.js";
import ChartConstants from "./ChartConstants.js";
import sample from './sample.js';


// Create HTML content manually
const chartWidth = 350;
const chartHeight = 250;

export default function startup() {
    console.log("ChaosChart Library v0.0.1");

    const rootElement = document.getElementById("root");

    // Title section
    const titleContainer = document.createElement("div");
    titleContainer.className = "titleContainer";
    titleContainer.innerHTML = `
            <p>ChaosChart Javascript Library v1.0.0</p>
            <p>©️ All rights reserved by author Kooin Shin.</p>
        `;

    const htmlCheck = document.createElement("div");
    htmlCheck.className = "htmlCheck";
    htmlCheck.textContent = "HTML is loaded and script is running.";
    titleContainer.appendChild(htmlCheck);

    // Chart container (dummy content, replace with actual chart rendering logic)
    const chartContainer1 = document.createElement("div");
    chartContainer1.className = "chartContainer";
    const canvas = document.createElement("canvas");
    canvas.className = "chartCanvas";
    canvas.width = chartWidth;
    canvas.height = chartHeight;
    const chart1 = DefaultChartFactory.createChart(ChartConstants.CHART.AREA, sample, canvas);
    chart1.setTitle("Sample Chart");
    chart1.drawChart();

    const chartContainer2 = document.createElement("div");
    chartContainer2.className = "chartContainer";
    const canvas2 = document.createElement("canvas");
    canvas2.className = "chartCanvas";
    canvas2.width = chartWidth;
    canvas2.height = chartHeight;
    const chart2 = DefaultChartFactory.createChart(ChartConstants.CHART.LINE, sample, canvas2);
    chart2.setTitle("Sample Chart");
    chart2.drawChart();

    const chartContainer3 = document.createElement("div");
    chartContainer3.className = "chartContainer";
    const canvas3 = document.createElement("canvas");
    canvas3.className = "chartCanvas";
    canvas3.width = chartWidth;
    canvas3.height = chartHeight;
    const chart3 = DefaultChartFactory.createChart(ChartConstants.CHART.CIRCLE, sample, canvas3);
    chart3.setTitle("Sample Chart");
    chart3.setShowGridX(false);
    chart3.setShowGridY(false);

    chart3.drawChart();

    const chartContainer4 = document.createElement("div");
    chartContainer4.className = "chartContainer";
    const canvas4 = document.createElement("canvas");
    canvas4.className = "chartCanvas";
    canvas4.width = chartWidth;
    canvas4.height = chartHeight;
    const chart4 = DefaultChartFactory.createChart(ChartConstants.CHART.BAR, sample, canvas4);
    chart4.setTitle("Sample Chart");
    chart4.drawChart();

    const chartContainer5 = document.createElement("div");
    chartContainer5.className = "chartContainer";
    const canvas5 = document.createElement("canvas");
    canvas5.className = "chartCanvas";
    canvas5.width = chartWidth;
    canvas5.height = chartHeight;
    const chart5 = DefaultChartFactory.createChart(ChartConstants.CHART.BAR_RATIO, sample, canvas5);
    chart5.setTitle("Sample Chart");
    chart5.drawChart();

    // Append elements to the root
    rootElement.appendChild(titleContainer);

    chartContainer1.appendChild(canvas);
    rootElement.appendChild(chartContainer1);

    chartContainer2.appendChild(canvas2);
    rootElement.appendChild(chartContainer2);

    chartContainer3.appendChild(canvas3);
    rootElement.appendChild(chartContainer3);

    chartContainer4.appendChild(canvas4);
    rootElement.appendChild(chartContainer4);

    chartContainer5.appendChild(canvas5);
    rootElement.appendChild(chartContainer5);

}
