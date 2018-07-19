import { Col, Layout, Row } from 'antd';
import * as React from 'react';
import * as logo from '../assets/ATM-Logo.png';
import './App.css';
import DataRuns  from './DataRuns/';
// import DataView from "./DataView";
import SidePanel from './SidePanel';
import { IDatarunStatusTypes } from 'types/index';



const { Content, Header } = Layout;

export interface IState {
  datarunID: number | null;
  datasetID: number | null;
  datarunStatus: IDatarunStatusTypes;
}


class App extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);
    // this.onChange = this.onChange.bind(this)
    this.setDatarunID = this.setDatarunID.bind(this);
    this.setDatasetID = this.setDatasetID.bind(this);
    this.setDatarunStatus = this.setDatarunStatus.bind(this);
    this.state = {
        datarunStatus: IDatarunStatusTypes.PENDING,
        datarunID: null,
        datasetID: null
    };
}
  public setDatarunID(id: number): void{
    console.info("set datarun id", id)
    this.setState({datarunID: id})
  }
  public setDatasetID(datasetID: number): void{
    this.setState({datasetID});
  }
  public setDatarunStatus(datarunStatus: IDatarunStatusTypes): void{
    this.setState({datarunStatus});
  }
  public render() {
    return (
      <Layout className="app" >
        <Header className='appHeader'>
            VIS + ATM
            <img src={logo}
            className='appLogo'/>
        </Header>
        <Content className='appContent' >
          <Row style={{"height": "100%"}}>
            <Col span={6} className="col">
              <SidePanel
                {...this.state}
                setDatarunID={this.setDatarunID}
                setDatasetID={this.setDatasetID}
                setDatarunStatus={this.setDatarunStatus}
              />
            </Col >

            <Col span={18}  className="col">
            <div className="shadowBox" >
              <DataRuns datarunID={this.state.datarunID} datarunStatus={this.state.datarunStatus}/>
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
