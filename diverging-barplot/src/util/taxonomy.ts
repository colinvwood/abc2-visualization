import { tsv } from "d3-fetch";
import * as d3 from "d3";

type PlotDimensions = {
    width: number;
    margin: number;
    nodeWidth: number;
    nodeHeight: number;
    boxHeight: number;
    boxWidth: number;
};

export class TaxonomyPlot {
    dimensions: PlotDimensions;
    root: d3.HierarchyNode<TaxonomyNode>;
    treeLayout: d3.TreeLayout<any>;
    link: d3.Link<any, any, any>;

    constructor(root: d3.HierarchyNode<TaxonomyNode>) {
        this.root = root;
        this.initTree(this.root);

        this.dimensions = this.getDimensions();
        this.treeLayout = this.createTreeLayout();
        this.link = this.createLinkGenerator();

        this.initSvg();
    }

    initTree(root: d3.HierarchyNode<TaxonomyNode>) {
        root.descendants().forEach((node, i) => {
            node._children = node.children;
            node.id = i;
            node.children = null;
            node.expand = false;
            node.keep = false;
        });
    }

    getDimensions() {
        const width = 1750;
        const margin = 50;

        const taxonomyDepth = this.root.height;
        const nodeWidth = width / (taxonomyDepth + 1);
        const nodeHeight = 30;

        const dimensions: PlotDimensions = {
            width: width,
            margin: margin,
            nodeHeight: nodeHeight,
            nodeWidth: nodeWidth,
            boxWidth: 0.8 * nodeWidth,
            boxHeight: 0.8 * nodeHeight,
        };

        return dimensions;
    }

    createTreeLayout(): d3.TreeLayout<any> {
        const treeLayout = d3
            .tree()
            .nodeSize([this.dimensions.nodeHeight, this.dimensions.nodeWidth]);

        return treeLayout;
    }

