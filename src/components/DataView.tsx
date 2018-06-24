import axios from "axios";
import * as React from "react";

export interface IState{
datasets: string[]
}
// export interface IDataset{
//     name:string,
//     [key:string]:any
// }
export default class DataView extends React.Component<{}, IState>{
    constructor(props: {}) {
        super(props)
        this.state = {
            datasets:[]
        }
    }
    public async getData() {
        // const res = await axios.get('../../data/csvs/datasets.csv')
        // const datum = res.data
        // const lines = datum.split('\n')
        // this.setState({datasets: lines})
        const res = await

    }
    public componentDidMount(){
        this.getData()
    }
    public render(){
        const {datasets} = this.state
        return <div className="datasets shadowBox">
            {datasets.length>0?
            datasets.map((dataset)=>{
                const values = dataset.split(',')
                return <div key={values[0]}>
                    {values[1]}
                </div>
            })
            :<div/>}
            </div>
    }
}
