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
        yextragap:16
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
        let { classifiers, usedMethods, unusedMethods, hyperpartitions,methodSelected} = this.props
        this.width = (this.props.width - 7*this.gap)/2>20?(this.props.width - 7*this.gap)/2:20;
        // public height = (window.innerHeight * 0.94 * 0.9 - this.gap) / (Object.keys(methodsDef).length * 0.5) - this.gap
        this.methodBoxAttr = {
            // width : 70,
            height: this.width * 0.6,
            width: this.width,
            gap: this.gap,
            x: 2*this.gap,
            y: 2*this.gap,
            checkboxY: 2,
            checkboxWidth: 100,
            checkboxHeight: 30,
            yextragap:13
        }


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
                                            Math.floor(i / 7)  * (this.methodBoxAttr.width + 2*this.methodBoxAttr.gap) - 15}
                                        y={this.methodBoxAttr.y +
                                            (i % 7)* (this.methodBoxAttr.height + this.methodBoxAttr.gap+ this.methodBoxAttr.yextragap) - this.methodBoxAttr.gap}
                                        width={this.methodBoxAttr.checkboxWidth}
                                        height={this.methodBoxAttr.checkboxHeight}>

                                       <Checkbox
                                        key={name+"_checkbox_"+(i)}
                                        checked={checked}
                                        indeterminate={indeterminate}
                                        disabled={disabled}
                                        value={name}
                                        onChange={this.props.onMethodsCheckBoxChange} >
                                        {/*<Tag color={getColor(name)}>{name}</Tag>*/}
                                        <Tooltip title={methodsDef[name].fullname}>
                                            <span>{name}</span>
                                            </Tooltip>
                                        </Checkbox>

                                        </foreignObject>
                                  )
                    })}
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
                    let usedHpID = Array.from(new Set(filterclassifier.map(d=>d.hyperpartition_id)));
                    //let usedhpidlen = usedHpID.length;
                    let filterhyperpartitionslen = filterhyperpartitions.length;
                    if(filterhyperpartitionslen==0){
                        filterhyperpartitionslen=1;
                    }
                     const progressHyperpartiton = (percent:number)=>{
                        return `${usedHpID.length}/${filterhyperpartitions.length}`
                    }

                    // if (testin > -1) {
                    //     selected = true;
                    // }
                    //const classifier_num = datarun[name].length;
                    //const top_width = classifier_num*6+60;
                    // this.index++;
                    return (<g key={name + "_g_linechart_" + i}>
                        
                        <LineChart key={name + "_used_" + i}
                            // x={this.methodBoxAttr.x+i*(this.methodBoxAttr.width+this.methodBoxAttr.gap)}
                            // y={this.methodBoxAttr.y}
                            x={
                                this.methodBoxAttr.x +
                                Math.floor(i / 7)  * (this.methodBoxAttr.width + 2*this.methodBoxAttr.gap)
                            }
                            y={
                                this.methodBoxAttr.y +
                                (i % 7)* (this.methodBoxAttr.height + this.methodBoxAttr.gap+ this.methodBoxAttr.yextragap)
                            }
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
                        />
                        <foreignObject key={name + "_progressbar_" + i} x={
                                this.methodBoxAttr.x +
                                Math.floor(i / 7)  * (this.methodBoxAttr.width + 2*this.methodBoxAttr.gap) + this.methodBoxAttr.width-20
                            }
                            y={
                                this.methodBoxAttr.y +
                                (i % 7)* (this.methodBoxAttr.height + this.methodBoxAttr.gap+ this.methodBoxAttr.yextragap) + this.methodBoxAttr.height-20
                            } width={40} height={40}
                            >
                        <Progress
                        type="circle"
                        percent={100*usedHpID.length/filterhyperpartitionslen}
                        format={progressHyperpartiton}
                        width={40}
                        strokeWidth={10}
                        />
                        </foreignObject>
                        
                        
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
                    return (<g
                        key={name + '_unused'}
                        transform={`translate(
                    ${
                            this.methodBoxAttr.x +
                            Math.floor(index / 7)* (this.methodBoxAttr.width + 2*this.methodBoxAttr.gap)
                            },
                    ${
                            this.methodBoxAttr.y +
                            (index % 7)  * (this.methodBoxAttr.height + this.methodBoxAttr.gap+ this.methodBoxAttr.yextragap)
                            }
                )`}
                    >
                        <rect
                            strokeDasharray="5,5"
                            width={this.methodBoxAttr.width}
                            height={this.methodBoxAttr.height}
                            fill="white" strokeWidth={2} stroke="#E0D6D4" />
                        {flowerlist.map((d:number)=>{
                            return <image key={name+"_flower_"+d} opacity={0.5} xlinkHref="small_hint.png" x={this.methodBoxAttr.width-15*d} y={0} width={15} height={15}/>}
                            )}
                        <text
                            x={this.methodBoxAttr.width}
                            y={this.methodBoxAttr.height}
                            textAnchor="end"
                        >
                            {name}
                        </text>
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
    flower:number

}

class LineChart extends React.Component<LineChartProps, {}>{
    TAG = "LineChart_";
    componentDidMount() {
        this.renderD3();
    }
    componentDidUpdate(){
        let g = d3.select("#" +this.TAG + this.props.name)

        g.selectAll('*').remove()
        this.renderD3();
    }
    renderD3() {
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
        let yAxisData: string[] = []
        for (let i = 0; i <= 1 / step; i++) {
            yAxisData.push(`${(i * step).toFixed(2)}`)
        }

        // g
        // Set the dimensions of the canvas / graph
        //let	margin = {top: 0, right: 0, bottom: 0, left: 0},
        let margin = { top: 0, right: 2, bottom: 0, left: 2 },
            width = this.props.width - margin.left - margin.right,
            height = this.props.height - margin.top - margin.bottom,
            top_margin = { top: this.props.y, left: this.props.x };

        // Set the ranges
        // let	xScale = d3.scaleLinear().range([0, width]);
        let yScale = d3.scaleBand()
            .rangeRound([height, 0])
            .paddingInner(0.1);
        let xScale = d3.scaleLinear().range([0, width]);


        xScale.domain([0, totallen]);
        yScale.domain(data.map((d, i) => i/10));
        console.log(data.map((d, i) => i/10))
        //Create SVG element
       // let tooltip = d3.select("#tooltip");
        //let top_methods = d3.select("#methodstop");
        /*
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .attr("id", "tooltip")
                .style("opacity", 0)
                .style("left", "0px")
                .style("top", "0px");;
        }*/
        let top_svg = d3.select("#" + this.TAG + this.props.name).attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom).attr("transform", "translate(" + top_margin.left + "," + top_margin.top + ")")
            // .on("click",()=>{onClick(this.props.name)})
            .on("mousemove", function (d: any) {
                    /*
                tooltip.transition()
                    .duration(100)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                tooltip.style("opacity", 0.7).html(methodDef.fullname + "<br/>" + "best performance:" + bestperformance.toFixed(2) + "<br/>" + "trial number:" + total)
                    */
            })

            .on("mouseout", function (d: any) {
               // tooltip
               //     .style("opacity", 0);
            });;
        top_svg.append("rect")
            .attr('class', `${this.props.name} methodRect`)
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
            })

        let svg = top_svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // var line = d3.line()
        // .x(function(d:any, i:any) { return xScale(d); }) // set the x values for the line generator
        // .y(function(d:any,i:any) { return yScale((i)*step); }) // set the y values for the line generator
        // .curve(d3.curveMonotoneX) // apply smoothing to the line


        // function generateArray(index: number) {
        //     let data: any[] = [];
        //     data.push({ x: 0, y: index * step });
        //     data.push({ x: totallen, y: index * step });
        //     return data;
        // }

        // var straightline = d3.line()
        //     .x(function (d: any, i: any) { return xScale(d.x); }) // set the x values for the line generator
        //     .y(function (d: any, i: any) { return yScale(d.y); }) // set the y values for the line generator
        // svg.append("path")
        //     .datum(generateArray(bestindex))
        //     .attr("class", "line")
        //     .attr("fill", "none")
        //     .attr("stroke", "#E0D6D4")
        //     .attr("stroke-width", 2)
        //     .attr("stroke-dasharray", "5,5")
        //     .attr("d", straightline);
        // svg.append("path")
        //     .datum(generateArray(frequentindex))
        //     .attr("class", "line")
        //     .attr("fill","none")
        //     .attr("stroke","#E0D6D4")
        //     .attr("stroke-width",2)
        //     .attr("stroke-dasharray","5,5")
        //     .attr("d", straightline);
        svg.selectAll('.method_bar')
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "method_bar")
            .style("fill", getColor(methodDef.name))
            .attr("x", 0)
            .attr("y", (d: any, i: number) => (
                yScale(i/10)
            ))
            .attr("width", (d: any) => xScale(d))
            .attr("height", yScale.bandwidth())

        svg.append("text")
            .attr("class", "method_name")
            .attr('x', width)
        //    .attr('y', height-12)
            .attr('y',-3)
            .attr('text-anchor', "end")
            .text(`${classifiers.length} / ${bestperformance.toFixed(3)}`)
       /* svg.append("text")
            .attr("class", "best_score")
            .attr('x', width)
            .attr('y', height )
            .attr('text-anchor', "end")
            .text(`best: ${bestperformance.toFixed(3)}`)*/
        /*svg.append('text')
            .attr('class', 'hps')
            .attr("transform", `translate(${width+margin.left},${height/2}) rotate(${90})`)
            .attr('text-anchor', 'middle')
            .text(`hp:${usedHpID.length}/${hyperpartitoins.length}`)*/
        for(let i = 1;i<=this.props.flower;i++){
            svg.append('image')
                .attr('width',15)
                .attr('height',15)
                .attr('opacity',0.5)
                .attr('xlink:href',"small_hint.png")
                .attr('x',width-15*i)
                .attr('y',0);
        }
        // // Add the X Axis
        // svg.append("g")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(d3.axisBottom(xScale));

        // Add the Y Axis
        svg.append("g")
            .attr('transform', `translate(${-margin.left}, 0)`)
            .call(d3.axisLeft(yScale).tickValues([0.1,0.3,0.5,0.7,0.9]).tickFormat(function (d:any) {

                        return d;}))


    }
    render() {
        const { name } = this.props;
        return <g id={this.TAG + name} className='algorithm'/>
    }
}

