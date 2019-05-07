import { URL } from 'Const';
const  baseURL: string = `${URL}/api`;

const api = {
    get(url: string, dataType: string = 'json'){
        //dataType can be text (for parsig CSV)
        const apiUrl = `${baseURL}${url}`;
        return fetch(apiUrl, {
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': `application/${dataType}`
            }
        })
        .then(response =>  dataType !== 'json' ? response.text() : response.json())
        .catch(err => console.log(err))
    }
}

export function getClassifiersSummaryAction(datarun_id?: number) {
    const url = `/classifier_summary?datarun_id=${datarun_id}`;
    return function(dispatch: any) {
        dispatch({type: 'GET_CLASSIFIERS_SUMMARY_REQUEST'});
        return api
            .get(url, 'text')
            .then(
                data => dispatch({type: 'GET_CLASSIFIERS_SUMMARY_SUCCESS', classifiersSummary: data}),
                err => dispatch({type: 'GET_CLASSIFIERS_SUMMARY_ERROR', err})
            );

    }
}

export function getClassifiersAction(datarun_id?: number){
    return function(dispatch: any) {
        const url = `/classifiers?datarun_id=${datarun_id}`;
        dispatch({type: 'GET_CLASSIFIERS_REQUEST'})
        return api
            .get(url)
            .then(
                data => dispatch({type: 'GET_CLASSIFIERS_SUCCESS', classifiers: data}),
                err => dispatch({type: 'GET_CLASSIFIERS_ERROR', err})
            );
    }
}


export function setHyperPartitionsAction(hp_id?: number, datarun_id?:number) {
    const url = hp_id ? `/hyperpartitions/${hp_id}` : (datarun_id ? `/hyperpartitions?&datarun_id=${datarun_id}` : `/hyperpartitions/`);
    return function(dispatch: any) {
        dispatch({type: 'GET_HYPERPARTITIONS_REQUEST'})
        return api
            .get(url)
            .then(
                data => dispatch({type: 'SET_HYPERPARTITIONS_SUCCESS', hyperpartitions: data}),
                err => dispatch({type: 'SET_HYPERPARTITIONS_ERROR', err})
            );
    }
}