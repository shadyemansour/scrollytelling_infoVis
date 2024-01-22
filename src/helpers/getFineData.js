import {getData} from '../utils.js';
import DataPaths from '../utils/constants.js';
import { themes } from '../config.js';


export async function getFineData() {
    let loadedData = await getData(DataPaths.FINE_DATA);

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
    return series;
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


export default getFineData;

