import { Col, Layout, Row } from 'antd';
import * as React from 'react';
import * as logo from '../assets/ATM-Logo.png';
import './App.css';
import DataRuns  from './DataRuns/';
import DataView from "./DataView";



const { Content, Header } = Layout;

export interface IState {
  datarunID: number
}


class App extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props)
    // this.onChange = this.onChange.bind(this)
    this.setDatarunID = this.setDatarunID.bind(this)
    this.state = {
        datarunID:1
    }
}
  public setDatarunID(id:number){
    this.setState({datarunID: id})
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
              <DataView setDatarunID={this.setDatarunID}/>
            </Col >

            <Col span={18}  className="col">
            <div className="shadowBox" >
              <DataRuns datarunID={this.state.datarunID}/>
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
