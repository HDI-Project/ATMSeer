import * as React from 'react';
export interface IProps {
    id: string
}
export interface IState {
    id: ''
};

export default class GenerateSvg extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    render() {
        return (
            <svg 
                id={this.props.id}
                style={{ height: '100%', width: '100%' }}
                xmlns="http://www.w3.org/2000/svg"
            >
                {this.props.children}
            </svg>
        )
    }
}
