import * as React from "react";
import { IClassifier, IMethod,  } from "types";
import { getColor } from "helper";
import * as methodsDef from "assets/methodsDef.json";
import {IHyperpartitionInfo, IClassifierInfo,IRecommendationResult} from 'service/dataService';
import { Checkbox,Tooltip,Progress } from 'antd';
import "./Methods.css";
//import * as hint from "assets/small_hint.png"
const d3 = require("d3");

export interface IProps {
    classifiers: IClassifierInfo[],
    onSelectMethod: (methodName:string)=>void,
    usedMethods: string[],
    unusedMethods: string[],
    width: number,
    height:number,
    displaymode:number,
    selectedMethod: string,
    hyperpartitions: IHyperpartitionInfo[],
    configsMethod : string[],
    onMethodsCheckBoxChange: (e:any)=>void,
    onMethodsCheckBoxAllChange:(e:any)=>void,
    compareK:number,
    methodSelected:any,
    recommendationResult:IRecommendationResult,
    checkAllAttr:any
}

export interface IState {

}


export default class methods extends React.Component<IProps, IState>{
    public gap = 20
    width = (this.props.width - 2*this.gap)/2>20?(this.props.width - 2*this.gap)/2:20;
    // public height = (window.innerHeight * 0.94 * 0.9 - this.gap) / (Object.keys(methodsDef).length * 0.5) - this.gap
    public methodBoxAttr = {
        // width : 70,
        height: this.width * 0.4,
        width: this.width,
        gap: this.gap,
        x: this.gap,
        y: this.gap,
        checkboxY: 2,
        checkboxWidth: 75,
        checkboxHeight: 30,
        yextragap:20
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
        let { classifiers, usedMethods, unusedMethods, hyperpartitions,methodSelected,width,height} = this.props;

        console.log(width);
        console.log(height);
        // Calculate Layout
        let refwidth = 1600;
        let oneboxwidth:number = 215/refwidth*width;
        let oneboxgap :number = 30;
        let oneboxinnerwidth:number = oneboxwidth -2* oneboxgap;
        const x = 48;
        const y = 60;
        const yextragap = 20;
        const gap = 30;
        const yGap = gap + yextragap;
        // const maxrow = 7;
        let maxrow = Math.floor((width-x)/(oneboxinnerwidth+2*oneboxgap));
        if(maxrow<=1){
            maxrow = 1;
        }
        const nRows = Math.ceil((usedMethods.length + unusedMethods.length) / maxrow);
        console.log(nRows);
        // const oneboxheight = (height - y) / nRows - yGap;
        let oneboxinnerheight:number = (height - y) / nRows - yGap;
        // oneboxygap = 30;
        this.methodBoxAttr = {
            // width : 70,
            height: oneboxinnerheight  ,
            width: oneboxinnerwidth ,
            gap,
            x,
            y,
            checkboxY: 2,
            checkboxWidth: 100,
            checkboxHeight: 30,
            yextragap,
        }

        /**
         * checkboxHeight: 30
            checkboxWidth: 100
            checkboxY: 2
            gap: 20
            height: 68.76923076923076
            width: 114.61538461538461
            x: 40
            y: 40
            yextragap: 20
         *
         */
        console.log(this.methodBoxAttr);

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
        let maxnum = Math.max(
            ...usedMethods.map(
                (name:string)=>this.getmaxnum(classifiers.filter(d=>d.method==name))
        ))
        // // calculate the max num
        // sortedusedMethods.forEach((name: string, i: number)=>{
        //     let num = this.getmaxnum(datarun[name]);
        //     if(num>maxnum){
        //         maxnum=num;
        //     }
        // });
        let getXcorr = (i:number) =>{
            return  this.methodBoxAttr.x +  (i % maxrow)* (this.methodBoxAttr.width + 2*this.methodBoxAttr.gap)
        }
        let getYcorr = (i:number) =>{
            return this.methodBoxAttr.y + Math.floor(i / maxrow) * (this.methodBoxAttr.height + this.methodBoxAttr.gap+ this.methodBoxAttr.yextragap)
        }
        let checkAllAttr:any = this.props.checkAllAttr;
        return <g className="methods" >
                                <foreignObject
                                        key={name+"_text_checkall"}
                                        x={150}
                                        y={-7}
                                        width={this.methodBoxAttr.checkboxWidth}
                                        height={this.methodBoxAttr.checkboxHeight}>

                                       <Checkbox
                                        key={name+"_checkbox_all"}
                                        checked={checkAllAttr.checked}
                                        indeterminate={checkAllAttr.indeterminate}
                                        disabled={checkAllAttr.disabled}
                                        value={name}
                                        onChange={this.props.onMethodsCheckBoxAllChange} >
                                        Check all
                                        </Checkbox>
                                    </foreignObject>
                  
            <g className="usedMethods">
                {sortedusedMethods.map((name: string, i: number) => {
                    const methodDef = methodsDef[name];
                    // let  testin = selectedMethodName.indexOf(name);
                    let selected = (name==this.props.selectedMethod)
                    let index = this.props.recommendationResult.result.indexOf(name);
                    let flower = 0;
                    if(index>=0&&index<=2){
                        flower = 3-index;
                    }
                    let filterclassifier = classifiers.filter((d:any)=>d.method==name);
                    let filterhyperpartitions = hyperpartitions.filter((d:IHyperpartitionInfo)=>d.method==name);
                    
               
                    let mymethodSelected = {
                        checked : false,
                        indeterminate : false,
                        disabled : false
                    };
                    if(methodSelected[name]){
                       mymethodSelected = methodSelected[name];
                    }
                    // if (testin > -1) {
                    //     selected = true;
                    // }
                    //const classifier_num = datarun[name].length;
                    //const top_width = classifier_num*6+60;
                    // this.index++;
                    return (<g key={name + "_g_linechart_"}>

                        <LineChart key={name + "_used_"}
                            // x={this.methodBoxAttr.x+i*(this.methodBoxAttr.width+this.methodBoxAttr.gap)}
                            // y={this.methodBoxAttr.y}
                            x={getXcorr(i)}
                            y={getYcorr(i)}
                            width={this.methodBoxAttr.width}
                            height={this.methodBoxAttr.height}
                            methodDef={methodDef}
                            classifiers={filterclassifier}
                            name={name}
                            totallen={maxnum}
                            onClick={this.props.onSelectMethod}
                            selected={selected}
                            hyperpartitoins = {filterhyperpartitions}
                            flower={flower}
                            methodBoxAttr={this.methodBoxAttr}
                            methodSelected={mymethodSelected}
                            onMethodsCheckBoxChange={this.props.onMethodsCheckBoxChange}
                            mode={0}
                        />
                        


                        </g>)

                })}
            </g>
            <g className="unusedMethods">{
                unusedMethods.map((name: string, i: number) => {
                    let index = i + usedMethods.length;
                    let index2 = this.props.recommendationResult.result.indexOf(name);
                    let flower = 0;
                    if(index2>=0&&index2<=2){
                        flower = 3-index2;
                    }
                    let flowerlist = [];
                    for(let i = 1;i<=flower;i++){
                        flowerlist.push(i);
                    }
                    let mymethodSelected = {
                        checked : false,
                        indeterminate : false,
                        disabled : false
                    };
                    if(methodSelected[name]){
                       mymethodSelected = methodSelected[name];
                    }
                     return (<g key={name + "_unused"}>

                        <LineChart key={name + "_used_"}
                            // x={this.methodBoxAttr.x+i*(this.methodBoxAttr.width+this.methodBoxAttr.gap)}
                            // y={this.methodBoxAttr.y}
                            x={getXcorr(index)}
                            y={getYcorr(index)}
                            width={this.methodBoxAttr.width}
                            height={this.methodBoxAttr.height}
                            methodDef={methodsDef[name]}
                            classifiers={[]}
                            name={name}
                            totallen={maxnum}
                            onClick={this.props.onSelectMethod}
                            hyperpartitoins = {[]}
                            flower={flower}
                            methodBoxAttr={this.methodBoxAttr}
                            methodSelected={mymethodSelected}
                            onMethodsCheckBoxChange={this.props.onMethodsCheckBoxChange}
                            mode={1}
                        />
                        


                        </g>)
                    
                })
            } </g>
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
    flower:number,
    methodBoxAttr:any,
    methodSelected:any,
    onMethodsCheckBoxChange:(e:any)=>void,
    mode:number


}
/*class UnusedLineChart extends React.Component<UnusedLineChartProps,{}>{

}*/
class LineChart extends React.Component<LineChartProps, {}>{
    TAG = "LineChart_";
    mode = 0;
    componentDidMount() {
        this.mode = this.props.mode;
        if(this.props.mode==0){
            this.renderD3(0);
        }else if(this.props.mode==1){
            this.renderD3_unused(0);
        }
    }
    
