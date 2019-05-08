import * as React from 'react';
import { Select, Row, Col, Upload, Icon, Button, message } from 'antd';
import { IDatasetInfo, IDatarunInfo, IDatarunStatus, IConfigsInfo, postNewDatarun, INewDatarunResponse } from 'service/dataService';
import {
    getDatasets,
    getDataruns,
    getDatarun,
    postNewDataset,
    startDatarun,
    stopDatarun } from 'service/dataService';
import { IDatarunStatusTypes } from 'types/index';
import "./DataSelector.css";
import SettingsModal from './SettingsModal';

import {connect} from 'react-redux';
import {
    getDatarunIdSelector,
    getDatasetIdSelector,
    getDatarunStatusSelector,
    getDataSetSelector,
    getIsDataSetLoading,
    getDataRunsSelector,
    someOptions
} from 'selectors/DataSelector';

import {
    setDatarunIdAction,
    setDataSetIdAction,
    setDatarunStatusAction
} from 'actions/dataSelectors';

import {
    startDatarunAction,
    stopDatarunAction,
    setDatasetsAction,
    getDataRunsAction
} from 'actions/api';

const Option = Select.Option;

export interface DataSelectorProps {
    datasetID: number;
    datarunID: number;
    datarunStatus: IDatarunStatusTypes;
    dataSet: any;
    isDataSetLoading: boolean;
    dataRuns: any;
    setDataset: () => void,
    setDatasetID: (id: number) => void;
    setDatarunID: (id: number | null) => void;
    setDatarunStatus: (status: IDatarunStatusTypes) => void;
    startDataRun: (datarunId: number) => void;
    stopDataRun: (datarunId: number) => void;
    getDataRun: (dataSetID: number) => void;
}

export interface DataSelectorState {
    datasets: IDatasetInfo[];
    dataruns: IDatarunInfo[];
    isProcessing: boolean;
    // datarunStatus: IDatarunStatusTypes;
}

class DataSelector extends React.Component<DataSelectorProps, DataSelectorState> {
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
        // this.props.setDataset();
        // const datasets = await getDatasets();
        // if(datasets){
        //     this.setState({ datasets });
        // }

