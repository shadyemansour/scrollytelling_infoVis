import { getMotion } from '../utils.js';
    
    let animation = getMotion(); // Set animation preference depending on browser preference true/false
    
    // Functions for chart and map on:select and on:hover events
	export function doSelect(e) {
		console.log(e);
		selected = e.detail.id;
		if (e.detail.feature) fitById(selected); // Fit map if select event comes from map
	}
	export function doHover(e) {
		hovered = e.detail.id;
	}

	// Functions for map component
	export function fitBounds(bounds, map) {
		if (map) {
			map.fitBounds(bounds, { animate: animation, padding: 30 });
		}
	}
	export function fitById(id, geojson) {
		if (geojson && id) {
			let feature = geojson.features.find((d) => d.properties.AREACD == id);
			let bounds = bbox(feature.geometry);
			fitBounds(bounds);
		}
	}