// library
// import axios from "axios";
import * as React from "react";

//
import {parseDatarun} from "helper";
import {IDatarun} from 'types';
// import {URL} from '../../Const';
//import {getClassifierSummary} from 'service/dataService';
import {getClassifierSummary, getClassifiers,getHyperpartitions, IClassifierInfo,IHyperpartitionInfo} from '../../service/dataService';

//components
import MethodsLineChart from './MethodsLineChart';
//import MethodsSearchSpace from './MethodsSearchSpace';
import BarChart from './BarChart';
// import Histogram from "./Histogram";
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
    classifiers: IClassifierInfo[],
    hyperpartitions: IHyperpartitionInfo[]
 
}
export interface IProps{
    datarunID: number | null;
    datarunStatus: IDatarunStatusTypes;
    datasetID: number | null;
    setDatarunID: (id: number) => void;
}
export default class DataRuns extends React.Component<IProps, IState>{
    private intervalID: number
    constructor(props: IProps) {
        super(props)
        this.getData = this.getData.bind(this)
        this.state = {
            runCSV:'',
            classifiers:[],
            hyperpartitions:[]
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
            const classifiers = await getClassifiers(datarunID);
            let sethyperpartitions = this.state.hyperpartitions;
            getHyperpartitions().then(hyperpartitions => {
                // console.log(hyperpartitions);
                if (Array.isArray(hyperpartitions))
                   {
                    sethyperpartitions=hyperpartitions.filter(d=>d.datarun_id==datarunID)
                       //this.setState({ hyperpartitions });
                   }
                else
                    console.error('The fetched hyperpartitions should be an array!');
            });
            this.setState({runCSV:runCSV, classifiers:classifiers, hyperpartitions:sethyperpartitions})
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
        if (this.state.runCSV==''){
            this.getData();
        }
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
        console.log(datarun);
        //console.log(runCSV);
        //console.log(datarun);
        if (Object.keys(datarun).length>0){
            return (
        <div style={{height: '100%'}}>

            <div className="runTracker" style={{height: '15%', display: "flex"}}>
                {/* <Histogram datarun={datarun} width={40}/> */}
                <BarChart run={runCSV} width={100} />
            </div>
            {/* <div style={{height: "80%", overflowY: "scroll"}}>
                <HyperPartitions classifiers={classifiers} />
            </div> */}

            <MethodsLineChart height={85} datarun={datarun} hyperpartitions={this.state.hyperpartitions}
            datasetID={this.props.datasetID} setDatarunID={this.props.setDatarunID}
            datarunID={this.props.datarunID}/>

        </div>)
        }else{
            return <div />
        }

    }
}

