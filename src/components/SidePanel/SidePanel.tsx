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
    activeKey : string,
    setActiveKey : (e:string)=>void
}

export interface SidePanelState {
}

export default class SidePanel extends React.Component<SidePanelProps, SidePanelState> {
    constructor(props: SidePanelProps) {
        super(props);

        this.state = {
        };
    }
    onChange = (activeKey:string) => {
        this.props.setActiveKey(activeKey);
    }
    public render() {
        return (
            <div className="side-panel" style={{overflowY:"hidden"}}>
                <DataSelector {...this.props} />
                <Tabs
                    onChange={this.onChange}
                    activeKey={this.props.activeKey}
                >
                    <TabPane tab="Data" key="1">
                        <DataView datasetID={this.props.datasetID} />
                    </TabPane>
                    <TabPane tab="Overview" key="2">
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
