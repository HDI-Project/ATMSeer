import { Col, Layout, Row } from 'antd';
import * as React from 'react';
import * as logo from '../assets/ATM-Logo.png';
import './App.css';
import DataRuns from './DataRuns';
import DataView from "./DataView";
import Methods from './Methods';


const { Content, Header } = Layout;


class App extends React.Component {
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
            <Col span={4} className="col">
              <DataView/>
            </Col >
            <Col span={14}  className="col">
              <DataRuns/>
            </Col>
            <Col span={6} className="col">
              <Methods/>
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }
}

export default App;
