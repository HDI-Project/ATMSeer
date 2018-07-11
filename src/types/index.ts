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
