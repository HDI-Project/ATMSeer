import { Col, Layout, Row } from 'antd';
import * as React from 'react';
import * as logo from '../assets/ATM-Logo.png';
import './App.css';
import DataRuns from './DataRuns';
// import DataView from "./DataView";
import SidePanel from './SidePanel';
import { IDatarunStatusTypes } from 'types';
import { getDatarun,IClickEvent,postBundleClickEvent,IClickBundleEvent } from 'service/dataService';
import { UPDATE_INTERVAL_MS,USER_STUDY } from 'Const';
import UploadModal from './UploadModal'
import {connect} from 'react-redux';

// import{
//     getDatarunIdSelector,
//     getDatasetIdSelector,
//     getDatarunStatusSelector
// } from 'selectors/App';

// import {
//     setDatarunIdAction,
//     setDataSetIdAction,
//     setDatarunStatusAction
// } from 'actions/app';


const { Content, Header } = Layout;

export interface IState {
//   datarunID: number | null;
//   datasetID: number | null;
//   datarunStatus: IDatarunStatusTypes;
  compareK: number // 0=> don't compare
}

export interface IProps {
    // datarunID: number;
    // datasetID: number;
    // datarunStatus: IDatarunStatusTypes;
    // setDatarunID: (datarunID: number | null) => void;
    // setDatasetID: (datasetID: number) => void;
    // setDatarunStatus: (datarunStatus: IDatarunStatusTypes) => void;

}


export default class App extends React.Component<IProps, IState> {
    private intervalID: number | null;
    private user_name = "";
    //private clickevent: IClickEvent[] = [];
    constructor(props: IProps) {
        super(props);
        // this.onChange = this.onChange.bind(this)
        // this.setDatarunID = this.setDatarunID.bind(this);
        // this.setDatasetID = this.setDatasetID.bind(this);
        // this.setDatarunStatus = this.setDatarunStatus.bind(this);
        // this.updateDatarunStatus = this.updateDatarunStatus.bind(this);
        // this.startOrStopUpdateCycle = this.startOrStopUpdateCycle.bind(this);
        // this.setTopK = this.setTopK.bind(this);
        this.state = {
            // datarunStatus: IDatarunStatusTypes.PENDING,
            // datarunID: null,
            // datasetID: null,
            compareK: 0 // 0=> don't compare
        };
        this.intervalID = null;
    }
    // public setDatarunID(id: number): void {
    //     // console.info("set datarun id", id)
    //     // this.setState({ datarunID: id })
    //     this.props.setDatarunID(id);
    // }
    // public setDatasetID(datasetID: number): void {
    //     // this.setState({ datasetID });
    //     this.props.setDatasetID(datasetID);
    // }

    // public setDatarunStatus(datarunStatus: IDatarunStatusTypes): void {
    //     // this.setState({ datarunStatus });
    //     // this.props.setDatarunStatus(datarunStatus)
    // }

    // public updateDatarunStatus() {
    //     const { datarunID } = this.props;
    //     if (datarunID !== null) {
    //         getDatarun(datarunID).then(({ status }) => {
    //             this.props.setDatarunStatus(status);
    //         });
    //     }
    // }
    // public setTopK(topK:number){
    //     let action = topK == 0 ? 'unselected' : 'selected' ;

    //     let eventlog:IClickEvent = {
    //         type:"compare",
    //         description:{
    //             action,
    //             topK
    //         },
    //         time:new Date().toString()
    //     }
    //     this.postClickEvent(eventlog);
    //     this.setState({compareK: topK})
    // }

    // public startOrStopUpdateCycle(datarunStatus: IDatarunStatusTypes) {
    //     if (datarunStatus === IDatarunStatusTypes.RUNNING) {
    //         this.intervalID = window.setInterval(this.updateDatarunStatus, UPDATE_INTERVAL_MS);
    //     } else if (this.intervalID !== null) {
    //         clearInterval(this.intervalID);
    //         this.intervalID = null;
    //     }
    // }
    setUserName = (user_name:string)=>{
        this.user_name = user_name;
    }
    // postClickEvent = (log:IClickEvent)=>{
    //     //this.clickevent.push(log);
    //     if(USER_STUDY){
    //         let bundlelog : IClickBundleEvent= {
    //             name:this.user_name,
    //             datasetID:this.props.datasetID?this.props.datasetID:-1,
    //             datarunID:this.props.datarunID?this.props.datarunID:-1,
    //             clickevent:log
    //         }
    //         postBundleClickEvent(bundlelog);
    //     }
    // }

    // componentDidUpdate(prevProps: IProps, prevState: IState) {
    //     if (prevProps.datarunID !== this.props.datarunID) {
    //         this.updateDatarunStatus();
    //     }

    //     if (prevProps.datarunStatus !== this.props.datarunStatus) {
    //         this.startOrStopUpdateCycle(this.props.datarunStatus);
    //     }
    // }

    public render() {
        // const {
        //     datarunID,
        //     datasetID,
        //     datarunStatus,
        //     setDatarunID,
        //     setDatasetID,
        //     setDatarunStatus
        // } = this.props;

        return (
            <Layout className="app" >
                <Header className='appHeader'>
                ATMSeer
                        <img src={logo} className='appLogo' />
                        <UploadModal setUserName={this.setUserName}/>
                </Header>
                <Content className='appContent' >
                    <Row style={{ "height": "100%" }}>
                        <Col span={4} className="col">
                            <SidePanel
                                // {...this.state}
                                // datarunID={datarunID}
                                // datasetID={datasetID}
                                // datarunStatus={datarunStatus}
                                // setDatarunID={setDatarunID}
                                // setDatasetID={setDatasetID}
                                // setDatarunStatus={setDatarunStatus}
                                // setTopK = {this.setTopK}
                                // postClickEvent = {this.postClickEvent}
                            />
                        </Col >

                        <Col span={20} className="col">
                            <div className="shadowBox" >
                                {/* <DataRuns
                                    datarunID={datarunID}
                                    datarunStatus={datarunStatus}
                                    datasetID={datasetID}
                                    setDatarunID={setDatarunID}
                                    compareK = {this.state.compareK}
                                    postClickEvent ={this.postClickEvent}
                                    setDatarunStatus={setDatarunStatus}
                                /> */}
                            </div>
                        </Col>
                    </Row>
                </Content>
            </Layout>

        );
    }
}

// export default connect((state: any) => ({
//     // datarunID: getDatarunIdSelector(state),
//     // datasetID: getDatasetIdSelector(state),
//     // datarunStatus: getDatarunStatusSelector(state)
// }), (dispatch: any)=> ({
//     // setDatarunID: (datarunID: number) => dispatch(setDatarunIdAction(datarunID)),
//     // setDatasetID: (dataSetID: number) => dispatch(setDataSetIdAction(dataSetID)),
//     // setDatarunStatus: (datarunStatus: IDatarunStatusTypes) => dispatch(setDatarunStatusAction(datarunStatus))
// }))(App)
