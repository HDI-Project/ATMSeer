import ReactEcharts from "echarts-for-react";
import {getColor} from "helper"
import * as React from "react";


export default class BarChart extends React.Component<{run:any, width: number}, {}>{
    constructor(props:any) {
        super(props)
    }
    public getOption(){
        let points = this.props.run.split('\n')
        points.splice(-1, 1) //remove last empty line
        // extract headers

        let headers = points.shift().split(',')

        // hold a list of performance scores (to later find the max)
        let performanceArray = [0]

        let data = points.map((point:any)=>{
            point = point.split(',')
            let performanceIdx = headers.indexOf('performance')
            let performance = parseFloat( point[performanceIdx].split("+-")[0] )
            performanceArray.push(performance)
            let method = point[1]
            // let trialID = parseInt(point[0])
            return {
                value: performance,
                itemStyle: {
                     color: getColor(method)
                }
            }
        })
        const option = {
            title:{
                text:"data run tracker",
                left: '5%',
                top: '0.5%',
            },
            xAxis: {
                type: 'category',
                name: "trial ID",
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
            grid:{
                left: '5%',
                right: '5%',
                top: '25%',
                bottom: '30%',
            },
            tooltip:{},
            series: [{
                data: data,
                type: 'bar',
                itemStyle: {
                    normal: {
                    },
                    emphasis: {
                        barBorderWidth: 1,
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        shadowColor: 'rgba(0,0,0,0.5)'
                    }
                }
            }]
        };
        return option
    }
    public render(){

        return (
                <ReactEcharts
                option = { this.getOption() }
                style={{width: `${this.props.width}%`, height: '100%'}}
                />

        )
    }
}
