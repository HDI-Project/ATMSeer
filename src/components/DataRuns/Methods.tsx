import { } from 'antd';
import * as React from 'react';
import * as methods from "../../assets/methods.json";
import { IMethod, IDataRun } from "../../types";
import {getColor} from '../../helper';
import "./Methods.css"
import ReactEcharts from "echarts-for-react";

export interface IState{
}
export interface IProps{
    height: number,
    datarun: any
}
export default class Methods extends React.Component<IProps, IState>{
    
    public render(){
        // const methodLen = Object.keys(methods).length
        let allmethods = this.props.datarun[1]['data']
        let usedMethods:string[] = []
        allmethods.forEach((m:string)=>{
            if(usedMethods.indexOf(m)==-1){
                usedMethods.push(m)
            }
        })
        // const usedMethods = ['SVM', 'RF', 'DT', 'MLP',,'GP', 'LR', 'KNN'] // the used methods should be obtained by requesting server the config file
        const unusedMethods = Object.keys(methods).filter((name:string)=>usedMethods.indexOf(name)<0)
        return <div className="methods">
        {usedMethods.map((name: string, i:number)=>{
            const method = methods[name]
            return <div key={method.name+'_used'} className="usedMethodContainer"
                    style={{height: `20%`, width: '25%'}}>
                <div className="method">
                    <Method method={method} datarun={this.props.datarun}/>
                </div>
            </div>           
        })}
        
        {unusedMethods.map((name:string)=>(<div key ={name+'_unused'} className='unusedMethod'>{methods[name]['fullname']}</div>))}
        </div>
            
    }
}

class Method extends React.Component<{method:IMethod, datarun:IDataRun}, {}>{
    getOption(){
        const {method, datarun} = this.props
        let parallelAxis: any[] = []
        let idx = 0
        method.root_hyperparameters.forEach((p:string)=>{
            let parameter = method['hyperparameters'][p]
            if (parameter['values']){ //category axis
                parallelAxis.push({dim:idx, name:p, type: 'category', data: parameter['values']} )
            }else if(parameter['range']){//value axis
                if(parameter['range'].length>1){ //range in the form of [min, max]
                    parallelAxis.push( {dim:idx, name:p, type: 'value', min: parameter['range'][0], max: parameter['range'][1]} )
                }else{ // range in the form of [max]
                    parallelAxis.push( {dim:idx, name:p, type: 'value', min: 0, max: parameter['range'][0]} )
                }
                
            }else if(parameter['type']=='list'){ // the hidden layer sizes in MLP
                for (let hidden_l =0; hidden_l<parameter['list_length'].length; hidden_l++) {
                    
                    parallelAxis.push({
                        dim: idx+hidden_l, name:`${p}[${hidden_l}]`, type: 'value', 
                        min: 0, 
                        max: parameter['element']['range'][1]
                    })
                }
                idx = idx+parameter['list_length'].length-1
                // parallelAxis.push({
                //     dim: idx, name:p, type:'value'
                // })
                
            }else{
                parallelAxis.push({
                    dim: idx, name:p, type:'value'
                })
            }
        })
        //performance as a value axis
        parallelAxis.push({
            dim: parallelAxis.length, 
            name:'performance', 
            type:'value', 
            min:0, 
            max:1
        })
        //remove axes that only have one value
        parallelAxis = parallelAxis.filter(axis=>{
            if(axis.type=='value'){
                return true
            }else{
                return axis.data.length>1
            }
        })
        //re organize the dim index after filtering and inserting
        parallelAxis.forEach((p, idx:number)=>{
            p.dim = idx
        })
        let data:any[] = []
        datarun[1].data.forEach(((_method:string, idx:number)=>{
            if(_method == method.name){
                let par_dict = {}
                let parameters = datarun[2].data[idx] //
                parameters = parameters.split('; ')
                parameters = parameters.map((p:string)=>{
                    let [k, v] = p.split(' = ')
                    return par_dict[k] = v
                })
                // for the hidden layer sizes in MLP

                if(par_dict['len(hidden_layer_sizes)']){
                    for (let i=parseInt(par_dict['len(hidden_layer_sizes)']); i<3; i++){
                        par_dict[`hidden_layer_sizes[${i}]`]=0
                    }
                }

                // add perforamce
                let headers = datarun.map((d:{'name':string, 'data':any[]})=>d.name)
                let performanceIdx = headers.indexOf('performance')
                par_dict['performance'] = parseFloat(datarun[performanceIdx].data[idx].split(' +- ') )
                let attrs = parallelAxis.map(p=>{

                    let value = par_dict[p.name]
                    if(p.type=='value'){
                        return parseFloat(value)
                    }else{
                        return value
                    }
                })
                data.push( attrs  )
            }
        }))
        const option ={
            title:{
                text:method.fullname,
                textStyle:{
                    fontSize: 12,
                }
            },
            parallelAxis,
            parallel: {
                bottom: '10%',
                left: '5%',
                top: '30%',
                right: '8%',
                // height: '31%',
                // width: '55%',
                parallelAxisDefault: {
                    type: 'value',
                    name: 'performance',
                    nameLocation: 'end',
                    nameGap: 10,
                    splitNumber: 3,
                    nameTextStyle: {
                        fontSize: 14
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#555'
                        }
                    },
                    axisTick: {
                        lineStyle: {
                            color: '#555'
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#555'
                        }
                    }
                }
            },
            series: [
                {
                    name: 'parallel',
                    type: 'parallel',
                    smooth: true,
                    inactiveOpacity: 0.2,
                    activeOpacity: 0.9,
                    tooltip:{},
                    lineStyle: {
                        normal: {
                            width: 1,
                            opacity: 0.8,
                            color: getColor(method.name)
                        }
                    },
                    data,
                },
                // {
                //     name: 'bar',
                //     type: 'bar',
                //     data: [120, 200, 150, 80, 70, 110, 130]
                // }
            ],
            
        }
        return option
    }
    render(){
        return <ReactEcharts 
        option = { this.getOption() }
        style={{height: `100%`, width: '100%'}}
        />
    }
}


