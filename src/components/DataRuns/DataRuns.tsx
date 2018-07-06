// library
import axios from "axios";
import * as React from "react";

//
import {parseDatarun} from "../../helper"
import {IDatarun} from '../../types';
import {URL} from '../../Const'

//components
import Methods from './Methods';
import BarChart from './BarChart';
// import Histogram from "./Histogram";

const axiosInstance = axios.create({
    baseURL: URL+'/api',
    // timeout: 1000,
    headers: {
        'Access-Control-Allow-Origin': '*',
}
  });



export interface IState{
    runCSV:string
}
export interface IProps{
}
export default class DataRuns extends React.Component<IProps, IState>{
    private intervalID:number
    constructor(props: IProps) {
        super(props)
        this.state = {
            runCSV:''
        }
    }
    public async getData() {
        // const res = await axios.get('../../viz/datarun2_gp.csv')
        const res = await axiosInstance.get(`/classifier_summary?datarun_id=1`)
        const run = res.data
        // const res = await axios.get('../../data/csvs/bandit/hyperpartitions.csv')
        // const banditData = res.data
        this.setState({runCSV: run})

    }
    public componentDidMount(){
        this.getData()
        // this.intervalID = window.setInterval(this.getData, 2500)
    }
    public componentWillUnmount() {
        window.clearInterval(this.intervalID)
    }
    public render(){
        const {runCSV} = this.state
        let datarun:IDatarun = parseDatarun(runCSV)
        if (Object.keys(datarun).length>0){
            return <div style={{height: '100%'}}>
            <BarChart datarun={runCSV} height={20} />
            {/* <Histogram datarun={datarun} height={20}/> */}
            <Methods height={80} datarun={datarun}/>
            </div>
        }else{
            return <div />
        }
        
    }
}

