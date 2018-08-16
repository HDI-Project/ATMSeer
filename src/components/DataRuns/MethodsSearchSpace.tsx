import { Button } from 'antd';
import * as React from 'react';
import * as methodsDef from "../../assets/methodsDef.json";
import { IMethod, IDatarun, IClassifier } from "types";
import { getColor ,RED,YELLOW, getGradientColor} from 'helper';
//import { getColor } from 'helper';
import "./MethodsSearchSpace.css"
import ReactEcharts from "echarts-for-react";
export interface IState {
}
export interface IProps {
    height: number,
    datarun: IDatarun
}
export default class MethodsSearchSpace extends React.Component<IProps, IState>{
    state={
        mode : 0,
        selectedHyperpartitionName : ""
    };
    onOverViewClick = (HyperpatitionName:string)=>{
        //alert("onclick "+HyperpatitionName);
        this.setState({
            mode : 1,
            selectedHyperpartitionName : HyperpatitionName
        });
    };
    onBackBtn = ()=>{
        //alert("onclick "+HyperpatitionName);
        this.setState({
            mode : 0,
            selectedHyperpartitionName : ""
        });
    };
    public render() {
        // const methodLen = Object.keys(methodsDef).length
        let { datarun, height } = this.props;
        let { mode,selectedHyperpartitionName } = this.state;
        let usedMethods: string[] = Object.keys(datarun);
        let sumTrail : number = 0;
        usedMethods.forEach((name:string)=>{
            sumTrail+=datarun[name].length;
        });
        // const usedMethods = ['SVM', 'RF', 'DT', 'MLP',,'GP', 'LR', 'KNN'] // the used methodsDef should be obtained by requesting server the config file
        const unusedMethods = Object.keys(methodsDef).filter((name: string) => usedMethods.indexOf(name) < 0)
        let hyperpartitionData : IDatarun= {};
        let hyperpartition2Method : {[hyperpartition:string]:string}= {};
        usedMethods.forEach((name: string, i: number) => {
            const methodDef = methodsDef[name];
            const classifiers = datarun[name];
            let parameterList: any[] = [];
            let idx = 0;
            methodDef.root_hyperparameters.forEach((p: string) => {
                let parameter = methodDef['hyperparameters'][p]
                if (parameter['values']) { //category axis
                    parameterList.push({ dim: idx, name: p, type: 'category', data: parameter['values'] })
                }
            })
            classifiers.forEach(((classifier: IClassifier, idx: number) => {
                let par_dict = {}
                let parameters = classifier['parameters'].split('; ')
                parameters = parameters.map((p: string) => {
                    let [k, v] = p.split(' = ')
                    return par_dict[k] = v
                })
                // for the hidden layer sizes in MLP
    
                if (par_dict['len(hidden_layer_sizes)']) {
                    for (let i = parseInt(par_dict['len(hidden_layer_sizes)']); i < 3; i++) {
                        par_dict[`hidden_layer_sizes[${i}]`] = 0
                    }
                }
    
                // add perforamce
                par_dict['performance'] = parseFloat(classifier['performance'].split(' +- '))
                let ScatterPlotCategory : any[] = [methodDef.fullname];
                parameterList.forEach(p => {
                    let value = par_dict[p.name]
                    if (p.type == 'category') {
                        ScatterPlotCategory.push(p.name+":"+value);
                    }
                });
                let HyperpartitionName = ScatterPlotCategory.join("\n");
    
                if(!hyperpartitionData[HyperpartitionName]){
                    hyperpartitionData[HyperpartitionName] = [];
                }
                hyperpartitionData[HyperpartitionName].push(classifier);
                hyperpartition2Method[HyperpartitionName] = name;
            }
            )); 
        });

        let usedHyperpartitions: string[] = Object.keys(hyperpartitionData)


        /**
         * <div key={name + '_used'} className="usedMethodContainer"
                    style={{ height: `100%`, width: '100%' }}>
                    
                    <div className="method">
                        <HyperpatitionSearchSpace hyperpartitionName={name} methodDef={methodDef} classifiers={hyperpartitionData[name]} sumTrail={sumTrail} />
                        <HyperpatitionBarChart hyperpartitionName={name} methodDef={methodDef} classifiers={hyperpartitionData[name]} sumTrail={sumTrail} />
                    </div>
                </div>
         */
        if(mode==0){
            return <div className="methods" style={{height: height+'%', borderTop: ".6px solid rgba(0,0,0, 0.4)"}}>
                {usedHyperpartitions.map((name: string, i: number) => {
                    const methodDef = methodsDef[hyperpartition2Method[name]];
                    return <div key={name + '_used'} className="usedMethodContainer"
                        style={{ height: `33%`, width: '33%' }}>
                        
                        <div className="method">
                            <HyperpatitionOverViewBarChart hyperpartitionName={name} methodDef={methodDef} classifiers={hyperpartitionData[name]} sumTrail={sumTrail} onClick={this.onOverViewClick}/>
                        </div>
                    </div>
                })}
                
                {unusedMethods.map((name: string) => (<div key={name + '_unused'} className='unusedMethod'>{methodsDef[name]['fullname']}</div>))
                }
            </div>
        }else if(mode==1){
            const methodDef = methodsDef[hyperpartition2Method[selectedHyperpartitionName]];
            return <div className="methods" style={{height: height+'%', borderTop: ".6px solid rgba(0,0,0, 0.4)"}}>                    
                    <div key={name + '_used'} className="usedMethodContainer"
                    style={{ height: `100%`, width: '100%' }}>
                    
                    <div className="method">
                        <HyperpatitionSearchSpace hyperpartitionName={selectedHyperpartitionName} methodDef={methodDef} classifiers={hyperpartitionData[selectedHyperpartitionName]} sumTrail={sumTrail} />
                        <HyperpatitionBarChart hyperpartitionName={selectedHyperpartitionName} methodDef={methodDef} classifiers={hyperpartitionData[selectedHyperpartitionName]} sumTrail={sumTrail} />
                        <Button  onClick={this.onBackBtn}>Back</Button>
                        
                    </div>
                    </div>
                    </div> 
        }else{
            return <div />
        }

    }
}
/*
class MethodSearchSpace extends React.Component<{ methodDef: IMethod, classifiers: IClassifier[] ,sumTrail:number}, {}>{

    public render() {
        const { methodDef, classifiers , sumTrail } = this.props;
        // pepare data for hyperpartition search space visualization
        // TODO: Now I split the classifier data two times. In order to improve efficiency, maybe it is necessary
        // to split the classifier data once.
        let parameterList: any[] = [];
        let idx = 0;
        methodDef.root_hyperparameters.forEach((p: string) => {
            let parameter = methodDef['hyperparameters'][p]
            if (parameter['values']) { //category axis
                parameterList.push({ dim: idx, name: p, type: 'category', data: parameter['values'] })
            }
        })
        let hyperpartitionData : IDatarun= {};
        classifiers.forEach(((classifier: IClassifier, idx: number) => {
            let par_dict = {}
            let parameters = classifier['parameters'].split('; ')
            parameters = parameters.map((p: string) => {
                let [k, v] = p.split(' = ')
                return par_dict[k] = v
            })
            // for the hidden layer sizes in MLP

            if (par_dict['len(hidden_layer_sizes)']) {
                for (let i = parseInt(par_dict['len(hidden_layer_sizes)']); i < 3; i++) {
                    par_dict[`hidden_layer_sizes[${i}]`] = 0
                }
            }

            // add perforamce
            par_dict['performance'] = parseFloat(classifier['performance'].split(' +- '))
            let ScatterPlotCategory : any[] = [methodDef.fullname];
            parameterList.forEach(p => {
                let value = par_dict[p.name]
                if (p.type == 'category') {
                    ScatterPlotCategory.push(p.name+":"+value);
                }
            });
            let HyperpartitionName = ScatterPlotCategory.join("\n");

            if(!hyperpartitionData[HyperpartitionName]){
                hyperpartitionData[HyperpartitionName] = [];
            }
            hyperpartitionData[HyperpartitionName].push(classifier);
        }
        )); 
        let usedHyperpartitions: string[] = Object.keys(hyperpartitionData)
        return <div className="methods" style={{height: '100%', borderTop: ".6px solid rgba(0,0,0, 0.4)"}}>
            {usedHyperpartitions.map((name: string, i: number) => {
                return <div key={name + '_used'} className="usedMethodContainer"
                    style={{ height: `100%`, width: '100%' }}>
                    
                    <div className="method">
                        <HyperpatitionSearchSpace hyperpartitionName={name} methodDef={methodDef} classifiers={hyperpartitionData[name]} sumTrail={sumTrail} />
                        <HyperpatitionBarChart hyperpartitionName={name} methodDef={methodDef} classifiers={hyperpartitionData[name]} sumTrail={sumTrail} />
                    </div>
                </div>
            })}
            
        </div>
        

    }

}

*/
class HyperpatitionSearchSpace extends React.Component<{ methodDef: IMethod, classifiers: IClassifier[], hyperpartitionName : string, sumTrail:number }, {}>{
    PCA = require('ml-pca');

