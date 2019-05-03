const api = {
    get(url: string) {
        return fetch(url)
            .then(response => response.json())
    }
}

export function getClassifiersAction(datarun_id: number){
    return function(dispatch: any, getState: any) {
        const url = `/classifier_summary/${datarun_id}`;
        return api
            .get(url)
            .then(
                data => dispatch({type: 'GET_CLASSIFIERS_SUCCESS', classifiers: data}),
                err => dispatch({type: 'GET_CLASSIFIERS_ERROR', err})
            )
    }
}
