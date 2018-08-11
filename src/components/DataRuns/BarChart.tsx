import ReactEcharts from "echarts-for-react";
import { getColor } from "helper"
import * as React from "react";
import { Switch } from "antd";
import {EChartOption} from "echarts";

const sortSwitchStyle = {
    position: "absolute" as "absolute",
    top: "5px",
    right: "5px"
}
export interface IProps {
    run: any,
    width: number
}
export interface IState {
    sorted: boolean,
}
export default class BarChart extends React.Component<IProps, IState>{
    constructor(props: IProps) {
        super(props)
        this.state = {
            sorted: false
        }
        this.changeSort = this.changeSort.bind(this)
        this.getOption = this.getOption.bind(this)
    }
    public getOption() {
        let points = this.props.run.split('\n')
        points.splice(-1, 1) //remove last empty line
        // extract headers

        let headers = points.shift().split(',')

        // // hold a list of performance scores (to later find the max)
        // let performanceArray = [0]

        let data = points.map((point: any) => {
            point = point.split(',')
            let performanceIdx = headers.indexOf('performance')
            let performance = parseFloat(point[performanceIdx].split("+-")[0])
            // performanceArray.push(performance)
            let method = point[1]
            // let trialID = parseInt(point[0])
            return {
                value: performance,
                itemStyle: {
                    color: getColor(method)
                }
            }
        })
        let series:EChartOption['series'] = [{
            data: data,
            type: 'bar',
        }]

        if (this.state.sorted) {
            data.sort((a: any, b: any) => {
                return b.value - a.value;
            })
        } else {
            let bestSoFar: number[] = []
            let max = 0
            for (let i = 0; i < data.length; i++) {
                let currentPerformance = data[i].value
                if (max < currentPerformance) {
                    max = currentPerformance
                }
                bestSoFar.push(max)
            }

            series.push({
                data: bestSoFar,
                type: "line",
                symbolSize: 2,
                symbol: "circle",
                lineStyle: {
                    color: "gray",
                    width: "1"
                }
            })
        };
        const option = {
            title: {
                text: "data run tracker",
                left: '5%',
                top: '0.5%',
            },
            xAxis: {
                type: 'category',
                name: this.state.sorted?"":"trial ID",
                nameLocation: "middle",
                nameGap: 5,
                // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                // type: 'value'
            },
            yAxis: {
                type: 'value',
                min: 'dataMin',
                max: 1,
            },
            grid: {
                left: '5%',
                right: '5%',
                top: '25%',
                bottom: '30%',
            },
            tooltip: {},
            series,
        };
        return option
    }
    public changeSort() {
        this.setState({
            sorted: !this.state.sorted
        })
    }
    public render() {

        return (
            <div style={{ width: `${this.props.width}%`, height: '100%' }}>

                <ReactEcharts
                    option={this.getOption()}
                    style={{ width: `100%`, height: '100%' }}
                    notMerge={true}
                />
                <div className="sortSwitch" style={sortSwitchStyle}>
                    sorted by
                    <Switch checkedChildren="score" unCheckedChildren="time"
                        defaultChecked={false} onChange={this.changeSort} />
                </div>
            </div>

        )
    }
}
