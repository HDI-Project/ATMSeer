import axios from 'axios';
import { URL } from '../Const';
import { IClassifier } from '../types';

const API = `${URL}/api`;

interface IDatasetInfo {
    id: number;
    d_features: number;
    k_classes: number;
    n_examples: number;
    name: string;
}

interface IDatarunInfo {
    id: number;
    dataset_id: number;
    metric: string;
    selector: string;
    tuner: string;
    status: 'complete' | 'running' | 'pending';
    name: string;
}

interface IHyperpartitionInfo {
    id: number;
    method: string;
    status: 'incomplete' | 'gridding_done' | 'errored';
}

async function getDatasets(id?: number): Promise<IDatasetInfo | IDatasetInfo[]> {
    const url = id ? `${API}/datasets/${id}` : `${API}/datasets`;
    const res = await axios.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

async function getDataruns(id?: number): Promise<IDatarunInfo | IDatarunInfo[]> {
    const url = id ? `${API}/dataruns/${id}` : `${API}/dataruns`;
    const res = await axios.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

async function getHyperpartitions(id?: number): Promise<IHyperpartitionInfo | IHyperpartitionInfo[]> {
    const url = id ? `${API}/hyperpartitions/${id}` : `${API}/hyperpartitions`;
    const res = await axios.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}


async function getDatasetCSV(id: number): Promise<string> {
    const url = `${API}/dataset_file/${id}`;
    const res = await axios.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

async function getDatarunStepsScores(
    id: number,
    classifier_start: number | null = null,
    classifier_end: number | null = null
): Promise<string> {
    const url = `${API}/datarun_steps_scores/${id}`;
    const params = {classifier_start, classifier_end};
    const res = await axios.get(url, {params});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}

export default {
    getDatasets,
    getDataruns,
    getHyperpartitions,
    getDatasetCSV,
    getDatarunStepsScores,
};
