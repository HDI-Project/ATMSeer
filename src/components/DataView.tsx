import axios from "axios";
import * as React from "react";
import FeatureChart from "./FeatureChart"
import { Upload, message, Icon, Col, Row } from 'antd';
import { DEV_URL } from '../Const';
import './DataView.css';

const axiosInstance = axios.create({
    baseURL: DEV_URL+'/api',
    // timeout: 1000,
    // headers: {'X-Custom-Header': 'foobar'}
  });

export interface IState {
    dataset: IFeature[]
}
export interface IFeature{
    name: string,
    data: number[]
}
// export interface IDataset{
//     name:string,
//     [key:string]:data
// }
export default class DataView extends React.Component<{}, IState>{
    constructor(props: {}) {
        super(props)
        this.state = {
            dataset: []
        }
    }
    public async getData() {
        const res = await axios.get('../../viz/pollution_1.csv') // this should be changed to the server response later
        const datum = res.data
        
        const lines = datum.split('\n')
        const features = lines[0].split(',').map(
            (feature:string)=>{
                return {name: feature, data: []}
            })
        lines.splice(0, 1)
        const instances = lines
        // for each row
        instances.forEach((ins:string) => {
            const values = ins.split(',')
            values.forEach((v, idx)=>{
                features[idx].data.push(parseFloat(v))
            })
        });
        this.setState({
            dataset: features
        })
    }
    public componentDidMount() {
        this.getData()
    }
    public startDataRun(){
        axiosInstance.get('/simple_worker')
        .then((response)=> {
            console.log(response);
        })
        .catch((error) => {
            console.log(error);
        });

    }
    public render() {
        // upload button
        const props = {
            name: 'file',
            action: `${DEV_URL}/api/enter_data`,
            headers: {
              authorization: '',
            },
            onChange(info:any) {
              if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
              }
              if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
              } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
              }
            },
          };
          const uploadButton = (
            <div >
              <Icon type={'plus'} onClick={this.startDataRun()}/>
              <div className="ant-upload-text">
                <div>Upload</div>
                <div>New</div>
                <div>Dataset</div>
              </div>
            </div>
          );
        
        // start data runs
          const runButton = (
            <div className='boxButton'>
            <Icon type="caret-right" />
            <div className="startRun" >
              <div>Run</div>
              <div>for this</div>
              <div>Dataset</div>
            </div>
          </div>
          )
          

        //render
        const { dataset } = this.state
        const classes = dataset.pop()
        if(classes){           
            const features = dataset
            let cate_classes:number[] = []
            classes.data.forEach(d=>{
                if(cate_classes.indexOf(d)==-1){
                    cate_classes.push(d)
                }
            })
            return <div className="instances shadowBox">
                    <Row className='datasetInfo' style={{height:'15%'}}>
                    <Col span={8} className='datasetDetail' style={{height:'100%'}}>
                        <div>
                            <h4>{features.length} features</h4> 
                            <h4>{dataset[0].data.length} instances</h4> 
                            <h4> {cate_classes.length} classes </h4> 
                        </div>
                    </Col>
                    <Col span={8} style={{height:'100%'}}>
                        <Upload {...props}               
                            listType="text">
                            {uploadButton}
                        </Upload>
                    </Col>
                    <Col span={8} style={{height:'100%'}}>
                       {runButton}
                    </Col>
                        
                    </Row>
                    <div className='features' style={{height:'85%'}}>
                        {features.map((f:IFeature)=>{
                            
                            return <FeatureChart 
                            feature={f} classes={classes} 
                            key={f.name} cate_classes={cate_classes}
                            />
                        })}
                    </div>

                </div>
        }else{
            return <Upload {...props} 
                name="avatar"
                listType="picture-card"
                className="avatar-uploader">
                {uploadButton}
            </Upload>
        }
    }
}