// class LineChart2 extends React.Component<LineChartProps, {}>{
//     TAG = "LineChart_";
//     componentDidMount() {
//         this.renderD3();
//     }
//     renderD3() {
//         // Get Datasets
//         const { methodDef, classifiers,totallen,selected } = this.props;
//         let step = 0.1;
//         let data:number[] = [];

//         for (let i =0; i<=1/step; i++){
//             data.push(0)
//         }
//         let bestperformance = 0;
//         classifiers.forEach((classifier:IClassifier)=>{
//             let performance = parseFloat(classifier['performance'].split(' +- ')[0]);
//             if(performance>bestperformance){
//                 bestperformance=performance;
//             }
//             let rangeIdx = Math.floor(performance/step)
//             data[rangeIdx] = data[rangeIdx]+1
//         });
//         let total = 0;
//         let bestindex = 0;
//         // let frequentindex = 0;
//         // let maxfrequency = 0;
//         data.forEach((d:any,i:any)=>{
//             if(d>0&&i>bestindex){
//                 bestindex=i;
//             }
//             // if(d>maxfrequency){
//             //     // frequentindex=i;
//             //     maxfrequency=d;
//             // }
//             total+=d;
//         });
//         //total;
//         let yAxisData:string[] = []
//         for (let i =0; i<=1/step; i++){
//             yAxisData.push(`${(i*step).toFixed(2)}`)
//         }

