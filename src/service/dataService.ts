import axios from 'axios';
import { URL } from '../Const';

const API = `${URL}/api`;

export interface IDatasetInfo {
    id: number;
    d_features: number;
    k_classes: number;
    n_examples: number;
    name: string;
}

export interface IDatarunInfo {
    id: number;
    dataset_id: number;
    metric: string;
    selector: string;
    tuner: string;
    status: 'complete' | 'running' | 'pending';
}

export interface IHyperpartitionInfo {
    id: number;
    method: string;
    status: 'incomplete' | 'gridding_done' | 'errored';
}

export interface IDatarunStepScore {
   [method: string]: number[]
}

export async function getDatasets(): Promise<IDatasetInfo[]> {
    const url = `${API}/datasets`;
    const res = await axios.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getDataset(id: number): Promise<IDatasetInfo> {
    const url = `${API}/datasets/${id}`;
    const res = await axios.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getDataruns(params?: {dataset_id: number}): Promise<IDatarunInfo[]> {
    const url = `${API}/dataruns`;
    const res = await axios.get(url, {params});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getDatarun(id: number): Promise<IDatarunInfo> {
    const url = `${API}/dataruns/${id}`;
    const res = await axios.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getHyperpartitions(id?: number): Promise<IHyperpartitionInfo | IHyperpartitionInfo[]> {
    const url = id ? `${API}/hyperpartitions/${id}` : `${API}/hyperpartitions`;
    const res = await axios.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getDatasetCSV(id: number): Promise<string> {
    const url = `${API}/dataset_file/${id}`;
    const res = await axios.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getDatarunStepsScores(
    id: number,
    classifier_start: number | null = null,
    classifier_end: number | null = null
): Promise<IDatarunStepScore[]> {
    const url = `${API}/datarun_steps_scores/${id}`;
    const params = {classifier_start, classifier_end, nice: true};
    const res = await axios.get(url, {params});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export async function getClassifierSummary(datarun_id: number): Promise<string> {
    const url = `${API}/classifier_summary`;
    const params = {datarun_id};
    const res = await axios.get(url, {params});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}