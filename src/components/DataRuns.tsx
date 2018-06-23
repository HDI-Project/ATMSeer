import axios from "axios";
import ReactEcharts from "echarts-for-react";
import * as React from "react";
import {getColor} from "../helper"



export interface IState{
    dataruns: any[]
}

export default class DataRuns extends React.Component<{}, IState>{
    constructor(props: {}) {
        super(props)
        this.state = {
            dataruns:[]
        }
    }
    public async getData() {
        const res = await axios.get('../../viz/datarun2_gp.csv')
        const run = res.data
        // const res = await axios.get('../../data/csvs/bandit/hyperpartitions.csv')
        // const banditData = res.data
        this.setState({dataruns: [run]})

    }
    public componentDidMount(){
        this.getData()
    }
    public render(){
        const {dataruns} = this.state
        if (dataruns.length>0){
            return <LineChart run={dataruns[0]}/>
        }else{
            return <div />
        }
        
    }
}

class LineChart extends React.Component<{run:any}, {}>{
    public getOption(){
        let points = this.props.run.split('\n')
        // remove the header and last row
        points.shift()
        points.splice(-1, 1)
        let data = points.map((point:any)=>{
            point = point.split(',')
            let performance = parseFloat( point[4].split("+-")[0] )
            console.info(point[4], performance)
            let method = point[1]
            // let trialID = parseInt(point[0])
            return {
                value: performance,
                itemStyle: {
                     color: getColor(method)
                }
            }
        })
        return {
            xAxis: {
                type: 'category',
                // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                // type: 'value'
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: data,
                type: 'bar'
            }]
        };
    }
    public render(){
        return <ReactEcharts 
        option = { this.getOption() }
        style={{height: '50%', width: '100%'}}
        />
    }
}