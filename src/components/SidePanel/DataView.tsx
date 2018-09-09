import * as React from 'react';
import { getDatasetCSV } from 'service/dataService';
import FeatureChart from './FeatureChart';
import {EChartsColor} from "helper";

import "./DataView.css";

export interface IProps{
    // setDatarunID: (id:number)=>void
    datasetID: number | null,
}

export interface IState {
    dataset: IFeature[],
    fileList: any[],
    running: boolean
}
export interface IFeature {
    name: string,
    data: any[] // Revised number[] to any[]
}
// export interface IDataset{
//     name:string,
//     [key:string]:data
// }
export default class DataView extends React.Component<IProps, IState>{
    // public datarunID:number
    constructor(props: IProps) {
        super(props);
        // this.onChange = this.onChange.bind(this)
        this.state = {
            dataset: [],
            fileList: [],
            running: false
        };
    }
    public async getData() {
        if (this.props.datasetID) {
            const datum = await getDatasetCSV(this.props.datasetID);
            // const res = await axios.get('../../viz/dataset_31_credit-g.csv') // this should be changed to the server response later
            // const datum = res.data
            this.parseData(datum);
        }
    }
    public parseData(csv:string){
        const lines:string[] = csv.split('\n')
        const features: IFeature[] = lines[0].split(',').map(
            (feature: string) => {
                return { name: feature, data: [] };
            });
        lines.splice(0, 1);
        const instances = lines;
        // for each row
        // Revised the data type to support the category feature
        instances.forEach((ins:string) => {
            const values = ins.split(',');
            values.forEach((v, idx)=>{
                let _v = parseFloat(v);
                if(isNaN(_v)){
                    features[idx].data.push(v);
                }else{
                    features[idx].data.push(_v);
                }
            })
        });
        this.setState({
            dataset: features
        });
    }
    public componentDidUpdate(prevProps: IProps, provState: IState) {
        if (this.props.datasetID != prevProps.datasetID) {
            this.getData();
        }
    }
    public componentDidMount() {
        this.getData()
    }

    public render() {

        //render
        const { dataset } = this.state;
        const labels = dataset[dataset.length-1];


        if (labels) {
            const features = dataset.slice(0, dataset.length-1);
            const classSet = new Set(labels.data);
            const classes: (number|string)[] = Array.from(classSet);

            //legend of classes
            const legend = classes.map((className,i)=>{
                return <span key={className} className='classLegend'>
                    <span style={{color: EChartsColor[i],  margin:'2px'}}/>
                    {className}
                    ({labels.data.filter(d=>d==className).length})
                </span>
            })

            return (<div className="data-view">
                <div>
                    <h4>Overview</h4>
                    <hr/>
                    <div>{features.length} features / {dataset[0].data.length} instances / {classes.length} classes {legend}</div>
                </div>
                <div>
                    <h4>Feature Distribution</h4>
                    <hr/>
                    <div className='features' style={{ height:'calc(94vh - 300px)' }}>
                        {features.map((f: IFeature) =>
                            <FeatureChart
                                feature={f} classes={labels}
                                key={f.name} cate_classes={classes}
                            />
                        )}
                    </div>
                </div>

            </div>);
        } else {
            return (<div>
                Please select a dataset.
                </div>);
        }
    }
}


