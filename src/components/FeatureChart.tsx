import ReactEcharts from "echarts-for-react";
import * as React from "react";

import {IFeature} from './DataView';

export default class FeatureChart extends React.Component<{feature:IFeature, classes:IFeature, cate_classes: number[]}>{
    getOption(){
        let {feature, classes, cate_classes} = this.props

        const title = cate_classes.map((d, idx)=>{
            return {
                text: `class_${d}`,
                textBaseline: 'middle',
                textStyle:{
                    fontSize: 12
                },
                top: (idx +  0.2 ) * 100 / (cate_classes.length) + '%',
            } 
        })
        const singleAxis = cate_classes.map((d, idx)=>{
            return {
                left: '20%',
                boundaryGap: false,
                height: '5%',
                top: (idx + 0.2 ) * 100 / (cate_classes.length) + '%',
                axisLabel: {
                    interval: 2
                }
            }
        })
        const series = cate_classes.map((d, f_idx)=>{
            let data:any[] = []
            feature.data.forEach((d, idx)=>{
                if(classes.data[idx]==f_idx){
                    data.push(d)
                }
            })
            return {
                singleAxisIndex: f_idx,
                coordinateSystem: 'singleAxis',
                type: 'scatter',
                data,
            }
        })
        const option = {
            tooltip: {
                position: 'top'
            },
            title,
            singleAxis,
            series,
        };
        return option
    }
    render(){
        const {feature} = this.props
        return <div className="feature" style={{height: '20%'}}>
            <div className='featureTitle'>{feature.name}</div>
            <ReactEcharts 
            option = { this.getOption() }
            style={{height: `100%`, width: '100%'}}
            />
        </div>
    }
}
