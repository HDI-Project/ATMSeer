import * as React from "react";
import { IClassifierInfo } from "service/dataService"
import { getColor } from 'helper';
import * as methodsDef from "assets/methodsDef.json";

export interface IProps {
    classifiers: IClassifierInfo[],
    selectedMethod: string,
    compareK:number,
    onSelectedChange:(method:string,name:string,type:string,range:number[])=>void,
    alreadySelectedRange:any
}

const d3 = require("d3");
// Get Datasets
export default class HyperParameters extends React.Component<IProps, {}>{
    render() {
        let { classifiers, selectedMethod, compareK,alreadySelectedRange } = this.props
        let comparedCls = classifiers.slice(0, compareK)
        let comparedMethods = Array.from(new Set(comparedCls.map(d=>d.method)))

        if (comparedMethods.length==1){
            selectedMethod = comparedMethods[0]
        }
        classifiers = classifiers.filter(d=>d.method==selectedMethod)
        function judgeSelect(d:IClassifierInfo){
            let hpaSelect : boolean = true;
            if(alreadySelectedRange){
                let filterkeys = Object.keys(alreadySelectedRange);
                if(filterkeys.length>0){
                    filterkeys.forEach((name:string,index:number)=>{
                        if(hpaSelect){
                            // Avoid endless comparison
                            if(d.hyperparameters[name]){
                                let data = d.hyperparameters[name];
                                if(alreadySelectedRange[name]["range"]&&alreadySelectedRange[name]["range"].length==2){
                                    let hpamin = alreadySelectedRange[name]["range"][0];
                                    let hpamax = alreadySelectedRange[name]["range"][1];

                                    if(data<hpamin||data>hpamax){
                                        hpaSelect = false;
                                    }
                                }
                            }else{
                                hpaSelect = false;
                            }
                        }
                    });
                }else{hpaSelect=true;}
            }else{hpaSelect = true;}
            return hpaSelect;
        }
        if (classifiers.length>0) {
            let HyperparameterList: any[] = [];
            let idx = 0
            let methodDef = methodsDef[selectedMethod];
            methodDef.root_hyperparameters.forEach((p: string) => {
                let parameter = methodDef['hyperparameters'][p]
                if (parameter['values']) { //category axis
                } else if (parameter['range']) {//value axis
                    if (parameter['range'].length > 1) { //range in the form of [min, max]
                        HyperparameterList.push({ dim: idx, name: p, type: 'value', min: parameter['range'][0], max: parameter['range'][1], valueType: parameter['type'] })
                    } else { // range in the form of [max]
                        HyperparameterList.push({ dim: idx, name: p, type: 'value', min: 0, max: parameter['range'][0], valueType: parameter['type'] })
                    }

                } else if (parameter['type'] == 'list') { // the hidden layer sizes in MLP
                    for (let hidden_l = 0; hidden_l < parameter['list_length'].length; hidden_l++) {

                        HyperparameterList.push({
                            dim: idx + hidden_l, name: `${p}[${hidden_l}]`, type: 'value',
                            min: 0,
                            max: parameter['element']['range'][1],
                            valueType: parameter['type']
                        })
                    }
                    idx = idx + parameter['list_length'].length - 1

                } else {
                    HyperparameterList.push({
                        dim: idx, name: p, type: 'value', valueType: parameter['type']
                    })
                }
            })
            let selectedClassifier : IClassifierInfo[] =[];

            if(compareK>0){
                selectedClassifier = comparedCls.filter(d=>{
                    return judgeSelect(d);
                })
            }else{
                selectedClassifier = classifiers.filter(d=>{
                    return judgeSelect(d);
                })

            }
            let box = {
                width: 200,
                height: 100,
                margin: 40
            }
            return <g className="hyperParameters">
                {HyperparameterList.map((hp, i) => {
                    return <HyperParameter
                        key={hp}
                        classifiers={classifiers}
                        hp={hp}
                        idx={i}
                        box={box}
                        selectedMethod={selectedMethod}
                        comparedCls={selectedClassifier}
                        onSelectedChange={this.props.onSelectedChange}
                        alreadySelectedRange={this.props.alreadySelectedRange[hp.name]?this.props.alreadySelectedRange[hp.name]:{}}
                        valueType={hp.valueType}
                        />
                })}
            </g>
        } else {
            return <g />
        }

    }
}


export interface HyProps {
    classifiers: IClassifierInfo[],
    selectedMethod: string,
    hp: any,
    idx: number,
    comparedCls: IClassifierInfo[],
    valueType: string,
    box: {
        width: number,
        height: number,
        margin: number
    },
    onSelectedChange:(method:string,name:string,type:string,range:number[])=>void,
    alreadySelectedRange:any
}
/**
 * export interface DetailChartProps{
    width: number,
    height: number,
    x: number,
    y: number,
    methodDef: IMethod,
    classifiers : IClassifier[],
    name:string,
    min:number,
    max:number,
    hyname:string,
    alreadySelectedRange:number[],
    hintRange:number[],
    onSelectedChange:(method:string,name:string,range:number[])=>void,
    valueType:string
}
 */

