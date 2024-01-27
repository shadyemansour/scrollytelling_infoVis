import { getData, getColor } from '../utils.js';
import DataPaths from '../utils/constants.js';


export async function getUsageData() {
    let loadedData = await getData(DataPaths.USAGE_DATA);
    let usageData = new UsageData();
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
    usageData.metadata.region.array = meta;
    usageData.metadata.region.lookup = lookup;


    // Process indicators
    let indicators = loadedData.map((d, i) => ({
        ...meta[i],
        "Car": d['car'],
        "Oepnv": d['oepnv'],
    }));

    // Additional processing for region
    ["Car", "Oepnv", "Bike"].forEach((key) => {
        let values = indicators.map((d) => d[key]).sort((a, b) => a - b);
        const min = Math.min(...values);
        const max = Math.max(...values);
        indicators.forEach(
            (d, i) => {
                if (key === "Bike") {
                    (indicators[i][key + '_color'] = "rgba(0,0,25,0.75)");

                } else {
                    (indicators[i][key + '_color'] = getColor(min, max, 'interpolate' + key)(d[key]));
                }
            }
        );

    });
    // console.log(indicators);    
    usageData.data.region.indicators = indicators; // Save regions indictors to data

    return usageData;
}

export class UsageData {
    constructor() {
        this.data = { region: {} };
        this.metadata = { region: {} };
    }
}

export default getUsageData;

