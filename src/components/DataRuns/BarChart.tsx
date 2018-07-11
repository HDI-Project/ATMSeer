import ReactEcharts from "echarts-for-react";
import {getColor} from "../../helper"
import * as React from "react";

export default class BarChart extends React.Component<{datarun:string|any, width: number}, {}>{
    public getOption(){
        let points = this.props.datarun.split('\n')
        // remove the header and last row
        let headers = points.shift().split(',')
        points.splice(-1, 1)
        
        let data = points.map((point:any)=>{
            point = point.split(',')
            let performanceIdx = headers.indexOf('performance')
            let performance = parseFloat( point[performanceIdx].split("+-")[0] )
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
                left: '0.5%',
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
        return <ReactEcharts 
        option = { this.getOption() }
        style={{height: `100%`, width: `${this.props.width}%`}}
        />
    }
}