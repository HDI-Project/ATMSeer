import * as React from "react";
import { IHyperpartitionInfo, IClassifierInfo } from "service/dataService"
import { getColor } from "helper";
//import {Checkbox} from "antd";
import "./HyperPartitions.css";

// import { IDatarun } from "types";
const d3 = require("d3");
export interface IProps {
    hyperpartitions: IHyperpartitionInfo[],
    // datarun: IDatarun,
    datarunID: number|null,
    selectedMethod: string,
    classifiers: IClassifierInfo[],
    compareK: number,
    hyperpartitionsSelected:number[],
    onHpsCheckBoxChange: (e:any)=>void

}
export interface IState {

}
export default class HyperPartitions extends React.Component<IProps, IState>{
    public hyperpartitionBox = {
        height: 20,
        gap: 8,
        width: 160
    }
    numPerRow = 14
    public renderD3(hpsInfo: Array<any>, maxLen: number, selectedMethod: string, hyperpartitionsSelected:any) {
            console.log("rerender hyperpartitions");
            // let num_all_hp = hpsInfo.length
            hpsInfo = hpsInfo.filter(d => d.sortedCls.length > 0)
            let { height, width, gap } = this.hyperpartitionBox

            // let g = d3.select('.HyperPartitions')
            //     .append('g')
            //     .attr('class', `HyperPartitions_${selectedMethod}`)
            // // let x = d3.scaleLinear()
            // //         .rangeRound([0, width]);

            let trans = d3.transition()
                    .duration(1000)
                    .ease(d3.easeLinear);

            let x = d3.scaleBand()
                .rangeRound([0, width])
                .paddingInner(0.05);

            let y = d3.scaleLinear()
                .rangeRound([height, 0]);
            x.domain(Array.from(Array(maxLen).keys()))
            // x.domain([0,10])
            y.domain([0, 1]);

            let lastposx = gap+0.5*width;
            let lastposy = height;
            let horizontalnum = 0;
            let maxhorizontalnum = 10;

            let pos = [[lastposx, lastposy]]

            for (let i = 0; i < hpsInfo.length; i++) {
                let currentPos = [0, 0]
                if (hpsInfo[i].method == selectedMethod) {
                    //next pos x not changed, y changed
                    lastposy = lastposy + (2 * height + gap);
                    currentPos = [lastposx, lastposy]
                    horizontalnum = 0;
                } else { 
                    if(horizontalnum == 0){
                        lastposy = lastposy + (2*gap);
                    }
                    if(horizontalnum<maxhorizontalnum){
                         //next pos x changed, y not changed
                        currentPos = [lastposx + (2*gap*horizontalnum), lastposy]
                        horizontalnum++;
                    }else{
                        lastposy = lastposy + (2*gap);
                        currentPos = [lastposx, lastposy]
                        horizontalnum = 1;
                    }
                    
                }
                if (lastposy > window.innerHeight * 0.8) {
                    lastposx = lastposx + width * 1.5;
                    lastposy = height + (
                        hpsInfo[i].method == selectedMethod?
                        (2 * height + gap)
                        :(2*gap)
                    );
                    currentPos = [lastposx, lastposy]
                }
                pos.push(currentPos)
            }

            //enter
            let hps = d3
                .select('g.HyperPartitions')
                .selectAll(`g.hpGroup`)
                .data(hpsInfo)
            let hpGroup = hps
                .enter()
                .append("g")
                .attr('class', 'hpGroup')
                .attr("transform",
                    (d: any, i: number) => {
                        return `translate(${pos[i + 1][0]},${pos[i + 1][1]})`
                    }
                )

            hps.filter((d: any) => d.method == selectedMethod)
                .selectAll('.hpBar')
                .data((d: any) => d.sortedCls)
                .enter().append("rect")
                .attr("class", "hpBar")
                .attr('id', (d:any)=>`_${d.id}`)
                .style('fill', function (d: any) {
                    return getColor(selectedMethod)
                })
                .attr("x", (d: any, i: number) => x(0))
                .attr("y", (d: any) => height )
                .attr("width", 0)
                .attr("height", 0)
                .transition(trans)
                .attr("x", (d: any, i: number) => x(i))
                .attr("y", (d: any) => y(d.cv_metric) - height)
                .attr("width", x.bandwidth())
                .attr("height", (d: any) => (height - y(d.cv_metric)))


            // hpGroup.append('g')
            // .attr('transform', (d:any)=>`translate(${width*d.scores.length/maxLen}, 0)`)
            // .attr('class', 'axis')
            // .call(d3.axisRight(y))

            let strokeWidth = 1

            hpGroup.append('rect')
                .attr('class', "out_hyperPartition")
                .attr('height', (d: any) => d.method == selectedMethod ? (height + 2 * strokeWidth) : gap)
                .attr('y', (d: any) => d.method == selectedMethod ? (-strokeWidth - height) : (gap))
                .attr('x', -strokeWidth)
                .attr('width', (d: any) => d.method == selectedMethod ? (width + 2 * strokeWidth) : gap)
                .style('fill', (d: any) => d.method == selectedMethod ? 'none' : getColor(d.method))
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

            let textEnter = hps.filter((d: any) => d.method == selectedMethod)
                    .append('g')
                    .attr('class', 'caption')
            textEnter.append('text')
                .attr('class', "num_cls")
                .attr('x', (d: any) => 1+width * d.sortedCls.length / maxLen - 2)
                .attr('y', -1)
                .text((d: any) => d.sortedCls.length)
                .attr('text-anchor', 'start')


            textEnter.append('text')
                .attr('class', "best_score")
                // .attr('x', (d:any)=>width*d.scores.length/maxLen)
                .attr('x', -gap)
                .attr('y', 0)
                .attr('text-anchor', 'end')
                .text((d: any) => d.bestScore >= 0 ? d.bestScore.toFixed(3) : '')
            
                let generateText = (d:any)=>{
                    let selected="";
                    if(hyperpartitionsSelected.indexOf(d.id)>-1){
                        selected="checked";
                    }
                   
                    return  `<div class="RadioBox"
                        style='text-overflow: ellipsis;
                        width: ${width}px;
                        height: ${height-1}px;
                        overflow:hidden;
                        white-space:nowrap';
                        padding: 0px;
                    >
                    <input type="radio" value="${d.id}" ${selected} /> <label> ${d.hyperpartition_string}</label>
                    </div>`
                };
                
            textEnter.append('g')
                .attr('class', 'hp_name')
                .attr('transform', `translate(${0}, ${1})`)
                .append('foreignObject')
                .attr('width', width)
                .attr('height', height)
                .append('xhtml:div')
                .attr('class',  'div_caption')
                .html(generateText)
                .on("click",(d:any)=>{
                    this.props.onHpsCheckBoxChange(d.id);
                })
                

          
                /*
            return (<foreignObject 
                        key={name+"_text_"+i} 
                        x={ this.methodBoxAttr.x +
                            Math.floor(i / 7)  * (this.methodBoxAttr.width + 2*this.methodBoxAttr.gap)} 
                        y={this.methodBoxAttr.y +
                            (i % 7)* (this.methodBoxAttr.height + this.methodBoxAttr.gap) - this.methodBoxAttr.gap} 
                        width={this.methodBoxAttr.checkboxWidth} 
                        height={this.methodBoxAttr.checkboxHeight}>
                       
                        </foreignObject>
                    )*/
            //update
            hps.transition(trans)
                .attr("transform",
                    (d: any, i: number) => {
                        return `translate(${pos[i + 1][0]},${pos[i + 1][1]})`

                })



            hps.filter((d: any) => d.method != selectedMethod)
                .selectAll('.hpBar')
                .transition(trans)
                .attr('width', 0)
                .attr('height', 0)
                .attr('x', x(0))
                .attr('y', height)
                .remove()

            hps.filter((d: any) => d.method == selectedMethod)
                .selectAll('.hpBar')
                .data((d: any) => d.sortedCls)
                .enter().append("rect")
                .attr("class", "hpBar")
                .attr('id', (d:any)=>`_${d.id}`)
                .style('fill', function (d: any) {
                    return getColor(selectedMethod)
                })
                .attr("x", (d: any, i: number) => x(0))
                .attr("y", (d: any) => height )
                .attr("width", 0)
                .attr("height", 0)
                .transition(trans)
                .attr("x", (d: any, i: number) => x(i))
                .attr("y", (d: any) => y(d.cv_metric) - height)
                .attr("width", x.bandwidth())
                .attr("height", (d: any) => (height - y(d.cv_metric)))

            hps.selectAll('.out_hyperPartition')
                .transition(trans)
                .attr('height', (d: any) => d.method == selectedMethod ? (height + 2 * strokeWidth) : gap)
                .attr('y', (d: any) => d.method == selectedMethod ? (-strokeWidth - height) : (gap))
                .attr('x', -strokeWidth)
                .attr('width', (d: any) => d.method == selectedMethod ? (width + 2 * strokeWidth) : gap)
                .style('fill', (d: any) => d.method == selectedMethod ? 'none' : getColor(d.method))
                .style('stroke', 'gray')
                .style('stroke-width', strokeWidth)

            let textUpdate = hps.filter((d: any) => d.method == selectedMethod)
                .selectAll('g.caption')
                .data((d:any)=>[d])

            textUpdate.exit()
                .transition(trans)
                .attr('opacity', 1e-6)
                .remove()

            textUpdate.selectAll('text.num_cls')
                .attr('x', (d: any) => 1+width * d.sortedCls.length / maxLen - 2)
                .attr('y', -1)
                .text((d: any) => d.sortedCls.length)
                .attr('text-anchor', 'start')
            textUpdate.selectAll('text.best_score')
                // .attr('x', (d:any)=>width*d.scores.length/maxLen)
                .attr('x', -gap)
                .attr('y', 0)
                .attr('text-anchor', 'end')
                .text((d: any) => d.bestScore >= 0 ? d.bestScore.toFixed(3) : '')
            textUpdate.selectAll('g.hp_name')
                .attr('transform', `translate(${0}, ${0})`)
                .select('foreignObject')
                .attr('width', width)
                .attr('height', height)
                .select('.div_caption')
                .html(generateText).attr('opacity', 1e-6)
                .transition(trans)
                .attr('opacity', 1)

            hps.filter((d: any) => d.method != selectedMethod)
                .selectAll('g.caption')
                .transition(trans)
                .attr('opacity', 1e-6)
                .remove()

            // exit()
            hps.exit()
            .transition(trans)
            .attr('opacity', 1e-6)
            .remove()


    }


