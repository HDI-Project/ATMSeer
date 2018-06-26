export interface IMethod{
    name: string,
    fullname:string,
    hyperparameters: any,
    root_hyperparameters: string[],
    conditional_hyperparameters: any
}

export interface IDataRun{
    [key:string]:any
}