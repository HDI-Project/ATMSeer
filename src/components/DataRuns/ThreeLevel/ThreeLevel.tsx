import * as React from "react";
import Methods from './Methods';
import HyperPartitions from "./HyperPartitions";
import HyperParameters from "./HyperParameters";
import {
    IHyperpartitionInfo, IClassifierInfo, IConfigsInfo,
    getDatarunConfigs, IUpdateDatarunConfig, ICommonResponse,
    updateDatarunConfigs, IClickEvent, IRecommendationResult
} from 'service/dataService';
import { IDatarun } from "types";
import * as methodsDef from "assets/methodsDef.json";
import { message, Icon } from 'antd';
import { getColor } from 'helper';
import GenerateSvg from '../../Utils/GenerateSvg';
import './ThreeLevel.css'

export interface IProps {
    height: number,
    datarun: IDatarun,
    datasetID: number | null,
    datarunID: number | null,
    setDatarunID: (id: number) => void,
    hyperpartitions: IHyperpartitionInfo[],
    classifiers: IClassifierInfo[],
    compareK: number,
    recommendationResult: IRecommendationResult,
    postClickEvent: (e: IClickEvent) => void
}

export interface IState {
    selectedMethod: string,
    configsBudget: number,
    configsMethod: string[],
    loading: boolean,
    methodSelected: any,
    hyperparametersRangeAlreadySelected: any,
    hyperpartitionsAlreadySelected: number[],
    mouseOverClassifier: number,
    displaymode: number,
    methodCoords: any, 
    classifiers: any
}

export default class ThreeLevel extends React.Component<IProps, IState>{
    index = 0
    constructor(props: IProps) {
        super(props)
        this.onSelectMethod = this.onSelectMethod.bind(this)
        this.state = {
            selectedMethod: '',
            configsBudget: 100,
            configsMethod: [],
            loading: false,
            methodSelected: {},
            hyperparametersRangeAlreadySelected: {},
            hyperpartitionsAlreadySelected: [],
            mouseOverClassifier: -1,
            displaymode: 0,
            classifiers: [],
            methodCoords: {
                svgHeight: window.innerHeight * 0.74,
                svgWidth: window.innerWidth * 5 / 6,
                methodHeight: window.innerWidth * 5 / 6,
                hyperPartHeight: window.innerHeight / 2,
                hyperParamWidth: window.innerWidth * 5 / 6,
                hyperParamHeight: window.innerHeight * 0.74 / 2,
                hyperPartWidth: window.innerWidth * 5 / 6,
                headerHeight: 10,
                textLeft: 40,
                hpTabLeft: 145,
                hyTabLeft: 156

            }

        }
    }

    onSelectMethod(methodName: string) {
        console.info('select method', methodName);
        let eventlog: IClickEvent = {
            type: "method",
            description: {
                action: "selected",
                name: methodName
            },
            time: new Date().toString()
        }
        this.props.postClickEvent(eventlog);
        let displaymode = this.state.displaymode;
        if (displaymode == 0) {
            displaymode = 1;
        }
        this.setState({ selectedMethod: methodName, displaymode: displaymode })
    }

    componentDidMount() {
        this.getCurrentConfigs();
        this.setMethodHeight();
        this.getClassifiers();
    }

    onBudgetChange = (budget: any) => {
        this.setState({ configsBudget: budget });
    }

    getCurrentConfigs = () => {
        if (this.props.datarunID != null) {
            let promise: Promise<IConfigsInfo>;
            let datarunID: number = this.props.datarunID ? this.props.datarunID : 0;
            promise = getDatarunConfigs(datarunID);
            promise.then(configs => {
                this.setState({
                    configsMethod: configs.methods,
                    configsBudget: configs.budget
                })
            })
        }
    }

