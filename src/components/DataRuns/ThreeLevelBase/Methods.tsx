import * as React from "react";
import { IClassifier, IMethod,  } from "types";
//import { getColor } from "helper";
//import * as methodsDef from "assets/methodsDef.json";
import {IHyperpartitionInfo, IClassifierInfo,IRecommendationResult} from 'service/dataService';
import { Checkbox } from 'antd';
import "./Methods.css";
//import * as hint from "assets/small_hint.png"
const d3 = require("d3");

export interface IProps {
    classifiers: IClassifierInfo[],
    onSelectMethod: (methodName:string)=>void,
    usedMethods: string[],
    unusedMethods: string[],
    width: number,
    selectedMethod: string,
    hyperpartitions: IHyperpartitionInfo[],
    configsMethod : string[],
    onMethodsCheckBoxChange: (e:any)=>void
    compareK:number,
    methodSelected:any,
    recommendationResult:IRecommendationResult
}

export interface IState {

}


export default class methods extends React.Component<IProps, IState>{
    public gap = 20
    width = (this.props.width - 6*this.gap)/2
    // public height = (window.innerHeight * 0.94 * 0.9 - this.gap) / (Object.keys(methodsDef).length * 0.5) - this.gap
    public methodBoxAttr = {
        // width : 70,
        height: this.width * 0.7,
        width: this.width,
        gap: this.gap,
        x: 2*this.gap,
        y: 2 * this.gap,
        checkboxY: 2,
        checkboxWidth: 75,
        checkboxHeight: 30
    }
    public getbestperformance(list: IClassifier[]) {
        if (list.length > 0) {
            let classifierPerformance: number[] = list.map((classifier: IClassifier) => {
                let performance = parseFloat(classifier['performance'].split(' +- ')[0]);
                return performance;
            });
            classifierPerformance.sort(function (a: any, b: any) {
                return b - a;
            });
            return classifierPerformance[0];
        } else {
            return 0;
        }

    }
    public getmaxnum(classifiers: IClassifierInfo[]) {
        let step = 0.1;
        let data: number[] = [];

        for (let i = 0; i < 1 / step; i++) {
            data.push(0)
        }
        let bestperformance = 0;
        classifiers.forEach((classifier: IClassifierInfo) => {
            let performance = classifier['cv_metric'];
            if (performance > bestperformance) {
                bestperformance = performance;
            }
            let rangeIdx = Math.floor(performance / step)
            data[rangeIdx] = data[rangeIdx] + 1
        });
        let maxvalue = 0;
        data.forEach((p: any) => {
            if (p > maxvalue) {
                maxvalue = p;
            }
        })
        return maxvalue;
    }
    componentDidUpdate(){
        let {classifiers, compareK } = this.props
        let comparedCls = classifiers.slice(0, compareK)

        let comparedMethods = Array.from(new Set(comparedCls.map(d=>d.method)))
        if(compareK>0){
            d3.selectAll('g.algorithm')
            .attr('opacity', 0.5)

            comparedMethods.forEach((methodName:string)=>{
                d3.select(`g#LineChart_${methodName}`)
                .attr('opacity', 1)
            })
        }else{
            d3.selectAll('g.algorithm')
            .attr('opacity', 1)
        }


    }
    render() {
        let { classifiers, usedMethods, unusedMethods, methodSelected} = this.props



        let performance = usedMethods.map((name: string, i: number) => {
            return {
                bestScore: Math.max(
                    ...classifiers.filter(
                            (d:any)=>d.method==name
                        ).map(
                            d=>d['cv_metric']
                        )
                ),
                name: name
            };
        });
        performance.sort(function (a: any, b: any) {
            return b.bestScore - a.bestScore;
        });
        let sortedusedMethods = performance.map((d: any) => {
            return d.name;
        });
        //let maxnum = Math.max(
        //    ...usedMethods.map(
        //        (name:string)=>this.getmaxnum(classifiers.filter(d=>d.method==name))
        //))
        // // calculate the max num
        // sortedusedMethods.forEach((name: string, i: number)=>{
        //     let num = this.getmaxnum(datarun[name]);
        //     if(num>maxnum){
        //         maxnum=num;
        //     }
        // });
        return <g className="methods" >
                    {sortedusedMethods.concat(unusedMethods).map((name: string, i: number) => {
                            /*let checked = false;
                            let configsMethod : string[] = this.props.configsMethod;
                            if(configsMethod.indexOf(name)>-1){
                                    checked= true;
                            };*/
                            let checked = false;
                            let indeterminate = false;
                            let disabled = false;
                            if(methodSelected[name]){
                                checked = methodSelected[name].checked;
                                indeterminate = methodSelected[name].indeterminate;
                                disabled = methodSelected[name].disabled;
                            }

                            return (<foreignObject 
                                        key={name+"_text_"+i} 
                                        x={ this.methodBoxAttr.x +
                                            Math.floor(i / 7)  * (this.methodBoxAttr.width + 2*this.methodBoxAttr.gap)} 
                                        y={this.methodBoxAttr.y +
                                            (i % 7)* (this.methodBoxAttr.height + this.methodBoxAttr.gap) - this.methodBoxAttr.gap} 
                                        width={this.methodBoxAttr.checkboxWidth} 
                                        height={this.methodBoxAttr.checkboxHeight}>
                                       <Checkbox  
                                        key={name+"_checkbox_"+(i)} 
                                        checked={checked} 
                                        indeterminate={indeterminate}
                                        disabled={disabled}
                                        value={name} 
                                        onChange={this.props.onMethodsCheckBoxChange} >
                                        {name}
                                        </Checkbox>
                                        </foreignObject>
                                  )
                    })}
          
             </g>
    
    }
}

export interface LineChartProps {
    width: number,
    height: number,
    x: number,
    y: number,
    methodDef: IMethod,
    classifiers: IClassifierInfo[],
    name: string,
    totallen?: number,
    methodName?: string,
    onClick:(a:string)=>void,
    selected?: boolean,
    hyperpartitoins: IHyperpartitionInfo[],
    flower:number

}
