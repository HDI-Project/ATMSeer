import axios from 'axios';
import { URL } from '../Const';
import { IDatarunStatusTypes, IClassifierStatusTypes } from '../types/index';

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
export interface IConfigsUploadResponse {
    success: boolean;
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

export async function getHyperpartitions(id?: number): Promise<IHyperpartitionInfo[]> {
    const url = id ? `/hyperpartitions/${id}` : `/hyperpartitions`;
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