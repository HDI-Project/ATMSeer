import axios from "axios";
import * as React from "react";
import FeatureChart from "./FeatureChart"
import { Upload, message, Icon, Col, Row } from 'antd';
import { URL } from '../Const';
import './DataView.css';
import {EChartsColor} from "../helper";

const axiosInstance = axios.create({
    baseURL: URL + '/api',
    // timeout: 1000,
    // headers: {'X-Custom-Header': 'foobar'}
});

export interface IProps{
    setDatarunID: (id:number)=>void
}

export interface IState {
    dataset: IFeature[],
    fileList: any[],
    running: boolean
}
export interface IFeature {
    name: string,
    data: any[] // Revised number[] to any[]
}
// export interface IDataset{
//     name:string,
//     [key:string]:data
// }
export default class DataView extends React.Component<IProps, IState>{
    public datarunID:number
    constructor(props: IProps) {
        super(props)
        // this.onChange = this.onChange.bind(this)
        this.beforeUpload = this.beforeUpload.bind(this)
        this.changeRunStatus = this.changeRunStatus.bind(this)
        this.state = {
            dataset: [],
            fileList: [],
            running: false
        }
    }
    public async getData() {
        const res = await axios.get('../../viz/dataset_31_credit-g.csv') // this should be changed to the server response later
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
    public changeRunStatus() {
        const {running} = this.state
        const info = running?'stop run':'start run'
        this.setState({running: !running})
        message.info(info);
        axiosInstance.get('/simple_worker')
            .then((response) => {
                console.log(response);
                message.success(`start a data run successfully`);
                this.props.setDatarunID(this.datarunID) // pass datarun id to datarun after clicking run button
                this.setState({running: !this.state.running})
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

        let formData = new FormData();
        formData.append("file", file);
        axiosInstance
        .post("/enter_data", formData)
        .then(response => {
            
            if (response.data.success === true) {
                message.success(`${file.name} file uploaded successfully`);
                this.datarunID = response.data.id
            } else {
                message.error(`${file.name} file upload failed.`);
            }
        })
        .catch((error) => {
            console.log(error);
        });


        return false
    }
    
        
    public render() {

        const {running} = this.state
        // upload button
        const props = {
            name: 'file',
            // action: `${URL}/api/enter_data`,
            headers: {
                authorization: '',
            },
            // onChange: this.onChange,
            beforeUpload: this.beforeUpload // custom controll the upload event

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

        // start data run button
        const runButton = (
            <div className='boxButton'>
                <Icon type={running?"pause":"caret-right"} onClick={this.changeRunStatus} className='iconButton' />
                <div className="startRun" >
                    <div>{running?"Stop":"Run"}</div>
                    {/* <div>for this</div>
              <div>Dataset</div> */}
                </div>
            </div>
        )

        

        //render
        const { dataset } = this.state
        const classes = dataset[dataset.length-1]
        if (classes) {
            const features = dataset.slice(0, dataset.length-1)
            let cate_classes: number[] = []
            classes.data.forEach(d => {
                if (cate_classes.indexOf(d) == -1) {
                    cate_classes.push(d)
                }
            })

            // legend of classes
            const legend = cate_classes.map((className,i)=>{
                return <span key={className} className='classLegend'>
                    <span style={{color: EChartsColor[i],  margin:'2px'}}/>
                    {className}
                </span>
            })

            return <div className="instances shadowBox">
                <Row className='datasetInfo' style={{ height: '15%', overflowY: "auto" }}>
                    <Col span={8} className='dataViewColContainer'>
                        <div className='dataViewCol'>
                            <div>
                                <h3><b>Overview</b></h3>
                                <div> {cate_classes.length} classes </div>
                                <div>{legend}</div>
                                <div>{features.length} features</div>
                                <div>{dataset[0].data.length} instances</div>
                            </div>
                        </div>
                    </Col>
                    <Col span={8} className='dataViewColContainer'>
                        <div className='dataViewCol'>
                            <Upload {...props}
                                listType="text">
                                {uploadButton}
                            </Upload>
                        </div>
                    </Col>
                    <Col span={8} className='dataViewColContainer'>
                        <div className='dataViewCol'>
                            {runButton}
                        </div>
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
                className="avatar-uploader">
                {uploadButton}
            </Upload>
        }
    }
}


