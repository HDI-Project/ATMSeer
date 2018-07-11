import * as React from 'react';
import {Tabs} from 'antd';
import DataSelector from './DataSelector';
import DataView from './DataView';
import LeaderBoard from './LeaderBoard';

const TabPane = Tabs.TabPane

export interface SidePanelProps {
    datasetID: number | null;
    datarunID: number | null;
    setDatasetID: (id: number) => void;
    setDatarunID: (id: number) => void;
}

export interface SidePanelState {}

export default class SidePanel extends React.Component<SidePanelProps, SidePanelState> {
    constructor(props: SidePanelProps) {
        super(props);

        this.state = {};
    }

    public render() {
        return (
            <div>
                <DataSelector {...this.props} />
                <Tabs
                    defaultActiveKey="1"
                >
                    <TabPane tab="Data" key="1">
                        <DataView datarunID={this.props.datarunID} />
                    </TabPane>
                    <TabPane tab="LeaderBoard" key="2">
                        <LeaderBoard datarunID={this.props.datarunID}/>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}