    public sortHpByperformance(props: IProps) {
        let { hyperpartitions: hps, classifiers, selectedMethod } = props
        // cls = cls.filter(d=>d.method==selectedMethod)
        // hps = hps.filter(d=>d.method==selectedMethod)
        let hpsInfo = hps.map(hp => {
            let filteredCls = classifiers
                .filter(
                    cls => cls.hyperpartition_id == hp.id
                )
            let sortedCls = filteredCls.sort((a, b) => (b.cv_metric - a.cv_metric))
            return {
                ...hp,
                bestScore: Math.max(...sortedCls.map(d=>d.cv_metric)),
                sortedCls
            }
        })
        hpsInfo.sort((a, b) => (b.bestScore - a.bestScore))
        let maxLen = Math.max(...hpsInfo.map(d => d.sortedCls.length))
        if (maxLen < 0) maxLen = 0


        // let filterHps = hps.filter(d => d.method == selectedMethod)
        // let filterHpsInfo = hpsInfo.filter(d => d.method == selectedMethod)

        return { hps, hpsInfo, maxLen, selectedMethod }
    }
    componentDidMount() {
        let { maxLen, hpsInfo, selectedMethod } = this.sortHpByperformance(this.props)

        let { compareK, classifiers,hyperpartitionsSelected} = this.props
        let comparedCls = classifiers.slice(0, compareK)
        let comparedMethods = Array.from(new Set(comparedCls.map(d=>d.method)))
        if (comparedMethods.length==1){
            selectedMethod = comparedMethods[0]
        }
        if(hpsInfo.length>0){
            this.renderD3(hpsInfo, maxLen, selectedMethod,hyperpartitionsSelected)
        }

        if (comparedMethods.length>=1){
            let g = d3.select('g.HyperPartitions')
            g.selectAll('rect.hpBar')
            .attr('opacity', 0.2)

            comparedCls.forEach(cls=>{
                g.select(`rect#_${cls.id}`)
                .attr('opacity', 1)
            })
        }
    }
    shouldComponentUpdate(nextProps: IProps, nextStates: IState) {
        let { maxLen, hpsInfo, selectedMethod } = this.sortHpByperformance(nextProps)
        let { compareK, classifiers,hyperpartitionsSelected} = nextProps
        let comparedCls = classifiers.slice(0, compareK)
        let comparedMethods = Array.from(new Set(comparedCls.map(d=>d.method)))
        if (comparedMethods.length==1){
            selectedMethod = comparedMethods[0]
        }

        if (this.props != nextProps || this.props.hyperpartitions.length == 0) { //update
            this.renderD3(hpsInfo, maxLen, selectedMethod,hyperpartitionsSelected)
        }
        if(this.props.datarunID!=nextProps.datarunID){//remove and redraw
            d3.select(`.HyperPartitions`).selectAll('*').remove()
            this.renderD3(hpsInfo, maxLen, selectedMethod,hyperpartitionsSelected)
        }
        //

        if (comparedMethods.length>=1){
            let g = d3.selectAll('g.hpGroup')
            console.info('d3, compare, hyperpartition', comparedMethods, comparedCls)
            g.selectAll('rect.hpBar')
            .attr('opacity', 0.2)

            comparedCls.forEach(cls=>{
                g.select(`rect#_${cls.id}`)
                .attr('opacity', 1)
            })
        }

        return false
    }
    // componentWillUpdate(){
    //     this.renderD3()
    // }
    render() {

        // let rectWidth = Math.max(
        //     ...hpsInfo.map(
        //         d=>d.hyperpartition_string.length*fontSize
        //     )
        // )
        return <g className={`HyperPartitions`} />
    }
}

