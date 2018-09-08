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


const { Content, Header } = Layout;

export interface IState {
  datarunID: number | null;
  datasetID: number | null;
  datarunStatus: IDatarunStatusTypes;
  compareK: number // 0=> don't compare
}


class App extends React.Component<{}, IState> {
    private intervalID: number | null;
    private user_name = "";
    //private clickevent: IClickEvent[] = [];
    constructor(props: {}) {
        super(props);
        // this.onChange = this.onChange.bind(this)
        this.setDatarunID = this.setDatarunID.bind(this);
        this.setDatasetID = this.setDatasetID.bind(this);
        this.setDatarunStatus = this.setDatarunStatus.bind(this);
        this.updateDatarunStatus = this.updateDatarunStatus.bind(this);
        this.startOrStopUpdateCycle = this.startOrStopUpdateCycle.bind(this);
        this.setTopK = this.setTopK.bind(this);
        this.state = {
            datarunStatus: IDatarunStatusTypes.PENDING,
            datarunID: null,
            datasetID: null,
            compareK: 0 // 0=> don't compare
        };
        this.intervalID = null;
    }
    public setDatarunID(id: number): void {
        console.info("set datarun id", id)
        this.setState({ datarunID: id })
    }
    public setDatasetID(datasetID: number): void {
        this.setState({ datasetID });
    }
    public setDatarunStatus(datarunStatus: IDatarunStatusTypes): void {
        this.setState({ datarunStatus });
    }

    public updateDatarunStatus() {
        const { datarunID } = this.state;
        if (datarunID !== null) {
            getDatarun(datarunID).then(({ status }) => {
                this.setDatarunStatus(status);
            });
        }
    }
    public setTopK(topK:number){
        let action="selected";
        if(topK==0){
            action="unselected";
        }
        let eventlog:IClickEvent = {
            type:"compare",
            description:{
                action:action,
                topK:topK
            },
            time:new Date().toString()
        }
        this.postClickEvent(eventlog);
        this.setState({compareK: topK})
    }

    public startOrStopUpdateCycle(datarunStatus: IDatarunStatusTypes) {
        if (datarunStatus === IDatarunStatusTypes.RUNNING) {
            this.intervalID = window.setInterval(this.updateDatarunStatus, UPDATE_INTERVAL_MS);
        } else if (this.intervalID !== null) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }
    }
    setUserName = (user_name:string)=>{
        this.user_name = user_name;
    }
    postClickEvent = (log:IClickEvent)=>{
        //this.clickevent.push(log);
        if(USER_STUDY){
            let bundlelog : IClickBundleEvent= {
                name:this.user_name,
                clickevent:log
            }
            postBundleClickEvent(bundlelog);
        }
    }
    componentDidUpdate(prevProps: {}, prevState: IState) {
        if (prevState.datarunID !== this.state.datarunID) {
            this.updateDatarunStatus();
        }
        if (prevState.datarunStatus !== this.state.datarunStatus) {
            this.startOrStopUpdateCycle(this.state.datarunStatus);
        }
    }
    public render() {
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
                                {...this.state}
                                setDatarunID={this.setDatarunID}
                                setDatasetID={this.setDatasetID}
                                setDatarunStatus={this.setDatarunStatus}
                                setTopK = {this.setTopK}
                                postClickEvent = {this.postClickEvent}
                            />
                        </Col >

                        <Col span={20} className="col">
                            <div className="shadowBox" >
                                <DataRuns
                                    datarunID={this.state.datarunID}
                                    datarunStatus={this.state.datarunStatus}
                                    datasetID={this.state.datasetID}
                                    setDatarunID={this.setDatarunID}
                                    compareK = {this.state.compareK}
                                    postClickEvent ={this.postClickEvent}
                                    setDatarunStatus={this.setDatarunStatus}
                                />
                            </div>
                        </Col>
                        {/* <Col span={6} className="col">

            </Col> */}
                    </Row>
                </Content>
            </Layout>

        );
    }
}

export default App;
