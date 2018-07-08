import axios from "axios";
import * as React from "react";
import FeatureChart from "./FeatureChart"
import { Upload, message, Icon, Col, Row } from 'antd';
import { URL } from '../Const';
import './DataView.css';

const axiosInstance = axios.create({
    baseURL: URL + '/api',
    // timeout: 1000,
    // headers: {'X-Custom-Header': 'foobar'}
});

export interface IState {
    dataset: IFeature[],
    fileList: any[]
}
export interface IFeature {
    name: string,
    data: any[] // Revised number[] to any[]
}
// export interface IDataset{
//     name:string,
//     [key:string]:data
// }
export default class DataView extends React.Component<{}, IState>{
    constructor(props: {}) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.beforeUpload = this.beforeUpload.bind(this)
        this.state = {
            dataset: [],
            fileList: []
        }
    }
    public async getData() {
        const res = await axios.get('../../viz/pollution_1.csv') // this should be changed to the server response later
        const datum = res.data
        this.parseData(datum)
    }
    public parseData(csv:string){
        const lines:string[] = csv.split('\n')
        const features:IFeature[] = lines[0].split(',').map(
            (feature: string) => {
                return { name: feature, data: [] }
            })
        lines.splice(0, 1)
        const instances = lines
        // for each row
        // Revised the data type to support the category feature
        instances.forEach((ins:string) => {
            const values = ins.split(',')
            values.forEach((v, idx)=>{
                let _v = parseFloat(v)
                if(isNaN(_v)){
                    features[idx].data.push(v)
                }else{
                    features[idx].data.push(_v)
                }
            })
        });
        this.setState({
            dataset: features
        })
    }
    public componentDidMount() {
        this.getData()
    }
    public startDataRun() {
        axiosInstance.get('/simple_worker')
            .then((response) => {
                console.log(response);
                message.success(`start a data run successfully`);
            })
            .catch((error) => {
                console.log(error);
            });

    }

    public beforeUpload(file:any){
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (evt: FileReaderProgressEvent) => {
            if (evt.target) {
                let content = reader.result;
                console.info(content)
                this.parseData(content)
            }
        };
        return false
    }
    
    public onChange(info: any) {

        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }

        

    }
    public render() {
        // upload button
        const props = {
            name: 'file',
            action: `${URL}/api/enter_data`,
            headers: {
                authorization: '',
            },
            onChange: this.onChange,
            beforeUpload: this.beforeUpload

        };
        const uploadButton = (
            <div >
                <Icon type={'plus'} className='iconButton' />
                <div className="ant-upload-text">
                    <div>Upload</div>
                    {/* <div>New</div>
                <div>Dataset</div> */}
                </div>
            </div>
        );

        // start data runs
        const runButton = (
            <div className='boxButton'>
                <Icon type="caret-right" onClick={this.startDataRun} className='iconButton' />
                <div className="startRun" >
                    <div>Run</div>
                    {/* <div>for this</div>
              <div>Dataset</div> */}
                </div>
            </div>
        )


        //render
        const { dataset } = this.state
        console.log('this.state',this.state);
        const classes = dataset.pop()
        if (classes) {
            const features = dataset
            let cate_classes: number[] = []
            classes.data.forEach(d => {
                if (cate_classes.indexOf(d) == -1) {
                    cate_classes.push(d)
                }
            })
            return <div className="instances shadowBox">
                <Row className='datasetInfo' style={{ height: '15%', overflowY: "auto" }}>
                    <Col span={8} className='dataViewCol'>
                        <div>
                            <h3><b>Overview</b></h3>
                            <div>{features.length} features</div>
                            <div>{dataset[0].data.length} instances</div>
                            <div> {cate_classes.length} classes </div>
                        </div>
                    </Col>
                    <Col span={8} className='dataViewCol'>
                        <Upload {...props}
                            listType="text">
                            {uploadButton}
                        </Upload>
                    </Col>
                    <Col span={8} className='dataViewCol'>
                        {runButton}
                    </Col>

                </Row>
                <div className='features' style={{ height: '85%' }}>
                    {features.map((f: IFeature) => {

                        return <FeatureChart
                            feature={f} classes={classes}
                            key={f.name} cate_classes={cate_classes}
                        />
                    })}
                </div>

            </div>
        } else {
            return <Upload {...props}
                name="avatar"
                listType="picture-card"
                className="avatar-uploader">
                {uploadButton}
            </Upload>
        }
    }
}


