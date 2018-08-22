//import { Button } from 'antd';
import * as React from 'react';
import * as methodsDef from "../../assets/methodsDef.json";
import { IMethod, IDatarun, IClassifier } from "types";
//import { IDatarun } from "types";
//import { getColor ,RED,YELLOW, getGradientColor} from 'helper';
import { getColor } from 'helper';
import "./MethodsDotBarChart.css"
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
    name:string

}
export default class MethodsDotBarChart extends React.Component<IProps, IState>{
    public render() {
        // const methodLen = Object.keys(methodsDef).length
        let { datarun, height } = this.props
        let usedMethods: string[] = Object.keys(datarun)
        // const usedMethods = ['SVM', 'RF', 'DT', 'MLP',,'GP', 'LR', 'KNN'] // the used methodsDef should be obtained by requesting server the config file
        const unusedMethods = Object.keys(methodsDef).filter((name: string) => usedMethods.indexOf(name) < 0)
        return <div className="methods" style={{height: height+'%', borderTop: ".6px solid rgba(0,0,0, 0.4)"}}>
            {usedMethods.map((name: string, i: number) => {
                const methodDef = methodsDef[name];
                const classifier_num = datarun[name].length;
                const top_width = classifier_num*6+60;
                return <div key={name + '_used'} className="usedMethodContainer"
                    style={{ height: 80, width: top_width }}>
                    <div className="method">
                        <svg style={{ height: '100%', width: '100%' }} id="chart">
                            <BoxPlot x={2} y={2} width={7} height={60} methodDef={methodDef} classifiers={datarun[name]} name={name}/>
                            <DotBarChart x={15} y={2} width={top_width-10} height={60} methodDef={methodDef} classifiers={datarun[name]} name={name}/>
                        </svg>  
                    </div>
                </div>
            })}

            {unusedMethods.map((name: string) => (<div key={name + '_unused'} className='unusedMethod'>{methodsDef[name]['fullname']}</div>))}
        </div>
      
    }
}
class SingleBoxPlot {
    
    boxWhiskers=(d:any)=> {
        return [0, d.length - 1];
      }
      
    boxQuartiles=(d:any)=> {
        const d3 = require("d3");
        return [
            d3.quantile(d, .25),
            d3.quantile(d, .5),
            d3.quantile(d, .75)
        ];
    }
    public width = 1;
    public height = 1;
    public duration = 0;
    public domain : any = null;
    public value = Number;
    public whiskers = this.boxWhiskers;
    public quartiles = this.boxQuartiles;
    public tickFormat : any= null;

    public setdomain(x:any) {
        this.domain = x;
    };

    renderBoxPlot(data:number[],obj:any){
        // obj -> Selection.
        // data -> sequential data.
        const d3 = require("d3");
        
        let width = this.width,
            height = this.height,
            //duration = this.duration,
            domain = this.domain,
           // value = this.value,
            whiskers = this.whiskers,
            quartiles = this.quartiles;
            
        let sortedData = data.sort((a,b)=>{return a - b;});
        let d = sortedData;
        let g = obj;

        let n = sortedData.length,
            min = sortedData[0],
            max = sortedData[n - 1];

        // Compute quartiles. Must return exactly 3 elements.
        var quartileData = quartiles(sortedData);

        // Compute whiskers. Must return exactly 2 elements, or null.
        var whiskerIndices = whiskers && whiskers(sortedData),
            whiskerData = whiskerIndices && whiskerIndices.map(function(i:number) { return sortedData[i]; });

        // Compute outliers. If no whiskers are specified, all data are "outliers".
        // We compute the outliers as indices, so that we can join across transitions!
        var outlierIndices = whiskerIndices
            ? d3.range(0, whiskerIndices[0]).concat(d3.range(whiskerIndices[1] + 1, n))
            : d3.range(n);

        // Compute the new x-scale.
        var x1 = d3.scaleLinear()
            .domain(domain || [min, max])
            .range([height, 0]);

        // Retrieve the old x-scale, if this is an update.
        //var x0 = d3.scaleLinear()
        //    .domain([0, Infinity])
        //    .range(x1.range());

        // Stash the new scale.
        //obj.__chart__ = x1;

        // Note: the box, median, and box tick elements are fixed in number,
        // so we only have to handle enter and update. In contrast, the outliers
        // and other elements are variable, so we need to exit them! Variable
        // elements also fade in and out.

        // Update center line: the vertical line spanning the whiskers.
        var center = g.selectAll("line.center")
            .data(whiskerData ? [whiskerData] : []);
        
        center.enter().insert("line", "rect")
            .attr("class", "center")
            .attr("x1", width / 2)
            .attr("y1", function(d:any) { return x1(d[0]); })
            .attr("x2", width / 2)
            .attr("y2", function(d:any) { return x1(d[1]); })
            .style("opacity", 1);

        // Update innerquartile box.
        var box = g.selectAll("rect.box")
            .data([quartileData]);

        box.enter().append("rect")
            .attr("class", "box")
            .attr("x", 0)
            .attr("y", function(d:any) { return x1(d[2]); })
            .attr("width", width)
            .attr("height", function(d:any) { return x1(d[0]) - x1(d[2]); });

        // Update median line.
        var medianLine =g.selectAll("line.median")
            .data([quartileData[1]]);

        medianLine.enter().append("line")
            .attr("class", "median")
            .attr("x1", 0)
            .attr("y1", x1)
            .attr("x2", width)
            .attr("y2", x1);


        // Update whiskers.
        var whisker = g.selectAll("line.whisker")
            .data(whiskerData || []);

        whisker.enter().insert("line", "circle, text")
            .attr("class", "whisker")
            .attr("x1", 0)
            .attr("y1", x1)
            .attr("x2", width)
            .attr("y2", x1)
            .style("opacity", 1);

        // Update outliers.
        var outlier = g.selectAll("circle.outlier")
            .data(outlierIndices, Number);

        outlier.enter().insert("circle", "text")
            .attr("class", "outlier")
            .attr("r", 5)
            .attr("cx", width / 2)
            .attr("cy", function(i:any) { return x1(d[i]); })
            .style("opacity", 1);
        
    }
}
class BoxPlot extends React.Component<ChartProps, {}>{
    TAG="BoxPlot_";
    componentDidMount() {
        this.renderBoxPlot();
    }
    