    componentDidUpdate(){
        if(this.props.mode == this.mode){
            if(this.props.mode==0){
                this.renderD3(1);
            }else if(this.props.mode==1){
                this.renderD3_unused(1);
            }
        }else{
            // unequal
            if(this.props.mode==0){
                this.renderD3(0);
            }else if(this.props.mode==1){
                this.renderD3_unused(0);
            }
        }
        this.mode = this.props.mode;
        
    }
    renderD3_unused(mode:number) {
        // Get Datasets
       
        let margin = { top: 0, right: 2, bottom: 0, left: 2 },
            width = this.props.width - margin.left - margin.right,
            height = this.props.height - margin.top - margin.bottom,
            top_margin = { top: this.props.y, left: this.props.x };
        console.log(height);
       
        let trans = d3.transition()
                            .duration(1000)
                            .ease(d3.easeLinear);

       
        let top_svg = d3.select("#unused_" + this.TAG + this.props.name);
        top_svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        

        let top_checkbox = d3.select("#checkbox_"+this.props.name);
        if(mode==1){
            top_checkbox = top_checkbox.transition(trans);
        }
        top_checkbox
        .attr("x",this.props.x-15)
        .attr("y",this.props.y-20);

        /////////////////////////////////////////////
        // Top SVG
        let select_top_svg = top_svg;
        if(mode==1){
            select_top_svg = top_svg.transition(trans);
        }
        select_top_svg.attr("transform", "translate(" + top_margin.left + "," + top_margin.top + ")");
        // Rect
        let select_top_svg_rect = top_svg.selectAll(`rect.${this.props.name}`).data([1]);
        select_top_svg_rect.enter().append("rect").attr('class', `${this.props.name} methodRect`)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("fill", "white")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray","5,5")
            .attr("stroke",  "#E0D6D4");
           
        select_top_svg_rect.transition(trans)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("fill", "white")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray","5,5")
            .attr("stroke", "#E0D6D4");
        select_top_svg_rect.exit().remove();
        // Rect end

        let imageData = [];
        for(let i = 1;i<=this.props.flower;i++){
            imageData.push(i);
            
        }
        let image = top_svg.selectAll("image.rec_image").data(imageData);
        
        image.enter().append('image').attr("class","rec_image")
                .attr('width',15)
                .attr('height',15)
                .attr('opacity',0.5)
                .attr('xlink:href',"small_hint.png")
                .attr('x',(d:number)=>width-15*d)
                .attr('y',0);
        image.transition(trans).attr('width',15)
                .attr('height',15)
                .attr('opacity',0.5)
                .attr('xlink:href',"small_hint.png")
                .attr('x',(d:number)=>width-15*d)
                .attr('y',0);
        image.exit().transition(trans).attr('opacity',1e-6).remove();
        

    }
    renderD3(mode:number) {
        // Get Datasets
        const { methodDef, classifiers, totallen, selected } = this.props;
       // let usedHpID = Array.from(new Set(classifiers.map(d=>d.hyperpartition_id)))
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
        let total = 0;
        let bestindex = 0;
        // let frequentindex = 0;
        let maxfrequency = 0;
        data.forEach((d: any, i: any) => {
            if (d > 0 && i > bestindex) {
                bestindex = i;
            }
            if (d > maxfrequency) {
                // frequentindex=i;
                maxfrequency = d;
            }
            total += d;
        });
        total;
        let margin = { top: 0, right: 2, bottom: 0, left: 2 },
            width = this.props.width - margin.left - margin.right,
            height = this.props.height - margin.top - margin.bottom,
            top_margin = { top: this.props.y, left: this.props.x };
        console.log(height);
        // Set the ranges
        // let	xScale = d3.scaleLinear().range([0, width]);
        let yScale = d3.scaleBand()
            .rangeRound([height, 0])
            .paddingInner(0.1);
        let	yScale2 = d3.scaleLinear().range([height, 0]);
        yScale2.domain([0, 1]);
        let xScale = d3.scaleLinear().range([0, width]);
        let trans = d3.transition()
                            .duration(1000)
                            .ease(d3.easeLinear);

        xScale.domain([0, totallen]);
        yScale.domain(data.map((d, i) => i/10));
        let top_svg = d3.select("#" + this.TAG + this.props.name);
        top_svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        // ProgressBar Transition
        let top_progressbar = d3.select("#progressbar_"+this.props.name);
        if(mode==1){
            top_progressbar = top_progressbar.transition(trans);
        }
        top_progressbar
        .attr("x",this.props.x+this.props.width-20)
        .attr("y",this.props.y+this.props.height-20);

        let top_checkbox = d3.select("#checkbox_"+this.props.name);
        if(mode==1){
            top_checkbox = top_checkbox.transition(trans);
        }
        top_checkbox
        .attr("x",this.props.x-15)
        .attr("y",this.props.y-20);

        /////////////////////////////////////////////
        // Top SVG
        let select_top_svg = top_svg;
        if(mode==1){
            select_top_svg = top_svg.transition(trans);
        }
        select_top_svg.attr("transform", "translate(" + top_margin.left + "," + top_margin.top + ")");

        // Rect
        let select_top_svg_rect = top_svg.selectAll(`rect.${this.props.name}`).data([1]);
        select_top_svg_rect.enter().append("rect").attr('class', `${this.props.name} methodRect`)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("fill", "white")
            .attr("stroke-width", 2)
            .attr("stroke", selected ? "#A4A0A0" : "#E0D6D4")
            .on('click', ()=>{
                d3.selectAll('rect.methodRect')
                    .attr("stroke", "#E0D6D4")
                d3.select(`rect.${this.props.name}`)
                    .attr('stroke', "#A4A0A0")
                    .attr("stroke-width", 3)
                this.props.onClick(this.props.name)
            });
        
        select_top_svg_rect.transition(trans)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("fill", "white")
            .attr("stroke-width", 2)
            .attr("stroke", selected ? "#A4A0A0" : "#E0D6D4");
        select_top_svg_rect.exit().remove();
        // Rect end

        // Select SVG
        let select_svg = top_svg.selectAll(`svg_${this.props.name}`).data([1]);
        select_svg.enter().append("g").attr("class",`svg_${this.props.name}`)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        select_svg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        select_svg.exit().remove();



        // Bar 
        let method_bar = select_svg.enter().merge(select_svg).selectAll('.method_bar')
            .data(data);

        method_bar.enter()
            .append("rect")
            .attr("class", "method_bar")
            .style("fill", getColor(methodDef.name))
            .attr("x", 0)
            .attr("y", (d: any, i: number) => (
                yScale(i/10)
            ))
            .attr("width", (d: any) => xScale(d))
            .attr("height", yScale.bandwidth())
        method_bar.style("fill", getColor(methodDef.name))
            .transition(trans)
            .attr("x", 0)
            .attr("y", (d: any, i: number) => (
                yScale(i/10)
            ))
            .attr("width", (d: any) => xScale(d))
            .attr("height", yScale.bandwidth())
        method_bar.exit().remove();
        // Bar end

        // Text
     let text1 = select_svg.enter().merge(select_svg).selectAll("text.method_name_text1").data([1]);
            text1.enter().append("text").attr("class", "method_name_text1")
            .attr('x', width-2.5)
                    .attr('y',-5)
                    .attr('text-anchor', "end")
                    .attr("opacity",1)
                    .text(`${" "+bestperformance.toFixed(3)+" "} `);
            text1.text(`${" "+bestperformance.toFixed(3)+" "} `)
                    .transition(trans)
                    .attr('x', width-2.5)
                    .attr('y',-5)
                    .attr("opacity",1)
                    .attr('text-anchor', "end")
                    ;
            text1.exit().remove();
    let bbox1 = select_svg.enter().merge(select_svg).selectAll("text.method_name_text1").node().getBBox();
    let text2 = select_svg.enter().merge(select_svg).selectAll("text.method_name_text2").data([1]);

            text2.enter().append("text").attr("class", "method_name_text2")
            .attr('x', width-55)
            .attr('y',-5)
            .attr('text-anchor', "end")
            .text(`${" "+classifiers.length+" "}`)

            text2.text(`${" "+classifiers.length+" "}`).transition(trans).attr("class", "method_name_text2")
            .attr('x', width-55)
            .attr('y',-5)
            .attr('text-anchor', "end")
            
            text2.exit().remove()
    let bbox2 = select_svg.enter().merge(select_svg).selectAll("text.method_name_text2").node().getBBox();
      
    
    let box1_rect = select_svg.enter().merge(select_svg).selectAll("rect.box1_rect").data([1]);
    
    box1_rect.enter().append("rect").attr("class","box1_rect")
    .attr("x", width-2.5-bbox1.width-2.5)
    .attr("y", -2-bbox1.height)
    .attr("width", bbox1.width+5)
    .attr("height", bbox1.height)
    .style("fill", "#ccc")
    .style("fill-opacity", ".0")
    .style("stroke", selected ? "#A4A0A0" : "#E0D6D4")
    .style("stroke-width", "1.5px");
    box1_rect.transition(trans)
    .attr("x", width-2.5-bbox1.width-2.5)
    .attr("y", -2-bbox1.height)
    .attr("width", bbox1.width+5)
    .attr("height", bbox1.height)
    .style("fill", "#ccc")
    .style("fill-opacity", ".0")
    .style("stroke", selected ? "#A4A0A0" : "#E0D6D4")
    .style("stroke-width", "1.5px");
    let box2_rect = select_svg.enter().merge(select_svg).selectAll("rect.box2_rect").data([1]);
      
   box2_rect.enter().append("rect").attr("class","box2_rect")
    .attr("x", width-55-bbox2.width-2.5)
    .attr("y", -2-bbox2.height)
    .attr("width", bbox2.width+5)
    .attr("height", bbox2.height)
    .style("fill", "#ccc")
    .style("fill-opacity", ".0")
    .style("stroke", selected ? "#A4A0A0" : "#E0D6D4")
    .style("stroke-width", "1.5px");
    box2_rect.transition(trans).attr("x", width-55-bbox2.width-2.5)
    .attr("y", -2-bbox2.height)
    .attr("width", bbox2.width+5)
    .attr("height", bbox2.height)
    .style("fill", "#ccc")
    .style("fill-opacity", ".0")
    .style("stroke", selected ? "#A4A0A0" : "#E0D6D4")
    .style("stroke-width", "1.5px");
    let imageData = [];
        for(let i = 1;i<=this.props.flower;i++){
            imageData.push(i);
            
        }
        let image = select_svg.enter().merge(select_svg).selectAll("image.rec_image").data(imageData);
        
        image.enter().append('image').attr("class","rec_image")
                .attr('width',15)
                .attr('height',15)
                .attr('opacity',0.5)
                .attr('xlink:href',"small_hint.png")
                .attr('x',(d:number)=>width-15*d)
                .attr('y',0);
        image.transition(trans).attr('width',15)
                .attr('height',15)
                .attr('opacity',0.5)
                .attr('xlink:href',"small_hint.png")
                .attr('x',(d:number)=>width-15*d)
                .attr('y',0);
        image.exit().transition(trans).attr('opacity',1e-6).remove();
        
        let yAxisData = [0.0,0.2,0.4,0.6,0.8];
        let yAxisNumerical = [0.0,0.2,0.4,0.6,0.8];
        if(height>90){
            yAxisData = [];
            yAxisNumerical = [];
            for(let i = 0; i<10;i++){
                yAxisNumerical.push(i/10);
                yAxisData.push((i*10)/100);
            }
        }
        let select_axisText = select_svg.enter().merge(select_svg).selectAll("g.yaxisText").data([1]);
        
        select_axisText.enter().append("g").attr("class","yaxisText")
        .attr('transform', `translate(${0}, 0)`)
        .call(d3.axisLeft(yScale2).tickSize(0).tickPadding(9).tickValues(yAxisData).tickFormat(function (d:any,i:number) {
                            return yAxisNumerical[i];
                       }))
        select_axisText.transition(trans).attr('transform', `translate(${0}, 0)`)
        .call(d3.axisLeft(yScale2).tickSize(0).tickPadding(9).tickValues(yAxisData).tickFormat(function (d:any,i:number) {
                            return yAxisNumerical[i];
                       }))

        
        let select_axisTicks = select_svg.enter().merge(select_svg).selectAll("g.yaxisTicks").data([1]);
       
        select_axisTicks.enter().append("g").attr("class","yaxisTicks")
            .attr('transform', `translate(${0}, 0)`)
            .call(d3.axisLeft(yScale2).tickValues([0.0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9]).tickFormat(function (d:any,i:number) {
                            return "";
                       }))
        select_axisTicks.transition(trans).attr('transform', `translate(${0}, 0)`)
            .call(d3.axisLeft(yScale2).tickValues([0.0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9]).tickFormat(function (d:any,i:number) {
                            return "";
                       }))

    }
    render() {
        const { name,classifiers,hyperpartitoins,methodBoxAttr,methodSelected } = this.props;

        if(this.props.mode==0){
            let usedHpID = Array.from(new Set(classifiers.map(d=>d.hyperpartition_id)));
                        //let usedhpidlen = usedHpID.length;
                        let filterhyperpartitionslen = hyperpartitoins.length;
                        if(filterhyperpartitionslen==0){
                            filterhyperpartitionslen=1;
                        }
                        const progressHyperpartiton = (percent:number)=>{
                            return `${usedHpID.length}/${hyperpartitoins.length}`
                        }
            return <g> <g id={this.TAG + name} className='algorithm'/>
                
                            <foreignObject key={name + "_progressbar_"} id={"progressbar_"+name}  width={40} height={40}
                                    >
                                <Progress
                                type="circle"
                                percent={100*usedHpID.length/filterhyperpartitionslen}
                                format={progressHyperpartiton}
                                width={40}
                                strokeWidth={10}
                                />
                                </foreignObject>
                                <foreignObject
                                key={name+"_text_"}
                                width={methodBoxAttr.checkboxWidth}
                                height={methodBoxAttr.checkboxHeight}
                                id={"checkbox_"+name}
                                >

                                <Checkbox
                                key={name+"_checkbox_"} 
                                checked={methodSelected.checked}
                                indeterminate={methodSelected.indeterminate}
                                disabled={methodSelected.disabled}
                                value={name}
                                onChange={this.props.onMethodsCheckBoxChange} >
                                {/*<Tag color={getColor(name)}>{name}</Tag>*/}
                                <Tooltip title={methodsDef[name].fullname}>
                                    <span>{name}</span>
                                    </Tooltip>
                                </Checkbox>

                                </foreignObject>
            </g>
        }else{
                return (<g> <g id={"unused_"+this.TAG + name} className='algorithm'/>
        
                          
                                <foreignObject
                                key={name+"_text_"}
                                width={methodBoxAttr.checkboxWidth}
                                height={methodBoxAttr.checkboxHeight}
                                id={"checkbox_"+name}
                                >

                                <Checkbox
                                key={name+"_checkbox_"} 
                                checked={methodSelected.checked}
                                indeterminate={methodSelected.indeterminate}
                                disabled={methodSelected.disabled}
                                value={name}
                                onChange={this.props.onMethodsCheckBoxChange} >
                                {/*<Tag color={getColor(name)}>{name}</Tag>*/}
                                <Tooltip title={methodsDef[name].fullname}>
                                    <span>{name}</span>
                                    </Tooltip>
                                </Checkbox>

                                </foreignObject>
            </g>)
        }
    }
}