//         // g
//         // Set the dimensions of the canvas / graph
//         //let	margin = {top: 0, right: 0, bottom: 0, left: 0},
//         let	margin = {top: 1, right: 1, bottom: 1, left: 1},
//             width = this.props.width - margin.left - margin.right,
//             height = this.props.height - margin.top - margin.bottom,
//             top_margin = {top:this.props.y,left:this.props.x};

//         // Set the ranges
//         let	xScale = d3.scaleLinear().range([0, width]);
//         let	yScale = d3.scaleLinear().range([height, 0]);


//         xScale.domain([0, totallen]);
//         yScale.domain([0, 1]);
//         //Create SVG element
//         let tooltip = d3.select("#tooltip");
//         //let top_methods = d3.select("#methodstop");

//         if(tooltip.empty()){
//             tooltip = d3.select("body").append("div")
//             .attr("class", "tooltip")
//             .attr("id","tooltip")
//             .style("opacity", 0)
//             .style("left",  "0px")
//               .style("top",  "0px");;
//         }
//         let top_svg = d3.select("#"+this.TAG+this.props.name).attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom).attr("transform", "translate(" + top_margin.left + "," + top_margin.top + ")")
//         // .on("click",()=>{onClick(this.props.name)})
//         .on("mousemove", function(d:any) {