    renderBoxPlot(){
        let topx = this.props.x;
        let topy = this.props.y;
        let name = this.props.name;
        let TAG = this.TAG;
        let d3 = require("d3");
        var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = this.props.width - margin.left - margin.right,
        height = this.props.height - margin.top - margin.bottom;

        var min = Infinity,
        max = -Infinity;

        var chart = new SingleBoxPlot();
        chart.whiskers = iqr(1.5);
        chart.width = width;
        chart.height = height;

        d3.csv("morley.csv", function(error:any, csv:any) {
            if (error) throw error;

            var data:any[] = [];

            csv.forEach(function(x:any) {
            //var e : number = Math.floor(x.Expt - 1),
            //    r = Math.floor(x.Run - 1),
            var s = Math.floor(x.Speed),
                d = data[0];
            if (!d) d = data[0] = [s];
            else d.push(s);
            if (s > max) max = s;
            if (s < min) min = s;
            });

            chart.setdomain([600, 1200]);

            d3.select("#"+TAG+name)
            .attr("class", "box")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top);
            var svg_box = d3.selectAll("#"+TAG+name).attr("transform", "translate(" + topx + "," + topy + ")");;
            var g_box = svg_box.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            chart.renderBoxPlot(data[0],g_box);
            
        });

       

        // Returns a function to compute the interquartile range.
        function iqr(k:any) {
            return function(d:any):number[] {
            let arr = chart.quartiles(d)
            var q1 = arr[0],
                q3 = arr[2],
                iqr = (q3 - q1) * k,
                i:number = -1,
                j = d.length;
            while (d[++i] < q1 - iqr);
            while (d[--j] > q3 + iqr);
            return [i, j];
            };
        }
    }
    render() {
        const {name}=this.props;
        return <g id={this.TAG+name}/>
    }
}


class DotBarChart extends React.Component<ChartProps, {}>{
    TAG = "DotBarChart_";
    componentDidMount() {
        this.renderD3();
    }
    renderD3() {
        const d3 = require("d3");
        // Get Datasets
        const { methodDef, classifiers } = this.props;
        let step = 0.1;
        let data:number[] = [];
        
        for (let i =0; i<1/step; i++){
            data.push(0)
        }
        classifiers.forEach((classifier:IClassifier)=>{
            let performance = parseFloat(classifier['performance'].split(' +- ')[0])
            let rangeIdx = Math.floor(performance/step)
            data[rangeIdx] = data[rangeIdx]+1
        });
        let total = 0;
        data.forEach(d=>{
            total+=d;
        });
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
        
        let yAxis = d3.axisLeft()
                    .scale(yScale)
                    .tickFormat(function (d:any) {
                        return "";
                    })
                    .ticks(1);

        xScale.domain([0, total]);
        yScale.domain([0, 1]);
        //Create SVG element
        let top_svg = d3.select("#"+this.TAG+this.props.name).attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom).attr("transform", "translate(" + top_margin.left + "," + top_margin.top + ")");;

        let svg = top_svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //Create Y axis
        svg.append("g")
            .attr("transform", "translate(0,0)")
            .attr("class", "y axis")
            .call(yAxis);

        let groups = svg
        .selectAll("g.group")
        .data( data )
            .enter()
            .append('g')
            .attr("class", "group");
        function generate_array(d:number,index:number){ 
            // index*step -> performance range
            // d -> number

            var arr = new Array(d);
            for(var i=0;i<d;i++){
                arr[i] = {y:(index+0.5)*step,x:i};
            }
            return arr;
        }
        let rectArray = groups.selectAll("g.rectArray")
        .data(function(d:number,i:number) {
            return generate_array(d,i);});

        rectArray.enter()
        .append('g')
        .attr("class", "rectArray")
        .append("rect")
        .style("fill",getColor(methodDef.name))
        .attr("width", 5)
        .attr("height",5)
        .attr("x", function(d:any,i:any) {return d.x*6; })
        .attr("y", function(d:any,i:any) { return yScale(d.y)-2.5; });
        

      }
    render() {
        const {name}=this.props;
        return <g id={this.TAG+name}/>
    }
}
