import { type FeatureRecord, type VariableRecord } from "../types/parse";

type ViewRecord = {
    featureId: string;
    lfc: number;
    se: number;
    p: number;
    q: number;
};

export function createSlices() {
    let data = $state<FeatureRecord[]>([]);
    let view = $state<ViewRecord[]>([]);

    let viewVariable = $state<string>("");
    let viewVariableLevel = $state<string | undefined>(undefined);

    let filters = $state<{ [key: number]: (r: FeatureRecord) => boolean }>({});

    const setSlices = (slices: FeatureRecord[]) => {
        data = slices;
    };

    const _getVariableRecord = (
        variableName: string,
        level: string | undefined = undefined,
        slice: string = "lfc",
        featureId: string | undefined = undefined,
    ): VariableRecord => {
        if (data.length == 0) {
            throw new Error("There are no features present in the data.");
        }

        let feature: FeatureRecord | undefined;
        if (!featureId) {
            // any feature will do because they all have the same variables
            feature = data[0];
        } else {
            feature = data.find((f) => f.featureId == featureId);
            if (!feature) {
                throw new Error(
                    `The feature with id ${featureId} was not found.`,
                );
            }
        }

        const variableRecords = feature.slices[slice].variables.filter(
            (v) => v.name == variableName,
        );

        // ensure level is specified iff variable is categorical
        if (!variableRecords.length) {
            throw new Error(`The ${variableName} variable was not found.`);
        } else if (variableRecords.length > 1 && typeof level == "undefined") {
            throw new Error(
                `The ${variableName} variable is categorical but no level was
                specified.`,
            );
        } else if (variableRecords.length == 1 && typeof level == "string") {
            throw new Error(
                `The ${variableName} variable is not categorical but a level
                was specified.`,
            );
        }

        // numerical variable
        if (typeof level == "undefined") {
            return variableRecords[0];
        }

        // categorical variable
        const variableRecord = variableRecords.find((v) => v.level == level);
        if (typeof variableRecord == "undefined") {
            throw new Error(
                `The ${variableName} variable does not have a ${level} level.`,
            );
        }

        return variableRecord;
    };

    const setVariable = (
        variable: string,
        level: string | undefined,
    ): undefined => {
        // for error checking
        _getVariableRecord(variable, level, "lfc");

        viewVariable = variable;
        if (typeof level != "undefined") {
            viewVariableLevel = level;
        }
    };

    const addFilter = (
        index: number,
        slice: string,
        relationship: string,
        value: number,
    ): undefined => {
        const filter = (record: FeatureRecord) => {
            const variableRecord = _getVariableRecord(
                viewVariable,
                viewVariableLevel,
                "lfc",
                record.featureId,
            );

            if (typeof variableRecord.value != "number") {
                throw new Error(
                    `The ${variableRecord.name} variable contains non-numeric
                    values.`,
                );
            }

            if (relationship == "gt") return variableRecord.value > value;
            if (relationship == "ge") return variableRecord.value >= value;
            if (relationship == "lt") return variableRecord.value < value;
            if (relationship == "le") return variableRecord.value <= value;

            throw new Error(`Unexpected relationship ${relationship}.`);
        };

        filters[index] = filter;
    };

    const removeFilter = (index: number) => {
        delete filters[index];
    };

    const render = (): undefined => {
        // apply all filters
        let filtered: FeatureRecord[] = data;
        for (let f of Object.values(filters)) {
            filtered = filtered.filter(f);
        }

        // map to view records by only selecting from variable of interest
        let viewRecords: ViewRecord[] = filtered.map((record) => {
            const slices = ["lfc", "se", "p", "q"];

            return {
                featureId: record.featureId,
                lfc: lfcVariable.value as number,
                se: seVariable.value as number,
                p: pVariable.value as number,
                q: qVariable.value as number,
            };
        });

        view = viewRecords;
    };

    return {
        get view() {
            return view;
        },
        setSlices,
        setVariable,
        addFilter,
        removeFilter,
    };
}
