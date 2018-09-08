import * as React from 'react';
import { Modal, Button, Input,Alert  } from 'antd';
import {USER_STUDY} from 'Const';
export interface UploadModalProps {
  setUserName : (e:string)=>void
}

export interface UploadModalState {
    loading: boolean,
    visible: boolean,
    name:string,
    alertvisible:boolean
}

export default class UploadModal extends React.Component<UploadModalProps, UploadModalState> {
  constructor(props: UploadModalProps) {
    super(props);
     this.state = {
        loading: false,
        visible: USER_STUDY,
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
    if(this.state.name==""){
      this.setState({alertvisible:true});
    }else{
      this.props.setUserName(this.state.name);
      this.setState({ visible:false, alertvisible:false});
    }

  }
  handleCancel = () => {
    this.handleOk();
    //this.setState({ visible: false });
  }
  onInputChange = (e : any) =>{
    //console.log(e.target.value);
    this.setState({name:e.target.value});
  }
  render() {
    const { visible, loading,alertvisible } = this.state;
    let generateAlert = () =>{
      if(alertvisible)
      return <Alert message="Please enter your name" type="error" />
      else return <div />
    }

    return (
      <div>
        <Modal
          visible={visible}
          title="Set your name"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
              OK
            </Button>,
          ]}
          
        >   {generateAlert()}
            <h4 style={{display: "inline"}}> Your name </h4>
            <Input placeholder="Please input your name for user study" onChange={this.onInputChange}/>
        </Modal>
      </div>
    );
  }
}

