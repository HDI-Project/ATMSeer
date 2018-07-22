import * as React from 'react';
import ReactEcharts from 'echarts-for-react';
import {getColor} from "helper";
import { IHyperpartitionInfo } from 'service/dataService';

export interface LineChartProps {
    scores: {[id: string]: number}[];
    // id2method: {[id: number]: string};
    hyperpartitions: IHyperpartitionInfo[];
    topK: number
}

export interface LineChartState {}

export default class LineChart extends React.Component<LineChartProps, LineChartState> {
    constructor(props: LineChartProps) {
        super(props);
    }

    public computeOption() {
        const { scores, hyperpartitions } = this.props;
        const id2hp: {[id: number]: IHyperpartitionInfo} = {};
        hyperpartitions.forEach(hp => {
            id2hp[hp.id] = hp;
        });
        let series: any[] = [];
        let min = null;
        let max = null;
        if (scores.length > 0) {
            let ids = Object.keys(scores[0]);
            const lastScores = ids.map(id => scores[scores.length - 1][id]);
            // Sort ids by the last scores
            ids = ids.sort((a, b) => lastScores[b] - lastScores[a]);
            // min = lastScores[ids[topK - 1]];
            // max = lastScores[ids[0]];
            // const diff = max - min;
            // min = min - 0.1 * diff;
            // max = max + 0.1 * diff;
            series = ids.map(id => {
                const hp = id2hp[Number(id)];
                return {
                    data: scores.map((ss, i) => [i, ss[id]]),
                    type: 'line',
                    itemStyle: {
                        color: getColor(hp.method),
                        opacity: 0.5,
                    },
                    lineStyle: {
                        opacity: 0.5,
                    },
                    name: hp.hyperpartition_string,
                    label: true,
                    symbolSize: 1,
                };
            });
        }

        const option = {
            xAxis: {
                type: 'value',
            },
            yAxis: {
                type: 'value',
                min: min,
                max: max,
            },
            tooltip: {
                trigger: 'axis',
            },
            series,
            legend: {
                data: series.map(s => s.name),
                // type: 'scroll',
                // orient: 'vertical',
                // right: 10,
                // top: 20,
                // bottom: 20,
                itemHeight: 8,
            },
            grid: {
                top: 80,
                bottom: 30,
                left: 30,
                right: 20,
            }
        };
        return option;
    }

    public render() {
        return <ReactEcharts option={this.computeOption()}/>;
    }
}
