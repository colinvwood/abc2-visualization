import { vi, describe, test, assert } from "vitest";
import { readFileSync } from "fs";
import { TaxonomyNode, parseTaxonomy } from "../src/util/taxonomy";

// mock d3.tsv
async function mockedTsv(slice: string): Promise<object[]> {
    const textData = readFileSync(slice, "utf-8");
    let lines = textData.split("\n").filter((l) => l.trim() != "");

    // drop header
    lines = lines.slice(1);

    let data: object[] = [];
    for (let line of lines) {
        const values = line.split("\t");
        const record = {
            "Feature ID": values[0],
            Taxon: values[1],
        };
        data.push(record);
    }

    return data;
}
vi.mock("d3-fetch", () => {
    return { tsv: vi.fn(mockedTsv) };
});

describe("parseTaxonomy()", async () => {
    let root: TaxonomyNode;

    test("parses successfully", async () => {
        root = await parseTaxonomy("tests/data/taxonomy-fake.tsv");
    });

    test("has correct number of nodes", () => {
        assert.equal(root.getNumberDescendants(), 11);
    });

    test("root has correct children", () => {
        const exp = ["d1", "d2"];
        assert.deepEqual(
            root.children.map((c) => c.name),
            exp,
        );
    });
});

describe("TaxonomyNode", async () => {
    const root = await parseTaxonomy("tests/data/taxonomy-fake.tsv");

    test("isRoot", () => {
        assert.isTrue(root.isRoot());

        const child = root.children[0];
        assert.isFalse(child.isRoot());
    });

    test("addChild", () => {
        assert.equal(root.children.length, 2);

        // new child added, not merged
        root.addChild(new TaxonomyNode("d3", root, "d3-id1"));
        assert.equal(root.children.length, 3);

        // existing child merged
        const child = root.addChild(new TaxonomyNode("d3", root, "d3-id2"));
        assert.equal(root.children.length, 3);
        assert.deepEqual(child.featureIds, ["d3-id1", "d3-id2"]);
    });

    test("findById", () => {
        let found = root.findById("1");
        assert.equal(found!.name, "p1");

        found = root.findById("6");
        assert.equal(found!.name, "p4");

        found = root.findById("ha");
        assert.isNull(found);
    });

    test("findByName", () => {
        let found = root.findByName("root");
        assert.equal(found!.length, 1);
        assert.equal(found![0], root);

        found = root.findByName("k1");
        assert.equal(found!.length, 2);

        found = root.findByName("c1");
        assert.equal(found!.length, 1);
        assert.deepEqual(found![0].featureIds, ["7"]);

        found = root.findByName("ha");
        assert.isNull(found);
    });

    test("getNumberAncestors", () => {
        let numAncestors = root.getNumberAncestors();
        assert.equal(numAncestors, 0);

        const p1 = root.findById("1");
        numAncestors = p1!.getNumberAncestors();
        assert.equal(numAncestors, 3);

        const c1 = root.findById("7");
        numAncestors = c1!.getNumberAncestors();
        assert.equal(numAncestors, 4);
    });

    test("getNumberDescendants", () => {
        const p1 = root.findById("1");
        let numberDescendants = p1!.getNumberDescendants();
        assert.equal(numberDescendants, 0);

        const d2 = root.findByName("d2")![0];
        numberDescendants = d2.getNumberDescendants();
        assert.equal(numberDescendants, 4);
    });
});
