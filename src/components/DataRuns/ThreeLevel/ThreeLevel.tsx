import * as React from "react";
import Methods from './Methods';
import HyperPartitions from "./HyperPartitions";
import HyperParameters from "./HyperParameters";
import { IHyperpartitionInfo, IClassifierInfo} from 'service/dataService';
import { IDatarun } from "types";
import * as methodsDef from "assets/methodsDef.json";

export interface IProps {
    height: number,
    datarun: IDatarun,
    datasetID: number | null,
    datarunID: number | null,
    setDatarunID: (id: number) => void,
    hyperpartitions : IHyperpartitionInfo[],
    classifiers: IClassifierInfo[]
}

export interface IState {
    selectedMethod:string
}

export default class ThreeLevel extends React.Component<IProps, IState>{
    constructor(props: IProps){
        super(props)
        this.onSelectMethod = this.onSelectMethod.bind(this)
        this.state={
            selectedMethod: ''
        }
    }

    onSelectMethod(methodName:string){
        console.info('select method', methodName)
        this.setState({selectedMethod: methodName})
    }

    componentDidMount(){

    }

    render(){
        let {datarun, hyperpartitions, classifiers} = this.props
        let {selectedMethod} = this.state
        let usedMethods: string[] = Object.keys(datarun);
        let unusedMethods = Object.keys(methodsDef)
            .filter(
                (name: string) => usedMethods.indexOf(name) < 0
            )
        let svgWidth = window.innerWidth*5/6
        return <div
            style={{
                height: `${this.props.height}%`,
                width: '100%',
                borderTop: ".6px solid rgba(0,0,0, 0.4)"
                }}
            >
            <svg
            style={{ height: '100%', width: '100%' }}
            id="svgChart"
            xmlns="http://www.w3.org/2000/svg"
            >
            <Methods
                datarun={datarun}
                onSelectMethod={this.onSelectMethod}
                usedMethods = {usedMethods}
                unusedMethods = {unusedMethods}
            />
            <g transform={`translate(${svgWidth/3}, 20)`}>
            <text
                textAnchor="middle"
                x={svgWidth/6}
                y={10}
            >HyperPartitions</text>
                <HyperPartitions
                hyperpartitions={hyperpartitions}
                // datarun={datarun}
                selectedMethod={selectedMethod}
                classifiers={classifiers}
                />
            </g>
            <g transform={`translate(${svgWidth/3*2}, 20)`}>
            <text
                textAnchor="middle"
                x={svgWidth/6}
                y={10}
            >HyperParameters of {selectedMethod}</text>
            <HyperParameters classifiers={classifiers} selectedMethod={selectedMethod}/>
            </g>
            </svg>
            </div>
    }
}
