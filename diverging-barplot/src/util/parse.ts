import { text } from "d3-fetch";

import {
    type VariableRecord,
    type SliceRecord,
    type FeatureRecord,
    type JSONLHeaderField,
    type JSONLHeader,
    type JSONLFeatureRecord,
} from "../types/parse";

/**
 * Parses slice data from the ANCOMBC2 output format that resides inside of the
 * visualization artifact.
 *
 * @param {string} slicesDir - The name of the directory containing the slices.
 * @returns {FeatureRecord[]} An array of feature records.
 */
export async function parseAllSlices(
    slicesDir: string,
): Promise<FeatureRecord[]> {
    const slices = ["diff", "lfc", "p", "passed_ss", "q", "se", "W"];

    let featureRecordsMap: Record<string, FeatureRecord> = {};
    for (let slice of slices) {
        const sliceFilepath = `${slicesDir}/${slice}.jsonl`;
        let sliceFeatureRecords = await parseSlice(sliceFilepath);

        const sliceName = Object.keys(sliceFeatureRecords[0].slices)[0];
        for (let record of sliceFeatureRecords) {
            // merge slices if feature already parsed in another slice
            if (Object.hasOwn(featureRecordsMap, record.featureId)) {
                featureRecordsMap[record.featureId].slices = {
                    ...featureRecordsMap[record.featureId].slices,
                    ...record.slices,
                };
            }
            // otherwise create new feature record
            else {
                featureRecordsMap[record.featureId] = record;
            }
        }
    }

    return Object.values(featureRecordsMap);
}

/**
 * Parses a JSONL slice into an array of feature records.
 *
 * @param {string} slice - The filepath of the slice file to parse.
 * @returns {Promise<FeatureRecord[]>} The parsed feature records.
 */
export async function parseSlice(slice: string): Promise<FeatureRecord[]> {
    // open file, convert to json
    const textData: string = await text(slice);
    const jsonRecords: any = textData
        .split("\n")
        .filter((line) => line.trim() != "")
        .map((line) => JSON.parse(line));

    // parse header and check if empty
    if (jsonRecords.length < 1) {
        const msg = `The ${slice} slice is empty.`;
        throw new Error(msg);
    } else if (jsonRecords.length === 1) {
        const msg = `The ${slice} slice has a header but no records.`;
        throw new Error(msg);
    }
    const header: JSONLHeader = jsonRecords.shift()!;

    // parse each remaining line into a feature record
    const jsonFeatureRecords: JSONLFeatureRecord[] = jsonRecords;
    const sliceName = slice.split("/").pop()!.replace(".jsonl", "");

    return jsonFeatureRecords.map((record) =>
        parseFeatureRecord(record, header, sliceName),
    );
}

/**
 * Parses a feature record from a JSONL slice into a more structured
 * representation.
 *
 * @param {JSONLFeatureRecord} jsonRecord - A record from a JSONL slice
 * corresponding to one line in the JSONL file.
 * @param {JSONLHeader} header - A header from a JSONL slice.
 * @param {string} sliceName - The name of the JSONL slice being parsed.
 * @returns {FeatureRecord} The parsed record.
 */
export function parseFeatureRecord(
    jsonRecord: JSONLFeatureRecord,
    header: JSONLHeader,
    sliceName: string,
): FeatureRecord {
    // intialize feature and slice records
    let sliceRecord: SliceRecord = {
        variables: [],
    };
    let featureRecord: FeatureRecord = {
        featureId: jsonRecord.taxon,
        slices: { [sliceName]: sliceRecord },
    };

    // parse JSONL column entries into variable records
    for (let columnName of Object.keys(jsonRecord)) {
        if (columnName === "taxon") continue;

        if (isCategoricalColumn(columnName, header)) {
            const headerField = getColumnField(columnName, header);

            const categoricalVarRecord: VariableRecord = {
                name: headerField.extra.variable,
                value: jsonRecord[columnName],
                level: headerField.extra.level,
                reference: headerField.extra.reference,
            };
            sliceRecord.variables.push(categoricalVarRecord);
        } else {
            const numericalVarRecord: VariableRecord = {
                name: columnName,
                value: jsonRecord[columnName],
            };
            sliceRecord.variables.push(numericalVarRecord);
        }
    }

    return featureRecord;
}

/**
 * Retrieves the header field entry for a column name.
 *
 * @param column {string} The name of the column of interest.
 * @param header {JSONLHeader} A header from a JSONL slice.
 * @returns {JSONLHeaderField} The header field entry for `column`.
 */
export function getColumnField(
    column: string,
    header: JSONLHeader,
): JSONLHeaderField {
    const columnFields: JSONLHeaderField[] = header.fields.filter((field) => {
        return field.name === column;
    });

    if (columnFields.length > 1) {
        const msg = `Duplicate name '${column}' found in JSONL header.`;
        throw new Error(msg);
    } else if (!columnFields.length) {
        const msg = `Column ${column} not found in JSONL header.`;
        throw new Error(msg);
    }

    return columnFields.shift()!;
}

/**
 * Checks whether a column is annotated as categorical in its slice header.
 *
 * @param column {string} The name of the column to check.
 * @param header {JSONLHeader} A header from a JSONL slice.
 * @returns {boolean} Whether the column refers to a categorical variable.
 */
export function isCategoricalColumn(
    column: string,
    header: JSONLHeader,
): boolean {
    const columnField: JSONLHeaderField = getColumnField(column, header);

    return Object.hasOwn(columnField.extra, "reference");
}
