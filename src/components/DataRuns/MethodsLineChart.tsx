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
    totallen:number,
    methodName?:string,
    onClick:(a:string)=>void,
    selected?:boolean

}
export default class MethodsLineChart extends React.Component<IProps, IState>{
    index = 0;
    state={
        mode : 0,
        selectedMethodName :[],
        selectedHyperpartitionName : []
    };
    onMethodsOverViewClick = (Methods:string)=>{
        // Show Methods
        console.log("onclick");
        let selectedMethodName:string[] = this.state.selectedMethodName;
        let  i = selectedMethodName.indexOf(Methods);
        if (i > -1) {
            selectedMethodName.splice(i, 1);
            this.setState({
                selectedMethodName : selectedMethodName
            });
        }else{
            selectedMethodName.push(Methods);
        
            if(this.state.mode==0){
                this.setState({
                    mode : 1,
                    selectedMethodName : selectedMethodName
                });
            }else{
                this.setState({
                    selectedMethodName : selectedMethodName
                });
            }
        }

        
    };
    onHyperpartitionsOverViewClick = (HyperpatitionName:string)=>{
        //alert("onclick "+HyperpatitionName);
        let selectedHyperpartitionName:string[] = this.state.selectedHyperpartitionName;
        selectedHyperpartitionName.push(HyperpatitionName);
        this.setState({
            mode : 2,
            selectedHyperpartitionName : selectedHyperpartitionName
        });
    };
    public getbestperformance(list:IClassifier[]){
        if(list.length>0){
            let classifierPerformance:number[]=list.map((classifier:IClassifier)=>{
                let performance = parseFloat(classifier['performance'].split(' +- ')[0]);
                return performance;
            });
            classifierPerformance.sort(function(a:any,b:any){
                return b-a;
            });
            return classifierPerformance[0];
        }else{
            return 0;
        }
        
    }
    public render() {
        // const methodLen = Object.keys(methodsDef).length
        let { datarun, height } = this.props;
        let {mode,selectedHyperpartitionName} = this.state;
        let selectedMethodName:string[] = this.state.selectedMethodName;
        selectedHyperpartitionName;
        let usedMethods: string[] = Object.keys(datarun);
        let totallen = 0;
        usedMethods.forEach((name: string, i: number)=>{
            const classifier_num = datarun[name].length;
            totallen+=classifier_num;
        })
        let hyperpartitionData : IDatarun= {};
        let hyperpartition2Method : {[hyperpartition:string]:string}= {};
        let Method2hyperpartition : {[method:string]:string[]} = {};
        usedMethods.forEach((name: string, i: number) => {
            const methodDef = methodsDef[name];
            const classifiers = datarun[name];
            let parameterList: any[] = [];
            let idx = 0;
            methodDef.root_hyperparameters.forEach((p: string) => {
                let parameter = methodDef['hyperparameters'][p]
                if (parameter['values']) { //category axis
                    parameterList.push({ dim: idx, name: p, type: 'category', data: parameter['values'] })
                }
            })
            classifiers.forEach(((classifier: IClassifier, idx: number) => {
                let par_dict = {}
                let parameters = classifier['parameters'].split('; ')
                parameters = parameters.map((p: string) => {
                    let [k, v] = p.split(' = ')
                    return par_dict[k] = v
                })
                // for the hidden layer sizes in MLP
    
                if (par_dict['len(hidden_layer_sizes)']) {
                    for (let i = parseInt(par_dict['len(hidden_layer_sizes)']); i < 3; i++) {
                        par_dict[`hidden_layer_sizes[${i}]`] = 0
                    }
                }
    
                // add perforamce
                par_dict['performance'] = parseFloat(classifier['performance'].split(' +- '))
                let ScatterPlotCategory : any[] = [methodDef.fullname];
                parameterList.forEach(p => {
                    let value = par_dict[p.name]
                    if (p.type == 'category') {
                        ScatterPlotCategory.push(p.name+":"+value);
                    }
                });
                let HyperpartitionName = ScatterPlotCategory.join("\n");
                if(!Method2hyperpartition[name]){
                    Method2hyperpartition[name]=[];
                }
                if(!hyperpartitionData[HyperpartitionName]){
                    hyperpartitionData[HyperpartitionName] = [];
                    Method2hyperpartition[name].push(HyperpartitionName);
                }
                hyperpartitionData[HyperpartitionName].push(classifier);
                hyperpartition2Method[HyperpartitionName] = name;
                
                
            }
            )); 
        });

        //let usedHyperpartitions: string[] = Object.keys(hyperpartitionData);
        if(mode==1||mode==2){
            //is method name exist?
            let flag = 0;
            let len = selectedMethodName.length;
            for(let i = 0;i<len;i++){
                const methodDef = methodsDef[selectedMethodName[i]];
                if(!methodDef||!Method2hyperpartition[selectedMethodName[i]]){
                    flag= 1;
                    break;
                }
            }
            if(len==0){
                flag=1;
            }
            if(flag){
                mode=0;
                selectedHyperpartitionName=[];
                selectedMethodName=[];
                console.log("roll back");
                this.setState({
                    mode : 0,
                    selectedMethodName:[],
                    selectedHyperpartitionName : []
                });
            }
        }
        
            /*
            if(mode==2){
            const methodDef = methodsDef[hyperpartition2Method[selectedHyperpartitionName]];
            if(!methodDef){
                mode=0;
                selectedHyperpartitionName="";
                selectedMethodName="";
                this.setState({
                    mode : 0,
                    selectedMethodName:"",
                    selectedHyperpartitionName : ""
                });
            }*/
        

        // const usedMethods = ['SVM', 'RF', 'DT', 'MLP',,'GP', 'LR', 'KNN'] // the used methodsDef should be obtained by requesting server the config file
        //const unusedMethods = Object.keys(methodsDef).filter((name: string) => usedMethods.indexOf(name) < 0)
        let generateHp = ()=>{
            if(mode==1||mode==2){
                let gap = 20;
                let nowx = 2;
                let lastwidth = 0;
                let hpheight = 70;
                let hpmargin = 12;
                let rectwidth = 5;
                let rectheight = 5;
                let verticalnum = Math.floor((hpheight-hpmargin)/(rectheight+1));
                console.log("verticalnum");
                console.log(verticalnum);

                // horizontalnum should be set to be Math.ceil(num/verticalnum) 
                //let horizontalnum = Math.floor(width/(rectwidth+1));
             let hpname :string[]= [];
             selectedMethodName.forEach((name: string, i: number) =>{
                 hpname = hpname.concat(Method2hyperpartition[name]);
             });
             let performance = hpname.map((name: string, i: number) =>{
                return {value:this.getbestperformance(hyperpartitionData[name]),name:name};
             });
             performance.sort(function(a:any,b:any){
                 return b.value-a.value;
             });
             let sortedhpname = performance.map((d:any)=>{
                 return d.name;
             });

             let array = sortedhpname.map((name: string, i: number) => {
                 nowx+=lastwidth;lastwidth=0;
                 const selectedMethod = hyperpartition2Method[name];
                const methodDef = methodsDef[selectedMethod];
                const hplen:number = hyperpartitionData[name].length;
                let horizontalnum = Math.ceil(hplen/verticalnum);
                let hpwidth = hpmargin + horizontalnum * (rectwidth+1);
                lastwidth = hpwidth+gap;
                return (<HyperpartitionHeatmap 
                    key={name+"_used_"+(++this.index)} 
                    x={nowx} 
                    y={2+85} 
                    width={hpwidth} 
                    height={hpheight} 
                    methodDef={methodDef} 
                    classifiers={hyperpartitionData[name]} 
                    name={"hp"+this.index} 
                    totallen={totallen} 
                    onClick={this.onHyperpartitionsOverViewClick}/>);
             })
             return array;
            }else{
                return <g />
            }
        }; 
        let hpname :string[]= [];
        usedMethods.forEach((name: string, i: number) =>{
            hpname = hpname.concat(Method2hyperpartition[name]);
        });
        let performance = usedMethods.map((name: string, i: number) =>{
           return {value:this.getbestperformance(datarun[name]),name:name};
        });
        performance.sort(function(a:any,b:any){
            return b.value-a.value;
        });
        let sortedusedMethods = performance.map((d:any)=>{
            return d.name;
        });
        return <div className="methods" id="methodstop" style={{height: height+'%', borderTop: ".6px solid rgba(0,0,0, 0.4)"}}>
            <div className="usedMethodContainer"
                    style={{ height: "100%", width: "100%" }}>
                    
                        <svg style={{ height: '100%', width: '100%' }} id="chart">
                            {sortedusedMethods.map((name: string, i: number) => {
                                const methodDef = methodsDef[name];
                                let  testin = selectedMethodName.indexOf(name);
                                let selected = false;
                                if (testin > -1) {
                                    selected = true;
                                }
                                //const classifier_num = datarun[name].length;
                                //const top_width = classifier_num*6+60;
                                this.index++;
                                return <LineChart key={name+"_used_"+this.index} 
                                        x={2+i*85} 
                                        y={2} 
                                        width={70} 
                                        height={70} 
                                        methodDef={methodDef} 
                                        classifiers={datarun[name]} 
                                        name={name} 
                                        totallen={totallen} 
                                        onClick={this.onMethodsOverViewClick}
                                        selected={selected}
                                        />
                                    
                            })}
                            {generateHp()}

                         </svg>  
                    </div>
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
        const { methodDef, classifiers,totallen,onClick,selected } = this.props;
        let step = 0.1;
        let data:number[] = [];
        
        for (let i =0; i<=1/step; i++){
            data.push(0)
        }
        let bestperformance = 0;
        classifiers.forEach((classifier:IClassifier)=>{
            let performance = parseFloat(classifier['performance'].split(' +- ')[0]);
            if(performance>bestperformance){
                bestperformance=performance;
            }
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
        //total;
        let yAxisData:string[] = []
        for (let i =0; i<=1/step; i++){
            yAxisData.push(`${(i*step).toFixed(2)}`)
        }
        
        // g
        // Set the dimensions of the canvas / graph
        //let	margin = {top: 0, right: 0, bottom: 0, left: 0},
        let	margin = {top: 6, right: 6, bottom: 6, left: 6},
            width = this.props.width - margin.left - margin.right,
            height = this.props.height - margin.top - margin.bottom,
            top_margin = {top:this.props.y,left:this.props.x};

        // Set the ranges
        let	xScale = d3.scaleLinear().range([0, width]);
        let	yScale = d3.scaleLinear().range([height, 0]);
        

        xScale.domain([0, totallen]);
        yScale.domain([0, 1]);
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
        let top_svg = d3.select("#"+this.TAG+this.props.name).attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom).attr("transform", "translate(" + top_margin.left + "," + top_margin.top + ")")
        .on("click",()=>{onClick(this.props.name)})
        .on("mousemove", function(d:any) {
            
            tooltip.transition()
              .duration(100)
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
              tooltip.style("opacity", 0.7).html(methodDef.fullname+"<br/>"+"best performance:"+bestperformance.toFixed(2) + "<br/>" + "trial number:"+total)
             
            })
            
          .on("mouseout", function(d:any) {
            tooltip
              .style("opacity", 0);
            });;
        top_svg.append("rect")
        .attr("x",0)
        .attr("y",0)
        .attr("width", width + margin.left + margin.right)
        .attr("height",height + margin.top + margin.bottom)
        .attr("fill","white")
        .attr("stroke",selected?"#A4A0A0":"#E0D6D4")
        .attr("stroke-width",2);
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


class HyperpartitionHeatmap extends React.Component<ChartProps, {}>{
    TAG = "HyperpartitionHeatmap_";
    componentDidMount() {
        this.renderD3();
    }
    renderD3() {
        const d3 = require("d3");
        // Get Datasets
        const { methodDef, classifiers,onClick } = this.props;
        let bestperformance = 0;
        let classifierPerformance:number[]=classifiers.map((classifier:IClassifier)=>{
            let performance = parseFloat(classifier['performance'].split(' +- ')[0]);
            return performance;
        });
        classifierPerformance.sort(function(a:any,b:any){
            return b-a;
        });
        if(classifierPerformance.length>0){
            bestperformance = classifierPerformance[0];
        }
        let total = classifierPerformance.length;

         // g
        // Set the dimensions of the canvas / graph
        //let	margin = {top: 0, right: 0, bottom: 0, left: 0},
        let	margin = {top: 6, right: 6, bottom: 6, left: 6},
            width = this.props.width - margin.left - margin.right,
            height = this.props.height - margin.top - margin.bottom,
            top_margin = {top:this.props.y,left:this.props.x};
        //Create SVG element

        //Create SVG element
        let tooltip_hp = d3.select("#tooltip_hp");
        //let top_methods = d3.select("#methodstop");

        if(tooltip_hp.empty()){
            tooltip_hp = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id","tooltip_hp")
            .style("opacity", 0)
            .style("left",  "0px")
            .style("top",  "0px");;
        }

        let top_svg = d3.select("#"+this.TAG+this.props.name).attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom).attr("transform", "translate(" + top_margin.left + "," + top_margin.top + ")")
        .on("click",()=>{onClick(this.props.name)})
        .on("mousemove", function(d:any) {
            
            tooltip_hp.transition()
              .duration(100)
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
              tooltip_hp.style("opacity", 0.7).html(methodDef.fullname+"<br/>"+"best performance:"+bestperformance.toFixed(2) + "<br/>" + "trial number:"+total)
             
            })
            
          .on("mouseout", function(d:any) {
            tooltip_hp
              .style("opacity", 0);
            });;;
        top_svg.append("rect")
        .attr("x",0)
        .attr("y",0)
        .attr("width", width + margin.left + margin.right)
        .attr("height",height + margin.top + margin.bottom)
        .attr("fill","white")
        .attr("stroke","#E0D6D4")
        .attr("stroke-width",2);
        let svg = top_svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        let rectwidth = 5;
        let rectheight = 5;
        //let verticalnum = Math.floor(height/(rectheight+1));
        // horizontalnum should be set to be Math.ceil(num/verticalnum) 
        let horizontalnum = Math.floor(width/(rectwidth+1));

        let groups = svg
            .append('g')
            .attr("class", "group");
        
        let rectArray = groups.selectAll("g.rectArray")
        .data(classifierPerformance);
        console.log(classifierPerformance.length);
        rectArray.enter()
        .append("rect")
        .style("fill",getColor(methodDef.name))
        .attr("fill-opacity",function(d:any,i:any){return d*0.9+0.1;})
        .attr("width", rectwidth)
        .attr("height",rectheight)
        .attr("x", function(d:any,i:any) {return  (i%horizontalnum)*(rectwidth+1);})
        .attr("y", function(d:any,i:any) { return  Math.floor(i/horizontalnum)*(rectheight+1)-rectheight/2;});
        
            

        
    }

    render() {
        const {name}=this.props;
        return <g id={this.TAG+name}/>
    }
}
