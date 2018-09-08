import {Checkbox,InputNumber,Button,message } from 'antd';
import * as React from 'react';
import * as methodsDef from "../../assets/methodsDef.json";
import {  IDatarun } from "types";
import {  } from 'helper';
import "./InputForm.css"
//import ReactEcharts from "echarts-for-react";
import { IHyperpartitionInfo, IClassifierInfo,  IConfigsInfo,IUpdateDatarunConfig,   getDatarunConfigs,updateDatarunConfigs,ICommonResponse,

 IClickEvent,IRecommendationResult} from 'service/dataService';
export interface IState {
    selectedMethod:string,
    configsBudget: number,
    configsMethod : string[],
    loading: boolean,
    methodSelected:any,
    hyperparametersRangeAlreadySelected:any,
    hyperpartitionsAlreadySelected:number[]
}
export interface IProps {
    height: number,
    datarun: IDatarun,
    datasetID: number | null,
    datarunID: number | null,
    setDatarunID: (id: number) => void,
    hyperpartitions : IHyperpartitionInfo[],
    classifiers: IClassifierInfo[],
    compareK: number,
    recommendationResult:IRecommendationResult,
    postClickEvent:(e:IClickEvent)=>void;
}
export default class Methods extends React.Component<IProps, IState>{
    index = 0
    constructor(props: IProps){
        super(props)
        this.state={
            selectedMethod: '',
            configsBudget: 100,
            configsMethod: [],
            loading: false,
            methodSelected:{},
            hyperparametersRangeAlreadySelected:{},
            hyperpartitionsAlreadySelected:[]

        }
    }