    createLinkGenerator(): d3.Link<any, any, any> {
        return d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x);
    }

    initSvg() {
        const svg = d3.select(".taxonomy svg");

        const zoomContainer = svg.append("g");

        zoomContainer.append("g").attr("class", "link-group");
        zoomContainer.append("g").attr("class", "node-group");

        const zoom = d3
            .zoom()
            .scaleExtent([0.5, 2])
            .on("zoom", (event) => {
                zoomContainer.attr("transform", event.transform);
            });

        svg.call(zoom).on("dblclick.zoom", null);
    }

    resizeSvg(): d3.Transition<any, any, any, any> {
        // find lowest and highest node coordinates (along svg y axis)
        let upperLimit = 0;
        let lowerLimit = 0;
        this.root.eachBefore((node) => {
            if (node.x! < lowerLimit) lowerLimit = node.x!;
            if (node.x! > upperLimit) upperLimit = node.x!;
        });

        const height = upperLimit - lowerLimit + 2 * this.dimensions.margin;

        // resize the svg and readjust its viewbox to center the tree
        const transition = d3
            .select(".taxonomy svg")
            .transition()
            .duration(200)
            .attr("width", this.dimensions.width)
            .attr("height", height)
            .attr("viewBox", [
                -this.dimensions.margin,
                lowerLimit - this.dimensions.margin,
                this.dimensions.width,
                height,
            ]);

        return transition;
    }

    addExpandHandlers() {
        d3.selectAll(".expand-button").on("click", (event, d) => {
            d.expand = !d.expand;
            this.render(d);
        });
    }

    addKeepHandlers() {
        d3.selectAll(".keep-button").on("click", (event, d) => {
            d.keep = !d.keep;

            const fillColor = d.keep ? "orange" : "lightgray";
            d3.select(event.currentTarget)
                .select("rect")
                .attr("fill", fillColor);

            this.render(d);
        });
    }

    drawButton(
        selection: d3.Selection<any, any, any, any>,
        type: "expand" | "keep",
    ) {
        let xTranslation;
        let className;
        let letter;
        if (type == "expand") {
            xTranslation = this.dimensions.boxWidth - this.dimensions.boxHeight;
            className = "expand-button";
            letter = "E";
        } else if (type == "keep") {
            xTranslation =
                this.dimensions.boxWidth - 2 * this.dimensions.boxHeight;
            className = "keep-button";
            letter = "K";
        } else {
            throw new Error("Unrecognized button type.");
        }

        const button = selection
            .append("g")
            .attr("class", className)
            .attr("transform", `translate(${xTranslation}, 2)`);

        button
            .append("rect")
            .attr("width", this.dimensions.boxHeight - 4)
            .attr("height", this.dimensions.boxHeight - 4)
            .attr("fill", "lightgray");

        if (type == "keep") {
            button
                .selectAll("rect")
                .attr("fill", (d) => (d.keep ? "orange" : "lightgray"));
        }

        button
            .append("text")
            .text(letter)
            .attr("x", this.dimensions.boxHeight / 2 - 2)
            .attr("y", this.dimensions.boxHeight / 2 - 2)
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle")
            .attr("font-size", 14)
            .attr("dy", 2);
    }

    drawNodes(
        nodes: d3.HierarchyNode<TaxonomyNode>[],
        source: d3.HierarchyNode<TaxonomyNode>,
        transition: d3.Transition<any, any, any, any>,
    ) {
        const updateSelection = d3
            .select(".node-group")
            .selectAll(".taxonomy-node")
            .data(nodes, (d) => d.id);

        // create entering node groups
        const enterSelection = updateSelection
            .enter()
            .append("g")
            .attr("class", "taxonomy-node")
            .attr("cursor", "pointer")
            .attr("transform", (d) => `translate(${source.y0}, ${source.x0})`)
            .attr("stroke-opacity", 1)
            .attr("fill-opacity", 1);

        // taxon names
        enterSelection
            .append("text")
            .text((d) => {
                if (d.data.name.length > 18) {
                    return d.data.name.slice(0, 15) + "...";
                }
                return d.data.name;
            })
            .attr("dx", 10)
            .attr("y", this.dimensions.boxHeight / 2)
            .attr("dominant-baseline", "middle")
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 5)
            .attr("stroke", "white")
            .attr("paint-order", "stroke")
            .attr("font-weight", "bold")
            .attr("font-size", 13);

        // draw taxon boxes
        enterSelection
            .append("rect")
            .attr("height", this.dimensions.boxHeight)
            .attr("width", this.dimensions.boxWidth)
            .attr("fill", "white")
            .attr("stroke", "gray")
            .attr("stroke-width", 2)
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("stroke-opacity", 1)
            .attr("fill-opacity", 0);

        // left circle
        enterSelection
            .append("circle")
            .attr("cx", 0)
            .attr("cy", this.dimensions.boxHeight / 2)
            .attr("r", 3)
            .attr("fill", "#555");

        // right circle; visible only if node has children
        enterSelection
            .append("circle")
            .attr("cx", this.dimensions.boxWidth)
            .attr("cy", this.dimensions.boxHeight / 2)
            .attr("r", (d) => (d._children ? 3 : 0))
            .attr("fill", "#555");

        this.drawButton(enterSelection, "expand");
        this.drawButton(enterSelection, "keep");

        // add click event handlers
        this.addExpandHandlers();
        this.addKeepHandlers();

        // color buttons
        updateSelection
            .selectAll(".expand-button")
            .select("rect")
            .attr("fill", (d) => (d.expand ? "lightblue" : "lightgray"));

        updateSelection
            .selectAll(".keep-button")
            .select("rect")
            .attr("fill", (d) => (d.keep ? "orange" : "lightgray"));

        // transition all nodes to their new positions
        updateSelection
            .merge(enterSelection)
            .transition(transition)
            .attr("transform", (d) => `translate(${d.y}, ${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        // transition exiting nodes to parents' new positions
        updateSelection
            .exit()
            .transition(transition)
            .remove()
            .attr("transform", (d) => `translate(${source.y}, ${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);
    }

    drawLinks(
        links: d3.HierarchyLink<TaxonomyNode>[],
        source: d3.HierarchyNode<TaxonomyNode>,
        transition: d3.Transition<any, any, any, any>,
    ) {
        const updateSelection = d3
            .select(".link-group")
            .selectAll(".taxonomy-link")
            .data(links, (d) => d.target.id);

        // create entering link paths
        const enterSelection = updateSelection
            .enter()
            .append("path")
            .attr("class", "taxonomy-link")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", 1.5)
            .attr("d", (d) => {
                const parentOld = { x: source.x0, y: source.y0 };
                return this.link({ source: parentOld, target: parentOld });
            });

        // transition all links to their new shapes
        updateSelection
            .merge(enterSelection)
            .transition(transition)
            .attr("d", (d) => {
                const sourceX = d.source.x! + this.dimensions.boxHeight / 2;
                const targetX = d.target.x! + this.dimensions.boxHeight / 2;

                const sourceY = d.source.y! + this.dimensions.boxWidth;
                const targetY = d.target.y!;

                const positions = {
                    source: { x: sourceX, y: sourceY },
                    target: { x: targetX, y: targetY },
                };
                return this.link(positions);
            });

        // transition exiting links to parent's new position
        updateSelection
            .exit()
            .transition(transition)
            .remove()
            .attr("d", (d) => {
                const parentNew = { x: source.x, y: source.y };
                return this.link({ source: parentNew, target: parentNew });
            });
    }

    assignChildren(node: d3.HierarchyNode<TaxonomyNode>): boolean {
        let keptDescendant = node.keep;
        if (!node._children) {
            return keptDescendant;
        }

        node.children = [];
        for (let child of node._children) {
            if (this.assignChildren(child)) {
                node.children.push(child);
                keptDescendant = true;
            }
        }

        if (node.expand) {
            node.children = node._children;
        }

        if (node.children!.length == 0) {
            node.children = null;
        }

        return keptDescendant;
    }

    render(source: d3.HierarchyNode<TaxonomyNode>) {
        // update visible children
        this.assignChildren(this.root);

        // gather all expanded nodes and links
        const nodes = this.root.descendants().reverse();
        const links = this.root.links();

        // assign coordinates to nodes
        this.treeLayout(this.root);

        const transition = this.resizeSvg();
        this.drawLinks(links, source, transition);
        this.drawNodes(nodes, source, transition);

        // store the current positions for the next render
        this.root.eachBefore((node) => {
            node.x0 = node.x;
            node.y0 = node.y;
        });
    }
}

