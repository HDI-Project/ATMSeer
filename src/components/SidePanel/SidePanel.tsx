import * as React from 'react';
import DataSelector from './DataSelector';

export interface SidePanelProps {
    datasetID: number | null;
    datarunID: number | null;
    setDatasetID: (id: number) => void;
    setDatarunID: (id: number) => void;
}

export interface SidePanelState {
}

export default class SidePanel extends React.Component<SidePanelProps, SidePanelState> {
  constructor(props: SidePanelProps) {
    super(props);

    this.state = {
    }
  }

  public render() {
    return (
      <div>
        <DataSelector {...(this.props)}/>
      </div>
    );
  }
}
