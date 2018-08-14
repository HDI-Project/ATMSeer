// library
// import axios from "axios";
import * as React from "react";

//
import {parseDatarun} from "helper";
import {IDatarun} from 'types';
// import {URL} from '../../Const';
import {getClassifierSummary} from 'service/dataService';

//components
import MethodsSearchSpace from './MethodsSearchSpace';
import BarChart from './BarChart';
import Histogram from "./Histogram";
import { IDatarunStatusTypes } from 'types';
import { UPDATE_INTERVAL_MS } from "Const";

// const axiosInstance = axios.create({
//     baseURL: URL+'/api',
//     // timeout: 1000,
//     headers: {
//         'Access-Control-Allow-Origin': '*',
// }
//   });



export interface IState{
    runCSV:string
}
export interface IProps{
    datarunID: number | null;
    datarunStatus: IDatarunStatusTypes;
}
export default class DataRuns extends React.Component<IProps, IState>{
    private intervalID: number
    constructor(props: IProps) {
        super(props)
        this.getData = this.getData.bind(this)
        this.state = {
            runCSV:''
        }
    }
    public async getData() {
        // const res = await axios.get('../../viz/datarun2_gp.csv')
        // const {datarunID} = this.props
        // const res = await axiosInstance.get(`/classifier_summary?datarun_id=${datarunID}`)
        // const run = res.data
        if (this.props.datarunID !== null) {
            const run = await getClassifierSummary(this.props.datarunID);
            // const res = await axios.get('../../data/csvs/bandit/hyperpartitions.csv')
            // const banditData = res.data
            this.setState({runCSV: run})
        }

    }
    public startOrStopUpdateCycle() {
        this.intervalID = window.setInterval(this.getData, UPDATE_INTERVAL_MS);
        // if (this.props.datarunStatus === IDatarunStatusTypes.RUNNING) {
        //     this.intervalID = window.setInterval(this.getData, UPDATE_INTERVAL_MS);
        // } else {
        //     clearInterval(this.intervalID);
        // }
    }
    public componentDidMount(){
        // this.getData()
        // repeatedly get data
        this.getData();
        this.startOrStopUpdateCycle();
    }
    componentDidUpdate(prevProps: IProps) {
        if (prevProps.datarunID !== this.props.datarunID) {
            this.getData();
        }
        if (prevProps.datarunStatus !== this.props.datarunStatus) {
            this.startOrStopUpdateCycle();
        }
    }
    public componentWillUnmount() {
        window.clearInterval(this.intervalID)
    }
    public render(){
        const {runCSV} = this.state
        let datarun:IDatarun = parseDatarun(runCSV)
        if (Object.keys(datarun).length>0){
            return <div style={{height: '100%'}}>

            <div className="runTracker" style={{height: '20%', display: "flex"}}>
                <BarChart run={runCSV} width={60} />
                <Histogram datarun={datarun} width={40}/>
            </div>
            <MethodsSearchSpace height={80} datarun={datarun}/>

            </div>
        }else{
            return <div />
        }

    }
}

