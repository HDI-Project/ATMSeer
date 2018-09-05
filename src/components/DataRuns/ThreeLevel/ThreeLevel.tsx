import * as React from "react";
import Methods from './Methods';
import HyperPartitions from "./HyperPartitions";
import HyperParameters from "./HyperParameters";
import { IHyperpartitionInfo, IClassifierInfo, IConfigsInfo, getDatarunConfigs, IUpdateDatarunConfig, ICommonResponse, updateDatarunConfigs} from 'service/dataService';
import { IDatarun } from "types";
import * as methodsDef from "assets/methodsDef.json";
import {Button, InputNumber, message} from 'antd';

export interface IProps {
    height: number,
    datarun: IDatarun,
    datasetID: number | null,
    datarunID: number | null,
    setDatarunID: (id: number) => void,
    hyperpartitions : IHyperpartitionInfo[],
    classifiers: IClassifierInfo[],
    compareK: number
}

export interface IState {
    selectedMethod:string,
    configsBudget: number,
    configsMethod : string[],
    loading: boolean,
    methodSelected:any,
    hyperparametersRangeAlreadySelected:any,
    hyperpartitionsAlreadySelected:number[]
}

export default class ThreeLevel extends React.Component<IProps, IState>{
    index = 0
    constructor(props: IProps){
        super(props)
        this.onSelectMethod = this.onSelectMethod.bind(this)
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

    onSelectMethod(methodName:string){
        console.info('select method', methodName)
        this.setState({selectedMethod: methodName})
    }

    componentDidMount(){
        this.getCurrentConfigs()
    }

    onBudgetChange = (budget : any) =>{

        this.setState({configsBudget:budget});
    }
    getCurrentConfigs = () =>{
        if(this.props.datarunID!=null){
            let promise: Promise<IConfigsInfo>;
            let datarunID : number= this.props.datarunID?this.props.datarunID:0;
            promise = getDatarunConfigs(datarunID);
            promise.then(configs=>{
                this.setState({
                    configsMethod:configs.methods,
                    configsBudget:configs.budget
                })
            })
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
            console.log(checked);
            methodSelected[value].checked=false;
            methodSelected[value].indeterminate=false;
            methodSelected[value].disabled=false;
            let hpid = this.fetchHpId(value);
            configsHyperpartitions = configsHyperpartitions.filter((d:number)=>hpid.indexOf(d)<0);
          
            console.log(hpid);
            console.log(configsHyperpartitions);
            this.setState({
                hyperpartitionsAlreadySelected:configsHyperpartitions,
                methodSelected:methodSelected,
                
            });

        }else{
            console.log(checked);
            methodSelected[value].checked=true;
            methodSelected[value].indeterminate=false;
            methodSelected[value].disabled=false;
         let hpid = this.fetchHpId(value);
         configsHyperpartitions = Array.from(new Set(configsHyperpartitions.concat(hpid)));
            console.log(hpid);
            console.log(configsHyperpartitions);
            this.setState({
                hyperpartitionsAlreadySelected:configsHyperpartitions,
                methodSelected:methodSelected
                
            });


        }
    }
    onHyperpartitionCheckBoxChange=(id : number)=>{
        let checked : boolean =!( this.state.hyperpartitionsAlreadySelected.indexOf(id)>-1);
        let value = id;
        console.log(value);
        console.log(checked);
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
                if(judgeSet.length>0){
                    // Fetch method intersect hpid 
                    // method unselected
                    methodSelected[method].checked=false;
                    methodSelected[method].indeterminate=true;
                }else{
                    methodSelected[method].checked=false;
                    methodSelected[method].indeterminate=false;
                }
                this.setState({
                    hyperpartitionsAlreadySelected:configsHyperpartitions,
                    methodSelected:methodSelected

                });

            }
        }else{
            let configsHyperpartitions : number[] = this.state.hyperpartitionsAlreadySelected;
            configsHyperpartitions.push(value);
            let hp :any= this.props.hyperpartitions.filter((d:any)=>d.id==value);
            console.log(hp);
            let method = hp[0].method;
            let hpid = this.fetchHpId(method);
            let judgeSet = Array.from(new Set(configsHyperpartitions.concat(hpid)));
            let methodSelected = this.state.methodSelected;
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
                methodSelected:methodSelected
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
     componentWillReceiveProps(nextProps : IProps) {
        if(this.state.loading==false){
            let {hyperpartitions} = nextProps;
            let methodhistogram:any ={};
            let methodSelected:any={};
            let hyperpartitionsAlreadySelected:number[] = hyperpartitions.map((d:any)=>{
                return d.id;
            });
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
                if(d.status=="incomplete"||d.status=="gridding_done"){
                    methodhistogram[d.method].total++;
                    methodhistogram[d.method].enable++;
                }else{
                    methodhistogram[d.method].total++;
                }
                
            });
            Object.keys(methodhistogram).forEach((d:string)=>{
                if(methodhistogram[d].total==0){
                    methodSelected[d] = {checked:false,disabled:true,indeterminate:false};
                }else{
                    methodSelected[d] = {checked:true,disabled:false,indeterminate:false};
                }
            });
            
            this.setState({
                methodSelected:methodSelected,
                hyperpartitionsAlreadySelected:hyperpartitionsAlreadySelected
            });
            //this.getCurrentConfigs();
        }
    }
    render(){
        let {datarun, hyperpartitions, classifiers, datarunID, compareK} = this.props
        classifiers = classifiers.sort(
            (a,b)=>b.cv_metric-a.cv_metric
        ) // best performance in the front
        let {selectedMethod} = this.state
        let usedMethods: string[] = Object.keys(datarun);
        let unusedMethods = Object.keys(methodsDef)
            .filter(
                (name: string) => usedMethods.indexOf(name) < 0
            )
        let svgWidth = window.innerWidth*5/6,
        width1 = svgWidth*3/13,
        width2 = svgWidth*1/2,
        width3 = svgWidth*1/6,
        headerHeight = 10
        console.log("three level render");
        console.log(this.state.hyperpartitionsAlreadySelected);
        return <div
            style={{
                height: `${this.props.height}%`,
                width: '100%',
                borderTop: ".6px solid rgba(0,0,0, 0.4)"
                }}
            >
            <svg
            style={{ height: '100%', width: '100%' }}
            id="svgChart"
            xmlns="http://www.w3.org/2000/svg"
            >
            <g transform={`translate(${0}, ${headerHeight})`}>
            <text
                textAnchor="middle"
                x={width1/2}
                y={10}
                style={{ font: "bold 16px sans-serif" }}
            >Algorithms</text>
            <Methods
                classifiers={classifiers}
                width = {width1}
                onSelectMethod={this.onSelectMethod}
                selectedMethod = {this.state.selectedMethod}
                usedMethods = {usedMethods}
                unusedMethods = {unusedMethods}
                hyperpartitions={hyperpartitions}
                configsMethod = {this.state.configsMethod}
                methodSelected = {this.state.methodSelected}
                onMethodsCheckBoxChange = {this.onMethodsCheckBoxChange}
                compareK={compareK}
            />
            </g>
            <g transform={`translate(${width1}, ${headerHeight})`}>
            <text
                textAnchor="middle"
                x={width2/2}
                y={10}
                style={{ font: "bold 16px sans-serif" }}
            >HyperPartitions of {selectedMethod}</text>
                <HyperPartitions
                hyperpartitions={hyperpartitions}
                // datarun={datarun}
                datarunID={datarunID}
                selectedMethod={selectedMethod}
                classifiers={classifiers}
                compareK={compareK}
                hyperpartitionsSelected={this.state.hyperpartitionsAlreadySelected}

                onHpsCheckBoxChange={this.onHyperpartitionCheckBoxChange}
                />
            </g>
            <g transform={`translate(${width1+width2}, ${headerHeight})`}>
            <text
                textAnchor="end"
                x={width3}
                y={10}
                style={{ font: "bold 16px sans-serif" }}
            >HyperParameters of {selectedMethod}</text>
            <HyperParameters 
                classifiers={classifiers} 
                selectedMethod={selectedMethod} 
                compareK={compareK}
                alreadySelectedRange={this.state.hyperparametersRangeAlreadySelected[selectedMethod]?this.state.hyperparametersRangeAlreadySelected[selectedMethod]:{}}
                onSelectedChange={this.onBrushSelected}
                />
            </g>
            </svg>

            <div style={{position: "absolute",bottom:"10px",right:"10px"}}>
                <h4>Budget</h4>
                <InputNumber min={1} value={this.state.configsBudget} style={{ width: "130px" }} onChange={this.onBudgetChange} />
                <br /><Button key={"_button_"+(++this.index)} loading={this.state.loading} onClick={this.updateCurrentDataRun}>Update</Button>
                <br /></div>
            </div>
    }
}
