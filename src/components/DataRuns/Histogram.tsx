import ReactEcharts from "echarts-for-react";
import {getColor} from "../../helper"
import * as React from "react";

export default class Histogram extends React.Component<{datarun:any, height: number}, {}>{
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
            xAxis: {
                type: 'category',
                // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                // type: 'value'
            },
            yAxis: {
                type: 'value'
            },
            grid:{
                left: '5%',
                right: '5%',
                top: '5%',
                bottom: '5%',
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
        style={{height: `${this.props.height}%`, width: '100%'}}
        />
    }
}