import * as React from 'react';
import {Tabs} from 'antd';
import DataSelector from './DataSelector';
import DataView from './DataView';
import LeaderBoard from './LeaderBoard';
import { IDatarunStatusTypes } from 'types';

const TabPane = Tabs.TabPane

export interface SidePanelProps {
    datasetID: number | null;
    datarunID: number | null;
    datarunStatus: IDatarunStatusTypes;
    setDatasetID: (id: number) => void;
    setDatarunID: (id: number) => void;
    setDatarunStatus: (status: IDatarunStatusTypes) => void;
}

export interface SidePanelState {}

export default class SidePanel extends React.Component<SidePanelProps, SidePanelState> {
    constructor(props: SidePanelProps) {
        super(props);

        this.state = {};
    }

    public render() {
        return (
            <div className="side-panel">
                <DataSelector {...this.props} />
                <Tabs
                    defaultActiveKey="1"
                >
                    <TabPane tab="Data" key="1">
                        <DataView datarunID={this.props.datarunID} />
                    </TabPane>
                    <TabPane tab="LeaderBoard" key="2">
                        <LeaderBoard datarunID={this.props.datarunID} datarunStatus={this.props.datarunStatus}/>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}
