//import { Button } from 'antd';
import * as React from 'react';
import * as methodsDef from "../../assets/methodsDef.json";
import { IMethod, IDatarun, IClassifier } from "types";
//import { IDatarun } from "types";
//import { getColor ,RED,YELLOW, getGradientColor} from 'helper';
import { getColor } from 'helper';
import "./MethodsLineChart.css"
//import ReactEcharts from "echarts-for-react";

export interface IState {
}
export interface IProps {
    height: number,
    datarun: IDatarun
}
export interface ChartProps {
    width: number,
    height: number,
    x: number,
    y: number,
    methodDef: IMethod,
    classifiers : IClassifier[],
    name:string,
    totallen:number

}
export default class MethodsLineChart extends React.Component<IProps, IState>{
    public render() {
        // const methodLen = Object.keys(methodsDef).length
        let { datarun, height } = this.props
        let usedMethods: string[] = Object.keys(datarun);
        let totallen = 0;
        usedMethods.forEach((name: string, i: number)=>{
            const classifier_num = datarun[name].length;
            totallen+=classifier_num;
        })
        // const usedMethods = ['SVM', 'RF', 'DT', 'MLP',,'GP', 'LR', 'KNN'] // the used methodsDef should be obtained by requesting server the config file
        //const unusedMethods = Object.keys(methodsDef).filter((name: string) => usedMethods.indexOf(name) < 0)
        return <div className="methods" style={{height: height+'%', borderTop: ".6px solid rgba(0,0,0, 0.4)"}}>
            {usedMethods.map((name: string, i: number) => {
                const methodDef = methodsDef[name];
                //const classifier_num = datarun[name].length;
                //const top_width = classifier_num*6+60;
                return <div key={name + '_used'} className="usedMethodContainer"
                    style={{ height: 75, width: 75 }}>
                    <div className="method">
                        <svg style={{ height: '100%', width: '100%' }} id="chart">
                            <LineChart x={2} y={2} width={60} height={60} methodDef={methodDef} classifiers={datarun[name]} name={name} totallen={totallen}/>
                        </svg>  
                    </div>
                </div>
            })}

            {//unusedMethods.map((name: string) => (<div key={name + '_unused'} className='unusedMethod'>{methodsDef[name]['fullname']}</div>))
            }
        </div>
      
    }
}


class LineChart extends React.Component<ChartProps, {}>{
    TAG = "LineChart_";
    componentDidMount() {
        this.renderD3();
    }
    renderD3() {
        const d3 = require("d3");
        // Get Datasets
        const { methodDef, classifiers,totallen } = this.props;
        let step = 0.1;
        let data:number[] = [];
        
        for (let i =0; i<=1/step; i++){
            data.push(0)
        }
        classifiers.forEach((classifier:IClassifier)=>{
            let performance = parseFloat(classifier['performance'].split(' +- ')[0])
            let rangeIdx = Math.floor(performance/step)
            data[rangeIdx] = data[rangeIdx]+1
        });
        let total = 0;
        let bestindex = 0;
        let frequentindex = 0;
        let maxfrequency = 0;
        data.forEach((d:any,i:any)=>{
            if(d>0&&i>bestindex){
                bestindex=i;
            }
            if(d>maxfrequency){
                frequentindex=i;
                maxfrequency=d;
            }
            total+=d;
        });
        total;
        let yAxisData:string[] = []
        for (let i =0; i<=1/step; i++){
            yAxisData.push(`${(i*step).toFixed(2)}`)
        }
        
        // g
        // Set the dimensions of the canvas / graph
        let	margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = this.props.width - margin.left - margin.right,
            height = this.props.height - margin.top - margin.bottom,
            top_margin = {top:this.props.y,left:this.props.x};

        // Set the ranges
        let	xScale = d3.scaleLinear().range([0, width]);
        let	yScale = d3.scaleLinear().range([height, 0]);
        

        xScale.domain([0, totallen]);
        console.log(totallen);
        console.log(width);
        yScale.domain([0, 1]);
        //Create SVG element
        let top_svg = d3.select("#"+this.TAG+this.props.name).attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom).attr("transform", "translate(" + top_margin.left + "," + top_margin.top + ")");;
        /*top_svg.append("rect")
        .attr("x",0)
        .attr("y",0)
        .attr("width", width + margin.left + margin.right)
        .attr("height",height + margin.top + margin.bottom)
        .attr("fill","none")
        .attr("stroke","#E0D6D4")
        .attr("stroke-width",2);*/
        let svg = top_svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        var line = d3.line()
        .x(function(d:any, i:any) { return xScale(d); }) // set the x values for the line generator
        .y(function(d:any,i:any) { return yScale((i)*step); }) // set the y values for the line generator 
        .curve(d3.curveMonotoneX) // apply smoothing to the line


        function generateArray(index:number){
            let data:any[] = [];
            data.push({x:0,y:index*step});
            data.push({x:totallen,y:index*step});
            return data;
        }

        var straightline = d3.line()
            .x(function(d:any, i:any) { return xScale(d.x); }) // set the x values for the line generator
            .y(function(d:any,i:any) { return yScale(d.y); }) // set the y values for the line generator
        svg.append("path")
            .datum(generateArray(bestindex)) 
            .attr("class", "line") 
            .attr("fill","none")
            .attr("stroke","#E0D6D4")
            .attr("stroke-width",2)
            .attr("stroke-dasharray","5,5")
            .attr("d", straightline); 
        svg.append("path")
            .datum(generateArray(frequentindex)) 
            .attr("class", "line") 
            .attr("fill","none")
            .attr("stroke","#E0D6D4")
            .attr("stroke-width",2)
            .attr("stroke-dasharray","5,5")
            .attr("d", straightline); 
        svg.append("path")
            .datum(data) 
            .attr("class", "line") 
            .attr("fill","none")
            .attr("stroke",getColor(methodDef.name))
            .attr("stroke-width",2)
            .attr("d", line); 
      }
    render() {
        const {name}=this.props;
        return <g id={this.TAG+name}/>
    }
}
