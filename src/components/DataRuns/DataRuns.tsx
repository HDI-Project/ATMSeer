// library
// import axios from "axios";
import * as React from "react";

//
import {parseDatarun} from "../../helper";
import {IDatarun} from '../../types';
// import {URL} from '../../Const';
import {getClassifierSummary, getClassifiers, IClassifierInfo} from '../../service/dataService';

//components
import Methods from './Methods';
import BarChart from './BarChart';
import Histogram from "./Histogram";
// import HyperPartitions from "./HyperPartitions";
import { IDatarunStatusTypes } from 'types/index';
import { UPDATE_INTERVAL_MS } from "Const";

// const axiosInstance = axios.create({
//     baseURL: URL+'/api',
//     // timeout: 1000,
//     headers: {
//         'Access-Control-Allow-Origin': '*',
// }
//   });



export interface IState{
    runCSV:string,
    classifiers: IClassifierInfo[]
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
            runCSV:'',
            classifiers:[]
        }
    }
    public async getData() {
        // const res = await axios.get('../../viz/datarun2_gp.csv')
        // const {datarunID} = this.props
        // const res = await axiosInstance.get(`/classifier_summary?datarun_id=${datarunID}`)
        // const run = res.data
        const {datarunID} = this.props
        if (datarunID !== null) {
            const runCSV = await getClassifierSummary(datarunID);
            // const res = await axios.get('../../data/csvs/bandit/hyperpartitions.csv')
            // const banditData = res.data
            const classifiers = await getClassifiers(datarunID)
            this.setState({runCSV, classifiers})
        }

    }
    public startOrStopUpdateCycle() {
        // this.intervalID = window.setInterval(this.getData, UPDATE_INTERVAL_MS);
        if (this.props.datarunStatus === IDatarunStatusTypes.RUNNING) {
            this.intervalID = window.setInterval(this.getData, UPDATE_INTERVAL_MS);
        } else {
            clearInterval(this.intervalID);
        }
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
        // const {classifiers} = this.state
        let datarun:IDatarun = parseDatarun(runCSV)
        if (Object.keys(datarun).length>0){
            return (
        <div style={{height: '100%'}}>

            <div className="runTracker" style={{height: '20%', display: "flex"}}>
                <Histogram datarun={datarun} width={40}/>
                <BarChart run={runCSV} width={60} />
            </div>
            {/* <div style={{height: "80%", overflowY: "scroll"}}>
                <HyperPartitions classifiers={classifiers} />
            </div> */}

            <Methods height={80} datarun={datarun}/>

        </div>)
        }else{
            return <div />
        }

    }
}

