export type VariableRecord = {
    name: string;
    value: number | boolean;
    level?: string;
    reference?: string;
};
export type SliceRecord = {
    variables: VariableRecord[];
};
export type FeatureRecord = {
    featureId: string;
    slices: Record<string, SliceRecord>;
};

export type JSONLHeaderField = {
    name: string;
    type: string | null;
    missing: boolean;
    title: string;
    description: string;
    extra: Record<string, any>;
};
export type JSONLHeader = {
    doctype: object;
    direction: string;
    style: string;
    fields: JSONLHeaderField[];
};
export type JSONLFeatureRecord = {
    taxon: string;
} & Record<string, number | boolean>;
