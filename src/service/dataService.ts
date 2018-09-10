import axios from 'axios';
import { URL } from 'Const';
import { IDatarunStatusTypes, IClassifierStatusTypes } from 'types';
import { IHyperParameter, IMethodType } from '../types/index';

// const API = `${URL}/api`;

const axiosInstance = axios.create({
    baseURL: `${URL}/api/`,
    // timeout: 1000,
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
});

export interface IDatarunStatus {
    status: IDatarunStatusTypes;
}

export interface IDatasetInfo {
    id: number;
    d_features: number;
    k_classes: number;
    n_examples: number;
    name: string;
}

export interface IDatarunInfo extends IDatarunStatus {
    id: number;
    dataset_id: number;
    metric: string;
    selector: string;
    tuner: string;
}

export interface IHyperpartitionInfo {
    id: number;
    datarun_id: number;
    method: string;
    hyperpartition_string: string;
    status: 'incomplete' | 'gridding_done' | 'errored';
    categoricals: {[param: string]: string | boolean};
    constants: {[param: string]: string | boolean};
    tunables: {[param: string]: {type: string, range: number[]}}
}

export interface IHyperPartitionScores {
    [id: string]: number;
}

export interface IFileUploadResponse {
    success: boolean;
    filename: string;
    id: number;
}

export interface IClassifierInfo {
    id: number;
    datarun_id: number;
    hyperpartition_id: number;
    cv_metric: number;
    cv_metric_std: number;
    test_metric_std: number;
    method: string;
    hyperparameters: {[param: string]: boolean | number | string}
}

export interface IConfigsInfo {
    methods : string[];
    budget: number;
    r_minimum : number;
    k_window : number;
    gridding : number;
    metric :string;
    selector : string;
    budget_type: string;
    tuner: string;
    priority :number;
}

export interface ICommonResponse {
    success: boolean;
}

export interface IConfigsUploadResponse extends ICommonResponse {}

export interface INewDatarunResponse {
    success: boolean;
    id: number;
}

export interface IMethodHyperParameters {
    [name: string]: IHyperParameter;
}

