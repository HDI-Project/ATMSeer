import * as React from 'react';
import { Modal, Button, Icon, Checkbox,InputNumber,message,Select,Collapse   } from 'antd';
import * as methodsDef from "../../assets/methodsDef.json";
import { IConfigsInfo, IConfigsUploadResponse } from 'service/dataService';
import { getConfigs,postConfigs } from 'service/dataService';

export interface SettingsModalProps {

}

export interface SettingsModalState {
    loading: boolean
    visible: boolean,
    indeterminate: boolean,
    checkAll: boolean,
    configs: IConfigsInfo
}

const method_options =  Object.keys(methodsDef).map(
            (key : string)=>{
                return {label: methodsDef[key].fullname, value: key}
            }
        );

export default class SettingsModal extends React.Component<SettingsModalProps, SettingsModalState> {
  constructor(props: SettingsModalProps) {
    super(props);
    this.onCheckAllChange = this.onCheckAllChange.bind(this)
     this.state = {
        loading: false,
        visible: false,
        indeterminate: true,
        checkAll: false,
        configs : {
            methods : [''],
            budget : 100,
            r_minimum : 2,
            k_window :0,
            priority : 1,
            gridding :0,
            metric : "f1",
            selector :"bestk",
            budget_type : "classifier",
            tuner : "gp"

        },

    }
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
        this.setState({
          visible: true,
          checkAll: configs.methods.length===method_options.length,
          configs : {
            methods:configs.methods,
            budget:configs.budget,
            r_minimum: configs.r_minimum,
            k_window : configs.k_window,
            gridding : configs.gridding,
            metric :configs.metric,
            selector : configs.selector,
            budget_type: configs.budget_type,
            tuner: configs.tuner,
            priority : configs.priority
          },
        });
      })
      .catch(error => {
          console.log(error);
      });
  }


  handleOk = () => {
    // Submit
    this.setState({ loading: true });
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

  onBudgetChange = (budget : any) =>{
    let configs = this.state.configs;
    configs.budget = budget;
    this.setState({configs:configs});
  }
  onR_MinChange = (r_min : any) =>{
    let configs = this.state.configs;
    configs.r_minimum = r_min;
    this.setState({configs:configs});
  }
  onK_WinChange = (k_win : any) =>{
    let configs = this.state.configs;
    configs.k_window = k_win;
    this.setState({configs:configs});
  }
  onGriddingChange = (grid : any) =>{
    let configs = this.state.configs;
    configs.gridding = grid;
    this.setState({configs:configs});
  }
  onPriorityChange = (pri : any) =>{
    let configs = this.state.configs;
    configs.priority = pri;
    this.setState({configs:configs});
  }
  onBudgetTypeChange = (budget_type : any) =>{
    let configs = this.state.configs;
    configs.budget_type = budget_type;
    this.setState({configs:configs});
  }
  onMetricChange = (metric : any) =>{
    let configs = this.state.configs;
    configs.metric = metric;
    this.setState({configs:configs});
  }
  onTunerChange = (tuner : any) =>{
    let configs = this.state.configs;
    configs.tuner = tuner;
    this.setState({configs:configs});
  }
  onSelectorChange = (selector : any) =>{
    let configs = this.state.configs;
    configs.selector = selector;
    this.setState({configs:configs});
  }

  onMethodsChange = (methods : string[]) => {
    //console.log("checked",methods);
    if(methods.length<1){
      message.error("You must select at least one method");
    }else{
      let {configs} = this.state;
      configs.methods = methods;
      this.setState({
            configs:configs,
            indeterminate: !!methods.length && (configs.methods.length < Object.keys(methodsDef).length),
            checkAll: configs.methods.length === Object.keys(methodsDef).length,
        });
    }
  }

  onCheckAllChange(e:any){
    let {configs} = this.state
    configs.methods = e.target.checked ? Object.keys(methodsDef) : []
    this.setState({
        configs,
        indeterminate: false,
        checkAll: e.target.checked,
      });
  }
  render() {
    const { visible, loading, configs } = this.state;
    const CheckboxGroup = Checkbox.Group;
    const Panel = Collapse.Panel;


    const Option = Select.Option;
    const BUDGET_TYPES = ['none', 'classifier', 'walltime'];
    const TUNERS = ['uniform', 'gp', 'gp_ei', 'gp_eivel'];
    const SELECTORS = ['uniform', 'ucb1', 'bestk', 'bestkvel', 'purebestkvel', 'recentk',
                 'recentkvel', 'hieralg'];
    const METRICS = ['f1', 'roc_auc'];


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
            <h4 style={{display: "inline"}}> Methods </h4>
                <Checkbox
                    indeterminate={this.state.indeterminate}
                    onChange={this.onCheckAllChange}
                    checked={this.state.checkAll}
                >
                    Check all
                </Checkbox>
          <div>


            <CheckboxGroup options={method_options} value={configs.methods} onChange={this.onMethodsChange} />
          </div>
          <br /><br />

          <h4>Budget Type</h4>
          <Select value={configs.budget_type} style={{ width: '100%' }} onChange={this.onBudgetTypeChange} >
            {BUDGET_TYPES.map((value:string,index:number)=>{
              return <Option key={index} value={value}>{value}</Option>;
            })}
          </Select>
          <br /> <br />

          <h4>Budget</h4>
          <InputNumber min={1} value={configs.budget} style={{ width: '100%' }} onChange={this.onBudgetChange} />
          <br /> <br />

          <Collapse defaultActiveKey={[]}>
          <Panel header="Advanced Settings" key="1">
          <h4>Priority</h4>
          <InputNumber min={1} value={configs.priority} style={{ width: '100%' }} onChange={this.onPriorityChange} />
          <br /> <br />
          <h4>Metric</h4>
          <Select value={configs.metric} style={{ width: '100%' }} onChange={this.onMetricChange}>
          {METRICS.map((value:string,index:number)=>{
              return <Option key={index} value={value}>{value}</Option>;
            })}
          </Select>
          <br /><br />
          <h4>Tuner</h4>
          <Select value={configs.tuner}  style={{ width: '100%' }} onChange={this.onTunerChange}>
          {TUNERS.map((value:string,index:number)=>{
              return <Option key={index} value={value}>{value}</Option>;
            })}
          </Select>
          <br /><br />
          <h4>Selector</h4>
          <Select value={configs.selector} style={{ width: '100%' }} onChange={this.onSelectorChange} >
          {SELECTORS.map((value:string,index:number)=>{
              return <Option key={index} value={value}>{value}</Option>;
            })}
          </Select>
          <br /><br />
          <h4>r-minimum</h4>
          <InputNumber min={0} value={configs.r_minimum} onChange={this.onR_MinChange} style={{ width: '100%' }} />
          <br /><br />
          <h4>k-window</h4>
          <InputNumber min={0} value={configs.k_window} onChange={this.onK_WinChange} style={{ width: '100%' }} />
          <br /><br />
          <h4>gridding</h4>

          <InputNumber min={0} value={configs.gridding} onChange={this.onGriddingChange} style={{ width: '100%' }} />
          <br />    <br />
          </Panel>

        </Collapse>
        </Modal>
      </div>
    );
  }
}