    getOption() {
        // Get Datasets
        const { methodDef, classifiers,sumTrail } = this.props

        // pepare data for parallel coordinates
        let searchSpaceScatterPlot: any[] = [];
        let idx = 0
        methodDef.root_hyperparameters.forEach((p: string) => {
            let parameter = methodDef['hyperparameters'][p]
            if (parameter['values']) { //category axis
            } else if (parameter['range']) {//value axis
                if (parameter['range'].length > 1) { //range in the form of [min, max]
                    searchSpaceScatterPlot.push({ dim: idx, name: p, type: 'value', min: parameter['range'][0], max: parameter['range'][1] })
                } else { // range in the form of [max]
                    searchSpaceScatterPlot.push({ dim: idx, name: p, type: 'value', min: 0, max: parameter['range'][0] })
                }

            } else if (parameter['type'] == 'list') { // the hidden layer sizes in MLP
                for (let hidden_l = 0; hidden_l < parameter['list_length'].length; hidden_l++) {

                    searchSpaceScatterPlot.push({
                        dim: idx + hidden_l, name: `${p}[${hidden_l}]`, type: 'value',
                        min: 0,
                        max: parameter['element']['range'][1]
                    })
                }
                idx = idx + parameter['list_length'].length - 1

            } else {
                searchSpaceScatterPlot.push({
                    dim: idx, name: p, type: 'value'
                })
            }
        })
        let data: any[] = []
        let classifiersData : any[] = [];
        //let totallen = classifiers.length;
        classifiers.forEach(((classifier: IClassifier, idx: number) => {

            let par_dict = {}
            let parameters = classifier['parameters'].split('; ')
            parameters = parameters.map((p: string) => {
                let [k, v] = p.split(' = ')
                return par_dict[k] = v
            })
            // for the hidden layer sizes in MLP

            if (par_dict['len(hidden_layer_sizes)']) {
                for (let i = parseInt(par_dict['len(hidden_layer_sizes)']); i < 3; i++) {
                    par_dict[`hidden_layer_sizes[${i}]`] = 0
                }
            }

            // add perforamce
            par_dict['performance'] = parseFloat(classifier['performance'].split(' +- '))
            let attrs  =  searchSpaceScatterPlot.map(p => {
                let value = par_dict[p.name]
                if (p.type == 'value') {
                    return parseFloat(value);
                } else {
                    return value;
                }
            })
            data.push(attrs);
            let performance = parseFloat(classifier['performance'].split(' +- ')[0])
            let trailID : number = classifier['trail ID'];
            classifiersData.push({attrs:attrs,performance:performance,label:"trail ID:"+trailID+" performance:"+performance,idx:trailID});
        }
        ));
        // Get Color Gradient

        //const N = totallen<2?2:totallen;
        //const colors = getGradientColor(getColor(methodDef.name),RED,N);
        //console.log(colors);
  
        const N = sumTrail<2?2:sumTrail;
        const colors = getGradientColor(YELLOW,RED,N-1);      
        // PCA 
        let scatterPlotData : any[] = [];
        // scatterPlotData Format: x, y , performance, label, idx.
        //console.log(data);
        if(data.length>0 && data[0].length>0){
            const pca = new this.PCA(data);

            classifiersData.forEach(p=>{
                let predictData = pca.predict([p.attrs])[0];
                if(predictData.length>0){
                    let attr : any[] = [];
                    if(predictData.length==1){
                        attr.push(predictData[0]);
                        attr.push(predictData[0]);
                    }else if(predictData.length>=2){
                        attr.push(predictData[0]);
                        attr.push(predictData[1]);
                    }
                    attr.push(p.performance);
                    attr.push(p.label);
                    attr.push(p.idx);
                    scatterPlotData.push(attr);
                }
            });
        }else{
            console.log(data);
        }

        // Visualization for pca result.
        




        let series= [];
        series.push({
            data: scatterPlotData,
            type: 'scatter',
            symbolSize: function (data : any) {
                return data[2]*25+1;
            },
            label: {
                emphasis: {
                    show: true,
                    formatter: function (param : any) {
                        return param.data[3];
                    },
                    position: 'top',
                    color: 'black'
                }
            },
            itemStyle: {
                normal: {
                    color: function(param:any){
                        return colors[param.data[4]];
                    },
                    
                }
            }
        });
         let datalength = scatterPlotData.length;
        for(let i = 0;i<datalength-1;i++){
            let bundle = [];
            bundle.push(scatterPlotData[i]);
            bundle.push(scatterPlotData[i+1]);
            let series2 = {
                label:"index"+i,
                data: bundle,
                type: 'line',
                symbolSize: 0,
                color: colors[scatterPlotData[i][4]],
                itemStyle: {
                    normal: {
                        color: colors[scatterPlotData[i][4]]
                        
                    }
                }
            };

            series.push(series2);
        }
        const option = {
            title: {
                text: `${this.props.hyperpartitionName}: {term|${classifiers.length}}`,
                left: '0.5%',
                top: '0.5%',
                textStyle: {
                    fontSize: 15,
                    rich: {
                        term: {
                            borderColor: "black",
                            borderWidth: 1,
                            borderRadius: 15,
                            padding: 5
                        }
                    },
                    color:getColor(methodDef.name)
                }

            },
            xAxis: {
                show:false,
                scale:true
            },
            yAxis: {
                show:false,
                scale: true
            },
            
            visualMap: [
                {
                    left:'right',
                    dimension: 4,
                    min: 0,
                    max: N-1,
                    itemHeight: 120,
                    calculable: true,
                    precision: 0,
                    text: ['latest time'],                   
                    inRange: {
                        color: [YELLOW, RED]
                    }
                   
                    
                }

            ],

            series: series
        };
        return option
    }
    render() {
        return <ReactEcharts
            option={this.getOption()}
            style={{ height: `60%`, width: '100%' }}
        />
    }
}


