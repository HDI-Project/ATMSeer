import * as React from 'react';
import ReactEcharts from 'echarts-for-react';

export interface LineChartProps {
    scores: {[id: string]: number}[];
}

export interface LineChartState {}

export default class LineChart extends React.Component<LineChartProps, LineChartState> {
    constructor(props: LineChartProps) {
        super(props);
    }

    public computeOption() {
        const { scores } = this.props;
        let series: {data: number[][], type: string}[] = [];
        if (scores.length > 0)
            series = Object.keys(scores[0]).map(id => {
                return {
                    data: scores.map((ss, i) => [i, ss[id]]),
                    type: 'line'
                };
            });
        const option = {
            xAxis: {
                type: 'value',
            },
            yAxis: {
                type: 'value'
            },
            series
        };
        return option;
    }

    public render() {
        return <ReactEcharts option={this.computeOption()}/>;
    }
}