    componentWillReceiveProps(nextProps : IProps) {
        if(this.state.loading==false){
            let {hyperpartitions} = nextProps;
            let methodhistogram:any ={};
            let methodSelected:any={};
            let mode = 1;
            let hyperpartitionsAlreadySelected:number[] = [];
            if(mode==0){
                hyperpartitionsAlreadySelected = hyperpartitions.map((d:any)=>{
                    return d.id;
                });
            }else if(mode==1){
                hyperpartitionsAlreadySelected = hyperpartitions.filter((d:any)=>d.status!="errored").map((d:any)=>{
                    return d.id;
                });
            }
            
            Object.keys(methodsDef).forEach((d:string)=>{
                if(!methodhistogram[d]){
                    methodhistogram[d]={total:0,enable:0};
                }
            });
            hyperpartitions.forEach((d:any)=>{
                if(!methodhistogram[d.method]){
                    methodhistogram[d.method]={total:0,enable:0};
                    console.log("unknown method : "+d.method);
                }
                if(!(d.status=="errored")){
                    methodhistogram[d.method].total++;
                    methodhistogram[d.method].enable++;
                }else{
                    methodhistogram[d.method].total++;
                }
                
            });
            Object.keys(methodhistogram).forEach((d:string)=>{
                // 0 -> simple selection:
                // 1 -> complex selection:
                if(mode==0){
                    if(methodhistogram[d].total==0){
                        methodSelected[d] = {checked:false,disabled:true,indeterminate:false};
                    }else{
                        methodSelected[d] = {checked:true,disabled:false,indeterminate:false};
                    }
                }else if(mode==1){
                    if(methodhistogram[d].total==0){
                        methodSelected[d] = {checked:false,disabled:true,indeterminate:false};
                    }else if(methodhistogram[d].enable==0){
                        methodSelected[d] = {checked:false,disabled:false,indeterminate:false};
                    }else if(methodhistogram[d].total == methodhistogram[d].enable){
                        methodSelected[d] = {checked:true,disabled:false,indeterminate:false};
                    }else{
                        methodSelected[d] = {checked:false,disabled:false,indeterminate:true};
                    }
                }
            });
            let selectedMethod = this.state.selectedMethod;
            //if(this.props.datarunID!=nextProps.datarunID){
            //    selectedMethod = "";
            //}
            this.setState({
                methodSelected:methodSelected,
                hyperpartitionsAlreadySelected:hyperpartitionsAlreadySelected,
                selectedMethod:selectedMethod
            });
            //this.getCurrentConfigs();
        }
    }
    onBudgetChange = (budget : any) =>{

        this.setState({configsBudget:budget});
    }
    fetchHpId = (method:string)=>{
        let hp = this.props.hyperpartitions;
        return hp.filter((d:any)=>d.method==method).map((d:any)=>d.id);
    }
    onMethodsCheckBoxChange=(e : any)=>{
        let checked = e.target.checked;
        let value = e.target.value;
        let methodSelected = this.state.methodSelected;
        let configsHyperpartitions :number[] = this.state.hyperpartitionsAlreadySelected;
        console.log("onMethodsCheckBoxChange")
        if(checked==false){
            //un selected
            let configsMethod : string[] = this.state.configsMethod;
            let index = configsMethod.indexOf(value);
            if(index>-1){
                configsMethod.splice(index, 1);
            }


            methodSelected[value].checked=false;
            methodSelected[value].indeterminate=false;
            methodSelected[value].disabled=false;
            let hpid = this.fetchHpId(value);
            configsHyperpartitions = configsHyperpartitions.filter((d:number)=>hpid.indexOf(d)<0);
            
            this.setState({
                hyperpartitionsAlreadySelected:configsHyperpartitions,
                methodSelected:methodSelected,
                configsMethod:configsMethod
                
            });

        }else{
            let configsMethod : string[] = this.state.configsMethod;
            configsMethod.push(value);
            methodSelected[value].checked=true;
            methodSelected[value].indeterminate=false;
            methodSelected[value].disabled=false;
            let hpid = this.fetchHpId(value);
            configsHyperpartitions = Array.from(new Set(configsHyperpartitions.concat(hpid)));
            this.setState({
                hyperpartitionsAlreadySelected:configsHyperpartitions,
                methodSelected:methodSelected,
                configsMethod:configsMethod
                
            });


        }
    }
    onHyperpartitionCheckBoxChange=(e:any)=>{
        let id : number = e.target.value;
        let checked : boolean =!( this.state.hyperpartitionsAlreadySelected.indexOf(id)>-1);
        let value = id;
        if(checked==false){
            // un selected
            let configsHyperpartitions : number[] = this.state.hyperpartitionsAlreadySelected;
            let index = configsHyperpartitions.indexOf(value);
            if(index>-1){
                configsHyperpartitions.splice(index, 1);
                let hp :any= this.props.hyperpartitions.filter((d:any)=>d.id==value);
                let method = hp[0].method;
                let hpid = this.fetchHpId(method);
                let judgeSet = hpid.filter((d:any)=>configsHyperpartitions.indexOf(d)>-1);
                let methodSelected = this.state.methodSelected;
                let configsMethod : string[] = this.state.configsMethod;

                if(judgeSet.length>0){
                    // Fetch method intersect hpid 
                    // method unselected
                    methodSelected[method].checked=false;
                    methodSelected[method].indeterminate=true;
                }else{
                    methodSelected[method].checked=false;
                    methodSelected[method].indeterminate=false;
                    let index = configsMethod.indexOf(method);
                    if(index>-1){
                        configsMethod.splice(index, 1);
                    }
                }
                this.setState({
                    hyperpartitionsAlreadySelected:configsHyperpartitions,
                    methodSelected:methodSelected,
                    configsMethod:configsMethod

                });

            }
        }else{
            let configsHyperpartitions : number[] = this.state.hyperpartitionsAlreadySelected;
            configsHyperpartitions.push(value);
            let hp :any= this.props.hyperpartitions.filter((d:any)=>d.id==value);
            let method = hp[0].method;
            let hpid = this.fetchHpId(method);
            let judgeSet = Array.from(new Set(configsHyperpartitions.concat(hpid)));
            let methodSelected = this.state.methodSelected;
            let configsMethod : string[] = this.state.configsMethod;
            configsMethod = Array.from(new Set(configsMethod.concat([method])));

            if(judgeSet.length==configsHyperpartitions.length){
                //selected
                methodSelected[method].checked=true;
                methodSelected[method].indeterminate=false;              
            }else{
                methodSelected[method].checked=false;
                methodSelected[method].indeterminate=true;
            }

            this.setState({
                hyperpartitionsAlreadySelected:configsHyperpartitions,
                methodSelected:methodSelected,
                configsMethod:configsMethod
            });


        }
    }
    updateCurrentDataRun = () => {
        // get configs from server ;
        // submit configs in this view
        // switch to the new datarun.
        let methods = this.state.configsMethod;
        let budget = this.state.configsBudget;
        if(this.props.datarunID!=null){
            let promise: Promise<IConfigsInfo>;
            let datarunID : number= this.props.datarunID?this.props.datarunID:0;
            promise = getDatarunConfigs(datarunID);
            promise
                .then(configs => {
                    configs.methods = methods;
                    configs.budget = budget;
                    this.setState({ loading: true });

                    let submitconfigs : IUpdateDatarunConfig = {};
                    submitconfigs.configs = configs;
                    submitconfigs.method_configs = this.state.hyperparametersRangeAlreadySelected;
                    if(this.state.hyperpartitionsAlreadySelected.length>0){
                        submitconfigs.hyperpartitions = this.state.hyperpartitionsAlreadySelected;
                    }
                    let promise:Promise<ICommonResponse> = updateDatarunConfigs(datarunID,submitconfigs);
                    //const promise = this.props.onSubmit(this.state.configs);
                    console.log("update data run in methods view");
                    console.log(configs);
                    promise.then(status => {
                        if(status.success == true){
                            message.success("Update Configs Successfully.");
                        }else{
                            message.error("Update Configs Failed.");
                        }
                        this.setState({ loading: false });
                    }).catch(error=>{
                        console.log(error);
                        message.error("Update Configs Failed.");
                        this.setState({ loading: false});

                    });
                })
                .catch(error => {
                    console.log(error);
                });
                }
       }

