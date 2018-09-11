import ReactEcharts from "echarts-for-react";
//import {getColor} from "helper"
import * as React from "react";
import {  IClassifierInfo } from 'service/dataService';
export interface IProps{
    classifiers:IClassifierInfo[], width: number
}

export interface IState{
    step: number
    yAxis: 'absolute'|'relative'
}

export default class OverallHistogram extends React.Component<IProps, IState>{
    constructor(props:IProps){
        super(props)
        this.state={
            step :0.1,
            yAxis:'absolute' //'absolute' or 'relative
        }
    }
    public getOption(){
        const {classifiers} = this.props
        let {step, yAxis} = this.state
        let data : number[] = [];
        for (let i =0; i<1/step; i++){
            data.push(0)
        }
        classifiers.forEach(classifier=>{
            let performance = classifier.cv_metric;//parseFloat(classifier['performance'].split(' +- ')[0])
            let rangeIdx = Math.floor(performance/step)
            data[rangeIdx] = data[rangeIdx]+1
        })
        if (yAxis=='relative'){
            let max = Math.max(...data)
            data = data.map(d=>d/max)
        }
        let xAxisData:string[] = []
        for (let i =0; i<1/step; i++){
            //xAxisData.push(`${(i*step).toFixed(2)}-${((i+1)*step).toFixed(2)}`)
            xAxisData.push(`${(i*step).toFixed(2)}`)
        }
        const option = {
            title:{
                text:"performance histogram",
                 fontSize: '0.8vh',
                top: 0,
            },
            yAxis: {
                type: 'category',
                data: xAxisData,
                axisTick:{
                    interval:0,
                },
                axisLabel: {
                    rotate: 0,
                    interval:1,
                    fontSize: 10,
                }
            },
            xAxis: {
                type: 'value'
            },
            grid: {
                left: '10%',
                height: '50%',
                top: '25%',
                bottom: '30%'
            },
            series:{
                    type: 'bar',
                    // smooth: false,
                    barGap:'5%',
                    barCategoryGap: "5%",
                    data,
                    itemStyle:{
                        color:"#F7CEA7",
                        opacity: 1
                    },
            },
        };
        return option
    }
    public render(){
        return <ReactEcharts
        option = { this.getOption() }
        style={{ height: `250px`, width: `${this.props.width}%`}}
        />
    }
}