export class TaxonomyNode {
    name: string;
    featureIDs: string[];
    children: TaxonomyNode[];
    hierarchyNode: d3.HierarchyNode<TaxonomyNode> | null;

    constructor(name: string) {
        this.name = name;
        this.featureIDs = [];
        this.children = [];
        this.hierarchyNode = null;
    }

    getChild(name: string): TaxonomyNode | null {
        let matchingChildren = this.children.filter((child) => {
            return child.name == name;
        });

        if (matchingChildren.length > 1) {
            throw new Error("More than one matching child found.");
        }
        if (matchingChildren.length == 0) {
            return null;
        }

        return matchingChildren[0];
    }
}

/**
 * Parses a taxonomy.tsv file into a d3.hierarchy.
 */
export async function parseTaxonomy(
    taxonomyFilepath: string,
): Promise<d3.HierarchyNode<TaxonomyNode>> {
    const taxonomyRecords = await tsv(taxonomyFilepath);

    const root = new TaxonomyNode("root");

    for (let taxonRecord of taxonomyRecords) {
        const levelNames = taxonRecord["Taxon"]
            .split(";")
            .filter((n) => n != "");
        const featureId = taxonRecord["Feature ID"];

        let parentNode = root;
        for (let [levelIndex, levelName] of levelNames.entries()) {
            const currentNode = new TaxonomyNode(levelName);

            // if this is the last level then it has a feature ID
            if (levelIndex == levelNames.length - 1) {
                currentNode.featureIDs.push(featureId);
            }

            // merge with matching child if one exists
            const matchingChild = parentNode.getChild(levelName);
            if (matchingChild) {
                matchingChild.featureIDs.push(...currentNode.featureIDs);
                parentNode = matchingChild;
            } else {
                parentNode.children.push(currentNode);
                parentNode = currentNode;
            }
        }
    }

    const hierarchyRoot = d3.hierarchy(root);

    // create back references from TaxonomyNodes to d3 nodes
    hierarchyRoot.eachBefore((node) => {
        node.data.hierarchyNode = node;
    });

    return hierarchyRoot;
}