       onBrushSelected = (methodname:string, hpaName: string,hpatype:string,range:number[])=>{
        let {hyperparametersRangeAlreadySelected} = this.state;
        let update : boolean = false;
        if(hpatype=="int"){
            range[0]=Math.floor(range[0]);
            range[1]=Math.ceil(range[1]);
        }
        if(!hyperparametersRangeAlreadySelected[methodname]){
           hyperparametersRangeAlreadySelected[methodname]={};
        }
        if(hyperparametersRangeAlreadySelected[methodname][hpaName]&&hyperparametersRangeAlreadySelected[methodname][hpaName]["range"]){
           if(hyperparametersRangeAlreadySelected[methodname][hpaName]["range"][0]==range[0]&&hyperparametersRangeAlreadySelected[methodname][hpaName]["range"][1]==range[1]){
               // nothing
           }else{
               update = true;
           }
        }else{
            if(range.length>0){
                update = true;

           }
        }
        if(update){
           hyperparametersRangeAlreadySelected[methodname][hpaName]={"type":hpatype,"range":range};
           console.log(hyperparametersRangeAlreadySelected);
           this.setState({
               hyperparametersRangeAlreadySelected : hyperparametersRangeAlreadySelected
           })
        }

     }
    public render() {
        let {  height } = this.props
        const method_options =  Object.keys(methodsDef).map(
            (key : string)=>{
                return {label: methodsDef[key].fullname, value: key, ...this.state.methodSelected[key]}
            }
        );
        const hyperpartitions_options = this.props.hyperpartitions.map((d:any)=>{
            let selected="";
            if(this.state.hyperpartitionsAlreadySelected.indexOf(d.id)>-1){
                selected="checked";
            }
            return {label:d.hyperpartition_string,value:d.id,checked:selected}
        })
        let settingheight = 80;
        return <div className="methods" style={{height: height+'%', borderTop: ".6px solid rgba(0,0,0, 0.4)"}}>
        <div key={'0_used'} className={"usedMethodContainer"}
                         style={{ height: `20%`, width: '100%' }}>
                        <div>
                        <h2> Setting Panel : You can update current datarun config in this panel.</h2>
                        <br />
                        <h4 style={{display: "inline"}}>Budget :</h4>
                        <InputNumber min={1} value={this.state.configsBudget} onChange={this.onBudgetChange} />
                        
                        <Button loading={this.state.loading} onClick={this.updateCurrentDataRun}>Update</Button>
                                    
                    </div>
                    </div>
                   
                    <div key={'1_used'} className="usedMethodContainer"
                         style={{ height: `${settingheight}%`, width: '33%' }}>
                        <div className="method">
                        <h4 style={{textAlign: "center"}}> Methods </h4>
               
                        <div>
                            {method_options.map((d:any)=>{
                                return <div key={"div_checkbox_"+d.value}> <Checkbox
                                key={"_checkbox_"+d.value}
                                checked={d.checked}
                                disabled={d.disabled}
                                indeterminate={d.indeterminate}
                                value={d.value}
                                onChange={this.onMethodsCheckBoxChange}
                                >
                                {d.label}
                                </Checkbox><br /></div>
                            })
                        
                            }
                            {/*<CheckboxGroup options={method_options}  />*/}
                        </div>
                    </div>
                    </div>
                    <div key={'2_used'} className="usedMethodContainer"
                         style={{ height: `${settingheight}%`, width: '33%' }}>
                        <div className="method">
                        <h4 style={{textAlign: "center"}}> Hyperpartitions </h4>
                
                            <div>
                            {hyperpartitions_options.map((d:any)=>{
                                    return  (<div key={"div_checkbox_"+d.value}><Checkbox
                                    key={"_checkbox_"+d.value}
                                    checked={d.checked}
                                    disabled={d.disabled}
                                    indeterminate={d.indeterminate}
                                    value={d.value}
                                    onChange={this.onHyperpartitionCheckBoxChange}
                                >
                                    {d.label}
                                </Checkbox><br /></div>)
                                })
                        
                                }
                            </div>
                            <br />
                    </div>
                    </div>
                    <div key={'3_used'} className="usedMethodContainer"
                         style={{ height: `${settingheight}%`, width: '33%' }}>
                        <div className="method">
                        <h4 style={{textAlign: "center"}}> Hyperparameters </h4>
               
                            <div style={{display: "inline"}}>
                            Budget :
                            <InputNumber min={1} value={this.state.configsBudget} onChange={this.onBudgetChange} />
                            ~
                            <InputNumber min={1} value={this.state.configsBudget} onChange={this.onBudgetChange} />
                            </div>
                    </div>
                    </div>
                </div>


    }
}
