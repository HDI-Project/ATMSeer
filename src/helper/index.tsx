let names: string[] = []
const COLORS: string[] = [
    // ' #9e0142',
    ' #fdae61',
    // ' #d53e4f',
    ' #a0ef98',
    ' #f46d43',
    // ' #ffffbf',
    ' #66c2a5',
    ' #3288bd',
    ' #5e4fa2',
    ' #d53e4f',
    ' #fee08b',
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

export { getColor, csv2json, prepareBoxplotData }
