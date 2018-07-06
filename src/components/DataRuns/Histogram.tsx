import ReactEcharts from "echarts-for-react";
import {getColor} from "../../helper"
import * as React from "react";
import { IDatarun } from "../../types";

export interface IProps{
    datarun:IDatarun, height: number
}

export interface IState{
    step: number
    yAxis: 'absolute'|'relative'
}

export default class Histogram extends React.Component<IProps, IState>{
    constructor(props:IProps){
        super(props)
        this.state={
            step :0.05, 
            yAxis:'absolute' //'absolute' or 'relative
        }
    }
    public getOption(){
        const {datarun} = this.props
        let {step, yAxis} = this.state
        let series = Object.keys(datarun).map((name:string)=>{
            let data:number[] = []
            for (let i =0; i<1/step; i++){
                data.push(0)
            }
            datarun[name].forEach(classifier=>{
                let performance = parseFloat(classifier['performance'].split(' +- ')[0])
                let rangeIdx = Math.floor(performance/step)
                data[rangeIdx] = data[rangeIdx]+1
            })
            if (yAxis=='relative'){
                let max = Math.max(...data)
                data = data.map(d=>d/max)
            }
            
            return {
                type: 'line',
                smooth: false,
                data,
                lineStyle:{
                    color: getColor(name)
                },
            }
        })

        let xAxisData:string[] = []
        for (let i =0; i<1/step; i++){
            xAxisData.push(`${(i*step).toFixed(2)}-${((i+1)*step).toFixed(2)}`)
        }
        const option = {
            xAxis: {
                type: 'category',
                data: xAxisData,
            },
            yAxis: {
                type: 'value'
            },
            grid:{
                left: '5%',
                right: '5%',
                top: '5%',
                bottom: '12%',
            },
            series,
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