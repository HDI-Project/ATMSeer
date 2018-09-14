import * as React from "react";
import { IHyperpartitionInfo, IClassifierInfo } from "service/dataService"
import { getColor } from "helper";
//import {Checkbox} from "antd";
import "./HyperPartitions.css";
import {Button,Icon} from 'antd';

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
    onHpsCheckBoxChange: (e:any)=>void,
    width:number,
    height:number,
    onMouseOverClassifier:(e:number)=>void,
    mouseOverClassifier:number

}
export interface IState {
    hiddencol:number,
    visible:boolean,
    leftdisabled:boolean,
    rightdisabled:boolean
}
export default class HyperPartitions extends React.Component<IProps, IState>{
    state={
        hiddencol:0,
        visible:false,
        leftdisabled:false,
        rightdisabled:false
    }
    public hyperpartitionBox = {
        height: 20,
        gap: 8,
        width: 160
    }
    numPerRow = 14
    index= 0;
    lastArray:Array<any>= [];
    onLeftHp = () =>{
        let hiddencol = this.state.hiddencol;
        if(hiddencol<0){
            hiddencol = 0;
        }else if(hiddencol>0){
            hiddencol=hiddencol-1;
        }
        this.setState({
            hiddencol:hiddencol
        })
    }
    onRightHp = () =>{
        let hiddencol = this.state.hiddencol;
        hiddencol=hiddencol+1;
        this.setState({
            hiddencol:hiddencol
        })
    }
    public renderD3(hpsInfo: Array<any>, maxLen: number, selectedMethod: string, hyperpartitionsSelected:any,hiddencol:number,comparedCls:any,nowProps:IProps) {
            console.log("rerender hyperpartitions");
            /*if(this.index>=1){
                console.log("end");
                return;
            }else{
                this.index++;
            }*/
            // let num_all_hp = hpsInfo.length

            hpsInfo = hpsInfo.filter(d=>d.method==selectedMethod).filter(d => d.sortedCls.length > 0);
            console.log("len",hpsInfo.length);
            
            let { height, width, gap } = this.hyperpartitionBox

            let trans = d3.transition()
                    .duration(1000)
                    .ease(d3.easeLinear);

            let x = d3.scaleBand()
                .rangeRound([0, width])
                .paddingInner(0.05);

            let y = d3.scaleLinear()
                .rangeRound([height, 0]);
            x.domain(Array.from(Array(maxLen).keys()))
            y.domain([0, 1]);

            let exceedrow = -1;
            let maxrow = 0;
            let nowrow = 0;
            let lastposx = gap+width*0.5;

            let lastposy = 3*height+gap;
            //let verticalnum = 0;
            //let maxverticalnum = 10;

            let pos = [[lastposx, lastposy]]
            let bundleData : any[]= [];
            for (let i = 0; i < hpsInfo.length; i++) {
                let currentPos = [0, 0]
                //next pos x not changed, y changed
                if(i!=0)lastposx = lastposx + width * 1.5;
                currentPos = [lastposx, lastposy];
                
                
                
                if (lastposx+ width * 1.5 > nowProps.width) {
                    lastposy = lastposy + (2 * height + gap);
                    nowrow ++;
                    if(lastposy + (2 * height + gap)>nowProps.height && exceedrow==-1){
                        exceedrow = nowrow;
                    }
                    lastposx = gap+width*0.5;
                    currentPos = [lastposx, lastposy]
                }
                pos.push(currentPos)
                bundleData.push({
                    ...hpsInfo[i],
                    pos:currentPos,
                    col:nowrow
                })
            }
            maxrow = nowrow+1;
            //console.log("maxcol exceedcol");
            //console.log(maxcol);
            //console.log(exceedcol)
            if(exceedrow==-1){
                let newhiddencol = 0;
                if(newhiddencol != hiddencol || this.state.visible!=false){
                    this.setState({
                        hiddencol:0,
                        visible:false
                    })
                }
                hiddencol = newhiddencol;
            }else{
                let leftdisabled = hiddencol<=0;
                let rightdisabled = hiddencol>=maxrow-exceedrow;
                let newhiddencol = hiddencol;
                if(newhiddencol<=0){
                    newhiddencol=0;
                }
                if(newhiddencol>=maxrow-exceedrow){
                    newhiddencol=maxrow-exceedrow;
                }
                if(this.state.visible != true || this.state.leftdisabled != leftdisabled || this.state.rightdisabled!=rightdisabled || this.state.hiddencol!=newhiddencol){
                    this.setState(
                        {
                            visible:true,
                            leftdisabled:leftdisabled,
                            rightdisabled:rightdisabled,
                            hiddencol:newhiddencol
                        }
                    )
                }
                hiddencol = newhiddencol;
                
            }
            if(exceedrow!=-1){
                exceedrow=hiddencol+exceedrow;
            }else{
                exceedrow=maxrow+1;
            }
            //console.log("hiddencol");
           // console.log(hiddencol);
            bundleData.forEach((d:any)=>{
                if(d.col<hiddencol){
                    d.pos[1]=d.pos[1]-2*height-gap-(2 * height + gap)*(hiddencol);
                }else{
                    if(d.col>=exceedrow){
                        d.pos[1]=d.pos[1]-(2 * height + gap)*(d.col)+nowProps.height+(2 * height + gap)*(d.col-exceedrow);
                     }else{
                        d.pos[1]=d.pos[1]-(2 * height + gap)*(hiddencol);
                     }

                }
            })
            //enter
            let strokeWidth = 1

            let hps = d3
                .select('g.HyperPartitions')
                .selectAll(`g.hpGroup`)
                .data(bundleData,function(d:any){
                    return d.id;
                })
                console.log(hps);
                console.log(hps.enter().size());
                console.log(hps.size());
                console.log(hps.exit().size());
            //--------------Enter Phase-------------------//
            let hpGroupEnter = hps
                .enter()
                .append("g")
                .attr('class', 'hpGroup')
                .attr("transform",
                    (d: any, i: number) => {
                        return `translate(${d.pos[0]},${d.pos[1]})`
                    }
                );
            hpGroupEnter.append('rect')
                .attr('class', "out_hyperPartition")
                .attr('height', (d: any) => d.method == selectedMethod ? (height + 2 * strokeWidth) : gap)
                .attr('y', (d: any) => d.method == selectedMethod ? (-strokeWidth - height) : (gap))
                .attr('x', -strokeWidth)
                .attr('width', (d: any) => d.method == selectedMethod ? (width + 2 * strokeWidth) : gap)
                .style('fill', (d: any) => d.method == selectedMethod ? 'none' : getColor(d.method))
                .style('stroke', 'gray')
                .style('stroke-width', strokeWidth);
            //ENTER + UPDATE
            //TEXT ENTER
            let textData = hpGroupEnter.merge(hps).filter((d: any) => d.method == selectedMethod)
            .selectAll('g.caption')
            .data((d:any)=>[d],(d:any)=>{
                d.id
            });
            let textEnter = textData
                    .enter()
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
                        height: ${height}px;
                        overflow:hidden;
                        white-space:nowrap';
                        padding: 0px;
                    >
                    <input type="radio" value="${d.id}" ${selected} /> <label> ${d.hyperpartition_string}</label>
                    </div>`
                };
                 //Create SVG element
                let tooltip = d3.select("#tooltip");
                //let top_methods = d3.select("#methodstop");

                if(tooltip.empty()){
                    tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .attr("id","tooltip")
                    .style("opacity", 0)
                    .style("left",  "0px")
                    .style("top",  "0px");;
                }

            textEnter.append('g')
                .attr('class', 'hp_name')
                .attr('transform', `translate(${0}, ${0})`)
                .append('foreignObject')
                .attr('width', width)
                .attr('height', height)
                .append('xhtml:div')
                .attr('class',  'div_caption')
                .html(generateText)
                .on("click",(d:any)=>{
                    nowProps.onHpsCheckBoxChange(d.id);
                }).on("mouseover",(d:any)=>{
                    let length = d.hyperpartition_string.length * 6.5 + 15;
                    tooltip
                    .style("width",length+"px")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                    tooltip.style("opacity", 0.7).html(d.hyperpartition_string)

                })
                .on("mouseout",(d:any)=>{
                    tooltip
                    .style("opacity", 0);

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
            //UPDATE
            hps.transition(trans)
                .attr("transform",
                    (d: any, i: number) => {
                        return `translate(${d.pos[0]},${d.pos[1]})`

                })


            //HPGROUP UPDATE
            //CLASSIFIER REMOVE
            hpGroupEnter.merge(hps).filter((d: any) => d.method != selectedMethod)
                .selectAll('.hpBar')
                .transition(trans)
                .attr('width', 0)
                .attr('height', 0)
                .attr('x', x(0))
                .attr('y', height)
                .remove()
            // ENTER + UPDATE
            let classifierSelect = hpGroupEnter.merge(hps).filter((d: any) => d.method == selectedMethod)
                .selectAll('.hpBar')
                .data((d: any) => {
                    return d.sortedCls
                },function(d:any){
                    return "cls"+d.id;
                });

                let selectOpacity = (d:any)=>{

                    if(nowProps.mouseOverClassifier==d.id){
                        return 1;
                    }else{
                        if(nowProps.mouseOverClassifier==-1){
                            if(comparedCls.length>0){
                                let flag = false;
                                comparedCls.forEach((cls:any)=>{
                                    if(cls.id == d.id){
                                        flag = true;
                                    }
                                })
                                if(flag){
                                    return 1;
                                }else{
                                    return 0.2;
                                }
                            }else{
                                return 1;
                            }
                        }
                        else{
                            return 0.2;
                        }
                    }

                }

               
                //CLASSIFIER ENTER
                classifierSelect.enter().append("rect")
                .attr("class", "hpBar")
                .attr('id', (d:any)=>`_${d.id}`)
                .style('fill', function (d: any) {
                    return getColor(selectedMethod)
                })
                .attr('opacity',selectOpacity)
                .on("mouseover",(d:any)=>{
                    nowProps.onMouseOverClassifier(d.id);
                    tooltip
                    .style("width","40px")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                    tooltip.style("opacity", 0.7).html(d.cv_metric.toFixed(3))

                })
                .on("mouseout",(d:any)=>{
                    nowProps.onMouseOverClassifier(-1);
                    tooltip
                    .style("opacity", 0);

                })
                .attr("x", (d: any, i: number) => x(0))
                .attr("y", (d: any) => 0 )
                .attr("width", 0)
                .attr("height", 0)

                .transition(trans)
                .attr("x", (d: any, i: number) => x(i))
                .attr("y", (d: any) => y(d.cv_metric) - height)
                .attr("width", x.bandwidth())
                .attr("height", (d: any) => (height - y(d.cv_metric)))
                .attr('opacity',selectOpacity)
                //CLASSIFIER UPDATE
                classifierSelect.transition(trans)
                .attr("x", (d: any, i: number) => x(i))
                .attr("y", (d: any) => y(d.cv_metric) - height)
                .attr("width", x.bandwidth())
                .attr("height", (d: any) => (height - y(d.cv_metric)))
                .attr('opacity',selectOpacity)
                classifierSelect.exit().remove();
            //UPDATE
            hps.selectAll('.out_hyperPartition')
                .transition(trans)
                .attr('height', (d: any) => d.method == selectedMethod ? (height + 2 * strokeWidth) : gap)
                .attr('y', (d: any) => d.method == selectedMethod ? (-strokeWidth - height) : (gap))
                .attr('x', -strokeWidth)
                .attr('width', (d: any) => d.method == selectedMethod ? (width + 2 * strokeWidth) : gap)
                .style('fill', (d: any) => d.method == selectedMethod ? 'none' : getColor(d.method))
                .style('stroke', 'gray')
                .style('stroke-width', strokeWidth)
            //ENTER + UPDATE
            //TEXT UPDATE
            let textUpdate = textData;
            textUpdate.exit()
                .transition(trans)
                .attr('opacity', 1e-6)
                .remove()

            textUpdate.selectAll('text.num_cls')
                .attr('x', (d: any) => 1+width * d.sortedCls.length / maxLen - 2)
                .attr('y', -1)
                .text((d: any) => {
                    //console.log(d.id+":"+d.sortedCls.length);
                    return d.sortedCls.length
                }
                )
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
            //.transition(trans)
            //.attr('opacity', 1e-6)
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
            this.renderD3(hpsInfo, maxLen, selectedMethod,hyperpartitionsSelected,this.state.hiddencol,comparedCls,this.props)
        }
        /*
        if (comparedMethods.length>=1|| mouseOverClassifier!=-1){
            let g = d3.select('g.HyperPartitions')
            g.selectAll('rect.hpBar')
            .attr('opacity', 0.2)
            if(mouseOverClassifier==-1 && comparedMethods.length>=1){
                comparedCls.forEach(cls=>{
                    g.select(`rect#_${cls.id}`)
                    .attr('opacity', 1)
                })
            }else if(mouseOverClassifier!=-1){
                g.select(`rect#_${mouseOverClassifier}`)
                    .attr('opacity', 1)
            }
        }else{
            let g = d3.select('g.HyperPartitions')
            g.selectAll('rect.hpBar')
            .attr('opacity', 1)
        }*/
    }
    shouldComponentUpdate(nextProps: IProps, nextStates: IState) {

        let { maxLen, hpsInfo, selectedMethod } = this.sortHpByperformance(nextProps)
        let { compareK, classifiers,hyperpartitionsSelected} = nextProps
        let comparedCls = classifiers.slice(0, compareK)
        let comparedMethods = Array.from(new Set(comparedCls.map(d=>d.method)))
        if (comparedMethods.length==1){
            selectedMethod = comparedMethods[0]
        }

        if (this.props != nextProps || this.props.hyperpartitions.length == 0 || nextStates.hiddencol != this.state.hiddencol) { //update
            d3.selectAll(`.caption`).remove()
            this.renderD3(hpsInfo, maxLen, selectedMethod,hyperpartitionsSelected,nextStates.hiddencol,comparedCls,nextProps)
        }
        //if(this.props.datarunID!=nextProps.datarunID){//remove and redraw
            //d3.select(`.HyperPartitions`).selectAll('*').remove()
        //    this.renderD3(hpsInfo, maxLen, selectedMethod,hyperpartitionsSelected)
        //}
        //
        /*
        if (comparedMethods.length>=1 || mouseOverClassifier!=-1){
            let g = d3.selectAll('g.hpGroup')
            console.info('d3, compare, hyperpartition', comparedMethods, comparedCls)
            g.selectAll('rect.hpBar')
            .attr('opacity', 0.2)

            if(mouseOverClassifier==-1){
                comparedCls.forEach(cls=>{
                    g.select(`rect#_${cls.id}`)
                    .attr('opacity', 1)
                })
            }else{
                g.select(`rect#_${mouseOverClassifier}`)
                    .attr('opacity', 1)
            }
        }else{
            let g = d3.select('g.HyperPartitions')
            g.selectAll('rect.hpBar')
            .attr('opacity', 1)
        }*/

        return true
    }
    //componentWillUpdate(){
    //     this.renderD3()
    // }
    render() {

        // let rectWidth = Math.max(
        //     ...hpsInfo.map(
        //         d=>d.hyperpartition_string.length*fontSize
        //     )
        // )
        //console.log("render hiddencol");
        //console.log(this.state.hiddencol);
        let generateButton = () =>{
            if(this.state.visible){
            return (<foreignObject x={this.props.width-60-35} y={this.props.height/2-35} width={35} height={70}>
                <div>

               <Button type="default" size="small" onClick={this.onLeftHp} disabled={this.state.leftdisabled}>
                <Icon type="up" />
              </Button>
              <Button type="default" size="small" onClick={this.onRightHp} disabled={this.state.rightdisabled}>
                <Icon type="down" />
              </Button>
              </div></foreignObject>
              )
            }else{
                return <g />
            }

        }
        return (<g>{generateButton()}
        <g className={`HyperPartitions`}/></g>)
    }
}