        // if(!this.props.isDataLoading) {
        //     this.setState({datasets: this.props.dataSet}, () => console.log(this.state.datasets));
        // }
    }
    public async getDataruns(datasetID: number, datarunID:number = -1) {
        // const {dataRuns} = this.props;
        const dataruns = await getDataruns({ dataset_id: datasetID });

        this.setState({ dataruns });
        // Select the first run as default

        if (dataruns.length > 0) {
            if(datarunID == -1){
                datarunID = dataruns[0].id;
            }
            this.onSelectDatarun(datarunID);
        }

        else this.props.setDatarunID(null);
    }

    public componentDidMount() {
        // this.getDatasets();
        this.props.setDataset();
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
        console.log('dataRunClicked')
        const {
            startDataRun,
            stopDataRun,
            datarunID,
            datarunStatus
        } = this.props



        startDatarun(datarunID);
        console.log(datarunStatus);


        // const {startDataRun, stopDataRun, datarunStatus, datarunID } = this.props;
        // let promise: Promise<IDatarunStatus>;
        // if (!datarunID) return;

        // // datarunStatus == 'running' ? stopDatarun(datarunID) : startDataRun(datarunID);

        // // console.log(datarunStatus);

        // switch (datarunStatus) {
        //     case IDatarunStatusTypes.RUNNING:
        //     console.log('RUNNING state here')
        //         promise = stopDatarun(datarunID);
        //         break;
        //     case IDatarunStatusTypes.PENDING:
        //         console.log('pending state here')
        //         promise = startDatarun(datarunID);
        //         break;
        //     default:
        //         console.error("This branch should not occur!")
        //         return;
        // }

        // this.setState({isProcessing: true});


        // promise
        //     .then(datarun => {
        //         this.props.setDatarunStatus(datarun.status);
        //         this.setState({isProcessing: false});
        //     })
        //     .catch(error => {
        //         this.setState({isProcessing: false});
        //     });
            // console.log(datarunStatus);

            // if(datarunStatus === 'pending') {
            //     startDatarun(datarunID);
            //     this.setState({isProcessing: false});
            // }

            // if(datarunStatus === 'running') {
            //     stopDatarun(datarunID);
            //     this.setState({isProcessing: false});
            // }
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

        if (datarunID !== prevProps.datarunID && datarunID && datasetID ) {
            // Automatically try to correct the datarun list once.
            // let findflag = false;

            // for(let i = 0; i<this.state.dataruns.length;i++){
            //     if(this.state.dataruns[i].id == datarunID){
            //         findflag = true;
            //     }
            // }

            // if(findflag == false){
            //     this.getDataruns(datasetID, datarunID);
            // }

            // getDatarun(datarunID)
            //     .then((datarun) => {
            //         this.props.setDatarunStatus(datarun.status);
            //     });
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
        const {
            datarunStatus,
            datasetID,
            setDatasetID,
            dataSet,
            isDataSetLoading,
            dataRuns
        } = this.props;

        const { isProcessing } = this.state;
        const running = datarunStatus === IDatarunStatusTypes.RUNNING;
        const completed = datarunStatus === IDatarunStatusTypes.COMPLETE;
        // upload button
        const uploadProps = {
            name: 'file',
            headers: {
                authorization: ''
            },
            beforeUpload: this.beforeUploadDataset // custom control the upload event
        };
        console.log(dataRuns);
        return (
            <div className="data-selector">
                <div>
                    <span>Datasets</span>
                    <Row style={{marginBottom: '6px'}} gutter={6}>
                        <Col span={14} className="dataViewColContainer">
                            {!isDataSetLoading &&
                                <Select
                                    placeholder="Select a dataset"
                                    value={datasetID || undefined}
                                    style={{ width: '100%' }}
                                    onChange={setDatasetID}
                                >
                                    {dataSet.map((data: any)=>
                                        <Option key={data.id} value={data.id}>
                                            {data.name}
                                        </Option>
                                    )}
                                </Select>
                            }
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
                            <SettingsModal
                                onSubmit={this.newDatarun}
                                buttonOptions={{icon: 'plus', shape: 'circle'}}
                            />
                        </Col>
                        <Col span={13} className="dataViewColContainer">
                            <Select
                                placeholder="Select a datarun"
                                value={this.props.datarunID || undefined}
                                disabled={this.props.datasetID === null}
                                style={{ width: '100%' }}
                                onChange={this.onSelectDatarun}
                            >
                                {
                                    // dataRuns.map((data: any) => console.log(data))
                                }
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
                                {running ? 'Stop' : (completed ? 'Complete' : 'Run')}
                            </Button>
                        </Col>
                    </Row>
                </div>
            </div>

        );
    }
}

export default connect((state) => ({
    datarunID: getDatarunIdSelector(state),
    datasetID: getDatasetIdSelector(state),
    datarunStatus: getDatarunStatusSelector(state),
    dataSet: getDataSetSelector(state),
    isDataSetLoading: getIsDataSetLoading(state),
    dataRuns: getDataRunsSelector(state),
    someOptions: someOptions(state)
}), (dispatch: any) => ({
    setDatarunID: (datarunID: number) => dispatch(setDatarunIdAction(datarunID)),
    setDatasetID: (dataSetID: number) => dispatch(setDataSetIdAction(dataSetID)),
    setDatarunStatus: (datarunStatus: IDatarunStatusTypes) => dispatch(setDatarunStatusAction(datarunStatus)),
    setDataset: () => dispatch(setDatasetsAction()),
    startDataRun: (datarunID: number) =>dispatch(startDatarunAction(datarunID)),
    stopDataRun: (datarunID: number) => dispatch(stopDatarunAction(datarunID)),
    getDataRun: (dataSetID: number) => dispatch(getDataRunsAction(dataSetID))
}))(DataSelector)
