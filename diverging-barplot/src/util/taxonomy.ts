import { tsv } from "d3-fetch";

export class TaxonomyNode {
    name: string;
    featureIds: string[];
    parent: TaxonomyNode | null;
    children: TaxonomyNode[];
    data: object;

    constructor(
        name: string,
        parent?: TaxonomyNode,
        id?: string,
        children?: TaxonomyNode[],
        data?: object,
    ) {
        this.name = name;
        this.parent = parent ? parent : null;
        this.featureIds = id ? [id] : [];
        this.children = children ? children : [];
        this.data = data ? data : {};
    }

    /**
     * Returns whether the node is the root.
     */
    isRoot() {
        return Object.is(this.parent, null);
    }

    /**
     * Adds `newChildren` to `this.children` if the child is not already
     * present, otherwise merges the feature IDs of `newChild` into the found
     * child. Returns the newly added child if no match was found, otherwise
     * returns the match.
     */
    addChild(newChild: TaxonomyNode): TaxonomyNode {
        const matches = this.children.filter((child) => {
            return child.name == newChild.name;
        });

        if (matches.length == 0) {
            this.children.push(newChild);
            return newChild;
        } else if (matches.length == 1) {
            const [match] = matches;
            match.featureIds.push(...newChild.featureIds);
            return match;
        } else {
            throw new Error(`More than one matching child found.`);
        }
    }

    /**
     * Returns the node with id `id` if one is present in this node's
     * descendants, otherwise returns null.
     */
    findById(id: string): TaxonomyNode | null {
        if (this.featureIds.indexOf(id) != -1) {
            return this;
        }

        for (let child of this.children) {
            let node = child.findById(id);
            if (node != null) {
                return node;
            }
        }

        return null;
    }

    /**
     * Returns the node(s) with taxon name `name` if any are present in this
     * node's descendants, otherwise returns null.
     */
    findByName(name: string): TaxonomyNode[] | null {
        let matches = [];
        if (this.name == name) {
            matches.push(this);
        }

        for (let child of this.children) {
            let nodes = child.findByName(name);
            if (nodes != null) {
                matches.push(...nodes);
            }
        }

        if (matches.length > 0) {
            return matches;
        }
        return null;
    }

    /**
     * Returns the number of ancestors of this node. Can be interpreted as
     * the level (depth) of this node, with root having level 0.
     */
    getNumberAncestors(): number {
        let ancestorCount = 0;
        let ancestor = this.parent;

        while (ancestor != null) {
            ancestor = ancestor.parent;
            ancestorCount++;
        }

        return ancestorCount;
    }

    /**
     * Returns the number of descendants of this node.
     */
    getNumberDescendants(): number {
        let numberDescendants = 0;
        for (let child of this.children) {
            numberDescendants++;
            numberDescendants += child.getNumberDescendants();
        }

        return numberDescendants;
    }
}

/**
 * Parses a taxonomy.tsv file into a tree of `TaxonomyNode`s.
 */
export async function parseTaxonomy(
    taxonomyFilepath: string,
): Promise<TaxonomyNode> {
    const root = new TaxonomyNode("root");

    const taxonomyRecords = await tsv(taxonomyFilepath);

    for (let taxonRecord of taxonomyRecords) {
        const levelNames = taxonRecord["Taxon"]
            .split(";")
            .filter((n) => n != "");
        const featureId = taxonRecord["Feature ID"];

        let parentNode = root;
        for (let [levelIndex, levelName] of levelNames.entries()) {
            const currentNode = new TaxonomyNode(levelName, parentNode);

            // if this is the last level then it has a feature ID
            if (levelIndex == levelNames.length - 1) {
                currentNode.featureIds = [featureId];
            }

            const child = parentNode.addChild(currentNode);
            parentNode = child;
        }
    }

    return root;
}
