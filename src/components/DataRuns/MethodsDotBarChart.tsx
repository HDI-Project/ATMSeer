//import { Button } from 'antd';
import * as React from 'react';
//import * as methodsDef from "../../assets/methodsDef.json";
//import { IMethod, IDatarun, IClassifier } from "types";
import { IDatarun } from "types";
//import { getColor ,RED,YELLOW, getGradientColor} from 'helper';
//import { getColor } from 'helper';
import "./MethodsDotBarChart.css"
//import ReactEcharts from "echarts-for-react";

export interface IState {
}
export interface IProps {
    height: number,
    datarun: IDatarun
}
export default class MethodsDotBarChart extends React.Component<IProps, IState>{
    /*
    componentDidMount() {
        this.renderD3();
      }
    
      componentDidUpdate() {
        this.renderD3();
      }
    
      renderD3() {
        const d3 = require("d3");
            // INPUT
            const dataset =
            [
                { group: "Grp 1" ,category: "Cat 1", count: 1},
                { group: "Grp 1" ,category: "Cat 2", count: 3},
                { group: "Grp 1" ,category: "Cat 3", count: 5},
                { group: "Grp 1" ,category: "Cat 4", count: 4},
                { group: "Grp 2" ,category: "Cat 1", count: 6},
                { group: "Grp 2" ,category: "Cat 2", count: 2},
                { group: "Grp 3" ,category: "Cat 1", count: 5},
                { group: "Grp 3" ,category: "Cat 2", count: 4},
                { group: "Grp 4" ,category: "Cat 1", count: 1},
                { group: "Grp 4" ,category: "Cat 3", count: 4},
                { group: "Grp 4" ,category: "Cat 5", count: 2},
                { group: "Grp 5" ,category: "Cat 2", count: 6},
                { group: "Grp 5" ,category: "Cat 4", count: 2},
                { group: "Grp 5" ,category: "Cat 5", count: 1},
                { group: "Grp 6" ,category: "Cat 1", count: 7},
                { group: "Grp 6" ,category: "Cat 2", count: 3},
                { group: "Grp 6" ,category: "Cat 3", count: 2},
                { group: "Grp 6" ,category: "Cat 4", count: 1},
                { group: "Grp 6" ,category: "Cat 5", count: 5},
                { group: "Grp 6" ,category: "Cat 6", count: 3},
            ];

            let flags :any[] = [], unique_categories = [], unique_groups : any[]=[], l = dataset.length, i;
            for( i=0; i<l; i++) {
                if( flags[dataset[i].category]) continue;
                flags[dataset[i].category] = true;
                unique_categories.push(dataset[i].category);
            }
            flags = [];
            for( i=0; i<l; i++) {
                if( flags[dataset[i].group]) continue;
                flags[dataset[i].group] = true;
                unique_groups.push(dataset[i].group);
            }
            //v3
            //var groupScale = d3.scale.ordinal().domain(unique_groups).rangePoints([0, unique_groups.length - 1]);
            //var categoryScale = d3.scale.ordinal().domain(unique_categories).rangePoints([0, unique_categories.length]);
            
            var groupScale = d3.scaleOrdinal().domain(unique_groups).range([0, unique_groups.length - 1]);
            var categoryScale = d3.scaleOrdinal().domain(unique_categories).range([0, unique_categories.length]);

            // v3
            //var color = d3.scale.category20();
            var color = d3.scaleOrdinal(d3.schemeCategory10);

            // Set the dimensions of the canvas / graph
            var	margin = {top: 20, right: 50, bottom: 50, left: 150},
                width = 800 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            // Set the ranges
            var	xScale = d3.scale.linear().range([50, width]);
            var	yScale = d3.scale.linear().range([height, 50]);
            
            //var xAxis = d3.svg.axis()
            //    .scale(xScale)
            //    .orient("bottom");
            
            var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient("left")
                        .tickFormat(function (d:any) {
                            return unique_groups[d];
                        })
                        .ticks(unique_groups.length)


            var result = dataset.reduce(function(res : {__array:any[]}, obj) {
                if (!(obj.group in res)){
                    var copyObj = Object.assign({}, obj);
                    res.__array.push(res[obj.group] = copyObj);
                }
                else {
                    res[obj.group].count += obj.count;
                }
                return res;
            }, {__array:[]}).__array
                            .sort(function(a,b) { return b.count - a.count; });

            xScale.domain([0,result[0].count + 4]);
            yScale.domain([0,d3.max(dataset,function(d:any){return groupScale(d.group);})]);

            //Create SVG element
            var svg = d3.select("#chart")
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //Create Y axis
            svg.append("g")
                .attr("transform", "translate(50,0)")
                .attr("class", "y axis")
                .call(yAxis);


            function generate_array(d:any){
                var k = 0;
                for(var j=0;j<dataset.length;j++){
                    if(groupScale(dataset[j].group) == groupScale(d.group) && categoryScale(dataset[j].category) < categoryScale(d.category)){
                        k = k + dataset[j].count/2;
                    }
                }

                var arr = new Array(d.count);
                for(var i=0;i<d.count;i++){
                    arr[i] = {y:groupScale(d.group),x:k+i/2,group:d.group,category:d.category};
                }

                return arr;
            }

            var groups = svg
            .selectAll("g.group")
            .data( dataset )
                .enter()
                .append('g')
                .attr("class", "group");

            var rectArray = groups.selectAll("g.rectArray")
            .data(function(d:any) {return generate_array(d);});

            rectArray.enter()
            .append('g')
            .attr("class", "rectArray")
            .append("rect")
            .style("fill",function(d:any){return color("hello");})
            .attr("width", 5)
            .attr("height",5)
            .attr("x", function(d:any,i:any) {return xScale(d.x); })
            .attr("y", function(d:any,i:any) { return yScale(d.y)-2.5; });
            

      }
    */
    public render() {
        // const methodLen = Object.keys(methodsDef).length
        //let { datarun, height } = this.props;
        
        return (<div id="chart" />)

    }
}
/*
class BoxPlot extends React.Component<{}, {}>{
    
    render() {
        return <g />
    }
}


class DotBarChart extends React.Component<{}, {}>{
    
    render() {
        return <g />
    }
}
*/