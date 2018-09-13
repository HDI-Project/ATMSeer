import * as React from "react";
import Methods from './Methods';
import HyperPartitions from "./HyperPartitions";
import HyperParameters from "./HyperParameters";
import { IHyperpartitionInfo, IClassifierInfo, IConfigsInfo,
    getDatarunConfigs, IUpdateDatarunConfig, ICommonResponse,
     updateDatarunConfigs, IClickEvent,IRecommendationResult} from 'service/dataService';
import { IDatarun } from "types";
import * as methodsDef from "assets/methodsDef.json";
import {Button,  message, Icon} from 'antd';
import { getColor } from 'helper';
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
    postClickEvent:(e:IClickEvent)=>void
}

export interface IState {
    selectedMethod:string,
    configsBudget: number,
    configsMethod : string[],
    loading: boolean,
    methodSelected:any,
    hyperparametersRangeAlreadySelected:any,
    hyperpartitionsAlreadySelected:number[],
    mouseOverClassifier:number,
    displaymode:number
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
            hyperpartitionsAlreadySelected:[],
            mouseOverClassifier:-1,
            displaymode:0

        }
    }

    onSelectMethod(methodName:string){
        console.info('select method', methodName);
        let eventlog:IClickEvent = {
            type:"method",
            description:{
                action:"selected",
                name:methodName
            },
            time:new Date().toString()
        }
        this.props.postClickEvent(eventlog);
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
        //let budget = this.state.configsBudget;
        if(this.props.datarunID!=null){
            let promise: Promise<IConfigsInfo>;
            let datarunID : number= this.props.datarunID?this.props.datarunID:0;
            promise = getDatarunConfigs(datarunID);
            promise
                .then(configs => {
                    configs.methods = methods;
                    //configs.budget = budget;
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
        if(methodSelected[value]){
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
            let action="selected";
            if(checked==false){
                action="unselected";
            }
            let eventlog:IClickEvent = {
                type:"methodcheckbox",
                description:{
                    action:action,
                    methodname:value
                },
                time:new Date().toString()
            }
            this.props.postClickEvent(eventlog);
            this.updateCurrentDataRun();
        }
    }
    onHyperpartitionCheckBoxChange=(id : number)=>{
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
        let action="selected";
        if(checked==false){
            action="unselected";
        }
        let eventlog:IClickEvent = {
            type:"hyperpartitioncheckbox",
            description:{
                action:action,
                hpid:value
            },
            time:new Date().toString()
        }
        this.props.postClickEvent(eventlog);
        this.updateCurrentDataRun();
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
           });
           let action="updated";
           
            let eventlog:IClickEvent = {
                type:"hyperparametersRange",
                description:{
                    action:action,
                    range:range,
                    type:hpatype,
                    hyname:hpaName,
                    methodname:methodname
                },
                time:new Date().toString()
            }
            this.props.postClickEvent(eventlog);
            this.updateCurrentDataRun();
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
    onMouseOverClassifier = (classifierid:number)=>{
        if(this.state.mouseOverClassifier!=classifierid){
            if(classifierid!=-1){
                let action="mouseover";
            
                let eventlog:IClickEvent = {
                    type:"classifier",
                    description:{
                        action:action,
                        classifierid:classifierid
                    },
                    time:new Date().toString()
                }
                this.props.postClickEvent(eventlog);
            }
            this.setState({
                mouseOverClassifier:classifierid
            })
        }
    }
    onMethodButtonClick = () =>{
        console.log("onMethodButtonClick");
        let {displaymode} = this.state;
        if(displaymode==0){
            let eventlog:IClickEvent = {
                type:"hyperpartitionsView",
                description:{
                    action:"more",
                },
                time:new Date().toString()
            }
            this.props.postClickEvent(eventlog);
            this.setState({
                displaymode:1
            });
        }else{
            let eventlog:IClickEvent = {
                type:"hyperpartitionsView",
                description:{
                    action:"hide",
                },
                time:new Date().toString()
            }
            this.props.postClickEvent(eventlog);
            this.setState({
                displaymode:0
            });
        }
    }
    onHyperpartitionButtonClick = () =>{
        console.log("onHyperpartitionButtonClick");
        let {displaymode} = this.state;
        if(displaymode==1){
            let eventlog:IClickEvent = {
                type:"hyperparametersView",
                description:{
                    action:"more",
                },
                time:new Date().toString()
            }
            this.props.postClickEvent(eventlog);
            this.setState({
                displaymode:2
            });
        }else{
            let eventlog:IClickEvent = {
                type:"hyperparametersView",
                description:{
                    action:"hide",
                },
                time:new Date().toString()
            }
            this.props.postClickEvent(eventlog);
            this.setState({
                displaymode:1
            });
        }
    }
    render(){
        let {datarun, hyperpartitions, classifiers, datarunID, compareK} = this.props
        classifiers = classifiers.sort(
            (a,b)=>b.cv_metric-a.cv_metric
        ) // best performance in the front
        let {selectedMethod,displaymode} = this.state
        let usedMethods: string[] = Object.keys(datarun);
        let unusedMethods = Object.keys(methodsDef)
            .filter(
                (name: string) => usedMethods.indexOf(name) < 0
            )
        let svgWidth = window.innerWidth*5/6,
        width1 = svgWidth*3/13,
        gapbetween = 70,
        width2 = svgWidth*0.8/2,
       // width3 = svgWidth*1/7,
       width3 = 220,
        headerHeight = 10
        let svgHeight = window.innerHeight * 0.74;
        // let generateTag = (box:any,name:string)=>{
        //     if(name!=""){
        //         let width = box.width;
        //         let height = box.height;
        //         let x = box.x;
        //         let y = box.y;
        //         return  <foreignObject x={x} y={y} width={width} height={height}><Tag color={getColor(name)}>{name}</Tag></foreignObject>
        //     }else{
        //         return <g />
        //     }
        // }
        let generateTag = (box:any,name:string)=>{
                if(name!=""){
                    let {width, height, x, y}  = box;
                    return  <g className="tag" transform={`translate(${x},${y})`}>
                        <rect width={width} height={height} style={{fill:getColor(name)}} rx={5} ry={5}/>
                        <text y={height-5} x={width/2} textAnchor="middle" style={{fill: "white"}}>{name}</text>
                    </g>
                }else{
                    return <g className="tag"/>
                }
            }
       let generateButton = (box:any,mode:number,eventCallback:()=>void) =>{
            // mode == 0   show me more
            // mode == 1   hide
            // mode any other value  nothing
            if(mode==0){
                 return <foreignObject x={box.x} y={box.y} width={box.width} height={box.height}> 
                <Button type="default" onClick={eventCallback} size="small">
                    More<Icon type="double-right" />
                </Button>
                </foreignObject>
            }else if(mode==1){
                return  <foreignObject x={box.x} y={box.y} width={box.width} height={box.height}> 
                <Button type="default" onClick={eventCallback} size="small">
                   <Icon type="double-left" /> Hide
                </Button>
                </foreignObject>
            }else{
               return  <g />
            }
        }
        let generateHyperpartition = () => {
            let buttonMode = 0;
            if(displaymode==2){
                buttonMode = 1;
            }
            buttonMode;
            return  (<g><defs>
            <clipPath id="mask_hyperpartitions">
            <rect x={0} y={-10} width={width2-60} height={svgHeight+100} />
            </clipPath>
            </defs>
            <g transform={`translate(${width1+gapbetween}, ${headerHeight})`} clipPath={"url(#mask_hyperpartitions)"} width={width2} height={svgHeight}>
            <text
                textAnchor="middle"
                x={width2/3}
                y={10}
                style={{ font: "bold 16px sans-serif" , display:"inline" }}
            >HyperPartitions of </text>
            {generateTag({
                x:width2/3 + 80,
                y:-6,
                width:40,
                height:20

            },selectedMethod)}
                <HyperPartitions
                hyperpartitions={hyperpartitions}
                // datarun={datarun}
                datarunID={datarunID}
                selectedMethod={selectedMethod}
                classifiers={classifiers}
                compareK={compareK}
                hyperpartitionsSelected={this.state.hyperpartitionsAlreadySelected}
                width={width2}
                height={svgHeight}
                onHpsCheckBoxChange={this.onHyperpartitionCheckBoxChange}
                onMouseOverClassifier={this.onMouseOverClassifier}
                mouseOverClassifier={this.state.mouseOverClassifier}
                />
                
            
            </g>
            {generateButton({
                    x:width1+width2+gapbetween-60,
                    y:svgHeight/2+headerHeight,
                    width:150,
                    height:35
                },buttonMode,this.onHyperpartitionButtonClick)}</g>)
        }
        let generateHyperparameter = () => {
            
            return <g><defs>
            <clipPath id="mask_hyperparameters">
            <rect x={-60} y={-10} width={width3+200} height={svgHeight+100}/>
            </clipPath>
            </defs>
            <g transform={`translate(${width1+width2+2*gapbetween+60}, ${headerHeight})`} clipPath={"url(#mask_hyperparameters)"}>
            <text
                textAnchor="middle"
                x={width3/3}
                y={10}
                style={{ font: "bold 16px sans-serif" }}
            >HyperParameters of</text>
             {generateTag({
                x:width3/3 + 89,
                y:-6,
                width:40,
                height:20

            },selectedMethod)}
            <HyperParameters
                classifiers={classifiers}
                selectedMethod={selectedMethod}
                compareK={compareK}
                alreadySelectedRange={this.state.hyperparametersRangeAlreadySelected[selectedMethod]?this.state.hyperparametersRangeAlreadySelected[selectedMethod]:{}}
                onSelectedChange={this.onBrushSelected}
                mouseOverClassifier={this.state.mouseOverClassifier}
                height={svgHeight}
                />
               
            </g></g>
        }
         let methodbuttonMode = 0;
            if(displaymode!=0){
                methodbuttonMode = 1;
            }
        // console.log("three level render");
        // console.log(this.state.hyperpartitionsAlreadySelected);
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
                recommendationResult={this.props.recommendationResult}
            />
            { /*<foreignObject x={width1-30} y={svgHeight/2} width={150} height={35}> 
                <Button type="primary" onClick={this.onMethodButtonClick}>
                    Show me more<Icon type="right" />
                </Button>
                </foreignObject>*/}
             {generateButton({
                    x:width1,
                    y:svgHeight/2,
                    width:150,
                    height:35
                },methodbuttonMode,this.onMethodButtonClick)}
            </g>
            {displaymode==1 || displaymode==2?generateHyperpartition():<g />}
            {displaymode==2 ? generateHyperparameter():<g />}
           
            
            </svg>


           {/* <div style={{position: "absolute",bottom:"10px",left:"10px"}}>
                <span>Budget</span>
                <InputNumber min={1} value={this.state.configsBudget} style={{ width: "80px" }} onChange={this.onBudgetChange} />
                <Button key={"_button_"+(++this.index)} loading={this.state.loading} onClick={this.updateCurrentDataRun}>Update Config</Button>
                </div>*/}
            </div>
    }
}
