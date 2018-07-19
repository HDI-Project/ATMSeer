import * as React from 'react';
import ReactEcharts from 'echarts-for-react';

export interface LineChartProps {
    scores: {[id: string]: number}[]
}

export interface LineChartState {}

export default class LineChart extends React.Component<LineChartProps, LineChartState> {
    constructor(props: LineChartProps) {
        super(props);
    }

    public computeOption() {
        const scores = this.props;
        const option = {
            xAxis: {
                type: 'value',
                min: 0,
                max: scores.length
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                type: 'line'
            }]
        };
        return option;
    }

    public render() {
        return <ReactEcharts option={this.computeOption()}/>;
    }
}
