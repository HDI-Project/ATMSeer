import * as React from 'react';
import { Select, Row, Col, Upload, Icon, Button, message } from 'antd';
import { IDatasetInfo, IDatarunInfo, IDatarunStatus, IConfigsInfo, postNewDatarun, INewDatarunResponse } from 'service/dataService';
import { getDatasets, getDataruns, getDatarun, postNewDataset, startDatarun, stopDatarun } from 'service/dataService';
import { IDatarunStatusTypes } from 'types/index';
import "./DataSelector.css";
import SettingsModal from './SettingsModal';

const Option = Select.Option;


export interface DataSelectorProps {
    datasetID: number | null;
    datarunID: number | null;
    datarunStatus: IDatarunStatusTypes;
    setDatasetID: (id: number) => void;
    setDatarunID: (id: number | null) => void;
    setDatarunStatus: (status: IDatarunStatusTypes) => void;
}

export interface DataSelectorState {
    datasets: IDatasetInfo[];
    dataruns: IDatarunInfo[];
    isProcessing: boolean;
    // datarunStatus: IDatarunStatusTypes;
}

export default class DataSelector extends React.Component<DataSelectorProps, DataSelectorState> {
    constructor(props: DataSelectorProps) {
        super(props);
        this.onSelectDatarun = this.onSelectDatarun.bind(this);
        this.onSelectDataset = this.onSelectDataset.bind(this);
        this.beforeUploadDataset = this.beforeUploadDataset.bind(this);
        this.onClickDatarun = this.onClickDatarun.bind(this);
        this.newDatarun = this.newDatarun.bind(this);
        this.state = {
            datasets: [],
            dataruns: [],
            isProcessing: false,
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
        else this.props.setDatarunID(null);
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

    public beforeUploadDataset(file: any) {
        postNewDataset(file)
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

    public onClickDatarun() {
        const { datarunStatus } = this.props;
        let promise: Promise<IDatarunStatus>;
        if (!this.props.datarunID) return;
        switch (datarunStatus) {
            case IDatarunStatusTypes.RUNNING:
                promise = stopDatarun(this.props.datarunID);
                break;
            case IDatarunStatusTypes.PENDING:
                promise = startDatarun(this.props.datarunID);
                break;
            default:
                console.error("This branch should not occur!")
                return;
        }
        this.setState({isProcessing: true});
        promise
            .then(datarun => {
                // this.props.setDatarunID(this.props.datarunID) // pass datarun id to datarun after clicking run button
                this.props.setDatarunStatus(datarun.status);
                this.setState({isProcessing: false});
            })
            .catch(error => {
                console.log(error);
                this.setState({isProcessing: false});
            });
    }
    public async newDatarun(configs: IConfigsInfo): Promise<undefined | INewDatarunResponse> {
        const {datasetID} = this.props;
        if (datasetID === null) return;
        const p = postNewDatarun(datasetID, configs);
        p.then((status) => {
            if (status.success) {
                this.getDataruns(datasetID);
            }
        })
        return p;
    }

    public componentDidUpdate(prevProps: DataSelectorProps, prevState: DataSelectorState) {
        const { datasetID, datarunID, datarunStatus } = this.props;
        if (datasetID !== prevProps.datasetID && datasetID) {
            this.getDataruns(datasetID);
        }
        if (datarunID !== prevProps.datarunID && datarunID) {
            getDatarun(datarunID)
                .then((datarun) => {
                    this.props.setDatarunStatus(datarun.status);
                });
        }
        if (datarunStatus !== prevProps.datarunStatus && datarunID === prevProps.datarunID) {
            switch (datarunStatus) {
                case IDatarunStatusTypes.RUNNING:
                    message.info("Datarun is now started");
                    break;
                case IDatarunStatusTypes.COMPLETE:
                    message.info("Datarun has completed.");
                    break;
                case IDatarunStatusTypes.PENDING:
                    message.info("Datarun stopped / is pending");
                    break;
                default:
                    break;
            }
        }
    }

    public render() {
        const { datarunStatus } = this.props;
        const { isProcessing } = this.state;
        const running = datarunStatus === IDatarunStatusTypes.RUNNING;
        // upload button
        const uploadProps = {
            name: 'file',
            // action: `${URL}/api/enter_data`,
            headers: {
                authorization: ''
            },
            // onChange: this.onChange,
            beforeUpload: this.beforeUploadDataset // custom control the upload event
        };

        // const settingButton = <React.Fragment><Icon type='setting' /><span>Settings</span></React.Fragment>;
        return (
            <div className="data-selector">
                {/* <div>
                    <span>Settings</span>
                    <Row gutter={6}>

                        <Col span={24} className="dataViewColContainer">

                            <SettingsModal onSubmit={postConfigs} button={settingButton}/>
                        </Col>
                    </Row>

                </div> */}
                <div>
                    <span>Datasets</span>
                    <Row style={{marginBottom: '6px'}} gutter={6}>
                        <Col span={14} className="dataViewColContainer">
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
                        <Col span={10} className="dataViewColContainer">
                            <Upload {...uploadProps} listType="text">
                                <Button>
                                    <Icon type="upload" /> Upload
                                </Button>
                            </Upload>
                        </Col>
                    </Row>
                </div>
                <div>
                    <span>Dataruns</span>
                    <Row gutter={6}>
                        <Col span={3} className="dataViewColContainer">
                            <SettingsModal onSubmit={this.newDatarun} button={<Icon type="plus"/>}/>
                        </Col>
                        <Col span={13} className="dataViewColContainer">
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
                                onClick={this.onClickDatarun}
                                disabled={datarunStatus === IDatarunStatusTypes.COMPLETE || this.props.datasetID === null || isProcessing}
                            >
                                <Icon type={isProcessing ? 'loading' : (running ? 'pause' : 'caret-right')} />
                                {running ? 'Stop' : (datarunStatus === IDatarunStatusTypes.PENDING ? 'Run' : 'Complete')}
                            </Button>
                        </Col>
                    </Row>
                </div>
                </div>

        );
    }
}
