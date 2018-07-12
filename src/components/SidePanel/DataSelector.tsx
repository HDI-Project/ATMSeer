import * as React from 'react';
import { Select, Row, Col, Upload, Icon, Button, message } from 'antd';
import { IDatasetInfo, IDatarunInfo, IDatarunStatus } from '../../service/dataService';
import { getDatasets, getDataruns, getDatarun, postEnterData, startDatarun, stopDatarun } from '../../service/dataService';
import { IDatarunStatusTypes } from '../../types/index';

import "./DataSelector.css";

const Option = Select.Option;

export interface DataSelectorProps {
    datasetID: number | null;
    datarunID: number | null;
    datarunStatus: IDatarunStatusTypes;
    setDatasetID: (id: number) => void;
    setDatarunID: (id: number) => void;
    setDatarunStatus: (status: IDatarunStatusTypes) => void;
}

export interface DataSelectorState {
    datasets: IDatasetInfo[];
    dataruns: IDatarunInfo[];
    // datarunStatus: IDatarunStatusTypes;
}

export default class DataSelector extends React.Component<DataSelectorProps, DataSelectorState> {
    constructor(props: DataSelectorProps) {
        super(props);
        this.onSelectDatarun = this.onSelectDatarun.bind(this);
        this.onSelectDataset = this.onSelectDataset.bind(this);
        this.beforeUpload = this.beforeUpload.bind(this);
        this.onClickDataRun = this.onClickDataRun.bind(this);
        this.state = {
            datasets: [],
            dataruns: [],
            // datarunStatus: IDatarunStatusTypes.PENDING
        };
    }

    public async getDatasets() {
        const datasets = await getDatasets();
        this.setState({ datasets });
    }

    public async getDataruns(datasetID: number) {
        const dataruns = await getDataruns({ dataset_id: datasetID });
        this.setState({ dataruns });
        // Select the first run as default
        if (dataruns.length > 0) this.onSelectDatarun(dataruns[0].id);
    }

    public componentDidMount() {
        this.getDatasets();
    }

    public onSelectDataset(datasetID: number) {
        this.props.setDatasetID(datasetID);
    }

    public onSelectDatarun(datarunID: number) {
        this.props.setDatarunID(datarunID);
    }

    public beforeUpload(file: any) {
        postEnterData(file)
            .then(data => {
                if (data.success === true) {
                    message.success(`${file.name} file uploaded successfully`);
                    this.getDatasets().then(() => this.onSelectDataset(data.id));
                    // this.datarunID = response.data.id
                } else {
                    message.error(`${file.name} file upload failed.`);
                }
            })
            .catch(error => {
                console.error(error);
            });
        return false;
    }

    public onClickDataRun() {
        const { datarunStatus } = this.props;
        if (!this.props.datarunID) return;
        let promise: Promise<IDatarunStatus>;
        switch (datarunStatus) {
            case IDatarunStatusTypes.RUNNING:
                promise = stopDatarun(this.props.datarunID);
                message.info('stop');
                break;
            case IDatarunStatusTypes.PENDING:
                promise = startDatarun(this.props.datarunID);
                message.info('start');
                break;
            default:
                message.info('data run already complete');
                return;
        }
        promise
            .then(datarun => {
                switch (datarun.status) {
                    case IDatarunStatusTypes.RUNNING:
                        message.info('datarun is now running');
                        break;
                    case IDatarunStatusTypes.PENDING:
                        message.info('datarun is pending');
                        break;
                    default:
                        message.info('datarun already complete');
                    break;
                }
                // this.props.setDatarunID(this.props.datarunID) // pass datarun id to datarun after clicking run button
                this.props.setDatarunStatus(datarun.status);
            })
            .catch(error => {
                console.log(error);
            });
    }

    public componentDidUpdate(prevProps: DataSelectorProps, prevState: DataSelectorState) {
        const { datasetID, datarunID } = this.props;
        if (datasetID !== prevProps.datasetID && datasetID) {
            this.getDataruns(datasetID);
        }
        if (datarunID !== prevProps.datarunID && datarunID) {
            getDatarun(datarunID)
                .then((datarun) => {
                    this.props.setDatarunStatus(datarun.status);
                })
        }
    }

    public render() {
        const { datarunStatus } = this.props;
        const running = datarunStatus === IDatarunStatusTypes.RUNNING;
        // upload button
        const uploadProps = {
            name: 'file',
            // action: `${URL}/api/enter_data`,
            headers: {
                authorization: ''
            },
            // onChange: this.onChange,
            beforeUpload: this.beforeUpload // custom control the upload event
        };
        return (
            <div className="data-selector">
                <div>
                    <span>Datasets</span>
                    <Row style={{marginBottom: '6px'}}>
                        <Col span={16} className="dataViewColContainer">
                            <Select
                                placeholder="Select a dataset"
                                value={this.props.datasetID || undefined}
                                style={{ width: '100%' }}
                                onChange={this.onSelectDataset}
                            >
                                {this.state.datasets.map(({ id, name }) => (
                                    <Option key={id} value={id}>
                                        {name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={8} className="dataViewColContainer">
                            <Upload {...uploadProps} listType="text">
                                <Button>
                                    <Icon type="upload" /> upload
                                </Button>
                            </Upload>
                        </Col>
                    </Row>
                </div>
                <div>
                    <span>Dataruns</span>
                    <Row>
                        <Col span={16} className="dataViewColContainer">
                            <Select
                                placeholder="Select a datarun"
                                value={this.props.datarunID || undefined}
                                disabled={this.props.datasetID === null}
                                style={{ width: '100%' }}
                                onChange={this.onSelectDatarun}
                            >
                                {this.state.dataruns.map(({ id, selector }) => (
                                    <Option value={id} key={id}>
                                        {id}: {selector}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={8} className="dataViewColContainer">
                            <Button
                                onClick={this.onClickDataRun}
                                disabled={datarunStatus === IDatarunStatusTypes.COMPLETE}
                            >
                                <Icon type={running ? 'pause' : 'caret-right'} />
                                {running ? 'Stop' : (datarunStatus === IDatarunStatusTypes.PENDING ? 'Run' : 'Complete')}
                            </Button>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}
