import {getData} from '../utils.js';
import DataPaths from '../utils/constants.js';



export async function getVerkehrData() {
    let loadedData = await getData(DataPaths.VERKEHR_DATA);
    let verkehrData = new VerkehrData();
    // Process metadata
    let meta = loadedData.map((d) => ({
        code: d.code,
        name: d.name, // Name
        parent: d.parent ? d.parent : null
    }));
    let lookup = {};
    meta.forEach((d) => {
        lookup[d.code] = d;
    });
    verkehrData.metadata.array = meta;
    verkehrData.metadata.lookup = lookup;


    // Process timeseries
    let yearMonths = [];
    for (let year = 2015; year <= 2020; year++) {
        for (let month = 1; month <= 12; month++) {
            let yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
            yearMonths.push(yearMonth);
        }
    }

    let timeseries = [];
    loadedData.forEach((d) => {
        yearMonths.forEach((yearMonth) => {
            let [year, month] = yearMonth.split('-');
            let value = d[yearMonth] || null; // Assuming the data structure uses year-month as keys
            timeseries.push({
                code: d.code,
                name: d.name,
                value: value,
                year: parseInt(year),
                month: parseInt(month)
            });
        });
    });
    
    verkehrData.data.timeseries = timeseries; // Save timeseries indictors to data
    console.log(verkehrData);
    return verkehrData;
}

export class VerkehrData {
    constructor() {
        this.data = {};
        this.metadata = {};
    }
}

export default getVerkehrData;

