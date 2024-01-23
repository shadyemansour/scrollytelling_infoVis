import {getData, getColor } from '../utils.js';
import DataPaths from '../utils/constants.js';


export async function getCityBikeRating() {
    let loadedData = await getData(DataPaths.CITY_BIKE_RATING);
    let cityBikeRatingData = new CityBikeRatingData();
    // Process metadata
    let meta = loadedData.map((d) => ({
        name: d.name, // City Name
        // parent: d.parent ? d.parent : null
    }));
    let lookup = {};

    meta.forEach((d) => {
        lookup[d.name] = d;
    });
    cityBikeRatingData.metadata.city.array = meta;
    cityBikeRatingData.metadata.city.lookup = lookup;


    // Process indicators
    let indicators = loadedData.map((d, i) => ({
        ...meta[i],
        "Bike": d['rating'],
        "Positive1": d['Positiv1'],
        "Positive2": d['Positiv2'],
        "Positive3": d['Positiv3'],
        "Negative1": d['Negativ1'],
        "Negative2": d['Negativ2'],
        "Negative3": d['Negativ3'],

    }));

    // Additional processing for city

    indicators.forEach(
        (d, i) => {
            (indicators[i]['Bike_color'] = 'rgba(0, 0, 0, 1)');
        }
    );

    console.log(indicators)
    console.log(lookup)
            
    
    //console.log(indicators);    
    cityBikeRatingData.data.city.indicators = indicators; // Save citys indictors to data

    return cityBikeRatingData;
}

export class CityBikeRatingData {
    constructor() {
        this.data = { city: {} };
        this.metadata = { city: {} };
    }
}

export default getCityBikeRating;

