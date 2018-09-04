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
    hyperparametersRangeAlreadySelected:any,
    hyperpartitionsAlreadySelected:any
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
            hyperparametersRangeAlreadySelected:{},
            hyperpartitionsAlreadySelected:{}

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
    onMethodsCheckBoxChange=(e : any)=>{
        let checked = e.target.checked;
        let value = e.target.value;
        if(checked==false){
            let configsMethod : string[] = this.state.configsMethod;
            let index = configsMethod.indexOf(value);
            if(index>-1){
                configsMethod.splice(index, 1);
                this.setState({
                    configsMethod:configsMethod
                });

            }
        }else{
            let configsMethod : string[] = this.state.configsMethod;
            configsMethod.push(value);
            this.setState({
                configsMethod:configsMethod
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
                onMethodsCheckBoxChange = {this.onMethodsCheckBoxChange}
                compareK={compareK}
            />
            </g>
            <g transform={`translate(${width1}, ${headerHeight})`}>
            <text
                textAnchor="middle"
                x={width2/2}
                y={10}
            >HyperPartitions of {selectedMethod}</text>
                <HyperPartitions
                hyperpartitions={hyperpartitions}
                // datarun={datarun}
                datarunID={datarunID}
                selectedMethod={selectedMethod}
                classifiers={classifiers}
                compareK={compareK}
                />
            </g>
            <g transform={`translate(${width1+width2}, ${headerHeight})`}>
            <text
                textAnchor="end"
                x={width3}
                y={10}
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