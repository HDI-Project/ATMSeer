import * as React from 'react';
import {Tabs} from 'antd';
import DataSelector from './DataSelector';
import DataView from './DataView';
import LeaderBoard from './LeaderBoard';
import { IDatarunStatusTypes } from 'types';
import { IClickEvent } from 'service/dataService';

const TabPane = Tabs.TabPane

export interface SidePanelProps {
    datasetID: number | null;
    datarunID: number | null;
    datarunStatus: IDatarunStatusTypes;
    setDatasetID: (id: number) => void;
    setDatarunID: (id: number) => void;
    setDatarunStatus: (status: IDatarunStatusTypes) => void;
    setTopK: (topK:number)=>void;
    postClickEvent:(e:IClickEvent)=>void;
}

export interface SidePanelState {}

export default class SidePanel extends React.Component<SidePanelProps, SidePanelState> {
    constructor(props: SidePanelProps) {
        super(props);

        this.state = {};
    }

    public render() {
        return (
            <div className="side-panel" style={{overflowY:"hidden"}}>
                <DataSelector {...this.props} />
                <Tabs
                    defaultActiveKey="2"
                >
                    <TabPane tab="Data" key="1">
                        <DataView datarunID={this.props.datarunID} />
                    </TabPane>
                    <TabPane tab="LeaderBoard" key="2">
                        <LeaderBoard
                            datarunID={this.props.datarunID}
                            datarunStatus={this.props.datarunStatus}
                            setDatarunStatus={this.props.setDatarunStatus}
                            setTopK = {this.props.setTopK}
                            postClickEvent = {this.props.postClickEvent}
                        />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}