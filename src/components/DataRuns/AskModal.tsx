import * as React from 'react';
import { Modal, Button  } from 'antd';

export interface AskModalProps {
  AskModalCallBack : (e:number)=>void,
  visible:boolean
}

export interface AskModalState {
    loading: boolean,
    visible: boolean,
    name:string,
    alertvisible:boolean
}

export default class AskModal extends React.Component<AskModalProps, AskModalState> {
  constructor(props: AskModalProps) {
    super(props);
     this.state = {
        loading: false,
        visible: false,
        alertvisible:false,
        name:""
    }
  }

showModal =() => {
  this.initModal();
}
 public initModal() {
  // get configs from server ;
  // initialize the default value in Modal
  // Show Modal.
  this.setState({
    visible: true
  });
 }
 
  handleOk = () => {
    // Submit
    
    this.props.AskModalCallBack(0);
    //this.setState({ visible:false});
  }
  handleCancel = () => {
    //this.handleOk();
    this.props.AskModalCallBack(1);
    //this.setState({ visible: false });
  }
  onInputChange = (e : any) =>{
    //console.log(e.target.value);
    this.setState({name:e.target.value});
  }
  render() {
    const {  loading } = this.state;

    return (
      <div>
        <Modal
          visible={this.props.visible}
          title="Notice"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[

            <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
              I know
            </Button>,
          ]}>
            <h4 style={{display: "inline"}}>This datarun has been stopped, you can decide whether this datarun continues running. </h4>
        </Modal>
      </div>
    );
  }
}

