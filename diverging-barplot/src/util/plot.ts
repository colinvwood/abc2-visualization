import * as d3 from "d3";
import { type ViewRecord } from "../state/features.svelte";

type PlotDimensions = {
    svgWidth: number;
    svgHeight: number;
    margin: number;
    plotWidth: number;
    plotHeight: number;
    barHeight: number;
    barPadding: number;
};

export class DivergingBarplot {
    data: ViewRecord[];
    dimensions: PlotDimensions;
    xScale: d3.ScaleLinear<number, number>;
    yScale: d3.ScaleBand<any>;
    xAxis: d3.Selection<any, any, any, any>;
    yAxis: d3.Selection<any, any, any, any>;

    constructor(data: ViewRecord[]) {
        this.data = data;
        this.dimensions = this.createDimensions();
        this.xScale = this.createXScale();
        this.yScale = this.createYScale();
        this.xAxis = this.createXAxis();
        this.yAxis = this.createYAxis();

        this.drawPlot();
    }

    /**
     */
    createDimensions(): PlotDimensions {
        const numFeatures = this.data.length;
        const barHeight = 25;
        const barPadding = 1.25;
        const plotHeight = numFeatures * barHeight * barPadding;
        const plotWidth = 750;
        const margin = 50;

        return {
            svgWidth: plotWidth + 2 * margin,
            svgHeight: plotHeight + 2 * margin,
            margin,
            plotWidth,
            plotHeight,
            barHeight,
            barPadding,
        };
    }

    /**
     */
    updatePlotHeight() {
        this.dimensions.plotHeight =
            this.data.length *
            this.dimensions.barHeight *
            this.dimensions.barPadding;
        this.dimensions.svgHeight =
            this.dimensions.plotHeight + 2 * this.dimensions.margin;
    }

    /**
     */
    getXDomain(): [number, number] {
        // get min and max lfc values
        let [min, max] = d3.extent(this.data.map((f) => f.lfc));

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
    createXScale(): d3.ScaleLinear<number, number> {
        const domain = this.getXDomain();
        const range = this.getXRange();
        const scale = d3.scaleLinear().domain(domain).range(range);

        return scale;
    }

    /**
     */
    getYDomain(): string[] {
        return d3.range(0, this.data.length).map((i) => String(i));
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
    createYScale(): d3.ScaleBand<any> {
        const domain = this.getYDomain();
        const range = this.getYRange();
        const scale = d3.scaleBand().domain(domain).range(range);

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
    createXAxis(): d3.Selection<any, any, any, any> {
        let axis = d3
            .select("svg")
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", this.getXAxisTranslation())
            .call(d3.axisBottom(this.xScale));

        return axis;
    }

    /**
     */
    createYAxis(): d3.Selection<any, any, any, any> {
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
    drawPlot() {
        // size svg
        let svg = d3
            .select("svg")
            .attr("width", this.dimensions.svgWidth)
            .attr("height", this.dimensions.svgHeight);

        // draw bars
        svg.selectAll("rect")
            .data(this.data)
            .join("rect")
            .attr("x", (d) => (d.lfc > 0 ? this.xScale(0) : this.xScale(d.lfc)))
            .attr("y", (d, i) => this.yScale(String(i)))
            .attr("width", (d) => Math.abs(this.xScale(d.lfc) - this.xScale(0)))
            .attr("height", this.dimensions.barHeight)
            .attr("fill", (d) => (d.lfc > 0 ? "green" : "red"));
    }

    /**
     */
    updatePlot(data: ViewRecord[]) {
        console.log("view records in update plot", data);
        this.data = data;

        // update plot height
        this.updatePlotHeight();

        // update scales
        const xDomain = this.getXDomain();
        const xRange = this.getXRange();
        const yDomain = this.getYDomain();
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
            .data(this.data)
            .join("rect")
            .transition()
            .duration(500)
            .attr("x", (d) => (d.lfc > 0 ? this.xScale(0) : this.xScale(d.lfc)))
            .attr("y", (d, i) => this.yScale(String(i)))
            .attr("width", (d) => Math.abs(this.xScale(d.lfc) - this.xScale(0)))
            .attr("height", this.dimensions.barHeight)
            .attr("fill", (d) => (d.lfc > 0 ? "green" : "red"));
    }
}
