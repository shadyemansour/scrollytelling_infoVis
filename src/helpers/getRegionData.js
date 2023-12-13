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
    console.log(loadedData)

    console.log(meta)
    meta.forEach((d) => {
        lookup[d.code] = d;
    });
    regionData.metadata.region.array = meta;
    regionData.metadata.region.lookup = lookup;


    // Process indicators
    let indicators = loadedData.map((d, i) => ({
        ...meta[i],
        2020: d['2020'],
        2021: d['2021'],
        2022: d['2022'],
        2023: d['2023']
    }));

    // Additional processing for region
    [2020, 2021, 2022, 2023].forEach((key) => {
        let values = indicators.map((d) => d[key]).sort((a, b) => a - b);
        const min = Math.min(...values);
        const max = Math.max(...values);
        indicators.forEach(
            (d, i) =>
                (indicators[i][key + '_color'] = getColor(min, max, 'interpolateGreens')(d[key]))
        );
        // switch (key) {
        //     case 'density':
        //         indicators.forEach(
        //             (d, i) =>
        //                 (indicators[i][key + '_color'] = getColor(min, max, 'interpolateViridis')(d[key]))
        //         );
        //         break;
        //     case 'age_med':
        //         indicators.forEach(
        //             (d, i) =>
        //                 (indicators[i][key + '_color'] = getColor(min, max, 'interpolateInferno')(d[key]))
        //         );
        //         break;
        //     case 'area':
        //         indicators.forEach(
        //             (d, i) =>
        //                 (indicators[i][key + '_color'] = getColor(min, max, 'interpolateBlues')(d[key]))
        //         );
        //         break;

        //     default:
        //         indicators.forEach((d, i) => (indicators[i][key + '_color'] = colorScale(d[key])));
        //         break;
        // }
    });
    regionData.data.region.indicators = indicators; // Save regions indictors to data

    // // Process timeseries
    // let years = [
    //     2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
    //     2016, 2017, 2018, 2019, 2020
    // ];

    // let timeseries = [];
    // loadedData.forEach((d) => {
    //     years.forEach((year) => {
    //         timeseries.push({
    //             code: d.code,
    //             name: d.name,
    //             value: d[year],
    //             year
    //         });
    //     });
    // });
    
    // regionData.data.region.timeseries = timeseries; // Save timeseries indictors to data
    console.log(regionData);
    return regionData;
}

export class RegionData {
    constructor() {
        this.data = { region: {} };
        this.metadata = { region: {} };
    }
}

export default getRegionData;