class HyperParameter extends React.Component<HyProps, {}>{
    TAG = "HyperParameter_";
    componentDidMount() {
        this.renderD3();
        let g = d3.select("#" + this.TAG + this.props.idx)
        let {comparedCls} = this.props
        g.selectAll(`circle.dot`)
            .attr('opacity', 0.2)
        //if(comparedCls.length>0){
        //    g.selectAll(`circle.dot`)
        //    .attr('opacity', 0.2)
        //}
        comparedCls.forEach(d=>{
            g.select(`#_${d.id}`)
            .attr('opacity', 1)
        })
    }
    // componentWillUnmount() {
    //     // d3.select("#" + this.TAG + this.props.idx).remove()
    // }
    componentDidUpdate(){
        let g = d3.select("#" + this.TAG + this.props.idx)

        g.selectAll('*').remove()
        this.renderD3()

        let {comparedCls} = this.props
        g.selectAll(`circle.dot`)
            .attr('opacity', 0.2)
        //if(comparedCls.length>0){
        //    g.selectAll(`circle.dot`)
        //    .attr('opacity', 0.2)
        //}
        comparedCls.forEach(d=>{
            g.select(`#_${d.id}`)
            .attr('opacity', 1)
        })

    }
    renderD3() {
        let { box, hp, classifiers, idx, selectedMethod, onSelectedChange, alreadySelectedRange,valueType } = this.props
        classifiers.reverse() // reverse so that good classifiers is on the top
        let scatterData = classifiers.map(cls => {
            return { hp: cls.hyperparameters[hp.name]||0, score: cls.cv_metric, ...cls }
        })
        let methodColor = getColor(selectedMethod)

        let { width, height, margin } = box
        let x = d3.scaleLinear().range([0, width])
        let y = d3.scaleLinear().range([height, 0]);
        if(valueType=="float_exp"){
            x = d3.scaleLog().range([0, width])
        }
        let yArea = d3.scaleLinear().range([height/4, 0]);
        x.domain([hp.min, hp.max]);
        y.domain(d3.extent(classifiers, (cls:IClassifierInfo)=>cls.cv_metric));

        // calculate the area chart
        const num_step = 20
        let areaData: number[][] = Array.from(new Array(num_step).keys()).map(d => [])
        const step = width / num_step
        scatterData.forEach(d => {
            if (typeof (d.hp) == 'number') {
                let rangeIndex = Math.floor((x(d.hp) - 0) / step)

                rangeIndex = rangeIndex >= num_step ? (num_step - 1) : rangeIndex
                rangeIndex = rangeIndex < 0 ? 0 : rangeIndex;
                areaData[rangeIndex].push(d.score)
            }
        })
        areaData.unshift(areaData[0])

        //draw
        let svg = d3.select("#" + this.TAG + idx)
            .append('g')
            .attr('transform', `translate(${0}, ${margin + idx * (height*5/4 + margin)})`)



        yArea.domain(d3.extent(areaData, (d: number[]) => d.length))

        let area = d3.area()
            .x(function (d: any, i: number) { return i*step; })
            .y1(height*5/4)
            .y0(function (d: any) { return height + yArea(d.length); })
            .curve(d3.curveCardinal)


        // area performance gradient
        svg.append("linearGradient")
            .attr("id", `area-gradient-${hp.name}`)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", width).attr("y2", 0)
            .selectAll("stop")
            .data(areaData)
            .enter().append("stop")
            .attr("offset", (d: any, i: number) => i / num_step)
            .attr("stop-color", methodColor)
            .attr('stop-opacity', (d: number[]) => (d.reduce((m, n) => m + n, 0) || 0) / d.length)

        //area chart
        svg.append('g')
            .attr('class', 'areaGroup')
            .selectAll('.area')
            .data([areaData])
            .enter()
            .append('path')
            .attr('class', 'area')
            .attr('d', area)
            .style('fill', `url(#area-gradient-${hp.name})`)

        // brush
        function brushended() {
            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.selection) return; // Ignore empty selections.
            let d0 = d3.event.selection.map(x.invert);
            let min = d0[0];
            let max = d0[1];
            console.log("brush min max");
            console.log(min);
            console.log(max);
            onSelectedChange(selectedMethod,hp.name,hp.valueType,[min,max]);

        }


        let brush : any;
        let brush_g = svg.append("g")
                    .attr("class", "brush")
                    .call(brush = d3.brushX()
                    .extent([[x(hp.min), height], [x(hp.max), height*5/4]]));
        if(alreadySelectedRange["range"]&&alreadySelectedRange["range"].length==2){
            brush.move(brush_g,[x(alreadySelectedRange["range"][0]),x(alreadySelectedRange["range"][1])]);
        }
        brush.on("end", brushended);

        //scatter chart
        svg.append('g')
            .attr('class', 'dotGroup')
            .selectAll(".dot")
            .data(scatterData)
            .enter().append("circle")
            .attr("class", 'dot')
            .attr('id',(d:any)=>`_${d.id}`)
            .attr("r", 4)
            .attr("cx", function (d: any) { return x(d.hp); })
            .attr("cy", function (d: any) { return y(d.score); })
            .style('fill', getColor(classifiers[0].method))
            .attr('stroke', 'white')
            .attr('stroke-width', 1)

        // Add the X Axis
        svg.append("g")
            .attr('class','xAxis')
            .attr("transform", "translate(0," + height*5/4 + ")")
            .call(d3.axisBottom(x).ticks(5));
        svg.append("g")
            .attr('class','xAxis_')
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(0));

        // x axis lable;
        svg.append("text")
            .attr("transform",
                "translate(" + (width) + " ," +
                (height*5/4 + margin*0.75) + ")")
            .style("text-anchor", "end")
            .text(hp.name);

        // Add the Y Axis
        svg.append("g")
            .attr('class', 'yAxis')
            .call(d3.axisLeft(y).ticks(5));

        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - 1.5 * margin)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("F_score");

    }
    render() {
        return <g id={this.TAG + this.props.idx} />
    }
}