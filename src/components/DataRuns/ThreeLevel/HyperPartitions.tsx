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
    hiddencol:number,
    

}
export interface IState {
    hiddencol:number
    visible:boolean
}
export default class HyperPartitions extends React.Component<IProps, IState>{
    state={
        hiddencol:0,
        visible:false
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
    public renderD3(hpsInfo: Array<any>, maxLen: number, selectedMethod: string, hyperpartitionsSelected:any,hiddencol:number,nowProps:IProps) {
            console.log("rerender hyperpartitions");
            /*if(this.index>=1){
                console.log("end");
                return;
            }else{
                this.index++;
            }*/
            // let num_all_hp = hpsInfo.length
            hpsInfo = hpsInfo.filter(d => d.sortedCls.length > 0);
            if(this.lastArray == null){
                this.lastArray = hpsInfo;
            }else{
                let count = 0;
                hpsInfo.forEach(hp=>{
                    let length = -1;
                    this.lastArray.forEach(d=>{
                        if(d.id == hp.id){
                            length = d.sortedCls.length;
                        }
                    })
                    if(length!=-1&&length != hp.sortedCls.length){
                        count = count +1;
                        console.log(hp.id+" "+hp.sortedCls.length);
                    }
                })
                this.lastArray = hpsInfo;
                console.log("count:"+count);
            }
            //console.log(hpsInfo);
            //console.log(selectedMethod);
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
            //let hiddencol = this.props.hiddencol;
            console.log("hiddencol");
            console.log(hiddencol);
            let exceedcol = -1;
            let maxcol = 0;
            let nowcol = 0;
            let lastposx = gap+width*0.5;
            
            let lastposy = height;
            let horizontalnum = 0;
            let maxhorizontalnum = 10;

            let pos = [[lastposx, lastposy]]
            let bundleData : any[]= [];
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
                if (lastposy > nowProps.height) {
                    lastposx = lastposx + width * 1.5;
                    nowcol ++;
                    if(lastposx + width>nowProps.width && exceedcol==-1){
                        exceedcol = nowcol;
                    }
                    
                    
                    lastposy = height + (
                        hpsInfo[i].method == selectedMethod?
                        (2 * height + gap)
                        :(2*gap)
                    );
                    currentPos = [lastposx, lastposy]
                }
                pos.push(currentPos)
                bundleData.push({
                    ...hpsInfo[i],
                    pos:currentPos,
                    col:nowcol
                })
            }
            maxcol = nowcol+1;
            if(exceedcol==-1){
                hiddencol = 0;
                if(this.state.hiddencol != hiddencol){
                    this.setState({
                        hiddencol:0,
                    })
                }
                
            }else{
                if(hiddencol>maxcol-exceedcol){
                    hiddencol = maxcol-exceedcol;
                    if(this.state.hiddencol != hiddencol){

                        this.setState({
                            hiddencol:hiddencol,
                        })
                    }
                }
            }
            if(exceedcol!=-1){
                exceedcol=hiddencol+exceedcol;
            }else{
                exceedcol=maxcol+1;
            }
            bundleData.forEach((d:any)=>{
                if(d.col<hiddencol){
                    d.pos[0]=d.pos[0]-gap-width*0.5-width*1.5*(hiddencol);
                }else{
                    if(d.col>=exceedcol){
                        d.pos[0]=nowProps.width+width*1.5*(d.col-exceedcol);
                     }else{
                        d.pos[0]=d.pos[0]-width*1.5*(hiddencol);
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
                
                //CLASSIFIER ENTER
                classifierSelect.enter().append("rect")
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
                //CLASSIFIER UPDATE
                classifierSelect.transition(trans)
                .attr("x", (d: any, i: number) => x(i))
                .attr("y", (d: any) => y(d.cv_metric) - height)
                .attr("width", x.bandwidth())
                .attr("height", (d: any) => (height - y(d.cv_metric)))
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
            this.renderD3(hpsInfo, maxLen, selectedMethod,hyperpartitionsSelected,this.state.hiddencol,this.props)
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

        if (this.props != nextProps || this.props.hyperpartitions.length == 0 || nextStates.hiddencol != this.state.hiddencol) { //update
            d3.selectAll(`.caption`).remove()
            this.renderD3(hpsInfo, maxLen, selectedMethod,hyperpartitionsSelected,nextStates.hiddencol,nextProps)
        }
        //if(this.props.datarunID!=nextProps.datarunID){//remove and redraw
            //d3.select(`.HyperPartitions`).selectAll('*').remove()
        //    this.renderD3(hpsInfo, maxLen, selectedMethod,hyperpartitionsSelected)
        //}
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
        let generateButton = () =>{
            
            return (<foreignObject x={this.props.width/2} y={this.props.height+20} width={100} height={30}>
                <div>
               <Button type="primary" onClick={this.onLeftHp}>
                <Icon type="left" />
              </Button>
              <Button type="primary" onClick={this.onRightHp}>
                <Icon type="right" />
              </Button>
              </div></foreignObject>
              )
            
        }
        return (<g>{generateButton()}
        <g className={`HyperPartitions`}/></g>)
    }
}

