import {getData, getTopo, getColor } from '../utils.js';
import DataPaths from '../utils/constants.js';



export async function getRegionData() {
    let loadedData = await getData(DataPaths.REGION_DATA);
    let regionData = new RegionData();
    // Process metadata
    let meta = loadedData.map((d) => ({
        code: d.code, // Bundesland Code
        name: d.name, // Bundesland Name
        parent: d.parent ? d.parent : null
    }));
    let lookup = {};

    meta.forEach((d) => {
        lookup[d.code] = d;
    });
    regionData.metadata.region.array = meta;
    regionData.metadata.region.lookup = lookup;


    // Process indicators
    let indicators = loadedData.map((d, i) => ({
        ...meta[i],
        "Car": d['car'],
        "Oepnv": d['oepnv'],
    }));

    // Additional processing for region
    ["Car", "Oepnv"].forEach((key) => {
        let values = indicators.map((d) => d[key]).sort((a, b) => a - b);
        const min = Math.min(...values);
        const max = Math.max(...values);
        indicators.forEach(
            (d, i) => {
                (indicators[i][key + '_color'] = getColor(min, max, 'interpolate'+key)(d[key]));
            }
        );
            
    });
    console.log(indicators);    
    regionData.data.region.indicators = indicators; // Save regions indictors to data

    return regionData;
}

export class RegionData {
    constructor() {
        this.data = { region: {} };
        this.metadata = { region: {} };
    }
}

export default getRegionData;

