import * as d3 from "d3";
import { FeatureRecords } from "../state/features.svelte";

type PlotDimensions = {
    svgWidth: number;
    svgHeight: number;
    margin: number;
    plotWidth: number;
    plotHeight: number;
    barHeight: number;
};

export class DivergingBarplot {
    dimensions: PlotDimensions;
    xScale: d3.ScaleLinear<number, number>;
    yScale: d3.ScaleBand<any>;
    xAxis: d3.Selection<any, any, any, any>;
    yAxis: d3.Selection<any, any, any, any>;

    constructor(features: FeatureRecords) {
        this.dimensions = this.createDimensions(features);
        this.xScale = this.createXScale(features);
        this.yScale = this.createYScale(features);
        this.xAxis = this.createXAxis(this.xScale);
        this.yAxis = this.createYAxis(this.yScale);

        this.drawPlot(features);
    }

    /**
     */
    createDimensions(features: FeatureRecords): PlotDimensions {
        const numFeatures = features.view.length;
        const barHeight = 45;
        const svgHeight = numFeatures * barHeight;
        const svgWidth = 750;
        const margin = 50;

        return {
            svgWidth,
            svgHeight,
            margin,
            plotWidth: svgWidth - 2 * margin,
            plotHeight: svgHeight - 2 * margin,
            barHeight,
        };
    }

    /**
     */
    updatePlotHeight(features: FeatureRecords) {
        this.dimensions.svgHeight =
            features.view.length * this.dimensions.barHeight;
        this.dimensions.plotHeight =
            this.dimensions.svgHeight - 2 * this.dimensions.margin;
    }

    /**
     */
    getXDomain(features: FeatureRecords): [number, number] {
        // get min and max lfc values
        let [min, max] = d3.extent(features.view.map((f) => f.lfc));

        if (!min || !max) {
            throw new Error("Unable to find min/max of feature lfcs.");
        }

        // calculate scale range
        const scaleMargin = 0.25;
        if (min < 0) {
            min = (1 + scaleMargin) * min;
        } else {
            min = -scaleMargin * max;
        }

        if (max > 0) {
            max = (1 + scaleMargin) * max;
        } else {
            max = -scaleMargin * min;
        }

        return [min, max];
    }

    /**
     */
    getXRange() {
        return [
            this.dimensions.margin,
            this.dimensions.margin + this.dimensions.plotWidth,
        ];
    }

    /**
     */
    createXScale(features: FeatureRecords): d3.ScaleLinear<number, number> {
        const domain = this.getXDomain(features);
        const range = this.getXRange();
        const scale = d3.scaleLinear().domain(domain).range(range);

        return scale;
    }

    /**
     */
    getYDomain(features: FeatureRecords): string[] {
        return d3.range(0, features.view.length).map((i) => String(i));
    }

    /**
     */
    getYRange() {
        return [
            this.dimensions.margin,
            this.dimensions.margin + this.dimensions.plotHeight,
        ];
    }

    /**
     */
    createYScale(features: FeatureRecords): d3.ScaleBand<any> {
        const domain = this.getYDomain(features);
        const range = this.getYRange();
        const scale = d3.scaleBand().domain(domain).range(range).padding(0.2);

        return scale;
    }

    /**
     */
    getXAxisTranslation() {
        const translation = this.dimensions.margin + this.dimensions.plotHeight;
        return `translate(0, ${translation})`;
    }

    /**
     */
    getYAxisTranslation() {
        return `translate(${this.xScale(0)}, 0)`;
    }

    /**
     */
    createXAxis(
        scale: d3.ScaleLinear<number, number>,
    ): d3.Selection<any, any, any, any> {
        let axis = d3
            .select("svg")
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", this.getXAxisTranslation())
            .call(d3.axisBottom(scale));

        return axis;
    }

    /**
     */
    createYAxis(scale: d3.ScaleBand<any>): d3.Selection<any, any, any, any> {
        let axis = d3
            .select("svg")
            .append("g")
            .attr("class", "y-axis")
            .attr("transform", this.getYAxisTranslation())
            .call(
                d3
                    .axisLeft(this.yScale)
                    .tickSize(0)
                    .tickFormat("" as any),
            );

        return axis;
    }

    /**
     */
    drawPlot(features: FeatureRecords) {
        // size svg
        let svg = d3
            .select("svg")
            .attr("width", this.dimensions.svgWidth)
            .attr("height", this.dimensions.svgHeight);

        // draw bars
        svg.selectAll("rect")
            .data(features.view)
            .join("rect")
            .attr("x", (d) => (d.lfc > 0 ? this.xScale(0) : this.xScale(d.lfc)))
            .attr("y", (d, i) => this.yScale(String(i)))
            .attr("width", (d) => Math.abs(this.xScale(d.lfc) - this.xScale(0)))
            .attr("height", this.yScale.bandwidth())
            .attr("fill", (d) => (d.lfc > 0 ? "green" : "red"));
    }

    /**
     */
    updatePlot(features: FeatureRecords) {
        // update plot height
        this.updatePlotHeight(features);

        // update scales
        const xDomain = this.getXDomain(features);
        const xRange = this.getXRange();
        const yDomain = this.getYDomain(features);
        const yRange = this.getYRange();

        this.xScale.domain(xDomain).range(xRange);
        this.yScale.domain(yDomain).range(yRange);

        // transition axes
        this.xAxis
            .transition()
            .duration(500)
            .attr("transform", this.getXAxisTranslation())
            .call(d3.axisBottom(this.xScale));

        this.yAxis
            .transition()
            .duration(500)
            .attr("transform", this.getYAxisTranslation())
            .call(
                d3
                    .axisLeft(this.yScale)
                    .tickSize(0)
                    .tickFormat("" as any),
            );

        // transition bars
        d3.select("svg")
            .selectAll("rect")
            .data(features.view)
            .transition()
            .duration(500)
            .attr("x", (d) => (d.lfc > 0 ? this.xScale(0) : this.xScale(d.lfc)))
            .attr("y", (d, i) => this.yScale(String(i)))
            .attr("width", (d) => Math.abs(this.xScale(d.lfc) - this.xScale(0)))
            .attr("height", this.yScale.bandwidth())
            .attr("fill", (d) => (d.lfc > 0 ? "green" : "red"));
    }
}
