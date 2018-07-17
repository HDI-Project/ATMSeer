import ReactEcharts from "echarts-for-react";
import {getColor} from "../../helper"
import * as React from "react";
import {filterByMethod} from "../../helper";
import {filterByDescending} from "../../helper";


export default class BarChart extends React.Component<{run:any, height: number}, any>{
    constructor(props:any) {
        super(props)
        this.state = { performanceMax: 0, sortType: 'default'}

        this.handleOnClickDefault = this.handleOnClickDefault.bind(this)
        this.handleOnClickMethods = this.handleOnClickMethods.bind(this)
        this.handleOnClickDescending = this.handleOnClickDescending.bind(this)
    }
    public handleOnClickDefault() {
        this.setState({sortType: 'default'})
    }
    public handleOnClickMethods() {
        this.setState({sortType: 'methods'})
    }
    public handleOnClickDescending() {
        this.setState({sortType: 'descending'})
    }
    public getOption(){
        let points = []
        //chooses between the sort type
        if(this.state.sortType == 'default') {
            points = this.props.run.split('\n')
            points.splice(-1, 1) //remove last empty line
        } else if (this.state.sortType == 'methods') {
            points = filterByMethod(this.props.run)
        } else if (this.state.sortType == 'descending') {
            points = filterByDescending(this.props.run)
        }
        
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
         //set the state for the max performance
         if(this.state.performanceMax <= 0) {
            const maxPerformance = Math.max.apply(null, performanceArray)
            this.setState({performanceMax : maxPerformance})
        }
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
                markLine:{
                    data: [[
                        {
                            name: 'Max Performance',
                            xAxis: 0,
                            yAxis: this.state.performanceMax
                        }, {
                            name: 'Max Performance',
                            xAxis: data.length-1,
                            yAxis: this.state.performanceMax
                        }
                    ]]
                },
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
            <div>
                <ReactEcharts 
                option = { this.getOption() }
                style={{height: `${this.props.height}%`, width: '100%'}}
                />
                <button onClick={this.handleOnClickDefault}>Sort by default</button>
                <button onClick={this.handleOnClickMethods}>Sort by method</button>
                <button onClick={this.handleOnClickDescending}>Sort by descending</button>
            </div>
        )
    }
}