class HyperpatitionBarChart extends React.Component<{ methodDef: IMethod, classifiers: IClassifier[], hyperpartitionName : string, sumTrail:number }, {}>{
    PCA = require('ml-pca');

    getBarOption() {
        // Get Datasets
        const { methodDef, classifiers } = this.props;
        let step = 0.05;
        let data:number[] = [];
        for (let i =0; i<1/step; i++){
            data.push(0)
        }
        classifiers.forEach((classifier:IClassifier)=>{
            let performance = parseFloat(classifier['performance'].split(' +- ')[0])
            let rangeIdx = Math.floor(performance/step)
            data[rangeIdx] = data[rangeIdx]+1
        });
        let xAxisData:string[] = []
        for (let i =0; i<1/step; i++){
            xAxisData.push(`${(i*step).toFixed(2)}-${((i+1)*step).toFixed(2)}`)
        }
        const option = {
            title:{
                text:"performance histogram",
                left: '0.5%',
                bottom: '0.5%',
            },
            xAxis: {
                type: 'category',
                data: xAxisData,
                axisTick:{
                    interval:0,
                },
                axisLabel:{
                    rotate:-30,
                    interval:1,
                    fontSize: 8,
                }
            },
            yAxis: {
                type: 'value'
            },
            
            series:[
                {
                    type: 'bar',
                    // smooth: false,
                    barGap:'5%',
                    barCategoryGap: "5%",
                    data:data,
                    itemStyle:{
                        color: getColor(methodDef.name),
                        opacity: 1
                    },
                }
            ]
        };
        return option
    }
    render() {
        return <ReactEcharts
            option={this.getBarOption()}
            style={{ height: `30%`, width: '40%' }}
        />
    }
}