    updateCurrentDataRun = () => {
        // get configs from server ;
        // submit configs in this view
        // switch to the new datarun.
        let methods = this.state.configsMethod;
        //let budget = this.state.configsBudget;
        if (this.props.datarunID != null) {
            let promise: Promise<IConfigsInfo>;
            let datarunID: number = this.props.datarunID ? this.props.datarunID : 0;
            promise = getDatarunConfigs(datarunID);
            promise
                .then(configs => {
                    configs.methods = methods;
                    //configs.budget = budget;
                    this.setState({ loading: true });

                    let submitconfigs: IUpdateDatarunConfig = {};
                    submitconfigs.configs = configs;
                    submitconfigs.method_configs = this.state.hyperparametersRangeAlreadySelected;
                    if (this.state.hyperpartitionsAlreadySelected.length > 0) {
                        submitconfigs.hyperpartitions = this.state.hyperpartitionsAlreadySelected;
                    }
                    let promise: Promise<ICommonResponse> = updateDatarunConfigs(datarunID, submitconfigs);
                    //const promise = this.props.onSubmit(this.state.configs);
                    console.log("update data run in methods view");
                    console.log(configs);
                    promise.then(status => {
                        if (status.success == true) {
                            message.success("Update Configs Successfully.");
                        } else {
                            message.error("Update Configs Failed.");
                        }
                        this.setState({ loading: false });
                    }).catch(error => {
                        console.log(error);
                        message.error("Update Configs Failed.");
                        this.setState({ loading: false });

                    });
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }

    fetchHpId = (method: string) => {
        let hp = this.props.hyperpartitions;
        return hp.filter((d: any) => d.method == method).map((d: any) => d.id);
    }

    onMethodsCheckBoxChange = (e: any) => {
        let checked = e.target.checked;
        let value = e.target.value;
        let methodSelected = this.state.methodSelected;
        let configsHyperpartitions: number[] = this.state.hyperpartitionsAlreadySelected;
        console.log("onMethodsCheckBoxChange")
        if (methodSelected[value]) {
            if (checked == false) {
                //un selected
                let configsMethod: string[] = this.state.configsMethod;
                let index = configsMethod.indexOf(value);
                if (index > -1) {
                    configsMethod.splice(index, 1);
                }


                methodSelected[value].checked = false;
                methodSelected[value].indeterminate = false;
                methodSelected[value].disabled = false;
                let hpid = this.fetchHpId(value);
                configsHyperpartitions = configsHyperpartitions.filter((d: number) => hpid.indexOf(d) < 0);

                this.setState({
                    hyperpartitionsAlreadySelected: configsHyperpartitions,
                    methodSelected: methodSelected,
                    configsMethod: configsMethod

                });

            } else {
                let configsMethod: string[] = this.state.configsMethod;
                configsMethod.push(value);
                methodSelected[value].checked = true;
                methodSelected[value].indeterminate = false;
                methodSelected[value].disabled = false;
                let hpid = this.fetchHpId(value);
                configsHyperpartitions = Array.from(new Set(configsHyperpartitions.concat(hpid)));
                this.setState({
                    hyperpartitionsAlreadySelected: configsHyperpartitions,
                    methodSelected: methodSelected,
                    configsMethod: configsMethod

                });


            }
            let action = "selected";
            if (checked == false) {
                action = "unselected";
            }
            let eventlog: IClickEvent = {
                type: "methodcheckbox",
                description: {
                    action: action,
                    methodname: value
                },
                time: new Date().toString()
            }
            this.props.postClickEvent(eventlog);
            this.updateCurrentDataRun();
        }
    }

    onHyperpartitionCheckBoxChange = (id: number) => {
        let checked: boolean = !(this.state.hyperpartitionsAlreadySelected.indexOf(id) > -1);
        let value = id;
        if (checked == false) {
            // un selected
            let configsHyperpartitions: number[] = this.state.hyperpartitionsAlreadySelected;
            let index = configsHyperpartitions.indexOf(value);
            if (index > -1) {
                configsHyperpartitions.splice(index, 1);
                let hp: any = this.props.hyperpartitions.filter((d: any) => d.id == value);
                let method = hp[0].method;
                let hpid = this.fetchHpId(method);
                let judgeSet = hpid.filter((d: any) => configsHyperpartitions.indexOf(d) > -1);
                let methodSelected = this.state.methodSelected;
                let configsMethod: string[] = this.state.configsMethod;

                if (judgeSet.length > 0) {
                    // Fetch method intersect hpid
                    // method unselected
                    methodSelected[method].checked = false;
                    methodSelected[method].indeterminate = true;
                } else {
                    methodSelected[method].checked = false;
                    methodSelected[method].indeterminate = false;
                    let index = configsMethod.indexOf(method);
                    if (index > -1) {
                        configsMethod.splice(index, 1);
                    }
                }
                this.setState({
                    hyperpartitionsAlreadySelected: configsHyperpartitions,
                    methodSelected: methodSelected,
                    configsMethod: configsMethod

                });

            }
        } else {
            let configsHyperpartitions: number[] = this.state.hyperpartitionsAlreadySelected;
            configsHyperpartitions.push(value);
            let hp: any = this.props.hyperpartitions.filter((d: any) => d.id == value);
            let method = hp[0].method;
            let hpid = this.fetchHpId(method);
            let judgeSet = Array.from(new Set(configsHyperpartitions.concat(hpid)));
            let methodSelected = this.state.methodSelected;
            let configsMethod: string[] = this.state.configsMethod;
            configsMethod = Array.from(new Set(configsMethod.concat([method])));

            if (judgeSet.length == configsHyperpartitions.length) {
                //selected
                methodSelected[method].checked = true;
                methodSelected[method].indeterminate = false;
            } else {
                methodSelected[method].checked = false;
                methodSelected[method].indeterminate = true;
            }

            this.setState({
                hyperpartitionsAlreadySelected: configsHyperpartitions,
                methodSelected: methodSelected,
                configsMethod: configsMethod
            });


        }
        let action = "selected";
        if (checked == false) {
            action = "unselected";
        }
        let eventlog: IClickEvent = {
            type: "hyperpartitioncheckbox",
            description: {
                action: action,
                hpid: value
            },
            time: new Date().toString()
        }
        this.props.postClickEvent(eventlog);
        this.updateCurrentDataRun();
    }

    onBrushSelected = (methodname: string, hpaName: string, hpatype: string, range: number[]) => {
        let { hyperparametersRangeAlreadySelected } = this.state;
        let update: boolean = false;
        if (hpatype == "int") {
            range[0] = Math.floor(range[0]);
            range[1] = Math.ceil(range[1]);
        }
        if (!hyperparametersRangeAlreadySelected[methodname]) {
            hyperparametersRangeAlreadySelected[methodname] = {};
        }
        if (hyperparametersRangeAlreadySelected[methodname][hpaName] && hyperparametersRangeAlreadySelected[methodname][hpaName]["range"]) {
            if (hyperparametersRangeAlreadySelected[methodname][hpaName]["range"][0] == range[0] && hyperparametersRangeAlreadySelected[methodname][hpaName]["range"][1] == range[1]) {
                // nothing
            } else {
                update = true;
            }
        } else {
            if (range.length > 0) {
                update = true;

            }
        }
        if (update) {

            hyperparametersRangeAlreadySelected[methodname][hpaName] = { "type": hpatype, "range": range };
            console.log(hyperparametersRangeAlreadySelected);
            this.setState({
                hyperparametersRangeAlreadySelected: hyperparametersRangeAlreadySelected
            });
            let action = "updated";

            let eventlog: IClickEvent = {
                type: "hyperparametersRange",
                description: {
                    action: action,
                    range: range,
                    type: hpatype,
                    hyname: hpaName,
                    methodname: methodname
                },
                time: new Date().toString()
            }
            this.props.postClickEvent(eventlog);
            this.updateCurrentDataRun();
        }

    }

    componentWillReceiveProps(nextProps: IProps) {
        if (this.state.loading == false) {
            let { hyperpartitions } = nextProps;
            let methodhistogram: any = {};
            let methodSelected: any = {};
            let mode = 1;
            let hyperpartitionsAlreadySelected: number[] = [];

            if (mode == 0) {
                hyperpartitionsAlreadySelected = hyperpartitions.map((d: any) => {
                    return d.id;
                });
            } else if (mode == 1) {
                hyperpartitionsAlreadySelected = hyperpartitions.filter((d: any) => d.status != "errored").map((d: any) => {
                    return d.id;
                });
            }

            Object.keys(methodsDef).forEach((d: string) => {
                if (!methodhistogram[d]) {
                    methodhistogram[d] = { total: 0, enable: 0 };
                }
            });
            hyperpartitions.forEach((d: any) => {
                if (!methodhistogram[d.method]) {
                    methodhistogram[d.method] = { total: 0, enable: 0 };
                    console.log("unknown method : " + d.method);
                }
                if (!(d.status == "errored")) {
                    methodhistogram[d.method].total++;
                    methodhistogram[d.method].enable++;
                } else {
                    methodhistogram[d.method].total++;
                }

            });
            Object.keys(methodhistogram).forEach((d: string) => {
                if (mode == 0) {
                    if (methodhistogram[d].total == 0) {
                        methodSelected[d] = { checked: false, disabled: true, indeterminate: false };
                    } else {
                        methodSelected[d] = { checked: true, disabled: false, indeterminate: false };
                    }
                } else if (mode == 1) {
                    if (methodhistogram[d].total == 0) {
                        methodSelected[d] = { checked: false, disabled: true, indeterminate: false };
                    } else if (methodhistogram[d].enable == 0) {
                        methodSelected[d] = { checked: false, disabled: false, indeterminate: false };
                    } else if (methodhistogram[d].total == methodhistogram[d].enable) {
                        methodSelected[d] = { checked: true, disabled: false, indeterminate: false };
                    } else {
                        methodSelected[d] = { checked: false, disabled: false, indeterminate: true };
                    }
                }
            });
            let selectedMethod = this.state.selectedMethod;
            this.setState({
                methodSelected: methodSelected,
                hyperpartitionsAlreadySelected: hyperpartitionsAlreadySelected,
                selectedMethod: selectedMethod
            });
        }
    }

    onMouseOverClassifier = (classifierid: number) => {
        if (this.state.mouseOverClassifier != classifierid) {
            if (classifierid != -1) {
                let action = "mouseover";

                let eventlog: IClickEvent = {
                    type: "classifier",
                    description: {
                        action: action,
                        classifierid: classifierid
                    },
                    time: new Date().toString()
                }

                this.props.postClickEvent(eventlog);
            }

            this.setState({
                mouseOverClassifier: classifierid
            })
        }
    }

    onMethodButtonClick = () => {
        let { displaymode } = this.state;
        this.setMethodHeight();
        if (displaymode == 0) {
            let eventlog: IClickEvent = {
                type: "hyperpartitionsView",
                description: {
                    action: "more",
                },
                time: new Date().toString()
            }
            this.props.postClickEvent(eventlog);
            this.setState({
                displaymode: 1
            });
        } else {
            let eventlog: IClickEvent = {
                type: "hyperpartitionsView",
                description: {
                    action: "hide",
                },
                time: new Date().toString()
            }
            this.props.postClickEvent(eventlog);
            this.setState({
                displaymode: 0
            });
        }
    }

    onHyperpartitionButtonClick = () => {
        let { displaymode } = this.state;
        if (displaymode == 1) {
            let eventlog: IClickEvent = {
                type: "hyperparametersView",
                description: {
                    action: "more",
                },
                time: new Date().toString()
            }
            this.props.postClickEvent(eventlog);
            this.setState({
                displaymode: 2
            });
        } else {
            let eventlog: IClickEvent = {
                type: "hyperparametersView",
                description: {
                    action: "hide",
                },
                time: new Date().toString()
            }
            this.props.postClickEvent(eventlog);
            this.setState({
                displaymode: 1
            });
        }
    }

    setMethodHeight() {
        let { displaymode, methodCoords } = this.state,
            methodHeight = methodCoords.svgHeight;

        switch (displaymode) {
            case 0: {
                return methodHeight;
            }
            case 1: {
                return methodHeight = methodCoords.svgHeight / 2;
            }
            case 2: {
                return methodHeight = methodCoords.svgHeight * 1.3 / 3;
            }
            default: {
                return methodHeight;
            }
        }
    }

    setHyperPartitionsHeight() {
        let { displaymode, methodCoords } = this.state,
            hyperPartHeight = methodCoords.svgHeight / 2;

        switch (displaymode) {
            case 0: {
                return hyperPartHeight = 100;
            }
            case 2: {
                return hyperPartHeight = methodCoords.svgHeight * 0.7 / 3;
            }
            default: {
                return hyperPartHeight;
            }
        }
    }

    generateTag(box: any, name: string) {
        let { width, height, x, y } = box;
        const groupProps = {
            shape: {
                className: "tag",
                transform: `translate(${x},${y})`
            },
            rect: {
                width: width,
                height: height,
                style: { fill: getColor(name) },
                rx: 5,
                ry: 5
            },
            textProps: {
                y: height - 5,
                x: width / 2,
                textAnchor: "middle",
                style: { fill: "white" }
            }
        }

        return name !== '' ?
            <g {...groupProps.shape}>
                <rect {...groupProps.rect} />
                <text {...groupProps.textProps}>{name}</text>
            </g> : <g className="tag" />
    }

    generateRect(box: any, mode: number, eventCallback: () => void) {
        const rectProps = {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            fill: "rgb(250,250,250)",
            rx: 3,
            ry: 3,
            stroke: "rgb(217,217,217",
            strokeWidth: "1.5px",
            style: { cursor: "pointer" }
        }

        const foreigObjProps = {
            x: box.x + 10,
            y: box.y + 3,
            width: 35,
            height: 35
        }

        const iconDir = mode === 0 ? 'right' : 'down';

        return mode === 0 || mode === 1 ?
            <g>
                <rect {...rectProps} />
                <foreignObject {...foreigObjProps}>
                    <Icon type={iconDir} />
                </foreignObject>
            </g> : <g />
    }

    generateHyperpartitionText() {
        const methodHeight = this.setMethodHeight();
        const hyperPartHeight = this.setHyperPartitionsHeight();
        const { selectedMethod } = this.state;
        const {
            headerHeight,
            textLeft,
            hpTabLeft,
            hyperPartWidth
        } = this.state.methodCoords;

        const groupProps = {
            transform: `translate(${0}, ${methodHeight + headerHeight})`,
            width: hyperPartWidth,
            height: hyperPartHeight,
            onClick: this.onMethodButtonClick
        }

        const textProps = {
            textAnchor: "start",
            x: textLeft,
            y: 10,
            style: {
                font: "bold 16px sans-serif",
                display: "inline"
            }
        }

        return (
            <g>
                <g {...groupProps} >
                    {this.generateRect({
                        x: 10,
                        y: -9,
                        width: hyperPartWidth - 68,
                        height: 28
                    }, 0, this.onMethodButtonClick)}
                    <text {...textProps}>HyperPartitions of</text>
                    {this.generateTag({
                        x: textLeft + hpTabLeft,
                        y: -6,
                        width: 40,
                        height: 20
                    }, selectedMethod)}
                </g>
            </g>
        )
    }

    getClassifiers() {
        let { classifiers } = this.props;
        classifiers = classifiers.sort((a, b) => b.cv_metric - a.cv_metric);
        this.setState({
            classifiers
        });
    }

    generateHyperpartition() {
        const { selectedMethod, classifiers, methodCoords } = this.state;
        const { headerHeight, textLeft, hpTabLeft, hyperPartWidth } = methodCoords;
        const { hyperpartitions, datarunID, compareK } = this.props;

        const hyperPartHeight = this.setHyperPartitionsHeight();
        const methodHeight = this.setMethodHeight();

        const rectProps = {
            x: 0,
            y: 30,
            width: hyperPartWidth,
            height: hyperPartHeight - 30
        }

        const groupProps = {
            transform: `translate(${0}, ${headerHeight + methodHeight})`,
            width: hyperPartWidth,
            height: hyperPartHeight
        }
        return (
            <g>
                <defs>
                    <clipPath id="mask_hyperpartitions">
                        <rect {...rectProps} />
                    </clipPath>
                </defs>
                <g {...groupProps}>
                    <g onClick={this.onMethodButtonClick}>
                        {this.generateRect({
                            x: 10,
                            y: -9,
                            width: hyperPartWidth - 68,
                            height: 28
                        }, 1, this.onMethodButtonClick)}
                        <text
                            textAnchor="start"
                            x={textLeft}
                            y={10}
                            style={{ font: "bold 16px sans-serif", display: "inline" }}
                        >HyperPartitions of </text>
                        {this.generateTag({
                            x: textLeft + hpTabLeft,
                            y: -6,
                            width: 40,
                            height: 20

                        }, selectedMethod)}
                    </g>
                    <g clipPath={"url(#mask_hyperpartitions)"}>
                        <HyperPartitions
                            hyperpartitions={hyperpartitions}
                            datarunID={datarunID}
                            selectedMethod={selectedMethod}
                            classifiers={classifiers}
                            compareK={compareK}
                            hyperpartitionsSelected={this.state.hyperpartitionsAlreadySelected}
                            width={hyperPartWidth}
                            height={hyperPartHeight}
                            onHpsCheckBoxChange={this.onHyperpartitionCheckBoxChange}
                            onMouseOverClassifier={this.onMouseOverClassifier}
                            mouseOverClassifier={this.state.mouseOverClassifier}
                        />
                    </g>
                </g>
            </g>
        )
    }

    generateHyperparameterText() {
        const {
            headerHeight,
            hyTabLeft,
            textLeft,
            hyperPartWidth,
            hyperParamWidth
        } = this.state.methodCoords;

        const { selectedMethod } = this.state;

        let methodHeight = this.setMethodHeight();
        let hyperPartHeight = this.setHyperPartitionsHeight();

        const shapeProps = {
            transform: `translate(${0}, ${methodHeight + headerHeight + hyperPartHeight})`,
            width: hyperPartWidth,
            height: hyperPartHeight,
            onClick: this.onHyperpartitionButtonClick
        }

        const textProps = {
            textAnchor: "start",
            x: textLeft,
            y: 10,
            style: { font: "bold 16px sans-serif" }
        };

        return (
            <g>
                <g {...shapeProps}>
                    {this.generateRect({
                        x: 10,
                        y: -9,
                        width: hyperParamWidth - 68,
                        height: 28
                    }, 0, this.onHyperpartitionButtonClick)}
                    <text {...textProps}>HyperParameters of</text>
                    {this.generateTag({
                        x: textLeft + hyTabLeft,
                        y: -6,
                        width: 40,
                        height: 20

                    }, selectedMethod)}
                </g>
            </g>
        )
    }

    generateHyperparameter() {
        const {
            headerHeight,
            textLeft,
            hyTabLeft,
            hyperParamWidth,
            hyperParamHeight
        } = this.state.methodCoords;

        const {
            selectedMethod,
            classifiers
        } = this.state;

        const { compareK } = this.props;
        let hyperPartHeight = this.setHyperPartitionsHeight();
        let methodHeight = this.setMethodHeight();

        const shapeProps = {
            transform: `translate(${0}, ${headerHeight + methodHeight + hyperPartHeight + 35})`,
            clipPath: "url(#mask_hyperparameters)",
        }
        const rectProps = {
            x: 0,
            y: -10,
            width:hyperParamWidth + 200,
            height:hyperParamHeight + 100
        }

        return (
            <g>
                <defs>
                    <clipPath id="mask_hyperparameters">
                        <rect {...rectProps} />
                    </clipPath>
                </defs>
                <g {...shapeProps}>
                    <g onClick={this.onHyperpartitionButtonClick}>
                        {this.generateRect({
                            x: 10,
                            y: -9,
                            width: hyperParamWidth - 68,
                            height: 28
                        }, 1, this.onHyperpartitionButtonClick)}
                        <text
                            textAnchor="start"
                            x={textLeft}
                            y={10}
                            style={{ font: "bold 16px sans-serif" }}
                        >HyperParameters of</text>
                        {this.generateTag({
                            x: textLeft + hyTabLeft,
                            y: -6,
                            width: 40,
                            height: 20

                        }, selectedMethod)}
                    </g>
                    <HyperParameters
                        classifiers={classifiers}
                        selectedMethod={selectedMethod}
                        compareK={compareK}
                        alreadySelectedRange={this.state.hyperparametersRangeAlreadySelected[selectedMethod] ? this.state.hyperparametersRangeAlreadySelected[selectedMethod] : {}}
                        onSelectedChange={this.onBrushSelected}
                        mouseOverClassifier={this.state.mouseOverClassifier}
                        height={hyperParamHeight}
                        width={hyperParamWidth}
                    />
                </g>
            </g>
        )
    }
    render() {
        const { methodCoords } = this.state;
        const textLeft = methodCoords.textLeft;

        let {
            datarun,
            hyperpartitions,
            compareK
        } = this.props;

        let { displaymode, classifiers } = this.state;

        let usedMethods: string[] = Object.keys(datarun);
        let unusedMethods = Object.keys(methodsDef).filter((name: string) => usedMethods.indexOf(name) < 0);
        let svgWidth = methodCoords.svgWidth;
        let methodHeight = this.setMethodHeight();

        const generateRectProps = {
            x: 10,
            y: -9,
            width: svgWidth - 68,
            height: 28
        }
        
        const textProps = {
            textAnchor:"start", 
            x:textLeft,
            y:10,
            style:{ font: "bold 16px sans-serif" },
        }

        return (
            <div className="svgWrapper" style={{height: `${this.props.height}%`}}>
                <GenerateSvg id="svgChart">
                    <g transform={`translate(${0}, ${this.state.methodCoords.headerHeight})`}>
                        {this.generateRect({...generateRectProps }, 1, () => { })}
                        <text {...textProps}>Algorithms</text>
                        <Methods
                            classifiers={classifiers}
                            width={svgWidth}
                            height={methodHeight}
                            displaymode={displaymode}
                            onSelectMethod={this.onSelectMethod}
                            selectedMethod={this.state.selectedMethod}
                            usedMethods={usedMethods}
                            unusedMethods={unusedMethods}
                            hyperpartitions={hyperpartitions}
                            configsMethod={this.state.configsMethod}
                            methodSelected={this.state.methodSelected}
                            onMethodsCheckBoxChange={this.onMethodsCheckBoxChange}
                            compareK={compareK}
                            recommendationResult={this.props.recommendationResult}
                        />
                    </g>
                    {displaymode == 1 || displaymode == 2 ? this.generateHyperpartition() : this.generateHyperpartitionText()}
                    {displaymode == 2 ? this.generateHyperparameter() : displaymode == 1 ? this.generateHyperparameterText() : <g />}
                </GenerateSvg>
            </div>
        )
    }
}