import { describe, test, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { isCategoricalColumn } from "../src/util/parse.ts";

describe("isCategoricalColumn()", () => {
    const lfcText = readFileSync("tests/data/output-format/lfc.jsonl", "utf-8");
    const headerRecord = JSON.parse(lfcText.split("\n")[0]);

    test("categorical column correctly identified", () => {
        let columnName = "body-site::left palm";
        expect(isCategoricalColumn(columnName, headerRecord)).toBe(true);
    });

    test("numerical column not identified as categorical", () => {
        let columnName = "year";
        expect(isCategoricalColumn(columnName, headerRecord)).toBe(false);
    });

    test("nonexistent column errors", () => {
        let columnName = "waldo";
        expect(async () =>
            isCategoricalColumn(columnName, headerRecord),
        ).rejects.toThrow("Column waldo not found in JSONL header.");
    });
});
