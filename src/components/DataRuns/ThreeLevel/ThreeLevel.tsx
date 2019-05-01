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
import GenerateSvg from './../../Utils/GenerateSvg';
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
                headerHeight: 10,
                textleft: 40,
                hptableft: 145,
                hytableft: 156,
                methodHeight: window.innerHeight * 0.74,
                hyheight: window.innerHeight * 0.74 /3
            }
        }
        this.generateRect = this.generateRect.bind(this);
        this.onMethodButtonClick = this.onMethodButtonClick.bind(this);
        this.generateHyperpartition = this.generateHyperpartition.bind(this);
        this.generateHyperpartitionText = this.generateHyperpartitionText.bind(this);
        this.generateHyperparameter = this.generateHyperparameter.bind(this);
        this.generateHyperparameterText = this.generateHyperparameterText.bind(this);
        this.updateCurrentDataRun = this.updateCurrentDataRun.bind(this);
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
        this.setState({
            selectedMethod: methodName,
            displaymode: displaymode
        })
    }

    componentDidMount() {
        this.getCurrentConfigs();
        this.getClassifiers();
    }

    getClassifiers() {
        let {classifiers} = this.props;
        classifiers = classifiers.sort((a, b) => b.cv_metric - a.cv_metric) // best performance in the front;
        this.setState({
            classifiers
        })
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
                    this.setState({ loading: true });

                    let submitconfigs: IUpdateDatarunConfig = {};
                    submitconfigs.configs = configs;
                    submitconfigs.method_configs = this.state.hyperparametersRangeAlreadySelected;
                    if (this.state.hyperpartitionsAlreadySelected.length > 0) {
                        submitconfigs.hyperpartitions = this.state.hyperpartitionsAlreadySelected;
                    }
                    let promise: Promise<ICommonResponse> = updateDatarunConfigs(datarunID, submitconfigs);
                    promise.then(status => {
                        if (status.success == true) {
                            message.success("Update Configs Successfully.");
                        } else {
                            message.error("Update Configs Failed.");
                        }
                        this.setState({ loading: false });
                    }).catch(error => {
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
            let classifiers = nextProps.classifiers.sort((a, b) => b.cv_metric - a.cv_metric) // best performance in the front;
            this.setState({
                methodSelected: methodSelected,
                hyperpartitionsAlreadySelected: hyperpartitionsAlreadySelected,
                selectedMethod: selectedMethod,
                classifiers
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

    getMethodHeight() {
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

    getHyperPartitionsHeight() {
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
        return name !== "" ?
            <g className="tag" transform={`translate(${x},${y})`}>
                <rect
                    width={width}
                    height={height}
                    style={{ fill: getColor(name) }}
                    rx={5}
                    ry={5}
                />
                <text y={height - 5} x={width / 2} textAnchor="middle" style={{ fill: "white" }}>{name}</text>
            </g> : <g className="tag" />
    }

    generateRect(box: any, mode: number, eventCallback: () => void) {
        const svgProps = {
            rect: {
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
            },

            foreignObj: {
                x: box.x + 10,
                y: box.y + 3,
                width: 35,
                height: 35
            }
        }

        const iconDir = mode === 0 ? 'right' : 'down';

        return mode === 0 || mode === 1 ?
            <g>
                <rect {...svgProps.rect} />
                <foreignObject {...svgProps.foreignObj}>
                    <Icon type={iconDir} />
                </foreignObject>
            </g> : <g />
    }

    generateHyperpartitionText() {
        let { svgHeight, headerHeight, svgWidth, textleft, hptableft } = this.state.methodCoords;
        const { displaymode, selectedMethod } = this.state;
        let hpheight = svgHeight / 2;
        let width2 = svgWidth;


        let methodHeight = this.getMethodHeight();
        if (displaymode == 0) {
            hpheight = 100;
        }

        if (displaymode == 2) {
            hpheight = svgHeight * 0.7 / 3;
        }

        return (
            <g>
                <g transform={`translate(${0}, ${methodHeight + headerHeight})`} width={width2} height={hpheight} onClick={this.onMethodButtonClick}>
                    {this.generateRect({
                        x: 10,
                        y: -9,
                        width: width2 - 68,
                        height: 28
                    }, 0, this.onMethodButtonClick)}
                    <text
                        textAnchor="start"
                        x={textleft}
                        y={10}
                        style={{ font: "bold 16px sans-serif", display: "inline" }}
                    >HyperPartitions of </text>
                    {this.generateTag({
                        x: textleft + hptableft,
                        y: -6,
                        width: 40,
                        height: 20

                    }, selectedMethod)}
                </g>
            </g>)
    }

    generateHyperpartition() {

        let buttonMode = 0;
        const { displaymode, selectedMethod, classifiers } = this.state;
        const { hyperpartitions, datarunID, compareK} = this.props;
        const {
            headerHeight,
            svgWidth,
            //hpheight,
            textleft,
            hptableft
        } = this.state.methodCoords
        const width2 = svgWidth;
        const methodHeight = this.getMethodHeight();
        const hpheight = this.getHyperPartitionsHeight()

        if (displaymode == 2) {
            buttonMode = 1;
        }

        buttonMode;

        return (<g><defs>
            <clipPath id="mask_hyperpartitions">
                <rect x={0} y={30} width={width2} height={hpheight - 30} />
            </clipPath>
        </defs>
            <g transform={`translate(${0}, ${headerHeight + methodHeight})`} width={width2} height={hpheight}>
                <g onClick={this.onMethodButtonClick}>
                    {this.generateRect({
                        x: 10,
                        y: -9,
                        width: width2 - 68,
                        height: 28
                    }, 1, this.onMethodButtonClick)}
                    <text
                        textAnchor="start"
                        x={textleft}
                        y={10}
                        style={{ font: "bold 16px sans-serif", display: "inline" }}
                    >HyperPartitions of </text>
                    {this.generateTag({
                        x: textleft + hptableft,
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
                        width={width2}
                        height={hpheight}
                        onHpsCheckBoxChange={this.onHyperpartitionCheckBoxChange}
                        onMouseOverClassifier={this.onMouseOverClassifier}
                        mouseOverClassifier={this.state.mouseOverClassifier}
                    />
                </g>

            </g>
        </g>)
    }

    generateHyperparameterText() {
        const { headerHeight, svgWidth, textleft, hytableft } = this.state.methodCoords;
        const { selectedMethod } = this.state;
        const width2 = svgWidth;
        const width3 = svgWidth;
        const methodHeight = this.getMethodHeight();
        const hpheight = this.getHyperPartitionsHeight();

        return (
            <g>
                <g transform={`translate(${0}, ${methodHeight + headerHeight + hpheight})`} width={width2} height={hpheight} onClick={this.onHyperpartitionButtonClick}>
                    {this.generateRect({
                        x: 10,
                        y: -9,
                        width: width3 - 68,
                        height: 28
                    }, 0, this.onHyperpartitionButtonClick)}
                    <text
                        textAnchor="start"
                        x={textleft}
                        y={10}
                        style={{ font: "bold 16px sans-serif" }}
                    >HyperParameters of</text>
                    {this.generateTag({
                        x: textleft + hytableft,
                        y: -6,
                        width: 40,
                        height: 20

                    }, selectedMethod)}
                </g>
            </g>)
    }

    generateHyperparameter() {
        const { svgWidth, hyheight, headerHeight, textleft, hytableft } = this.state.methodCoords;
        const methodHeight = this.getMethodHeight();
        const { selectedMethod, classifiers } = this.state;
        const { compareK } = this.props;

        const width3 = svgWidth;
        const hpheight = this.getHyperPartitionsHeight();
        return <g><defs>
            <clipPath id="mask_hyperparameters">
                <rect x={0} y={-10} width={width3 + 200} height={hyheight + 100} />
            </clipPath>
        </defs>
            <g transform={`translate(${0}, ${headerHeight + methodHeight + hpheight + 35})`} clipPath={"url(#mask_hyperparameters)"}>
                <g onClick={this.onHyperpartitionButtonClick}>
                    {this.generateRect({
                        x: 10,
                        y: -9,
                        width: width3 - 68,
                        height: 28
                    }, 1, this.onHyperpartitionButtonClick)}
                    <text
                        textAnchor="start"
                        x={textleft}
                        y={10}
                        style={{ font: "bold 16px sans-serif" }}
                    >HyperParameters of</text>
                    {this.generateTag({
                        x: textleft + hytableft,
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
                    height={hyheight}
                    width={width3}
                />
            </g></g>
    }

    render() {
        let {
            datarun,
            hyperpartitions,
            compareK,
        } = this.props;
        const {
            headerHeight,
            svgWidth,
            textleft,
        } = this.state.methodCoords;

        const {classifiers } = this.state;

        let {displaymode} = this.state
        let usedMethods: string[] = Object.keys(datarun);
        let unusedMethods = Object.keys(methodsDef).filter((name: string) => usedMethods.indexOf(name) < 0)

        let width1 = svgWidth;
        let methodHeight = this.getMethodHeight();

        return (
            <div className="svgWrapper" style={{ height: `${this.props.height}%` }}>
                <GenerateSvg id="svgChart">
                    <g transform={`translate(${0}, ${headerHeight})`}>
                        {this.generateRect({
                            x: 10,
                            y: -9,
                            width: width1 - 68,
                            height: 28
                        }, 1, () => { })}
                        <text
                            textAnchor="start"
                            x={textleft}
                            y={10}
                            style={{ font: "bold 16px sans-serif" }}
                        >Algorithms</text>
                        <Methods
                            classifiers={classifiers}
                            width={width1}
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
