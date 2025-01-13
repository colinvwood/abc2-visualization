import { text } from "d3-fetch";

type VariableRecord = {
    name: string;
    value: number | boolean;
    level?: string;
    reference?: string;
};
type SliceRecord = {
    variables: VariableRecord[];
};
type FeatureRecord = {
    featureId: string;
    slices: { [key: string]: SliceRecord };
};

type JSONLHeaderField = {
    name: string;
    type: string | null;
    missing: boolean;
    title: string;
    description: string;
    extra: { [key: string]: any };
};
type JSONLHeader = {
    doctype: object;
    direction: string;
    style: string;
    fields: JSONLHeaderField[];
};

/**
 * Parses slice data from the ANCOMBC2 output format that resides inside of the
 * visualization artifact.
 *
 * @param {string} slicesDir - The name of the directory containing the slices.
 * @returns {FeatureRecord[]} An array of feature records.
 */
function parseAllSlices(slicesDir: string): FeatureRecord[] {
    // call parseSlice on each file

    // accumulate/combine outputs from parseSlice

    // return
    return [];
}

/**
 *
 *
 */
async function parseSlice(slice: string): Promise<FeatureRecord[]> {
    // open file, convert to json
    const textData: string = await text(slice);
    const textRecords: string[] = textData
        .split("\n")
        .filter((line) => line.trim() != "");

    const jsonRecords: any[] = textRecords.map((line) => JSON.parse(line));

    // parse header, check if empty
    const header: JSONLHeader | undefined = jsonRecords.shift();
    if (header === undefined) {
        const msg = `The ${slice} slice is empty.`;
        throw new Error(msg);
    }

    const sliceName = slice.replace(".jsonl", "");
    let featureRecords: FeatureRecord[] = [];
    for (let jsonRecord of jsonRecords) {
        let sliceRecord: SliceRecord = {
            variables: [],
        };
        let featureRecord: FeatureRecord = {
            featureId: jsonRecord.taxon,
            slices: { sliceName: sliceRecord },
        };

        for (let columnName of Object.keys(jsonRecord)) {
            if (columnName === "taxon") continue;

            // if already seen categorical variable add level
            if (isCategoricalColumn(columnName, header)) {
            }

            // if new categorical or numerical variable add new var record

            let variableRecord = {
                name: columnName,
                value: jsonRecord.columnName,
            };
            sliceRecord.variables.push(variableRecord);
        }

        featureRecords.push(featureRecord);
    }
    return [];

    // return
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