export async function getDatasets(): Promise<IDatasetInfo[]> {
    const url = `/datasets`;
    const res = await axiosInstance.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getDataset(id: number): Promise<IDatasetInfo> {
    const url = `/datasets/${id}`;
    const res = await axiosInstance.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getDataruns(params?: { dataset_id: number }): Promise<IDatarunInfo[]> {
    const url = `/dataruns`;
    const res = await axiosInstance.get(url, { params });
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getDatarun(id: number): Promise<IDatarunInfo> {
    const url = `/dataruns/${id}`;
    const res = await axiosInstance.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getClassifiers(
    datarun_id: number,
    status: IClassifierStatusTypes = IClassifierStatusTypes.COMPLETE
): Promise<IClassifierInfo[]> {
    const url = `/classifiers`;
    const params = { datarun_id, status };
    const res = await axiosInstance.get(url, { params });
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getHyperpartitions(hp_id?: number, datarun_id?:number): Promise<IHyperpartitionInfo[]> {
    const url = hp_id ?
        `/hyperpartitions/${hp_id}`
        :
        (
        datarun_id?
            `/hyperpartitions?&datarun_id=${datarun_id}`
            :
            `/hyperpartitions/`
        );
    const res = await axiosInstance.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getDatasetCSV(id: number): Promise<string> {
    const url = `/dataset_file/${id}`;
    const res = await axiosInstance.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getDatarunStepsScores(
    id: number,
    classifier_start: number | null = null,
    classifier_end: number | null = null
): Promise<IHyperPartitionScores[]> {
    const url = `/datarun_steps_scores/${id}`;
    const params = { classifier_start, classifier_end, nice: true };
    const res = await axiosInstance.get(url, { params });
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getDatarunSummary(
    id: number,
    classifier_start: number | null = null,
    classifier_end: number | null = null
): Promise<IHyperPartitionScores[]> {
    const url = `/datarun_summary/${id}`;
    const params = { classifier_start, classifier_end };
    const res = await axiosInstance.get(url, { params });
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function postEnterData(file: any): Promise<IFileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosInstance.post(`/enter_data`, formData);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function postNewDataset(file: any): Promise<IFileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosInstance.post(`/new_dataset`, formData);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function postNewDatarun(datasetId: number, configs: any): Promise<INewDatarunResponse> {
    const formData = new FormData();
    formData.append('configs', JSON.stringify(configs));
    const res = await axiosInstance.post(`/new_datarun/${datasetId}`, formData);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getClassifierSummary(datarun_id: number): Promise<string> {
    const url = `/classifier_summary`;
    const params = { datarun_id };
    const res = await axiosInstance.get(url, { params });
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function startDatarun(datarun_id: number): Promise<IDatarunStatus> {
    const url = `/start_worker/${datarun_id}`;
    const res = await axiosInstance.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function stopDatarun(datarun_id: number): Promise<IDatarunStatus> {
    const url = `/stop_worker/${datarun_id}`;
    const res = await axiosInstance.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getConfigs(): Promise<IConfigsInfo> {
    const url = `/configs`;
    const res = await axiosInstance.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}



export async function postConfigs(configs : any): Promise<IConfigsUploadResponse> {
    const formData = new FormData();
    formData.append('configs', JSON.stringify(configs));

    const res = await axiosInstance.post(`/configs`, formData);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

/**
 * update the hyperparameters ranges for a method of a datarun
 *
 * @export
 * @param {number} datarun_id
 * @param {string} method
 * @param {IMethodHyperParameters} config
 * @returns {Promise<ICommonResponse>}
 */
export async function postMethodHyperparameters(
    datarun_id: number, method: IMethodType, config: IMethodHyperParameters
): Promise<ICommonResponse> {
    const params = { method };
    const headers = {'Content-Type': 'application/json'};
    const res = await axiosInstance.post(`/hyperparameters/${datarun_id}`, config, {params, headers});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function postHyperparameters(
    datarun_id: number, config: {[method: string]: IMethodHyperParameters}
): Promise<ICommonResponse> {
    const headers = {'Content-Type': 'application/json'};
    const res = await axiosInstance.post(`/hyperparameters/${datarun_id}`, config, {headers});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getMethodHyperparameter(
    datarun_id: number, method: IMethodType
): Promise<{hyperparameters: IMethodHyperParameters}> {
    const params = { method };
    const res = await axiosInstance.get(`/hyperparameters/${datarun_id}`, {params});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getHyperparameters(
    datarun_id: number
): Promise<{[method: string]: {hyperparameters: IMethodHyperParameters}}> {
    const res = await axiosInstance.get(`/hyperparameters/${datarun_id}`);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}


export async function disableHyperpartitions(hyperpartitionIds: number[] | number): Promise<ICommonResponse> {
    const headers = {'Content-Type': 'application/json'};
    const data = Array.isArray(hyperpartitionIds) ? hyperpartitionIds : [hyperpartitionIds];
    const res = await axiosInstance.post(`/disable_hyperpartition`, data, {headers});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function enableHyperpartitions(hyperpartitionIds: number[] | number): Promise<ICommonResponse> {
    const headers = {'Content-Type': 'application/json'};
    const data = Array.isArray(hyperpartitionIds) ? hyperpartitionIds : [hyperpartitionIds];
    const res = await axiosInstance.post(`/enable_hyperpartition`, data, {headers});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}


export interface IUpdateDatarunConfig {
    // The run config ('run.yaml'), all fields inside configs are optional
    // If some method is removed from the configs.methods,
    // their corresponding hyperpartition will also be disabled
    // However, don't add new method in the config if they are not present in the initial config (when datarun is created).
    // New method will not be added
    configs?: Partial<IConfigsInfo>;
    // The ids of active hyperpartitions.
    // If not provided, then this field is ignored, we will only consider the methods field in configs.
    // If provided, then the method field in configs would be neglected (has no effect)
    hyperpartitions?: number[];
    // The configs of methods
    // Be careful with the format of IMethodHyperParameters
    method_configs?: {[method: string]: IMethodHyperParameters}
}

/**
 * Update the configurations of a datarun
 */
export async function updateDatarunConfigs(datarun_id: number, config: IUpdateDatarunConfig): Promise<ICommonResponse> {
    const headers = {'Content-Type': 'application/json'};
    const res = await axiosInstance.post(`/update_datarun_config/${datarun_id}`, config, {headers});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}
export async function getDatarunConfigs(datarun_id : number): Promise<IConfigsInfo> {
    const url = `/configs`;
    const params = { datarun_id };
    const res = await axiosInstance.get(url, { params });
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}
/*
Post Click Event
type: method, compare, classifier
description: {
    action: "selected"
    "unselected"
    id: classifier id
    name: [method name]
}
time: time
*/
export interface IClickEvent {
    type:string,
    description:any,
    time:string
}
export interface IClickBundleEvent{
    name:string,
    clickevent:IClickEvent,
    datasetID:number,
    datarunID:number,
    version:string
}
export async function postBundleClickEvent(log:IClickBundleEvent):Promise<ICommonResponse>{
    const headers = {'Content-Type': 'application/json'};
    const res = await axiosInstance.post(`/postClickEvent`, log, {headers});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export interface IRecommendationResult {
    result : string[];
}
export async function getRecommendation(dataset_id : number): Promise<IRecommendationResult> {
    const url = `/getRecommendation/${dataset_id}`;
    const res = await axiosInstance.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}