import { Col, Layout, Row } from 'antd';
import * as React from 'react';
import * as logo from '../assets/ATM-Logo.png';
import './App.css';
import DataRuns  from './DataRuns';
// import DataView from "./DataView";
import SidePanel from './SidePanel';
import { IDatarunStatusTypes } from 'types';
//import { IConfigsInfo } from 'service/dataService';



const { Content, Header } = Layout;

export interface IState {
  datarunID: number | null;
  datasetID: number | null;
  datarunStatus: IDatarunStatusTypes;
  compareK: number // 0=> don't compare
}


class App extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);
    // this.onChange = this.onChange.bind(this)
    this.setDatarunID = this.setDatarunID.bind(this);
    this.setDatasetID = this.setDatasetID.bind(this);
    this.setDatarunStatus = this.setDatarunStatus.bind(this);
    this.compareTopK = this.compareTopK.bind(this);
    this.state = {
        datarunStatus: IDatarunStatusTypes.PENDING,
        datarunID: null,
        datasetID: null,
        compareK: 0 // 0=> don't compare
    };
}
  public setDatarunID(id: number): void{
    console.info("set datarun id", id)
    this.setState({datarunID: id})
  }
  public setDatasetID(datasetID: number): void{
    this.setState({datasetID});
  }
  public compareTopK(topK:number){
      this.setState({compareK: topK})
  }
  public setDatarunStatus(datarunStatus: IDatarunStatusTypes): void{
    this.setState({datarunStatus});
  }


  public render() {
      let {datarunID, datasetID, compareK, datarunStatus} = this.state
    return (
      <Layout className="app" >
        <Header className='appHeader'>
            ATMSeer
            <img src={logo}
            className='appLogo'/>
        </Header>
        <Content className='appContent' >
          <Row style={{"height": "100%"}}>
            <Col span={4} className="col">
              <SidePanel
                {...this.state}
                setDatarunID={this.setDatarunID}
                setDatasetID={this.setDatasetID}
                setDatarunStatus={this.setDatarunStatus}
                compareTopK={this.compareTopK}
              />
            </Col >

            <Col span={20}  className="col">
            <div className="shadowBox" >
              <DataRuns
                datarunID={datarunID}
                datarunStatus={datarunStatus}
                datasetID={datasetID}
                setDatarunID={this.setDatarunID}
                compareK={compareK}
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
