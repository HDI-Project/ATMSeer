import * as React from "react";
import {IHyperpartitionInfo, IClassifierInfo} from "service/dataService"
import { getColor } from "helper";


// import { IDatarun } from "types";
const d3 = require("d3");
export interface IProps{
    hyperpartitions: IHyperpartitionInfo[],
    // datarun: IDatarun,
    classifiers: IClassifierInfo[]
}
export default class HyperPartitions extends React.Component<IProps, {}>{
    public hyperpartitionBox = {
        height: 20,
        gap: 20,
        width: 180
    }
    public generateCurve(){
        let {hpsInfo, maxLen} = this.sortHpByperformance()
        let {height, width, gap} = this.hyperpartitionBox
        let g = d3.select('.HyperPartitions')
        // let x = d3.scaleLinear()
        //         .rangeRound([0, width]);
        let x = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.05);

        let y = d3.scaleLinear()
            .rangeRound([height, 0]);
        x.domain(Array.from(Array(maxLen).keys()))
        // x.domain([0,10])
        y.domain([0, 1]);


        // var area = d3.area()
        // .x(function(d:any,i:number) { return x(i); })
        // .y0(height)
        // .y1(function(d:any) { return y(d); });

        let hpLine = g.selectAll(".hpLine")
        .data(hpsInfo)

        hpLine.enter().append("g")
        .attr("class", "hpLine")
        .merge(hpLine)

        hpLine.exit().remove()

        let hpGroup = hpLine.append("g")
            .attr("transform",
                (d:any, i:number)=>{
                    return `translate(${gap}, ${i*(2*height+gap)+gap})`
                }
            )


    //     <text
    //     className="bestPerformance"
    //     y={height*1}
    //     x={width*hp.scores.length/maxLen}
    // >
    //     {hp.bestScore.toFixed(3)}
    // </text>
    // <text
    // className="hpName"
    // y={height*1.5} x={gap}>
    //     {hp.hyperpartition_string}
    // </text>
    // <text
    //     className="clsNum"
    //     y={height*2.5}
    //     x={width*hp.scores.length/maxLen}
    // >
    // {hp.scores.length}
    // </text>


        hpGroup.selectAll('.bar')
        .data((d:any)=>{
            // currentMethod=d.method
            return d.scores
        })
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d:any, i:number)=>x(i))
        .attr("width", x.bandwidth())
        .attr("y", (d:any)=> y(d))
        .attr("height", (d:any)=>( height - y(d)))
        .style('fill', function(this:any){
            return getColor(d3.select(this.parentNode).datum().method)
        })


        // hpGroup.append('g')
        // .attr('transform', (d:any)=>`translate(${width*d.scores.length/maxLen}, 0)`)
        // .attr('class', 'axis')
        // .call(d3.axisRight(y))

        let strokeWidth = 1

        hpGroup.append('rect')
        .attr('class', "out_hyperPartition")
        .attr('height', height+2*strokeWidth)
        .attr('y', -strokeWidth)
        .attr('x', -strokeWidth)
        .attr('width', width+2*strokeWidth )
        .style('fill', 'none')
        .style('stroke', 'gray')
        .style('stroke-width', strokeWidth)



        // hpGroup.append('rect')
        // .attr('class', "bg_hyperPartition")
        // .attr('height', height)
        // .attr('y', height)
        // .attr('width', (d:any)=>width*d.scores.length/maxLen )
        // .style('fill', (d:any)=>getColor(d.method))
        // .style('stroke', 'white')
        // .style('stroke-width', 2)

        hpGroup.append('text')
        .attr('class', "num_cls")
        .attr('x', (d:any)=>width*d.scores.length/maxLen-2)
        .attr('y', height)
        .text( (d:any)=>d.scores.length)
        .attr('text-anchor', 'end')


        hpGroup.append('text')
        .attr('class', "best_score")
        // .attr('x', (d:any)=>width*d.scores.length/maxLen)
        .attr('x', width+ 2)
        .attr('y', height)
        .text( (d:any)=>d.bestScore.toFixed(3))

        hpGroup.append('g')
        .attr('transform', `translate(${0}, ${height})`)
        .append('foreignObject')
        .attr('width', width)
        .attr('height', height)
        .append('xhtml:div')
        .html((d:any)=>
            `<div
                style='text-overflow: ellipsis;
                width: ${width}px;
                height: ${height}px;
                overflow:hidden;
                white-space:nowrap';
                padding: 2px;
            >
                ${d.hyperpartition_string}
            </div>`
        )

        // hpGroup.append('text')
        // .attr('class', "hp_name")
        // .attr('x', 10)
        // .attr('y', 1.9*height)
        // .text( (d:any)=>d.hyperpartition_string)

    }

    public sortHpByperformance(){
        let {hyperpartitions:hps,classifiers:cls} = this.props
        let hpsInfo = hps.map(hp=>{
            let filteredCls = cls
                    .filter(
                        cls=>cls.hyperpartition_id==hp.id
                    )
            let scores = filteredCls.map(
                        d=>d.cv_metric
                        ).sort((a,b)=>(a-b))
            return {
                ...hp,
                bestScore: Math.max(...scores),
                scores
            }
        })
        hpsInfo.sort((a,b)=>(b.bestScore-a.bestScore))
        let maxLen = Math.max(...hpsInfo.map(d=>d.scores.length))
        if(maxLen<0)maxLen=0
        console.info('hps', maxLen, hpsInfo, hps)
        return {hps, hpsInfo, maxLen}
    }
    componentDidMount(){
        this.generateCurve()
    }
    shouldComponentUpdate(){
        this.generateCurve()
        return false
    }
    render(){

        // let rectWidth = Math.max(
        //     ...hpsInfo.map(
        //         d=>d.hyperpartition_string.length*fontSize
        //     )
        // )
        return <g className="HyperPartitions"/>
    }
}

