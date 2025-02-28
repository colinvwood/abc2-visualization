import { tsv } from "d3-fetch";
import * as d3 from "d3";

type PlotDimensions = {
    width: number;
    margin: number;
};
export class TaxonomyPlot {
    dimensions: PlotDimensions = {
        width: 1700,
        margin: 50,
    };

    root: d3.HierarchyNode<TaxonomyNode>;
    treeLayout: d3.TreeLayout<any>;
    link: d3.Link<any, any, any>;

    constructor(root: d3.HierarchyNode<TaxonomyNode>) {
        this.hideAllChildren(root);
        this.root = root;
        this.treeLayout = this.createTreeLayout();
        this.link = this.createLinkGenerator();
        this.createSvgGroups();
    }

    hideAllChildren(root: d3.HierarchyNode<TaxonomyNode>) {
        root.descendants().forEach((node, i) => {
            node._children = node.children;
            node.id = i;
            node.children = null;
        });

        root.links().forEach((node, i) => {});
    }

    createTreeLayout(): d3.TreeLayout<any> {
        const taxonomyDepth = this.root.height;
        const nodeWidth = this.dimensions.width / (taxonomyDepth + 1);
        const nodeHeight = 20;
        const treeLayout = d3.tree().nodeSize([nodeHeight, nodeWidth]);

        return treeLayout;
    }

    createLinkGenerator(): d3.Link<any, any, any> {
        return d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x);
    }

    createSvgGroups() {
        const svg = d3
            .select(".taxonomy svg")
            .append("g")
            .attr("class", "node-group");

        svg.append("g").attr("class", "link-group");
    }

    addClickHandlers(selection: d3.Selection<any, any, any, any>) {
        selection.on("click", (event, d) => {
            d.children = d.children ? null : d._children;
            this.render(event, d);
        });
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

        enterSelection
            .append("circle")
            .attr("r", 3)
            .attr("fill", "#555")
            .attr("stroke-width", 10);

        enterSelection
            .append("text")
            .text((d) => d.data.name)
            .attr("dy", 4)
            .attr("x", (d) => (d._children ? -5 : 5))
            .attr("text-anchor", (d) => (d._children ? "end" : "start"))
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 5)
            .attr("stroke", "white")
            .attr("paint-order", "stroke")
            .attr("font-weight", "bold")
            .attr("font-size", 14);

        this.addClickHandlers(enterSelection);

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
            .attr("d", this.link);

        // transition exiting links to parents' new
        updateSelection
            .exit()
            .transition(transition)
            .remove()
            .attr("d", (d) => {
                const parentNew = { x: source.x, y: source.y };
                return this.link({ source: parentNew, target: parentNew });
            });
    }

    render(event: MouseEvent | null, source: d3.HierarchyNode<TaxonomyNode>) {
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
