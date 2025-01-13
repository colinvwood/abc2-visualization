import { describe, test, assert, expect } from "vitest";
import { readFileSync } from "fs";
import {
    getColumnField,
    isCategoricalColumn,
    parseFeatureRecord,
} from "../src/util/parse";

describe("getColumnField()", () => {
    const lfcText = readFileSync("tests/data/output-format/lfc.jsonl", "utf-8");
    const header = JSON.parse(lfcText.split("\n")[0]);

    test("column name is present", () => {
        const column = "body-site::left palm";
        const exp = {
            name: "body-site::left palm",
            type: null,
            missing: false,
            title: "",
            description: "",
            extra: {
                variable: "body-site",
                level: "left palm",
                reference: "gut",
            },
        };

        assert.deepEqual(getColumnField(column, header), exp);
    });

    test("column name not present", () => {
        const column = "waldo";

        assert.throws(
            () => getColumnField(column, header),
            "Column waldo not found in JSONL header.",
        );
    });
});

describe("isCategoricalColumn()", () => {
    const lfcText = readFileSync("tests/data/output-format/lfc.jsonl", "utf-8");
    const header = JSON.parse(lfcText.split("\n")[0]);

    test("categorical column correctly identified", () => {
        const column = "body-site::left palm";
        assert.isTrue(isCategoricalColumn(column, header));
    });

    test("numerical column not identified as categorical", () => {
        const column = "year";
        assert.isFalse(isCategoricalColumn(column, header));
    });

    test("nonexistent column errors", () => {
        const column = "waldo";
        assert.throws(
            () => isCategoricalColumn(column, header),
            "Column waldo not found in JSONL header.",
        );
    });
});

describe("parseFeatureRecord()", () => {
    const lfcText = readFileSync("tests/data/output-format/lfc.jsonl", "utf-8");
    const jsonRecords = lfcText
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => JSON.parse(line));

    const header = jsonRecords[0];
    const jsonRecord = jsonRecords[1];
    const sliceName = "lfc";

    const obs = parseFeatureRecord(jsonRecord, header, sliceName);

    test("parses feature id", () => {
        assert.equal(obs.featureId, "4b5eeb300368260019c1fbc7a3c718fc");
    });

    test("parses into one slice record", () => {
        assert.equal(Object.keys(obs.slices).length, 1);
        assert.property(obs.slices, "lfc");
    });

    test("parses correct number of variables", () => {
        assert.equal(obs.slices.lfc.variables.length, 5);
    });

    test("parses categorical columns", () => {
        const bodySiteVariables = obs.slices.lfc.variables.filter(
            (v) => v.name === "body-site",
        );
        assert.equal(bodySiteVariables.length, 3);

        const levels = bodySiteVariables.map((v) => v.level);
        assert.sameMembers(levels, ["right palm", "left palm", "tongue"]);

        const references = bodySiteVariables.map((v) => v.reference);
        assert.sameMembers(references, ["gut", "gut", "gut"]);
    });

    test("parses numerical columns", () => {
        const nonCategoricalVariables = obs.slices.lfc.variables.filter(
            (v) => !Object.hasOwn(v, "reference"),
        );
        assert.equal(nonCategoricalVariables.length, 2);

        const yearVariable = nonCategoricalVariables.filter(
            (v) => v.name === "year",
        )[0];
        assert.deepEqual(yearVariable, {
            name: "year",
            value: 189.6871124062,
        });
    });
});
