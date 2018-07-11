import ReactEcharts from "echarts-for-react";
import * as React from "react";
// import { prepareBoxplotData } from '../helper';

import { IFeature } from './DataView';

export default class FeatureChart extends React.Component<{ feature: IFeature, classes: IFeature, cate_classes: number[] }>{
    checkFeatureType(feature_values:IFeature['data']) {
        
        for (let i = 0, ilen = feature_values.length; i < ilen; i++) {
            let d = feature_values[i];
            if (d && typeof (d) != 'number') {
                return 'category';
            }
        }
        return 'numerical';

    };
    getValOption() {
        let { feature, classes, cate_classes } = this.props
        const barNum = 15 //number of bars in the histogram
        let minFeatureVal = Math.min(...feature.data)
        let maxFeatureVal = Math.max(...feature.data)
        let step = (maxFeatureVal-minFeatureVal)/barNum
        let xAxesData:string[] = []

        for (let i = 0; i<barNum; i++){
            xAxesData.push(`${(minFeatureVal + i*step).toPrecision(3)}~${(minFeatureVal + (i+1)*step).toPrecision(3)}`)
        }

        const series = cate_classes.map((classIdx) => {
            let hisData:number[] = []
            for(let i =0; i<barNum; i++){
                hisData.push(0)
            }
            
            feature.data.forEach((d, idx)=>{
                if(classes.data[idx] == classIdx){
                    let hisIdx = Math.floor((d-minFeatureVal)/step)
                    hisData[hisIdx]+=1
                }
            })
            
            
            return {
                name: 'class_'+classIdx,
                type:'bar',
                data: hisData,
                barGap: '20%',
                barCategoryGap: '10%'
            }
        })

        

        const option = {
            tooltip:{},
            grid: {
                left: '10%',
                height: '50%',
                top: '25%',
            },
            title: { 
                text: feature.name,
                fontSize: '8px',
                top: 0, 
            },
            xAxis: {
                type: 'category',    
                data: xAxesData,
                axisTick:{
                    alighWithLabel: true,
                    interval: 0,
                },
                axisLabel: {
                    rotate: -30,
                    interval:1,
                    fontSize: 10,
                }
            },
            yAxis: {
                type: "value",
                splitNumber: 2,
            },
            // itemStyle:{
            //     opacity: 0.5
            // },
            series,
        }

        return option
       
        // const series = cate_classes.map((classIdx) => {
        //     let data: any[] = []
        //     feature.data.forEach((d, idx) => {
        //         if (classes.data[idx] == classIdx) {
        //             data.push([d, 'class_'+classIdx])
        //         }
        //     })
        //     return {
        //         type: 'scatter',
        //         symbolSize: 6,
        //         itemStyle: {
        //             opacity: 0.3
        //         },
        //         data,
        //     }
        // })

        // let boxData = prepareBoxplotData(
        //     series.map(d => {
        //         //from Array<[feature_value, classes_value]> to Array<feature_value>
        //         return d.data.map(d => d[0])
        //     }),
        //     { layout: 'vertical' }
        // );
        // let boxSeries = {
        //     type: 'boxplot',
        //     itemStyle: {
        //         borderWidth: 1,
        //         borderColor: '#444',
        //     },
        //     data: boxData.boxData
        // }

        // // series.concat(boxSeries)

        // const option = {
        //     // tooltip: {
        //     //     position: 'top'
        //     // },
        //     legend: {},
        //     grid: {
        //         left: '20%',
        //         height: '60%',
        //         top: '10%',
        //     },
        //     title: { text: feature.name },
        //     // singleAxis,
        //     xAxis: {
        //         type: 'value',
        //         min: 'dataMin',
        //         max: 'dataMax',
        //     },
        //     yAxis: {
        //         type: "category",
        //         data: cate_classes.map(d => 'class_' + d),
        //         axisLine: {
        //             show: false
        //         },
        //         axisLabel: {
        //             show: false
        //         },
        //         axisTick: {
        //             show: false
        //         },
        //     },
        //     series: [boxSeries, ...series],
        // };

        // return option
    };
    getCateOption() {

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

        const series = cate_classes.map((classIdx)=>{
            let data: any[] = []
            categories.forEach(()=>{
                data.push(0)
            })
            feature.data.forEach((d, idx)=>{
                if(classes.data[idx] == classIdx){
                    data[categories.indexOf(d)] += 1
                }              
            })
            return {
                name: 'class_'+classIdx,
                type: 'bar',
                barGap:'5%',
                barCategoryGap: '40%',
                data
            }
        })


        let option = {
            title: { 
                text: feature.name ,
                top: 0,
                fontSize: '8px',
            },
            // legend: {
            //     // data: ['bar', 'bar2'],
            //     // align: 'left'
            // },
            grid: {
                left: '10%',
                height: '50%',
                top: '25%',
            },
            
            tooltip: {},
            xAxis: {
                data: xAxisData,
                axisLabel: {
                    interval:0,
                    rotate: -30,
                },
                axisTick: {
                    interval:0
                }
            },
            yAxis: {
            },
            series: [...series],
            animationEasing: 'elasticOut',
            

        };
        return option
    }
    render() {
        let {feature} = this.props
        let featureType = this.checkFeatureType(feature.data)
        let option = featureType == 'numerical'?this.getValOption():this.getCateOption()
        return <div className="featurex" style={{ height: '25%' }}>
                {/* <div className='featureTitle'>{feature.name}</div> */}
                <ReactEcharts
                    option={option}
                    style={{ height: `100%`, width: '100%' }}
                />
            </div>

    }
}
