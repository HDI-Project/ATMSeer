import * as React from "react";
import { IClassifierInfo } from "service/dataService"
import { getColor } from 'helper';
import * as methodsDef from "assets/methodsDef.json";

export interface IProps {
    classifiers: IClassifierInfo[],
    selectedMethod: string
}

const d3 = require("d3");
// Get Datasets

export default class HyperParameters extends React.Component<IProps, {}>{
    render() {
        let { classifiers, selectedMethod } = this.props
        if (selectedMethod) {
            let HyperparameterList: any[] = [];
            let idx = 0
            let methodDef = methodsDef[selectedMethod];
            methodDef.root_hyperparameters.forEach((p: string) => {
                let parameter = methodDef['hyperparameters'][p]
                if (parameter['values']) { //category axis
                } else if (parameter['range']) {//value axis
                    if (parameter['range'].length > 1) { //range in the form of [min, max]
                        HyperparameterList.push({ dim: idx, name: p, type: 'value', min: parameter['range'][0], max: parameter['range'][1], valueType: parameter['type'] })
                    } else { // range in the form of [max]
                        HyperparameterList.push({ dim: idx, name: p, type: 'value', min: 0, max: parameter['range'][0], valueType: parameter['type'] })
                    }

                } else if (parameter['type'] == 'list') { // the hidden layer sizes in MLP
                    for (let hidden_l = 0; hidden_l < parameter['list_length'].length; hidden_l++) {

                        HyperparameterList.push({
                            dim: idx + hidden_l, name: `${p}[${hidden_l}]`, type: 'value',
                            min: 0,
                            max: parameter['element']['range'][1],
                            valueType: parameter['type']
                        })
                    }
                    idx = idx + parameter['list_length'].length - 1

                } else {
                    HyperparameterList.push({
                        dim: idx, name: p, type: 'value', valueType: parameter['type']
                    })
                }
            })

            let box = {
                width: 200,
                height: 100,
                margin: 30
            }
            return <g className="hyperParameters">
                {HyperparameterList.map((hp, i) => {
                    return <HyperParameter key={hp} classifiers={classifiers} hp={hp} idx={i} box={box} />
                })}
            </g>
        } else {
            return <g />
        }

    }
}


export interface HyProps {
    classifiers: IClassifierInfo[],
    hp: any,
    idx: number,
    box: {
        width: number,
        height: number,
        margin: number
    }
}

class HyperParameter extends React.Component<HyProps, {}>{
    TAG = "HyperParameter_";
    componentDidMount() {
        this.renderD3();
    }
    componentWillUnmount() {
        // d3.select("#" + this.TAG + this.props.idx).remove()
    }
    renderD3() {
        let { box, hp, classifiers, idx } = this.props
        let scatterData = classifiers.map(cls => {
            return { hp: cls.hyperparameters[hp.name], score: cls.cv_metric }
        })
        let methodColor = getColor(classifiers[0].method)

        // calculate the area chart
        const num_step = 20
        let areaData: number[][] = Array.from(new Array(num_step).keys()).map(d => [])
        const step = (hp.max - hp.min) / num_step
        scatterData.forEach(d => {
            if (typeof (d.hp) == 'number') {
                let rangeIndex = Math.floor((d.hp - hp.min) / step)
                rangeIndex = rangeIndex >= num_step ? (num_step - 1) : rangeIndex
                areaData[rangeIndex].push(d.score)
            }
        })
        areaData.push(areaData[areaData.length - 1])

        //draw
        let { width, height, margin } = box
        let svg = d3.select("#" + this.TAG + idx)
            .append('g')
            .attr('transform', `translate(${0}, ${margin + idx * (height + margin)})`)


        let x = d3.scaleLinear().range([0, width])
        let y = d3.scaleLinear().range([height, 0]);
        let yNum = d3.scaleLinear().range([0, height / 3]);
        x.domain([hp.min, hp.max]);
        y.domain([0, 1]);
        yNum.domain(d3.extent(areaData, (d: number[]) => d.length))

        let area = d3.area()
            .x(function (d: any, i: number) { return x(hp.min + i * step); })
            .y1(height)
            .y0(function (d: any) { return height + yNum(d.length); })
            .curve(d3.curveCardinal)


        // area performance gradient
        svg.append("linearGradient")
            .attr("id", `area-gradient-${hp.name}`)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", width).attr("y2", 0)
            .selectAll("stop")
            .data(areaData)
            .enter().append("stop")
            .attr("offset", (d: any, i: number) => i / num_step)
            .attr("stop-color", methodColor)
            .attr('stop-opacity', (d: number[]) => (d.reduce((m, n) => m + n, 0) || 0) / d.length)

        //area chart
        svg.append('g')
            .attr('class', 'areaGroup')
            .selectAll('.area')
            .data([areaData])
            .enter()
            .append('path')
            .attr('class', 'area')
            .attr('d', area)
            .style('fill', `url(#area-gradient-${hp.name})`)



        //scatter chart
        svg.append('g')
            .attr('class', 'dotGroup')
            .selectAll(".dot")
            .data(scatterData)
            .enter().append("circle")
            .attr("class", 'dot')
            .attr("r", 3)
            .attr("cx", function (d: any) { return x(d.hp); })
            .attr("cy", function (d: any) { return y(d.score); })
            .style('fill', getColor(classifiers[0].method))

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // x axis lable;
        svg.append("text")
            .attr("transform",
                "translate(" + (width + margin / 2) + " ," +
                (height + margin / 2) + ")")
            .style("text-anchor", "start")
            .text(hp.name);

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - 1.5 * margin)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("F_score");

    }
    render() {
        return <g id={this.TAG + this.props.idx} />
    }
}