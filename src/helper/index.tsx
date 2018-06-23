let names: string[] = []
const COLORS: string[] = [
    // ' #9e0142',
    ' #fdae61',
    // ' #d53e4f',
    // ' #e6f598',
    ' #f46d43',
    // ' #ffffbf',
    ' #66c2a5',
    ' #3288bd',
    ' #5e4fa2',
    ' #d53e4f',
    // ' #fee08b',
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

export { getColor }