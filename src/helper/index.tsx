import {IClassifier, IDatarun} from 'types';

const names: string[] = ['svm', 'knn', 'mlp', 'bnb', 'sgd', 'pa','dt','rf','et','mnb','ada','logreg','gp','gnb'] // fix the color of methods
const COLORS: string[] = [
    "#1A7AB1",
    "#ADC8E6",
    "#FF772D",
    "#FFB87F",
    "#2AA13A",
    "#98E090",
    "#FF9398",
    "#9467B9",
    "#C5B0D3",
    "#C49B95",
    "#E474C0",
    "#F7B4D1",
    "#BCBC3D",
    "#07C1CD"
    ]

const GREEN: string[] = [
    "#498B77",
    "#89C2AE",
    "#C1D6D3"
]
const BLUE: string[] = [
    "#3E97C7",
    "#72B3CF",
    "#8FCCDD",
    "#C8DADE"

]
const ORANGE: string[] = [
    "#E96206",
    "#F79143",
    "#F6AD76",
    "#F7CEA7"
]
const PINK: string[] = [
    "#F6B1C3",
    "#F07F93",
    "#DE4863",
    "#BC0F46"

]
const RED: string = "#DC143C";
const YELLOW : string = '#fee08b';
const getColor = (name: string, palatte: number = 0): string =>{
    let colors: string[]
    switch (palatte) {
        case 0:
            colors = COLORS
            break
        case 1:
            colors = GREEN
            break
        case 2:
            colors = BLUE
            break
        case 3:
            colors = ORANGE
            break
        case 4:
            colors = PINK
            break
        default:
            colors = COLORS
    }
    let idx: number = names.indexOf(name)
    let numColor = colors.length
    if (idx === -1) {
        names.push(name)
        return colors[(names.length - 1) % numColor]
    } else {
        return colors[idx % numColor]
    }
}

export const filterByMethod=(csv: string|any)=>{
    let lines = csv.split('\n')
    let result:any[] = [lines[0]]
    //make a unique array of the methods that were used
    let methodsUsed = csv2json(csv)[1]['data'].filter(
        (key:string, index:number, self:any) => {
            return self.indexOf(key) === index;
        })
    //create a new array ordered by the methods
    methodsUsed.forEach((method:string) =>{
        lines.forEach((row:string) => {
            let elements = row.split(',')
            if (elements[1] == method) {
                result.push(row)
            }
        })
    });
    return result
}
export const getGradientColor = (startColor : string,endColor :string,step : number) => {
    let colorRgb = (sColor : string)=>{
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        var sColor = sColor.toLowerCase();
        if(sColor && reg.test(sColor)){
            if(sColor.length === 4){
                var sColorNew = "#";
                for(var i=1; i<4; i+=1){
                    sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));
                }
                sColor = sColorNew;
            }
            var sColorChange = [];
            for(var i=1; i<7; i+=2){
                sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));
            }
            return sColorChange;
        }else{
            return sColor;
        }
    };
    startColor = startColor.replace(/\s+/g,"");
    endColor = endColor.replace(/\s+/g,"");
    let startRGB : any = colorRgb(startColor);//转换为rgb数组模式
    //console.log(startRGB);
    let startR = startRGB[0];
    let startG = startRGB[1];
    let startB = startRGB[2];

    let endRGB : any = colorRgb(endColor);
    //console.log(endRGB);

    let endR = endRGB[0];
    let endG = endRGB[1];
    let endB = endRGB[2];

    let sR = (endR-startR)/step;//总差值
    let sG = (endG-startG)/step;
    let sB = (endB-startB)/step;

    var colorArr = [];
    for(var i=0;i<step;i++){
        var R = parseInt((sR*i+startR));
        var G = parseInt((sG*i+startG));
        var B = parseInt((sB*i+startB));
        var strHex = "#";
        var aColor = new Array();
        aColor[0] = R;
        aColor[1] = G;
        aColor[2] = B;
        for(let j=0; j<3; j++){
            let hex : string = Number(aColor[j]).toString(16);
            let shex : string = Number(aColor[j])<10 ? '0'+hex :hex;
            if(shex === "0"){
                shex += shex;
            }
            strHex += shex;
        }
      colorArr.push(strHex);
    }
    return colorArr;
}




export const filterByDescending=(csv: string|any)=>{
    let lines = csv.split('\n')
    let result:any = [lines[0]]
    let performances:any = []
    //create an array of only the performances
    let rawPerformances = csv2json(csv)[5]['data']
    rawPerformances.forEach((value:any) => {
        performances.push(value)
    })
    performances.sort().reverse() //sort in descending order

    //create a new array according to the new descending order
    performances.forEach((rankedPerf:any) => {
        lines.forEach((row:any) => {
            if (rankedPerf == row.split(',')[5] && rankedPerf != '0.000 +- 0.000') {
                result.push(row)
            }
        })
    })
    return result
}

const csv2json=(csv: string|any)=>{
    let lines = csv.split('\n')
    let keys = lines[0].split(',').map(
            (key:string)=>{
                let data:any[] = []
                return {name: key, data}
            })

    lines.shift() //remove headers
    lines.splice(-1, 1) // remove lats empty line
    lines.forEach((row:string) => {
        const cells = row.split(',')
        cells.forEach((cell, idx)=>{
            keys[idx].data.push(cell)
        })
    });

    return keys
}

