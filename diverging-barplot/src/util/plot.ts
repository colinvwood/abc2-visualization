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

/**
 */
export function getDimensions(
    features: FeatureRecords,
    barHeight: number,
): PlotDimensions {
    const numFeatures = features.view.length;
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
function getXScale(
    features: FeatureRecords,
    dimensions: PlotDimensions,
): d3.ScaleLinear<number, number> {
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

    const scale = d3
        .scaleLinear()
        .domain([min, max])
        .range([dimensions.margin, dimensions.margin + dimensions.plotWidth]);

    return scale;
}

/**
 */
function getYScale(
    features: FeatureRecords,
    dimensions: PlotDimensions,
): d3.ScaleBand<string> {
    const domain = d3.range(0, features.view.length).map((i) => String(i));
    const padding = 0.2;

    const scale = d3
        .scaleBand()
        .domain(domain)
        .range([dimensions.margin, dimensions.margin + dimensions.plotHeight])
        .padding(padding);

    return scale;
}

/**
 */
export function drawPlot(
    features: FeatureRecords,
    barHeight: number,
): undefined {
    // get plot dimensions and scales
    const dimensions = getDimensions(features, barHeight);
    const xScale = getXScale(features, dimensions);
    const yScale = getYScale(features, dimensions);

    // size svg
    let svg = d3
        .select("svg")
        .attr("width", dimensions.svgWidth)
        .attr("height", dimensions.svgHeight);

    // draw axes
    let xAxis = svg
        .append("g")
        .attr(
            "transform",
            `translate(0, ${dimensions.margin + dimensions.plotHeight})`,
        )
        .call(d3.axisBottom(xScale));

    let yAxis = svg
        .append("g")
        .attr("transform", `translate(${xScale(0)}, 0)`)
        .call(
            d3
                .axisLeft(yScale)
                .tickSize(0)
                .tickFormat("" as any),
        );

    // draw bars
    svg.selectAll("rect")
        .data(features.view)
        .join("rect")
        .attr("x", xScale(0))
        .attr("y", (_, i) => yScale(String(i)))
        .attr("width", (d) => Math.abs(xScale(d.lfc) - xScale(0)))
        .attr("height", yScale.bandwidth())
        .attr("fill", (d) => (d.lfc > 0 ? "green" : "red"));
}
