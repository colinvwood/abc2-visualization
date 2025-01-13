import { describe, test, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { getColumnField, isCategoricalColumn } from "../src/util/parse.ts";

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

        expect(getColumnField(column, header)).toEqual(exp);
    });

    test("column name not present", () => {
        const column = "waldo";

        expect(() => getColumnField(column, header)).toThrowError(
            "Column waldo not found in JSONL header.",
        );
    });
});

describe("isCategoricalColumn()", () => {
    const lfcText = readFileSync("tests/data/output-format/lfc.jsonl", "utf-8");
    const header = JSON.parse(lfcText.split("\n")[0]);

    test("categorical column correctly identified", () => {
        const column = "body-site::left palm";
        expect(isCategoricalColumn(column, header)).toBe(true);
    });

    test("numerical column not identified as categorical", () => {
        const column = "year";
        expect(isCategoricalColumn(column, header)).toBe(false);
    });

    test("nonexistent column errors", () => {
        const column = "waldo";
        expect(() => isCategoricalColumn(column, header)).toThrowError(
            "Column waldo not found in JSONL header.",
        );
    });
});
