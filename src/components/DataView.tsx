import axios from "axios";
import * as React from "react";
import FeatureChart from "./FeatureChart"
import { Upload, message, Icon, Col, Row } from 'antd';
import './DataView.css';

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
    public render() {
        // upload button
        const props = {
            name: 'file',
            action: '',
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
            <div>
              <Icon type={'plus'} />
              <div className="ant-upload-text">Upload</div>
            </div>
          );
          


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
                    <Col span={16}>
                    <h6>{features.length} features</h6>
                        <h6>{dataset[0].data.length} instances</h6>
                        <h6> {cate_classes.length} classes </h6>
                    </Col>
                    <Col span={8}>
                        <Upload {...props} 
                            name="avatar"
                            listType="picture-card"
                            className="avatar-uploader">
                            {uploadButton}
                        </Upload>
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


