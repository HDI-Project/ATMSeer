import * as React from 'react';
import { Modal, Button, Icon, Checkbox,InputNumber,message } from 'antd';
import * as methodsDef from "../../assets/methodsDef.json";
import { IConfigsInfo, IConfigsUploadResponse } from 'service/dataService';
import { getConfigs,postConfigs } from 'service/dataService';

export interface SettingsModalProps {

}

export interface SettingsModalState {

}

export default class SettingsModal extends React.Component<SettingsModalProps, SettingsModalState> {
  constructor(props: SettingsModalProps) {
    super(props);
    
    
 }
 state = {
  loading: false,
  visible: false,
  configs : {methods : [], budget : 100},
  defaultMethodValue: [],
  defaultBudgetValue: 100,
 
};
showModal =() => {
  this.initModal();
}
 public initModal() {
   // get configs from server ;
   // initialize the default value in Modal
   // Show Modal.
  let promise: Promise<IConfigsInfo>;
  promise = getConfigs();
  promise
      .then(configs => {
        console.log(configs);
        this.setState({
          visible: true,
          configs : {methods:configs.methods,budget:configs.budget},
        });
      })
      .catch(error => {
          console.log(error);
      });
  }


  handleOk = () => {
    // Submit
    this.setState({ loading: true });
    console.log(this.state.configs);
    let promise:Promise<IConfigsUploadResponse> = postConfigs(this.state.configs);
    promise.then(status => {
      if(status.success == true){
        message.success("Submit Configs Successfully.");
      }
      this.setState({ loading: false, visible: false });
    }).catch(error=>{
      console.log(error);
      message.error("Submit Configs Failed.");
      this.setState({ loading: false, visible: false });

    });
    
  }
  handleCancel = () => {
    this.setState({ visible: false });
  }
  onMethodsChange = (methods : any) => {
    //console.log("checked",methods);
    if(methods.length<1){
      message.error("You must select at least one method");
    }else{
      let configs = this.state.configs;
      configs.methods = methods;
      this.setState({configs:configs});
    }
  }
  onBudgetChange = (budget : any) =>{
    let configs = this.state.configs;
    configs.budget = budget;
    this.setState({configs:configs});
  }
  render() {
    const { visible, loading, configs } = this.state;
    const CheckboxGroup = Checkbox.Group;
    const method_key = Object.keys(methodsDef);
    const options =  method_key.map((key : string, index : number)=>{
      return {label:methodsDef[key].fullname,value:key};
    });

    

    
    return (
      <div>
        <Button
            onClick={this.showModal}
        >
            <Icon type='setting' />Settings
        </Button>
        <Modal
          visible={visible}
          title="Settings"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" onClick={this.handleCancel}>Return</Button>,
            <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
              Submit
            </Button>,
          ]}
        >
          <h4>Methods</h4>
          <br />
          <div>
            <CheckboxGroup options={options} value={configs.methods} onChange={this.onMethodsChange} />
          </div>
          <br />
          <h4>Classifier Budget</h4>
          <br />
          <InputNumber min={1} value={configs.budget} onChange={this.onBudgetChange} />
          <br />
        </Modal>
      </div>
    );
  }
}

