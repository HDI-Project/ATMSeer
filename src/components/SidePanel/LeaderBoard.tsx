import * as React from 'react';
import { Collapse, Tag } from 'antd';
import { IDatarunStatusTypes } from 'types/index';
import { getClassifiers, IClassifierInfo, IDatarunInfo, getDatarun, IHyperpartitionInfo, getHyperpartitions, getDatarunStepsScores } from 'service/dataService';
import { UPDATE_INTERVAL_MS } from 'Const';
import './LeaderBoard.css';
import LineChart from './LineChart';
import { getColor } from 'helper';

const Panel = Collapse.Panel;

const TOP_K = 10;

function isFloat(n: number): boolean {
    return n % 1 !== 0;
}

export interface IDatarunSummary {
    nTried: number;
    topClassifiers: IClassifierInfo[];
    nTriedByMethod: { [method: string]: number };
}

export function computeDatarunSummary(classifiers: IClassifierInfo[]): IDatarunSummary {
    // This need to fix to support other metric?
    classifiers = [...classifiers];
    classifiers.sort((a, b) => -a.cv_metric + b.cv_metric);
    const nTriedByMethod = {};
    classifiers.forEach(c => {
        const nTried = nTriedByMethod[c.method];
        nTriedByMethod[c.method] = nTried ? nTried + 1 : 1;
    });
    return {
        nTried: classifiers.length,
        topClassifiers: classifiers.slice(0, TOP_K),
        nTriedByMethod
    };
}

export function classifierMetricString(c: IClassifierInfo): string {
    return `${c.cv_metric.toFixed(3)} ± ${c.cv_metric_std.toFixed(3)}`;
}

export function HyperParams(params: { [method: string]: any }) {
    const keys = Object.keys(params);
    keys.sort();
    return (
        <React.Fragment>
            {keys.map(k => (
                <span key={k}>
                    [{k}: {typeof params[k] === 'number'
                    ? (isFloat(params[k]) ? params[k].toPrecision(4) : params[k] )
                    : String(params[k])}]{' '}
                </span>
            ))}
        </React.Fragment>
    );
}

export function MethodHeader(params: IClassifierInfo) {
    const width = `${(params.cv_metric * 70).toFixed(1)}%`;
    return (
        <div>
            <Tag color={getColor(params.method)}>{params.method}</Tag>
            <div className="lb-classifier" style={{ width }}>
                <span className="lb-classifier-metric">{classifierMetricString(params)}</span>
            </div>
        </div>
    );
}

export interface LeaderBoardProps {
    datarunID: number | null;
    datarunStatus: IDatarunStatusTypes;
}

export interface LeaderBoardState {
    datarunInfo: IDatarunInfo | null;
    hyperpartitions: IHyperpartitionInfo[];
    summary: IDatarunSummary | null;
    scores: {[id: string]: number}[];
}

export default class LeaderBoard extends React.Component<LeaderBoardProps, LeaderBoardState> {
    private intervalID: number;
    constructor(props: LeaderBoardProps) {
        super(props);
        this.updateLeaderBoard = this.updateLeaderBoard.bind(this);
        this.state = {
            summary: null,
            datarunInfo: null,
            hyperpartitions: [],
            scores: [],
        };
    }
    public updateLeaderBoard(updateDatarunInfo: boolean = false) {
        const { datarunID } = this.props;
        if (datarunID === null) return;
        getClassifiers(datarunID).then(classifiers => {
            // console.log(classifiers);
            this.setState({ summary: computeDatarunSummary(classifiers) });
        });
        getDatarunStepsScores(datarunID).then(scores => this.setState({scores}))
        if (updateDatarunInfo) {
            getDatarun(datarunID).then(datarunInfo => this.setState({ datarunInfo }));
            getHyperpartitions().then(hyperpartitions => {
                if (Array.isArray(hyperpartitions))
                    this.setState({ hyperpartitions });
                else
                    console.error('The fetched hyperpartitions should be an array!');
            });
        }
    }
    public startOrStopUpdateCycle() {
        if (this.props.datarunStatus === IDatarunStatusTypes.RUNNING) {
            this.intervalID = window.setInterval(this.updateLeaderBoard, UPDATE_INTERVAL_MS);
        } else {
            clearInterval(this.intervalID);
        }
    }
    componentDidMount() {
        this.updateLeaderBoard(true);
        this.startOrStopUpdateCycle();
    }
    componentDidUpdate(prevProps: LeaderBoardProps) {
        if (prevProps.datarunID !== this.props.datarunID) {
            this.updateLeaderBoard(true);
        }
        if (prevProps.datarunStatus !== this.props.datarunStatus) {
            this.startOrStopUpdateCycle();
        }
    }
    public componentWillUnmount() {
        window.clearInterval(this.intervalID)
    }
    public render() {
        const { summary, datarunInfo, scores, hyperpartitions } = this.state;

        const best = summary ? summary.topClassifiers[0] : undefined;
        return summary ? (
            <div>
                <div>
                    <h4>Overview</h4>
                    <hr />
                    <div>
                        Metric: {datarunInfo && datarunInfo.metric} / Total classifier tried: {summary.nTried} / Best
                        classifier: {best && `${best.method}-${best.id}`}
                    </div>
                    <div>
                        <LineChart scores={scores} hyperpartitions={hyperpartitions} topK={TOP_K}/>
                    </div>
                </div>
                <div>
                    <h4>Scores</h4>
                    <hr />
                    <Collapse bordered={false}>
                        {summary.topClassifiers.map(c => (
                            <Panel key={String(c.id)} header={<MethodHeader {...c} />}>
                                <HyperParams {...c.hyperparameters} />
                            </Panel>
                        ))}
                    </Collapse>
                </div>
            </div>
        ) : (
            <div>Please select a datarun.</div>
        );
    }
}
