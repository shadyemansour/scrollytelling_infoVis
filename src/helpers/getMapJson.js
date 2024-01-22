import DataPaths from '../utils/constants.js';
import { feature } from "topojson-client";

export async function getMapJson() {
    let response = await fetch(DataPaths.MAP_DATA);
    let json = await response.json();
  
    let states = await feature(json, json.objects['states']);
    let cities = await feature(json, json.objects['cities']);

    states.features.sort((a, b) => a.properties.AREANM.localeCompare(b.properties.AREANM));
  
    return { states, cities  };
}

export default getMapJson;