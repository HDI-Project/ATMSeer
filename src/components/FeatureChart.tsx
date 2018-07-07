import ReactEcharts from "echarts-for-react";
import * as React from "react";
import { prepareBoxplotData } from '../helper';

import { IFeature } from './DataView';

export default class FeatureChart extends React.Component<{ feature: IFeature, classes: IFeature, cate_classes: number[] }>{
    checkFeatureType() {
        let feature_values = this.props.feature.data;
        for (let i = 0, ilen = feature_values.length; i < ilen; i++) {
            let d = feature_values[i];
            if (typeof (d) != 'number') {
                return 'category';
            }
        }
        return 'numerical';

    };
    getOption() {
        let { feature, classes, cate_classes } = this.props
        console.log('type', this.checkFeatureType())
        // const title = cate_classes.map((d, idx)=>{
        //     return {
        //         text: `class_${d}`,
        //         textBaseline: 'middle',
        //         textStyle:{
        //             fontSize: 12
        //         },
        //         top: (idx +  0.2 ) * 100 / (cate_classes.length) + '%',
        //     } 
        // })

        // const singleAxis = cate_classes.map((d, idx)=>{
        //     return {
        //         left: '20%',
        //         boundaryGap: false,
        //         height: '5%',
        //         top: (idx + 0.2 ) * 100 / (cate_classes.length) + '%',
        //         axisLabel: {
        //             interval: 2
        //         }
        //     }
        // })

        const series = cate_classes.map((d, f_idx) => {
            let data: any[] = []
            feature.data.forEach((d, idx) => {
                if (classes.data[idx] == f_idx) {
                    data.push([d, f_idx])
                }
            })
            return {
                type: 'scatter',
                symbolSize: 6,
                itemStyle: {
                    opacity: 0.3
                },
                data,
            }
        })

        let boxData = prepareBoxplotData(
            series.map(d => {
                //from Array<[feature_value, classes_value]> to Array<feature_value>
                return d.data.map(d => d[0])
            }),
            { layout: 'vertical' }
        );
        let boxSeries = {
            type: 'boxplot',
            itemStyle: {
                borderWidth: 1,
                borderColor: '#444',
            },
            data: boxData.boxData
        }

        // series.concat(boxSeries)

        const option = {
            // tooltip: {
            //     position: 'top'
            // },
            legend: {},
            grid: {
                left: '20%',
                height: '60%',
                top: '10%',
            },
            title: { text: feature.name },
            // singleAxis,
            xAxis: {
                type: 'value',
                min: 'dataMin',
                max: 'dataMax',
            },
            yAxis: {
                type: "category",
                data: cate_classes.map(d => 'class_' + d),
                axisLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                axisTick: {
                    show: false
                },
            },
            series: [boxSeries, ...series],
        };

        return option
    };
    getBarChartOption() {

        let { feature, classes, cate_classes } = this.props
        const categorySet = {}
        const categories: string[] = []
        feature.data.forEach((d)=>{
            if(!categorySet[d]){
                categorySet[d] = true
                categories.push(d)
            }
        })
        const xAxisData = categories

        const series = cate_classes.map((f_idx)=>{
            let data: any[] = []
            categories.forEach(()=>{
                data.push(0)
            })
            feature.data.forEach((d, idx)=>{
                if(classes.data[idx] == f_idx){
                    data[categories.indexOf(d)] += 1
                }              
            })
            return {
                name: f_idx,
                type: 'bar',
                data
            }
        })


        let option = {
            title: { text: feature.name },
            legend: {
                // data: ['bar', 'bar2'],
                // align: 'left'
            },
            grid: {
                left: '20%',
                height: '60%',
                top: '10%',
            },
            toolbox: {
                // feature: {
                //     magicType: {
                //         type: ['stack', 'tiled']
                //     },
                //     dataView: {},
                //     saveAsImage: {
                //         pixelRatio: 2
                //     }
                // }
            },
            tooltip: {},
            xAxis: {
                data: xAxisData,
                axisLabel: false
                
                // silent: false,
                // splitLine: {
                //     show: false
                // }
            },
            yAxis: {
            },
            series: [...series],
            animationEasing: 'elasticOut',
            

        };
        return option
    }
    render() {
        if (this.checkFeatureType() == 'category') {
            console.log('props', this.props)
            return <div className="featurex" style={{ height: '15%' }}>
                {/* <div className='featureTitle'>{feature.name}</div> */}
                <ReactEcharts
                    option={this.getBarChartOption()}
                    style={{ height: `100%`, width: '100%' }}
                />
            </div>
        } else {
            return <div className="featurex" style={{ height: '10%' }}>
                {/* <div className='featureTitle'>{feature.name}</div> */}
                <ReactEcharts
                    option={this.getOption()}
                    style={{ height: `100%`, width: '100%' }}
                />
            </div>
        }

    }
}
