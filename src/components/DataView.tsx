import axios from "axios";
import * as React from "react";

import './DataView.css';

export interface IState {
    dataset: IFeather[]
}
interface IFeather{
    feature: string,
    data: number[]
}
// export interface IDataset{
//     name:string,
//     [key:string]:any
// }
export default class DataView extends React.Component<{}, IState>{
    constructor(props: {}) {
        super(props)
        this.state = {
            dataset: []
        }
    }
    public async getData() {
        const res = await axios.get('../../viz/pollution_1.csv') // this should be changed to the server response later
        const datum = res.data
        const lines = datum.split('\n')
        const features = lines[0].split(',').map(
            (feature:string)=>{
                return {feature: feature, data: []}
            })
        lines.splice(0, 1)
        const instances = lines
        instances.forEach((ins:string) => {
            const values = ins.split(',')
            values.forEach((v, idx)=>{
                features[idx].data.push(v)
            })
        });
        this.setState({
            dataset: features
        })
    }
    public componentDidMount() {
        this.getData()
    }
    public render() {
        const { dataset } = this.state
        const classes = dataset.pop()
        const features = dataset
        console.info(classes)
        return <div className="instances shadowBox">
            {dataset.length > 0 ?
                <div>
                    <div className='datasetInfo' style={{ whiteSpace: "pre" }}>
                        <h6>{dataset.length-1} features</h6>
                        <h6>{dataset[0].data.length} instances</h6>
                        <h6> {} classes </h6>
                    </div>
                    <div>
                        {features.map((f:IFeather)=>{
                            return <div key={f.feature}>
                                    {f.feature}
                                    {/* {f.data.} */}
                                </div>
                        })}
                    </div>

                </div>
                : 
                <div />}
        </div>
    }
}