class HyperpatitionOverViewBarChart extends React.Component<{ methodDef: IMethod, classifiers: IClassifier[], hyperpartitionName : string, sumTrail:number,onClick:(name:string)=>void }, {}>{

    getBarOption() {
        // Get Datasets
        const { methodDef, classifiers } = this.props;
        let step = 0.05;
        let data:number[] = [];
        for (let i =0; i<1/step; i++){
            data.push(0)
        }
        classifiers.forEach((classifier:IClassifier)=>{
            let performance = parseFloat(classifier['performance'].split(' +- ')[0])
            let rangeIdx = Math.floor(performance/step)
            data[rangeIdx] = data[rangeIdx]+1
        });
        let xAxisData:string[] = []
        for (let i =0; i<1/step; i++){
            xAxisData.push(`${(i*step).toFixed(2)}-${((i+1)*step).toFixed(2)}`)
        }
        const option = {
            title: {
                text: `${this.props.hyperpartitionName}: {term|${classifiers.length}}`,
                left: '0.5%',
                top: '0.5%',
                textStyle: {
                    fontSize: 15,
                    rich: {
                        term: {
                            borderColor: "black",
                            borderWidth: 1,
                            borderRadius: 15,
                            padding: 5
                        }
                    },
                    color:getColor(methodDef.name)
                }

            },
            xAxis: {
                type: 'category',
                data: xAxisData,
                axisTick:{
                    interval:0,
                },
                axisLabel:{
                    rotate:-30,
                    interval:1,
                    fontSize: 8,
                }
            },
            yAxis: {
                type: 'value'
            },
            
            series:[
                {
                    type: 'bar',
                    // smooth: false,
                    barGap:'5%',
                    barCategoryGap: "5%",
                    data:data,
                    itemStyle:{
                        color: getColor(methodDef.name),
                        opacity: 1
                    },
                }
            ]
        };
        return option
    }
    onChartClick=()=>{
        //alert('chart click' + this.props.hyperpartitionName);
        const name = this.props.hyperpartitionName;
        this.props.onClick(name);
    };
    
      
    render() {
        
        return <div onClick={this.onChartClick} style={{ height: `100%`, width: '100%' }}>
        <ReactEcharts
            option={this.getBarOption()}
            style={{ height: `100%`, width: '100%' }}
        />
        </div>
    }
}