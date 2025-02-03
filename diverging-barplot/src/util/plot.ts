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
    addHoverHandlers() {
        // event handlers
        const handleMouseover = (e: any, d: any) => {
            const tooltipData = [
                `feature ID: ${d.featureId}`,
                `classification: todo`,
                `lfc: ${d.lfc}`,
                `se: ${d.se}`,
                `p-value: ${d.p}`,
                `q-value: ${d.q}`,
            ];

            d3.select(".tooltip")
                .style("left", `${e.clientX + 25}px`)
                .style("top", `${e.clientY - 10}px`)
                .selectAll("p")
                .data(tooltipData)
                .join("p")
                .text((d, i) => tooltipData[i])
                .style("margin", "2px");

            d3.select(".tooltip")
                .transition()
                .duration(300)
                .style("opacity", 1);
        };

        const handleMousemove = (e: any, d: any) => {
            d3.select(".tooltip")
                .style("left", `${e.clientX + 25}px`)
                .style("top", `${e.clientY - 10}px`);
        };

        const handleMouseout = (e: any, d: any) => {
            d3.select(".tooltip")
                .transition()
                .duration(300)
                .style("opacity", 0);
        };

        // create tooltip
        d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("background-color", "#f0edef")
            .style("padding", "10px")
            .style("border-radius", "10px")
            .style("position", "absolute")
            .style("opacity", 0);

        // register event handlers
        d3.select("svg")
            .selectAll("rect, .error-bar")
            .on("mouseover", handleMouseover)
            .on("mousemove", handleMousemove)
            .on("mouseout", handleMouseout);
    }

    /**
     */
    drawErrorBar(path: d3.Path, d: ViewRecord, i: number): d3.Path {
        // calculate error bar layout
        const startX = this.xScale(d.lfc)!;
        const startY =
            this.yScale(i.toString())! + this.dimensions.barHeight / 2;

        const errorBarRight = this.xScale(d.lfc + d.se);
        const errorBarLeft = startX - (errorBarRight - startX);
        const errorBarTop = startY + 0.25 * this.dimensions.barHeight;
        const errorBarBottom = startY - 0.25 * this.dimensions.barHeight;

        // draw error bar
        path.moveTo(errorBarRight, errorBarTop);
        path.lineTo(errorBarRight, errorBarBottom);
        path.moveTo(errorBarRight, startY);
        path.lineTo(errorBarLeft, startY);
        path.moveTo(errorBarLeft, errorBarTop);
        path.lineTo(errorBarLeft, errorBarBottom);

        return path;
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

        // draw error bars
        d3.select("svg")
            .selectAll(".error-bar")
            .data(this.data)
            .join("path")
            .attr("class", "error-bar")
            .attr("d", (d, i) => this.drawErrorBar(d3.path(), d, i).toString())
            .attr("stroke", "black")
            .attr("stroke-width", "2px");

        // attach event listeners
        this.addHoverHandlers();
    }

    /**
     */
    updatePlot(data: ViewRecord[]) {
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
            .duration(400)
            .attr("x", (d) => (d.lfc > 0 ? this.xScale(0) : this.xScale(d.lfc)))
            .attr("y", (d, i) => this.yScale(String(i)))
            .attr("width", (d) => Math.abs(this.xScale(d.lfc) - this.xScale(0)))
            .attr("height", this.dimensions.barHeight)
            .attr("fill", (d) => (d.lfc > 0 ? "green" : "red"));

        // transition error bars
        d3.select("svg")
            .selectAll(".error-bar")
            .data(this.data)
            .join("path")
            .transition()
            .duration(400)
            .attr("class", "error-bar")
            .attr("d", (d, i) => this.drawErrorBar(d3.path(), d, i).toString())
            .attr("stroke", "black")
            .attr("stroke-width", "2px");

        // reattach hover event listeners
        this.addHoverHandlers();
    }
}
