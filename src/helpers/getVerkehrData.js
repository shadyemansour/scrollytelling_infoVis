import {getData, getTopo, getColor } from '../utils.js';
import DataPaths from '../utils/constants.js';



export async function getVerkehrData() {
    let loadedData = await getData(DataPaths.VERKEHR_DATA);
    let verkehrData = new VerkehrData();
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
    verkehrData.metadata.array = meta;
    verkehrData.metadata.lookup = lookup;


    // Process timeseries
    let years = [
        2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
        2016, 2017, 2018, 2019, 2020
    ];

    let timeseries = [];
    loadedData.forEach((d) => {
        years.forEach((year) => {
            timeseries.push({
                code: d.code,
                name: d.name,
                value: d[year],
                year
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