//             tooltip.transition()
//               .duration(100)
//               .style("left", (d3.event.pageX) + "px")
//               .style("top", (d3.event.pageY - 28) + "px");
//               tooltip.style("opacity", 0.7).html(methodDef.fullname+"<br/>"+"best performance:"+bestperformance.toFixed(2) + "<br/>" + "trial number:"+total)

//             })

//           .on("mouseout", function(d:any) {
//             tooltip
//               .style("opacity", 0);
//             });;
//         top_svg.append("rect")
//         .attr("x",0)
//         .attr("y",0)
//         .attr("width", width + margin.left + margin.right)
//         .attr("height",height + margin.top + margin.bottom)
//         .attr("fill","white")
//         .attr("stroke-width",2)
//         .attr("stroke",selected?"#A4A0A0":"#E0D6D4")
//         ;
//         let svg = top_svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//         let line = d3.line()
//         .x(function(d:any, i:any) { return xScale(d); }) // set the x values for the line generator
//         .y(function(d:any,i:any) { return yScale((i)*step); }) // set the y values for the line generator
//         .curve(d3.curveMonotoneX) // apply smoothing to the line

//         let area = d3.area()
//         .y(function(d:any) { return yScale(d) })
//         .x0(0)
//         .x1(function(d:any) { return xScale(d); })

//         console.info(area, line)

//         function generateArray(index:number){
//             let data:any[] = [];
//             data.push({x:0,y:index*step});
//             data.push({x:totallen,y:index*step});
//             return data;
//         }

//         var straightline = d3.line()
//             .x(function(d:any, i:any) { return xScale(d.x); }) // set the x values for the line generator
//             .y(function(d:any,i:any) { return yScale(d.y); }) // set the y values for the line generator
//         svg.append("path")
//             .datum(generateArray(bestindex))
//             .attr("class", "line")
//             .attr("fill","none")
//             .attr("stroke","#E0D6D4")
//             .attr("stroke-width",2)
//             .attr("stroke-dasharray","5,5")
//             .attr("d", straightline);
//         // svg.append("path")
//         //     .datum(generateArray(frequentindex))
//         //     .attr("class", "line")
//         //     .attr("fill","none")
//         //     .attr("stroke","#E0D6D4")
//         //     .attr("stroke-width",2)
//         //     .attr("stroke-dasharray","5,5")
//         //     .attr("d", straightline);
//         svg.append("path")
//             .datum(data)
//             .attr("class", "line")
//             .attr("fill","none")
//             .attr("stroke",getColor(methodDef.name))
//             .attr("stroke-width",2)
//             .attr("d", line);

//         // svg.append("path")
//         //     .datum(data)
//         //     .attr("class", "line")
//         //     .attr("fill",getColor(methodDef.name))
//         //     .attr("d", area);

//         svg.append("text")
//             .attr("class", "hp_name")
//             .attr('x', width)
//             .attr('y', height)
//             .attr('text-anchor', "end")
//             .text(this.props.name)
//       }
//     render() {
//         const {name}=this.props;
//         return <g id={this.TAG+name}/>
//     }
// }