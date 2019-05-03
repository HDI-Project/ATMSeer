export const getClassifiersSelector = (state: any) => {
    console.log(state.DataRuns.toJS().classifiers)
    return state.DataRuns.toJS().classifiers;
}