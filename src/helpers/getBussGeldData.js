import {getData} from '../utils.js';
import DataPaths from '../utils/constants.js';
import { themes } from '../config.js';


export async function getBussGeldData() {
    let loadedData = await getData(DataPaths.BUSSGELD_DATA);
    let bussGeldData = new BussGeldData();

    let series = [];
    loadedData.forEach((d) => {
            series.push({
                code: d.code,
                type: d.type,
                category: d.category,
                amount: d.amount,
                color: getColor(d.code),
            });
    });
    
    bussGeldData.data = series; // Save timeseries indictors to data
    console.log(bussGeldData)
    return bussGeldData;
}

function getColor(code) {
    let color;
    switch(code){
        case "FA" : color = themes.bike.primary; break;
        case "OEF" : color = themes.oepnv.primary; break;
        case "AUT" : color = themes.car.primary; break;
    }
    return color;
}

export class BussGeldData {
    constructor() {
        this.data = {};
    }
}

export default getBussGeldData;

