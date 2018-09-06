// library
// import axios from "axios";
import * as React from "react";
import {Tabs,Row,Col,Progress} from 'antd';

//
import {parseDatarun} from "helper";
import {IDatarun} from 'types';
// import {URL} from '../../Const';
//import {getClassifierSummary} from 'service/dataService';
import {getClassifierSummary, getClassifiers,getHyperpartitions,IRecommendationResult, IClassifierInfo,IHyperpartitionInfo, getRecommendation, IClickEvent} from 'service/dataService';

//components
// import MethodsLineChart from './MethodsLineChart';
//import MethodsSearchSpace from './MethodsSearchSpace';
import BarChart from './BarChart';
import OverallHistogram from "./OverallHistogram";
// import HyperPartitions from "./HyperPartitions";
import { IDatarunStatusTypes } from 'types/index';
import { UPDATE_INTERVAL_MS } from "Const";
import ThreeLevel from "./ThreeLevel";
// const axiosInstance = axios.create({
//     baseURL: URL+'/api',
//     // timeout: 1000,
//     headers: {
//         'Access-Control-Allow-Origin': '*',
// }
//   });
const TabPane = Tabs.TabPane


export interface IProps{
    datarunID: number | null;
    datarunStatus: IDatarunStatusTypes;
    datasetID: number | null;
    compareK: number
    setDatarunID: (id: number) => void;
    postClickEvent :(e:IClickEvent)=>void;
}
export interface IState{
    runCSV:string,
    classifiers: IClassifierInfo[],
    hyperpartitions: IHyperpartitionInfo[],
    recommendationResult:IRecommendationResult
}
export interface IDatarunSummary {
    nTried: number;
    topClassifiers: IClassifierInfo[];
    nTriedByMethod: { [method: string]: number };
    triedHyperpartition: number[]
}
export default class DataRuns extends React.Component<IProps, IState>{
    private intervalID: number
    constructor(props: IProps) {
        super(props)
        this.getData = this.getData.bind(this)
        this.state = {
            runCSV:'',
            classifiers:[],
            hyperpartitions:[],
            recommendationResult:{
                result:[]
            }
        }
    }
    public async getData() {
        // const res = await axios.get('../../viz/datarun2_gp.csv')
        // const {datarunID} = this.props
        // const res = await axiosInstance.get(`/classifier_summary?datarun_id=${datarunID}`)
        // const run = res.data
        const {datarunID,datasetID} = this.props
        if (datarunID !== null && datasetID !== null) {
            const runCSV = await getClassifierSummary(datarunID);
            // const res = await axios.get('../../data/csvs/bandit/hyperpartitions.csv')
            // const banditData = res.data
            const classifiers = await getClassifiers(datarunID);
            let hyperpartitions = await  getHyperpartitions(undefined, datarunID).then(hyperpartitions => {
                // console.log(hyperpartitions);
                if (Array.isArray(hyperpartitions)){
                       return hyperpartitions
                }else
                    {console.error('The fetched hyperpartitions should be an array!');
                    return []
                }
            });
            let recommendationResult = await getRecommendation(datasetID);
            this.setState({runCSV:runCSV, 
                classifiers:classifiers, 
                hyperpartitions:hyperpartitions,
                recommendationResult:recommendationResult})
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
        let {runCSV, hyperpartitions, classifiers} = this.state
        let {datasetID, datarunID, compareK} = this.props
        hyperpartitions = hyperpartitions.filter(d=>d.datarun_id==this.props.datarunID)
        // const {classifiers} = this.state
        let datarun:IDatarun = parseDatarun(runCSV)
        //console.log(runCSV);
        //console.log(datarun);
        function computeDatarunSummary(classifiers: IClassifierInfo[]): IDatarunSummary {
            // This need to fix to support other metric?
            classifiers = [...classifiers];
            classifiers.sort((a, b) => -a.cv_metric + b.cv_metric);
            let nTriedByMethod = {};
            let triedHyperpartition = []
            classifiers.forEach(c => {
                const nTried = nTriedByMethod[c.method];
                nTriedByMethod[c.method] = nTried ? nTried + 1 : 1;
            });
            triedHyperpartition = Array.from(new Set(classifiers.map(d=>d.hyperpartition_id)))
            return {
                nTried: classifiers.length,
                topClassifiers: classifiers,
                nTriedByMethod,
                triedHyperpartition,
            };
        }
        let summary = computeDatarunSummary(classifiers);
        let methods_num = summary?Object.keys(summary.nTriedByMethod).length:0
        let hp_num = summary?summary.triedHyperpartition.length:0
        const progressAlgorithm = (percent:number)=>{
            return `${methods_num}/14`
        }
        const progressHyperpartiton = (percent:number)=>{
            return `${hp_num}/172`
        }




        if (Object.keys(datarun).length>0){
            return (
        <div style={{height: '100%'}}>

            <div className="runTracker" style={{height: '15%', display: "flex"}}>
                {/* <Histogram datarun={datarun} width={40}/> */}
                <Tabs
                    defaultActiveKey="1"
                    style={{width: '100%'}}
                    tabPosition="left"
                >
                    <TabPane tab="Trials" key="1">
                    <BarChart run={runCSV} width={100} />

                    </TabPane>
                    <TabPane tab="Performance" key="2">
                    <Row style={{ "height": "100%" }}>
                    <Col span={18}>
                    <OverallHistogram datarun={datarun} width={100}/>
                    </Col>
                    <Col span={6}>
                    <b>Algorithm Coverage</b>:{' '}
                        <Progress
                        type="circle"
                        percent={100*methods_num/14}
                        format={progressAlgorithm}
                        width={40}
                        strokeWidth={10}
                        />
                        <br/>
                        <b>Hyperpartitions Coverage</b>:{' '}
                        <Progress
                        type="circle"
                        percent={100*hp_num/172}
                        format={progressHyperpartiton}
                        width={40}
                        strokeWidth={10}
                        />
                    </Col>
                    </Row>
                    </TabPane>
                </Tabs>
            </div>
            {/* <div style={{height: "80%", overflowY: "scroll"}}>
                <HyperPartitions classifiers={classifiers} />
            </div> */}

            {/* <MethodsLineChart height={85} datarun={datarun} hyperpartitions={this.state.hyperpartitions}
            datasetID={this.props.datasetID} setDatarunID={this.props.setDatarunID}
            datarunID={this.props.datarunID}/> */}
            <ThreeLevel
            height={85}
            datarun={datarun}
            hyperpartitions={hyperpartitions}
            classifiers={classifiers}
            datasetID={datasetID}
            setDatarunID={this.props.setDatarunID}
            compareK={compareK}
            datarunID={datarunID}
            recommendationResult={this.state.recommendationResult}
            postClickEvent={this.props.postClickEvent}
            />

        </div>)
        }else{
            return <div />
        }

    }
}