const EChartsColor = [
    "#c23531",
    "#2f4554",
    "#61a0a8",
    "#d48265",
    "#91c7ae",
    "#749f83"
]

const parseDatarun=(csv: string|any)=>{
    let lines = csv.split('\n')

    let keys = lines[0].split(',')
    let datarun:IDatarun = {}

    lines.shift() //remove headers
    lines.splice(-1, 1) // remove lats empty line
    let trailID = 0;
    lines.forEach((row:string, idx:number) => {
        const cells = row.split(',')
        let record:IClassifier = {'trail ID':idx, method:''}

        cells.forEach((cell, idx)=>{
            record[keys[idx]] = cell
        })
        record['trail ID'] = trailID;
        trailID++;
        let methodIndex = keys.indexOf('method')
        let methodName = cells[methodIndex]
        if(datarun[methodName]){
            datarun[methodName].push(record)
        }else{
            datarun[methodName] = [record]
        }

    });

    //classify datarun based on methods type

    return datarun
}

function asc(arr:number[]) {
    arr.sort(function (a, b) {
        return a - b;
    });
    return arr;
}

var quantile = function(ascArr:number[], p:number) {
    var H = (ascArr.length - 1) * p + 1,
        h = Math.floor(H),
        v = +ascArr[h - 1],
        e = H - h;
    return e ? v + e * (ascArr[h] - v) : v;
};


var prepareBoxplotData = function (rawData:any[], opt:any) {
    opt = opt || [];
    var boxData = [];
    var outliers = [];
    var axisData = [];
    var boundIQR = opt.boundIQR;
    var useExtreme = boundIQR === 'none' || boundIQR === 0;

    for (var i = 0; i < rawData.length; i++) {
        axisData.push(i + '');
        var ascList = asc(rawData[i].slice());

        var Q1 = quantile(ascList, 0.25);
        var Q2 = quantile(ascList, 0.5);
        var Q3 = quantile(ascList, 0.75);
        var min = ascList[0];
        var max = ascList[ascList.length - 1];

        var bound = (boundIQR == null ? 1.5 : boundIQR) * (Q3 - Q1);

        var low = useExtreme
            ? min
            : Math.max(min, Q1 - bound);
        var high = useExtreme
            ? max
            : Math.min(max, Q3 + bound);

        boxData.push([low, Q1, Q2, Q3, high]);

        for (var j = 0; j < ascList.length; j++) {
            var dataItem = ascList[j];
            if (dataItem < low || dataItem > high) {
                var outlier = [i, dataItem];
                opt.layout === 'vertical' && outlier.reverse();
                outliers.push(outlier);
            }
        }
    }
    return {
        boxData: boxData,
        outliers: outliers,
        axisData: axisData
    };
};
//data-intro={getIntro("dataview").intro} data-step={getIntro("dataview").step}
//import {getIntro} from 'helper';

const introHidden = "-1";
introHidden;
const introDataSelectorPanel = 2;
const introData = {
    // the selector in the sidepanel.
    "dataselector_panel":{
        intro:"You can use this panel to select which dataset or datarun show. Also you can upload datasets and configurate the settings of dataruns in this panel.",
        step:`${1}`
    },
    "dataset_selector":{
        intro:"You can select a dataset here.",
        step:`${introDataSelectorPanel}`
    },
    "dataset_upload":{
        intro:"You can upload a dataset here.",
        step:`${introDataSelectorPanel+1}`
    },
    "datarun_add":{
        intro:"You can add a new datarun here.",
        step:`${introDataSelectorPanel+2}`
    },
    "datarun_selector":{
        intro:"You can select a datarun here.",
        step:`${introDataSelectorPanel+3}`
    },
    "datarun_run":{
        intro:"You can run/stop a datarun here.",
        step:`${introDataSelectorPanel+4}`
    },
    "dataview":{
        intro:"You can see the overview of feature and the distribution of features in the specific dataset in this panel.",
        step:"7"
    },
    "dataview_overview":{
        intro:"The dataset overview is displayed here.",
        step:"8"
    },
    "dataview_chart":{
        intro:"You can see each feature distribution here.",
        step:"9"
    },
    "leaderboard":{
        intro:"You can see datarun information here, and compare the top classifiers in this panel.",
        step:"10"
    },
    "leaderboard_overview":{
        intro:"You can see some information about this datarun here.",
        step:"11"
    },
    "leaderboard_topclassifer":{
        intro:"You can compare classifiers here",
        step:"12"
    },
    "leaderboard_topclassifier_number":{
        intro:"You can input the number of classifiers listed below.",
        step:"13"
    },
    "leaderboard_topclassifer_focus":{
        intro:"You can open this button and compare models in the right panel",
        step:"14"
    },
    "leaderboard_topclassifer_list":{
        intro:"You can see the information about the top classifiers in this list",
        step:"15"
    }
    
    
}
export function getIntro(label:string){
    return introData[label];
}
export { RED,YELLOW, getColor, EChartsColor, csv2json, parseDatarun, prepareBoxplotData }
