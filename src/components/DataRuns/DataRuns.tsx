import * as React from "react";
import * as methodsDef from "assets/methodsDef.json";
import { parseDatarun } from "helper";
import { IDatarun } from 'types';
import {
    getClassifierSummary, getClassifiers,
    getHyperpartitions,
    IRecommendationResult,
    IClassifierInfo, IHyperpartitionInfo, getRecommendation, IClickEvent, stopDatarun
} from 'service/dataService';
import BarChart from './BarChart';
import { IDatarunStatusTypes } from 'types/index';
import { UPDATE_INTERVAL_MS } from "Const";
import ThreeLevel from "./ThreeLevel";
import AskModal from "./AskModal";
import { USER_STUDY,THRESHOLD_STEP } from 'Const';
import {connect} from 'react-redux';

import {
    getClassifiersSummarySelector,
    getClassifiersSelector,
    getHyperPartitionsSelector,
    getIsLoading
} from '../../selectors/DataRuns';

import {
    getClassifiersSummaryAction,
    getClassifiersAction,
    getHyperPartitionsAction,

} from 'actions/api';


export interface IProps {
    datarunID: number | null;
    datarunStatus: IDatarunStatusTypes;
    datasetID: number | null;
    compareK: number
    setDatarunID: (id: number) => void;
    postClickEvent: (e: IClickEvent) => void;
    setDatarunStatus: (e: IDatarunStatusTypes) => void;

    getClassifiersSummary: (id?: number) => void;
    getClassifiers: (id?: number) => void;
    getHyperPartition: (id?: number, dataRunId?: number) => void;

    classifiers: any;
    classifiersSummary: any;
    hyperpartitions: any;
    isLoading: boolean
}
export interface IState {
    runCSV: string,
    classifiers: IClassifierInfo[],
    hyperpartitions: IHyperpartitionInfo[],
    recommendationResult: IRecommendationResult,
    run_threshold: number,
    askvisible: boolean
}
export interface IDatarunSummary {
    nTried: number;
    topClassifiers: IClassifierInfo[];
    nTriedByMethod: { [method: string]: number };
    triedHyperpartition: number[]
}

class DataRuns extends React.Component<IProps, IState>{
    private intervalID: number
    constructor(props: IProps) {
        super(props)
        this.getData = this.getData.bind(this)
        this.state = {
            runCSV: '',
            classifiers: [],
            hyperpartitions: [],
            recommendationResult: {
                result: []
            },
            run_threshold: THRESHOLD_STEP,
            askvisible: false
        }
    }

    public async getData() {
        const { datarunID, datasetID, classifiers, classifiersSummary, hyperpartitions } = this.props;


        if (datarunID !== null && datasetID !== null) {
            let hyperpartitionsAsync = await getHyperpartitions(undefined, datarunID).then(hyperpartitions => {
                if (Array.isArray(hyperpartitions)) {
                    return hyperpartitions
                } else {
                    console.error('The fetched hyperpartitions should be an array!');
                    return []
                }
            });


            let recommendationResult = await getRecommendation(datasetID);
            let askvisible = this.state.askvisible;
            let run_threshold = this.state.run_threshold;

            if (USER_STUDY) {
                if (this.props.datarunStatus === IDatarunStatusTypes.RUNNING) {
                    if (classifiers.length >= run_threshold) {
                        askvisible = true;
                        if (this.props.datarunID !== null) {
                            let promise = stopDatarun(this.props.datarunID);
                            promise
                                .then(datarun => {
                                    this.props.setDatarunStatus(datarun.status);
                                })
                                .catch(error => {
                                    console.log(error);
                                });
                        }
                    }
                } else {
                    if (askvisible == false) {
                        run_threshold = classifiers.length + THRESHOLD_STEP;
                    }
                }
            }

            this.setState({
                runCSV: classifiersSummary,
                classifiers,
                hyperpartitions,
                recommendationResult,
                run_threshold,
                askvisible
            })
        }
    }
    public startOrStopUpdateCycle() {
        // this.intervalID = window.setInterval(this.getData, UPDATE_INTERVAL_MS);
        if (this.props.datarunStatus === IDatarunStatusTypes.RUNNING) {
            this.intervalID = window.setInterval(this.getData, UPDATE_INTERVAL_MS);
        } else {
            clearInterval(this.intervalID);
        }
    }
    private setData() {
        const {datarunID} = this.props;

        if(datarunID !== null) {
            this.props.getClassifiersSummary(datarunID);
            this.props.getClassifiers(datarunID);
            this.props.getHyperPartition(undefined, datarunID);
        }
    }

    public componentDidMount() {
        // this.getData();
        this.startOrStopUpdateCycle();
        this.props.getClassifiersSummary(1);
            this.props.getClassifiers(1);
            this.props.getHyperPartition(undefined, 1);
        // this.setData();
    }

