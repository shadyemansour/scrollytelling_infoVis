import { csvParse, autoType } from 'd3-dsv';
import { feature } from 'topojson-client';
import { extent } from 'geojson-bounds';
import { themes } from './config.js';
import * as d3 from 'd3';
// CORE FUNCTIONS

export function getMotion() {
  let mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)"); // Check if browser prefers reduced motion
	return !mediaQuery || mediaQuery.matches ? false : true; // return true for motion, false for no motion
}

// DEMO-SPECIFIC FUNCTIONS
export async function getData(url) {
  let response = await fetch(url);
  let string = await response.text();
	let data = await csvParse(string, autoType);
  return data;
}

export async function getTopo(url, layer) {
  let response = await fetch(url);
  let json = await response.json();
  let geojson = await feature(json, layer);
  return geojson;
}


export function getColor(min, max, colors= "") {
  var colorScale;
  switch (colors) {
    case "interpolateBlues":
      colorScale = d3.scaleSequential()
            .domain([min, max])
            .interpolator(d3.interpolateBlues);
      break;
    case "interpolateInferno":
      colorScale = d3.scaleSequential()
            .domain([min, max])
            .interpolator(d3.interpolateInferno);
            break;
    case "interpolateMagma":
      colorScale = d3.scaleSequential()
            .domain([min, max])
            .interpolator(d3.interpolateMagma);
            break;
    case "interpolateViridis":
      colorScale = d3.scaleSequential()
            .domain([min, max])
            .interpolator(d3.interpolateViridis);
            break;
      case "interpolateGreens":
      colorScale = d3.scaleSequential()
            .domain([min, max])
            .interpolator(d3.interpolateGreens);
            break;
      case "car":
      colorScale = d3.scaleSequential()
            .domain([min, max])
            .interpolator(d3.interpolateHsl(themes.car.bright, themes.car.dark));
            break;
            
    default:
      colorScale = d3.scaleSequential()
            .domain([min, max])
            .interpolator(d3.interpolateMagma);
      break;
  }
  return colorScale;
}

export function getInfernoColor(value, breaks) {
  let found = false;
  let i = 1;
  while (found == false) {
    if (value <= breaks[i]) {
      color = colors[i - 1];
      found = true;
    } else {
      i ++;
    }
  }
  return color ? color : 'lightgrey';
}
