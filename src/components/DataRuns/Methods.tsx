import { } from 'antd';
import * as React from 'react';
import * as methodsDef from "../../assets/methodsDef.json";
import { IMethod, IDatarun, IClassifier } from "../../types";
import { getColor } from '../../helper';
import "./Methods.css"
import ReactEcharts from "echarts-for-react";

export interface IState {
}
export interface IProps {
    height: number,
    datarun: IDatarun
}
export default class Methods extends React.Component<IProps, IState>{

    public render() {
        // const methodLen = Object.keys(methodsDef).length
        let { datarun } = this.props
        let usedMethods: string[] = Object.keys(datarun)
        // const usedMethods = ['SVM', 'RF', 'DT', 'MLP',,'GP', 'LR', 'KNN'] // the used methodsDef should be obtained by requesting server the config file
        const unusedMethods = Object.keys(methodsDef).filter((name: string) => usedMethods.indexOf(name) < 0)
        return <div className="methods">
            {usedMethods.map((name: string, i: number) => {
                const methodDef = methodsDef[name]
                return <div key={name + '_used'} className="usedMethodContainer"
                    style={{ height: `35%`, width: '33%' }}>
                    <div className="method">
                        <Method methodDef={methodDef} classifiers={datarun[name]} />
                    </div>
                </div>
            })}

            {unusedMethods.map((name: string) => (<div key={name + '_unused'} className='unusedMethod'>{methodsDef[name]['fullname']}</div>))}
        </div>

    }
}

class Method extends React.Component<{ methodDef: IMethod, classifiers: IClassifier[] }, {}>{
    getOption() {
        const { methodDef, classifiers } = this.props

        // pepare data for parallel coordinates
        let parallelAxis: any[] = []
        let idx = 0
        methodDef.root_hyperparameters.forEach((p: string) => {
            let parameter = methodDef['hyperparameters'][p]
            if (parameter['values']) { //category axis
                parallelAxis.push({ dim: idx, name: p, type: 'category', data: parameter['values'] })
            } else if (parameter['range']) {//value axis
                if (parameter['range'].length > 1) { //range in the form of [min, max]
                    parallelAxis.push({ dim: idx, name: p, type: 'value', min: parameter['range'][0], max: parameter['range'][1] })
                } else { // range in the form of [max]
                    parallelAxis.push({ dim: idx, name: p, type: 'value', min: 0, max: parameter['range'][0] })
                }

            } else if (parameter['type'] == 'list') { // the hidden layer sizes in MLP
                for (let hidden_l = 0; hidden_l < parameter['list_length'].length; hidden_l++) {

                    parallelAxis.push({
                        dim: idx + hidden_l, name: `${p}[${hidden_l}]`, type: 'value',
                        min: 0,
                        max: parameter['element']['range'][1]
                    })
                }
                idx = idx + parameter['list_length'].length - 1
                // parallelAxis.push({
                //     dim: idx, name:p, type:'value'
                // })

            } else {
                parallelAxis.push({
                    dim: idx, name: p, type: 'value'
                })
            }
        })
        //performance as a value axis
        parallelAxis.push({
            dim: parallelAxis.length,
            name: 'performance',
            type: 'value',
            min: 0,
            max: 1
        })
        //remove axes that only have one value
        parallelAxis = parallelAxis.filter(axis => {
            if (axis.type == 'value') {
                return true
            } else {
                return axis.data.length > 1
            }
        })
        //re organize the dim index after filtering and inserting
        parallelAxis.forEach((p, idx: number) => {
            p['dim'] = idx,
                p['nameRotate'] = 45
            p['axisLabel'] = { rotate: 45 }
            p['gridIndex'] = 0
        })
        let data: any[] = []
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
            let attrs = parallelAxis.map(p => {

                let value = par_dict[p.name]
                if (p.type == 'value') {
                    return parseFloat(value)
                } else {
                    return value
                }
            })
            data.push(attrs)
        }
        ))

        // prepare data for performance histogram
        const step = 0.05
        let histogramData: number[] = []
        for (let i = 0; i < 1 / step; i++) {
            histogramData.push(0)
        }
        classifiers.forEach(classifier => {
            let performance = parseFloat(classifier['performance'].split(' +- ')[0])
            let rangeIdx = Math.floor(performance / step)
            histogramData[rangeIdx] = histogramData[rangeIdx] + 1
        })
        // normalize to 0-1
        let max = Math.max(...histogramData)
        histogramData = histogramData.map(d => d / max)

        let yAxisData: string[] = []
        for (let i = 0; i < 1 / step; i++) {
            yAxisData.push(`${(i * step).toFixed(2)}-${((i + 1) * step).toFixed(2)}`)
        }
        let barSeries = {
            name: methodDef.name,
            type: 'bar',
            coordinateSystem: 'cartesian2d',
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: histogramData,
            itemStyle: {
                color: getColor(methodDef.name),
                opacity: 0.6,
            },
            tooltip: {
                formatter: (params: Object | any[], ticket: string) => {
                    return `${params['seriesName']} between ${params['name']}: ${params['data'] * max}`
                }
            }
        }

        // construct echarts option
        const option = {
            title: {
                text: `${methodDef.fullname}: {term|${classifiers.length}}`,
                left: '0.5%',
                top: '0.5%',
                textStyle: {
                    fontSize: 15,
                    rich: {
                        term: {
                            borderColor: "black",
                            borderWidth: 1,
                            borderRadius: 15,
                            padding: 5
                        }
                    }
                }

            },
            tooltip: {},
            grid: [
                // this grid for the performance histogram
                {
                    id: 0,
                    left: '80%',
                    right: '2%',
                    top: '35%',
                    bottom: '5%',
                }
            ],
            // axis for parallel coordinates
            parallelAxis,
            parallel: {
                gridIndex: 0,
                bottom: '5%',
                left: '5%',
                top: '35%',
                right: '20%',
                // height: '31%',
                // width: '55%',
                parallelAxisDefault: {
                    type: 'value',
                    name: 'performance',
                    nameLocation: 'end',
                    nameGap: 10,
                    splitNumber: 3,
                    nameTextStyle: {
                        fontSize: 14
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#555'
                        }
                    },
                    axisTick: {
                        lineStyle: {
                            color: '#555'
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#555'
                        }
                    }
                }
            },
            // axes for performance histogram
            xAxis: {
                type: 'value',
                gridIndex: 0,
                id: 0,
                show: false,
                axisLabel: {
                    show: false
                }
            },
            yAxis: {
                type: 'category',
                id: 0,
                gridIndex: 0,
                data: yAxisData,
                show: false,
                axisLabel: {
                    show: false
                }
            },
            series: [
                {
                    name: 'parallel',
                    type: 'parallel',
                    smooth: true,
                    inactiveOpacity: 0,
                    activeOpacity: 1,
                    tooltip: {},
                    lineStyle: {
                        normal: {
                            width: 1,
                            opacity: 1,
                            color: getColor(methodDef.name)
                        }
                    },
                    data,
                },

                barSeries,
            ],

        }
        return option
    }
    render() {
        return <ReactEcharts
            option={this.getOption()}
            style={{ height: `100%`, width: '100%' }}
        />
    }
}


