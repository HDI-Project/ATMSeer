import axios from "axios";
import * as React from "react";
import {csv2json} from "../../helper"
import Methods from './Methods';
import {IDataRun} from '../../types';
// import {DEV_URL} from '../../Const'
import BarChart from './BarChart';



export interface IState{
    dataruns: IDataRun[]
}
export interface IProps{
}
export default class DataRuns extends React.Component<IProps, IState>{
    constructor(props: IProps) {
        super(props)
        this.state = {
            dataruns:[]
        }
    }
    public async getData() {
        const res = await axios.get('../../viz/datarun2_gp.csv')
        // const res = await axios.get(`${DEV_URL}/api/classifier_summary?datarun_id=${1}`)
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
            return <div style={{height: '100%'}}>
            <BarChart run={dataruns[0]} height={30}/>
            <Methods height={70} datarun={csv2json(dataruns[0])}/>
            </div>
        }else{
            return <div />
        }
        
    }
}

