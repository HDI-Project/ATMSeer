import { } from 'antd';
import * as React from 'react';
import * as methods from "../assets/methods.json";
import { IMethod } from "../types";
import "./Methods.css"


export default class Methods extends React.Component{
    
    public render(){
        const methodLen = Object.keys(methods).length
        return <div className="methods">
        {Object.values(methods).map((method: IMethod, i:number)=>{
            return <div key={method.name+i} className="methodContainer"
                    style={{"height": `${Math.floor(100/methodLen)}%`}}>
                <div className="method">
                    {method.fullname}
                </div>
            </div>
        })}
            </div>
    }
}