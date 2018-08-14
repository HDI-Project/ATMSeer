import { } from 'antd';
import * as React from 'react';
import * as methodsDef from "../../assets/methodsDef.json";
import { IMethod, IDatarun, IClassifier } from "types";
import { getColor ,RED, getGradientColor} from 'helper';
import "./MethodsSearchSpace.css"
import ReactEcharts from "echarts-for-react";
export interface IState {
}
export interface IProps {
    height: number,
    datarun: IDatarun
}
export default class MethodsSearchSpace extends React.Component<IProps, IState>{

    public render() {
        // const methodLen = Object.keys(methodsDef).length
        let { datarun, height } = this.props
        console.log(datarun);
        let usedMethods: string[] = Object.keys(datarun)
        // const usedMethods = ['SVM', 'RF', 'DT', 'MLP',,'GP', 'LR', 'KNN'] // the used methodsDef should be obtained by requesting server the config file
        const unusedMethods = Object.keys(methodsDef).filter((name: string) => usedMethods.indexOf(name) < 0)
        return <div className="methods" style={{height: height+'%', borderTop: ".6px solid rgba(0,0,0, 0.4)"}}>
            {usedMethods.map((name: string, i: number) => {
                const methodDef = methodsDef[name]
                return <div key={name + '_used'} className="usedMethodContainer"
                    style={{ height: `35%`, width: '33%' }}>
                    <div className="method">
                        <MethodSearchSpace methodDef={methodDef} classifiers={datarun[name]} />
                    </div>
                </div>
            })}

            {unusedMethods.map((name: string) => (<div key={name + '_unused'} className='unusedMethod'>{methodsDef[name]['fullname']}</div>))
            }
        </div>

    }
}

class MethodSearchSpace extends React.Component<{ methodDef: IMethod, classifiers: IClassifier[] }, {}>{
    PCA = require('ml-pca');
    gradient = require('gradient-color');

    getOption() {
        // Get Datasets
        const { methodDef, classifiers } = this.props

        // pepare data for parallel coordinates
        let searchSpaceScatterPlot: any[] = []
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
        let totallen = classifiers.length;
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
            let attrs = searchSpaceScatterPlot.map(p => {
                let value = par_dict[p.name]
                if (p.type == 'value') {
                    return parseFloat(value)
                } else {
                    return value
                }
            })
            data.push(attrs)
            let performance = parseFloat(classifier['performance'].split(' +- ')[0])
            classifiersData.push({attrs:attrs,performance:performance,label:"idx:"+idx+" performance:"+performance,idx:idx});
        }
        ));
        // Get Color Gradient

        const N = totallen<2?2:totallen;
        const colors = getGradientColor(getColor(methodDef.name),RED,N);
        //console.log(colors);
        
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
        
        
        const option = {
            title: {
                text: `${methodDef.fullname}: {term|${classifiers.length}}`,
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
            series: [{
                data: scatterPlotData,
                type: 'scatter',
                symbolSize: function (data : any) {
                    return data[2]*50+1;
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
            }]
        };
        
        return option
    }
    render() {
        return <ReactEcharts
            option={this.getOption()}
            style={{ height: `100%`, width: '100%' }}
        />
    }
}


