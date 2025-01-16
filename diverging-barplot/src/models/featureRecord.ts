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

export class FeatureRecords {
    records: FeatureRecord[] = [];

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
            feature.variables
                .values()
                .forEach((v) => matchingFeature.addVariable(v));
        }
    }
}