    componentDidUpdate(prevProps: IProps) {
        if (this.state.runCSV == '') {
            this.getData();
        }
        if (prevProps.datarunID !== this.props.datarunID) {
            this.getData();
        }
        if (prevProps.datarunStatus !== this.props.datarunStatus) {
            this.startOrStopUpdateCycle();
        }
    }

    public componentWillUnmount() {
        window.clearInterval(this.intervalID)
    }
    AskModalCallBack = (mode: number) => {
        let { run_threshold, classifiers } = this.state;
        run_threshold = classifiers.length + THRESHOLD_STEP;
        this.setState({
            askvisible: false,
            run_threshold: run_threshold
        })
    }

    private getHyperPartitions() {
        let hyperPartSelectedRange: number[] = [];
        let methodSelected: any = {};
        let mode = 1;
        const { hyperpartitions } = this.state;
        let methodhistogram: any = {};

        hyperPartSelectedRange = mode == 0 ?
            hyperpartitions.map((partition: any) => partition.id) :
            hyperpartitions
                .filter((partition: any) => partition.status != "errored")
                .map((partition: any) =>  partition.id);

        Object.keys(methodsDef).forEach((method: string) => {
            if (!methodhistogram[method]) {
                methodhistogram[method] = { total: 0, enable: 0 };
            }
        });

        hyperpartitions.forEach((partition: any) => {
            if (!methodhistogram[partition.method]) {
                methodhistogram[partition.method] = { total: 0, enable: 0 };
                console.log("unknown method : " + partition.method);
            }
            if (!(partition.status == "errored")) {
                methodhistogram[partition.method].total++;
                methodhistogram[partition.method].enable++;
            } else {
                methodhistogram[partition.method].total++;
            }
        });

        Object.keys(methodhistogram).forEach((method: string) => {
            const falseState = { checked: false, disabled: false, indeterminate: false }
            if (mode == 0) {
                if (methodhistogram[method].total == 0) {
                    methodSelected[method] = { ...falseState, disabled: true};
                } else {
                    methodSelected[method] = { ...falseState, checked: true};
                }

            } else if (mode == 1) {
                if (methodhistogram[method].total == 0) {
                    methodSelected[method] = { ...falseState, disabled: true};
                } else if (methodhistogram[method].enable == 0) {
                    methodSelected[method] = { ...falseState };
                } else if (methodhistogram[method].total == methodhistogram[method].enable) {
                    methodSelected[method] = { ...falseState, checked: true};
                } else {
                    methodSelected[method] = { ...falseState, indeterminate: true };
                }
            }
        });

        return {methodSelected, hyperPartSelectedRange};
    }

    public render() {
        let { runCSV,
            //hyperpartitions
        } = this.state;

        let {
            datasetID,
            datarunID,
            compareK,
            classifiers,
            hyperpartitions,
            classifiersSummary,
            isLoading
         } = this.props;

         let newHyper = this.getHyperPartitions();


        // hyperpartitions = hyperpartitions.filter((d: any) => d.datarun_id == this.props.datarunID)
        let datarun: IDatarun = parseDatarun(runCSV);
        // let datarun: IDatarun = parseDatarun(classifiersSummary);
        if (Object.keys(datarun).length <= 0)
            return <div />;

        return (
            <div style={{ height: '100%' }}>

                <div className="runTracker" style={{ height: '12%', display: "flex" }}>
                    <AskModal
                        AskModalCallBack={this.AskModalCallBack}
                        visible={this.state.askvisible}
                    />
                    <BarChart run={runCSV} width={100} />
                </div>
                <ThreeLevel
                    height={88}
                    datarun={datarun}
                    hyperpartitions={hyperpartitions}
                    classifiers={classifiers}
                    datasetID={datasetID}
                    setDatarunID={this.props.setDatarunID}
                    compareK={compareK}
                    datarunID={datarunID}
                    recommendationResult={this.state.recommendationResult}
                    postClickEvent={this.props.postClickEvent}
                    // newHyper={newHyper}
                    isLoading={isLoading}
                />
            </div>)
    }
}

export default connect((state: any) => ({
    classifiersSummary: getClassifiersSummarySelector(state),
    classifiers: getClassifiersSelector(state),
    hyperpartitions: getHyperPartitionsSelector(state),
    isLoading: getIsLoading(state)
}), (dispatch: any) => ({
    getClassifiersSummary: (id?: number) => dispatch(getClassifiersSummaryAction(id)),
    getClassifiers: (id?: number) => dispatch(getClassifiersAction(id)),
    getHyperPartition: (id?: number, dataRunId?: number) => dispatch(getHyperPartitionsAction(id, dataRunId))
}))(DataRuns)
