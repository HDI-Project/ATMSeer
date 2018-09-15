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
            xAxisData.push(`${(i*step).toFixed(1)}`)
        }
        const option = {
           // title:{
           //     text:"performance histogram",
           //      fontSize: '0.5vh',
           //     top: 0,
           // },
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
                },
                name: 'F_score',
               nameLocation :'middle',
               nameGap : '35'

            },
            xAxis: {
                type: 'value',
                name: 'Number of classifiers',
                nameLocation :'middle',
                nameGap : '30'
            },
            grid: {
                left: '15%',
                height: '55%',
                top: '10%',
                bottom: '25%',

            },
            series:{
                    type: 'bar',
                    // smooth: false,
                    barGap:'5%',
                    barCategoryGap: "5%",
                    data,
                    itemStyle:{
                        color:"#2491FC",
                        opacity: 1
                    },
            },
        };
        return option
    }
    public render(){
        return <ReactEcharts
        option = { this.getOption() }
        style={{ height: `150px`, width: `${this.props.width}%`}}
        />
    }
}