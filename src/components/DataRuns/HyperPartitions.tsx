import ReactEcharts from "echarts-for-react";
import {getColor} from "helper"
import * as React from "react";
import {IClassifierInfo} from "service/dataService"

export interface IProps{
    classifiers: IClassifierInfo[]
}

export interface IState{
    step: number
}

export default class extends React.Component<IProps, {}>{
    render(){
        let {classifiers} = this.props
        let hyperPartitionSet = new Set(classifiers.map(cls=>cls.hyperpartition_id))
        let hyperPartitionIDs = Array.from(hyperPartitionSet)
        return hyperPartitionIDs.map(hpID=>{
            let hpClassifiers = this.props.classifiers.filter(cls=>cls.hyperpartition_id==hpID)
            return (<div key={'hyperPartitionID:'+hpID} style={{float: "left", height: `35%`, width: '33%' }}>
                <GridHistogram  classifiers={hpClassifiers}/>
            </div>)
        })
    }
}

export class GridHistogram extends React.Component<IProps, IState>{
    constructor(props:IProps){
        super(props)
        this.state={
            step: 0.05
        }
    }
    public getOption(){
        let {classifiers} = this.props
        let {step} = this.state

        let xAxisData:string[] = []
        for (let i =0; i<1/step; i++){
            xAxisData.push(`${(i*step).toFixed(2)}-${((i+1)*step).toFixed(2)}`)
        }

        let performanceCount:number[] = []
        for (let i =0; i<1/step; i++){
            performanceCount.push(0)
        }
        let series = {
            type: "heatmap",
            itemStyle: {
                // color: getColor(classifiers[0].method),
                borderColor: 'white',
                borderWidth: 4,
            },
            data: classifiers.map(classifier=>{
                let performanceIdx = Math.floor(classifier.cv_metric/step)
                performanceCount[performanceIdx] += 1
                return [performanceIdx, performanceCount[performanceIdx]-1, classifier.id]
            })
        }

        const option = {
            title:{
                text: '',
                left: '0.5%',
                top: '0.5%',
            },
            tooltip:{
                formatter: (params: Object | any[], ticket: string) => {
                    return [
                        `performance: ${params['name']}`,
                        `classifier id: ${params['data'][2]}`
                    ].join('<br/>')
                }
            },
            xAxis: {
                type: 'category',
                data: xAxisData,
                axisTick:{
                    interval:0,
                },
                axisLabel:{
                    rotate:-30,
                    interval:1,
                    fontSize: 8,
                },
            },
            yAxis: {
                type: 'category',
                axisLabel:{
                    show: false
                },
            },
            grid:{
                left: '5%',
                right: '5%',
                top: '25%',
                bottom: '30%',
            },
            visualMap: {
                min: Math.min(...classifiers.map(cls=>cls.id)),
                max: Math.max(...classifiers.map(cls=>cls.id)),
                calculable: true,
                show:false,
                inRange: {
                    color: [getColor(classifiers[0].method)],
                    opacity: [0.4, 1]
                }
            },
            series,
        };
        return option
    }
    public render(){
        return <ReactEcharts
        option = { this.getOption() }
        style={{height: `100%`, width: `100%`}}
        />
    }
}