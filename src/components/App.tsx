import { Col, Layout, Row} from 'antd';
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
import {getIntro,selectIntroMode} from 'helper';
const { Content, Header } = Layout;
import 'intro.js/introjs.css';
import inf_icon from 'assets/info_icon.png';


export interface IState {
  datarunID: number | null;
  datasetID: number | null;
  datarunStatus: IDatarunStatusTypes;
  compareK: number; // 0=> don't compare
  activeKey:string
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
            compareK: 0, // 0=> don't compare
            activeKey:"2"
        };
        this.intervalID = null;
        selectIntroMode(3);
    }
    selectIntro = (key:string = this.state.activeKey) =>{
        if(key=="1"){
            selectIntroMode(2);
        }else if(key=="2"){
            selectIntroMode(1);
        }
    }
    public setDatarunID(id: number): void {
        console.info("set datarun id", id)
        this.setState({ datarunID: id })
    }
    public setDatasetID(datasetID: number): void {
        this.selectIntro();
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
                datasetID:this.state.datasetID?this.state.datasetID:-1,
                datarunID:this.state.datarunID?this.state.datarunID:-1,
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
    componentDidMount(){

    }
     setActiveKey = (e:string)=>{
         this.selectIntro(e);
        this.setState({
            activeKey : e
        })
    }
    introStart = ()=>{
        const introJs = require("intro.js");
        let setkey = (e:string) => {
            this.setActiveKey(e);
        }

        introJs().onbeforechange(function(targetElement:any) {
            let step = targetElement.getAttribute("data-step");
            if(step == getIntro("sidepanel_dataview").step){
                setkey("1");
            }else if(step == getIntro("sidepanel_leaderboard").step){
                setkey("2");
            }

        }).start();
    }

    public render() {
        return (
            <Layout className="app" >
                <Header className='appHeader'>
                ATMSeer
                <img src={logo} className='appLogo' />
                <UploadModal setUserName={this.setUserName}/>

                        {/* <Button shape="circle" icon="info-circle" onClick={this.introStart}/> */}
                        {/* <Icon type="info-circle" onClick={this.introStart}/> */}
                <div style={{ position: "absolute", top: "0px",right: "15px"}}>
                    <img src={inf_icon} width="35" height="35" onClick={this.introStart}/>
                </div>

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
                                activeKey = {this.state.activeKey}
                                setActiveKey = {this.setActiveKey}
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
