export type VariableRecord = {
    name: string;
    lfc?: number;
    p?: number;
    q?: number;
    se?: number;
    level?: string;
    reference?: string;
} & Record<string, number | string>;

export class FeatureRecord {
    featureId: string;
    variables: Map<string, VariableRecord> = new Map();

    constructor(featureId: string) {
        this.featureId = featureId;
    }

    /**
     * Returns the variable with `variableName` and `level` or undefined if
     * none is found.
     */
    getVariable(
        variableName: string,
        level: string | undefined = undefined,
    ): VariableRecord | undefined {
        if (level) {
            return this.variables.get(`${variableName}::${level}`);
        }

        return this.variables.get(variableName);
    }

    /**
     * Creates a VariableRecord from primitives.
     */
    createVariable(
        variableName: string,
        slice: string,
        value: number,
        level: string | undefined = undefined,
        reference: string | undefined = undefined,
    ): VariableRecord {
        let variable = {
            name: variableName,
            [slice]: value,
        };
        if (level && reference) {
            variable.level = level;
            variable.reference = reference;
        }

        return variable;
    }

    /**
     * Adds a new variable to the set of feature variables. If a matching
     * variable is already present then updates that variable with the any new
     * slice properties from `variable`.
     */
    addVariable(variable: VariableRecord): undefined {
        let matchingVariable = this.getVariable(variable.name, variable.level);

        let newVariable: VariableRecord;
        if (!matchingVariable) {
            newVariable = variable;
        } else {
            newVariable = {
                ...matchingVariable,
                ...variable,
            };
        }

        if (newVariable.level) {
            this.variables.set(
                `${newVariable.name}::${newVariable.level}`,
                newVariable,
            );
        } else {
            this.variables.set(newVariable.name, newVariable);
        }
    }

    /**
     * Returns the slice value for some variable. Errors if the variable or
     * slice is not found.
     */
    getVariableSlice(
        variableName: string,
        slice: string,
        level: string | undefined = undefined,
    ): number {
        const variable = this.getVariable(variableName, level);

        if (!variable) {
            throw new Error(`The ${variable} variable was not found.`);
        }
        if (!Object.hasOwn(variable, slice)) {
            throw new Error(`The ${variable} variable has no ${slice} slice.`);
        }

        return variable[slice] as number;
    }
}

export type ViewRecord = {
    featureId: string;
    lfc: number;
    se: number;
    p: number;
    q: number;
};

export class FeatureRecords {
    records: FeatureRecord[] = [];

    view = $state<ViewRecord[]>([]);
    viewVariable = $state<string>("");
    viewVariableLevel = $state<string | undefined>(undefined);

    filters = $state<{ [key: number]: (r: FeatureRecord) => boolean }>({});

    /*
     * Return the feature with id `featureId`, or undefined if not found.
     */
    getFeature(featureId: string): FeatureRecord | undefined {
        return this.records.find((r) => r.featureId == featureId);
    }

    /**
     * Adds a new feature. If a matching feature is already present then
     * merges that features variables with those from `feature`.
     */
    addFeature(feature: FeatureRecord): undefined {
        let matchingFeature = this.getFeature(feature.featureId);

        if (!matchingFeature) {
            this.records.push(feature);
        } else {
            Array.from(feature.variables.values()).forEach((v) =>
                matchingFeature.addVariable(v),
            );
        }
    }

    /**
     * Adds a user-specified filter to the set of filters applied to the
     * data.
     */
    addFilter(
        index: number,
        slice: string,
        relationship: string,
        value: number,
    ) {
        const filter = (record: FeatureRecord) => {
            const variableValue = record.getVariableSlice(
                this.viewVariable,
                slice,
                this.viewVariableLevel,
            );

            if (relationship == "gt") return variableValue > value;
            if (relationship == "ge") return variableValue >= value;
            if (relationship == "lt") return variableValue < value;
            if (relationship == "le") return variableValue <= value;

            throw new Error(`Unexpected relationship ${relationship}.`);
        };

        this.filters[index] = filter;
    }

    /**
     * Removes a filter by index.
     */
    removeFilter(index: number) {
        delete this.filters[index];
    }

    /**
     * Renders the `view` by applying all existing filters, sorting features
     * by decreasing lfc value, and extracting the slice values for the current
     * `viewVariable`.
     */
    render() {
        // apply all filters
        let filtered: FeatureRecord[] = this.records;
        for (let f of Object.values(this.filters)) {
            filtered = filtered.filter(f);
        }

        // map to view records by only selecting from variable of interest
        let viewRecords: ViewRecord[] = filtered.map((record) => {
            const variable = record.getVariable(
                this.viewVariable,
                this.viewVariableLevel,
            );

            if (!variable) {
                throw new Error(
                    `Could not find variable ${this.viewVariable}.`,
                );
            }

            return {
                featureId: record.featureId,
                lfc: variable.lfc!,
                se: variable.se!,
                p: variable.p!,
                q: variable.q!,
            };
        });

        // filter null lfc values
        viewRecords = viewRecords.filter((r) => r.lfc != null);

        // sort view records by decreasing lfc
        viewRecords = viewRecords.sort((r1, r2) => r2.lfc - r1.lfc);

        // update state
        this.view = viewRecords;
    }
}
