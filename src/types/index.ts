export interface IMethod{
    name: string,
    fullname:string,
    hyperparameters: any,
    root_hyperparameters: string[],
    conditional_hyperparameters: any
}

export interface IDatarun{
    [method:string]: IClassifier[]
}

export interface IClassifier{
    "trail ID":number,
    method:string,
    [key:string]:number|string|any,

}

export enum IDatarunStatusTypes {
    COMPLETE = 'complete',
    RUNNING = 'running',
    PENDING = 'pending'
}

export enum IClassifierStatusTypes {
    RUNNING = 'running',
    ERRORED = 'errored',
    COMPLETE = 'complete',
}

export interface IHyperParameterNumeric {
    type: 'int' | 'int_exp' | 'float' | 'float_exp';
    range: [number, number]
}

export interface IHyperParameterCategorical {
    type: 'int_cat' | 'float_cat' | 'string' | 'bool';
    values: (number | string | boolean | null)[];
}

export interface IHyperParameterList {
    type: 'list';
    list_length: number[];
    element: IHyperParameter;
}

export type IHyperParameter = IHyperParameterNumeric | IHyperParameterCategorical | IHyperParameterList;

export type IMethodType = 'logreg' | 'svm' | 'sgd' | 'dt' | 'et' | 'rf' | 'gnb' | 'mnb' | 'bnb' | 'gp' | 'pa' | 'knn' | 'mlp' | 'ada';