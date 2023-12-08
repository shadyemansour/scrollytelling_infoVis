<script>
	// CORE IMPORTS
	import { setContext, onMount } from 'svelte';
	import { getMotion } from '../utils.js';
	import { themes } from '../config.js';
	import LogoHeader from '../layout/LogoHeader.svelte';
	import Footer from '../layout/Footer.svelte';
	import Header from '../layout/Header.svelte';
	import Section from '../layout/Section.svelte';
	import Media from '../layout/Media.svelte';
	import Scroller from '../layout/Scroller.svelte';
	import Filler from '../layout/Filler.svelte';
	import Divider from '../layout/Divider.svelte';
	import Arrow from '../ui/Arrow.svelte';
	import Em from '../ui/Em.svelte';
	import * as d3 from 'd3';
	import  LineChartRace  from '../layout/LineChartRace.svelte';

	// DEMO-SPECIFIC IMPORTS
	import bbox from '@turf/bbox';
	import { getData, setColors, getTopo, getBreaks, getColor } from '../utils.js';
	import { colors, units } from '../config.js';
	// import { ScatterChart, LineChart, BarChart } from "@onsvisual/svelte-charts";
	import { Map, MapSource, MapLayer, MapTooltip } from '@onsvisual/svelte-maps';

	// CORE CONFIG (COLOUR THEMES)
	// Set theme globally (options are 'light', 'dark' or 'lightblue')
	let theme = 'light';
	setContext('theme', theme);
	setColors(themes, theme);

	// CONFIG FOR SCROLLER COMPONENTS
	// Config
	const threshold = 0.65;
	// State
	let animation = getMotion(); // Set animation preference depending on browser preference
	let id = {}; // Object to hold visible section IDs of Scroller components
	let idPrev = {}; // Object to keep track of previous IDs, to compare for changes
	onMount(async () => {
		await loadData();
		idPrev = { ...id };
	});

	// Constants
	const topojson = './data/1_sehr_hoch_topo.json';

	// Data
	var data_map = { region: {} };
	let metadata_map = { region: {} };
	var data_ver = {};
	let metadata_ver = {};
	let geojson;
	const mapbounds = [
		[5, 47.3],
		[15, 55.2]
	];

	// Element bindings
	let map = null; // Bound to mapbox 'map' instance once initialised

	// State
	let hovered; // Hovered district (chart or map)
	let selected; // Selected district (chart or map)
	let mapHighlighted = []; // Highlighted district (map only)
	let mapColor = 'inferno'; // Changes the color of map
	let mapKey = "density"; // Key for data to be displayed on map
	let explore = false; // Allows chart/map interactivity to be toggled on/off
	let trigger = -1;
	let currentLineChart='';

	var actions ={
			map: {
			// Actions for <Scroller/> with id="map"
			map01: () => {
				// Action for <section/> with data-id="map01"
				fitBounds(mapbounds);
				mapKey = 'density';
				mapHighlighted = [];
				explore = false;
				mapColor = 'inferno';
			},
			map02: () => {
				fitBounds(mapbounds);
				mapKey = 'age_med';
				mapHighlighted = [];
				explore = false;
			},
			map03: () => {
				let hl = [...data_map.region.indicators].sort((a, b) => b.age_med - a.age_med)[0];
				fitById(hl.code);
				mapKey = 'age_med';
				mapHighlighted = [hl.code];
				explore = false;
			},
			map04: () => {
				fitBounds(mapbounds);
				mapKey = 'age_med';
				mapHighlighted = [];
				explore = true;
			},
			map05: () => {
				fitBounds(mapbounds);
				mapKey = 'area';
				mapHighlighted = [];
				explore = true;
			}
		}
	}



	// FUNCTIONS (INCL. SCROLLER ACTIONS)

	// Functions for chart and map on:select and on:hover events
	function doSelect(e) {
		console.log(e);
		selected = e.detail.id;
		if (e.detail.feature) fitById(selected); // Fit map if select event comes from map
	}
	function doHover(e) {
		console.log(e.detail.id)
		hovered = e.detail.id;
	}

	// Functions for map component
	function fitBounds(bounds) {
		if (map) {
			map.fitBounds(bounds, { animate: animation, padding: 30 });
		}
	}
	function fitById(id) {
		if (geojson && id) {
			let feature = geojson.features.find((d) => d.properties.AREACD == id);
			let bounds = bbox(feature.geometry);
			fitBounds(bounds);
		}
	}




	// Code to run Scroller actions when new caption IDs come into view
	function runActions(codes = []) {
		codes.forEach((code) => {
			if (id[code] != idPrev[code]) {
				if (actions[code][id[code]]) {
					actions[code][id[code]]();
				}
				idPrev[code] = id[code];
			}
		});
	}
	$: id && runActions(Object.keys(actions)); // Run above code when 'id' object changes

	function loadData() {
	// INITIALISATION CODE
	getData('./data/data_region.csv')
		.then((arr) => {
			// Process metadata
			let meta = arr.map((d) => ({
				code: d.code, // Bundesland Code
				name: d.name, // Bundesland Name
			}));
			let lookup = {};
			meta.forEach((d) => {
				lookup[d.code] = d;
			});
			metadata_map.region.array = meta;
			metadata_map.region.lookup = lookup;

			// Process indicators
			var indicators = arr.map((d, i) => ({
				...meta[i],
				area: d.area,
				pop: d['2020'],
				density: d.density,
				age_med: d.age_med
			}));

			// Additional processing for region
			['density', 'age_med', 'area'].forEach((key) => {
				let values = indicators.map((d) => d[key]).sort((a, b) => a - b);
				const min = Math.min(...values);
				const max = Math.max(...values);
				switch (key) {
					case 'density':
						indicators.forEach(
							(d, i) =>
								(indicators[i][key + '_color'] = getColor(min, max, 'interpolateViridis')(d[key]))
						);
						break;
					case 'age_med':
						indicators.forEach(
							(d, i) =>
								(indicators[i][key + '_color'] = getColor(min, max, 'interpolateInferno')(d[key]))
						);
						break;
					case 'area':
						indicators.forEach(
							(d, i) =>
								(indicators[i][key + '_color'] = getColor(min, max, 'interpolateBlues')(d[key]))
						);
						break;

					default:
						indicators.forEach((d, i) => (indicators[i][key + '_color'] = colorScale(d[key])));
						break;
				}
			});
			data_map.region.indicators = indicators;
	
		})
		.catch((error) => {
			console.error('Error loading or processing data:', error);
		});

	getTopo(topojson, 'states').then((geo) => {
		geo.features.sort((a, b) => a.properties.AREANM.localeCompare(b.properties.AREANM));

		geojson = geo;
	});

	getData('./data/data_verkehr.csv')
		.then((arr) => {
			// Process metadata
			let meta = arr.map((d) => ({
				code: d.code, // Bundesland Code
				name: d.name, // Bundesland Name
			}));
			let lookup = {};
			meta.forEach((d) => {
				lookup[d.code] = d;
			});
			metadata_ver.array = meta;
			metadata_ver.lookup = lookup;

			// Process timeseries
			let years = [
				2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
				2016, 2017, 2018, 2019, 2020
			];

			let timeseries = [];
			arr.forEach((d) => {
				years.forEach((year) => {
					timeseries.push({
						code: d.code,
						name: d.name,
						value: d[year],
						year
					});

				});
			});
			data_ver.timeseries = timeseries;
		})
		.catch((error) => {
			console.error('Error loading or processing data:', error);
		});
}



	$: if (id['lineChart'] && currentLineChart !== id['lineChart']) {
		currentLineChart = id['lineChart'];
		console.log(trigger)
		trigger = parseInt(id['lineChart'].charAt(id['lineChart'].length - 1), 10)
	}

    
</script>

<LogoHeader filled={true} center={true} />

<Header bgcolor={themes.brand.background} bgfixed={true} center={true} short={true}>
	<h1>Was Deutschland bewegt</h1>
	<p class="text-big" style="margin-top: 10px; color:{themes.neutral.text.secondary}">
		Eine interaktive Geschichte über die Beförderungsmittel in Deutschland
	</p>
	<div style="margin-top: 90px;">
		<Arrow color="white" {animation}></Arrow>
	</div>
</Header>

<Divider />

<Section>
	<h2>This is a fery fancy line chart that's still not working</h2>
	<p class="mb">
		The chart is responding on ya scroll, Thats very cool right? yes yes it is (if it works). 
	</p>
</Section>

<Divider />

<Scroller {threshold} bind:id={id['lineChart']} splitscreen={true}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
					{#if data_ver.timeseries}
					<div class="chart">
						<LineChartRace rawData={data_ver.timeseries} animationStep={trigger}/>
					</div>
					{/if}
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="lineChart01">
			<div class="col-medium">
				<p>
					This chart shows the <strong>area in square kilometres</strong> of each local authority district in the UK. Each circle represents one district. The scale is logarithmic.
				</p>
			</div>
		</section>
		<section data-id="lineChart02">
			<div class="col-medium">
				<p>
					The radius of each circle shows the <strong>total population</strong> of the district.
				</p>
			</div>
		</section>
		<section data-id="lineChart03">
			<div class="col-medium">
				<p>
					The vertical axis shows the <strong>density</strong> of the district in people per hectare.
				</p>
			</div>
		</section>
		<section data-id="lineChart04">
			<div class="col-medium">
				<p>
					The colour of each circle shows the <strong>part of the country</strong> that the district is within.
				</p>
			</div>
		</section>
		<section data-id="lineChart05">
			<div class="col-medium">
				<h3>The End</h3>
			</div>
		</section>
	</div>
</Scroller>

<Divider />


<Section>
	<h2>This is Deutschland</h2>
	<p class="mb">
		The map is responding on ya scroll, Thats very cool right? yes yes it is. Dont get jaloussee
		about this cool scrolly molly.
	</p>
</Section>

{#if geojson && data_map.region.indicators}
	<Scroller {threshold} bind:id={id['map']}>
		<div slot="background">
			<figure>
				<div class="col-full height-full">
					<Map bind:map interactive={false} location={{ bounds: mapbounds }}>
						<MapSource id="lad" type="geojson" data={geojson} promoteId="AREACD" maxzoom={13}>
							<MapLayer
								id="lad-fill"
								idKey="code"
								colorKey={mapKey + '_color'}
								data={data_map.region.indicators}
								type="fill"
								select
								{selected}
								on:select={doSelect}
								clickIgnore={!explore}
								hover
								{hovered}
								on:hover={doHover}
								highlight
								highlighted={mapHighlighted}
								paint={{
									'fill-color': [
										'case',
										['!=', ['feature-state', 'color'], null],
										['feature-state', 'color'],
										'rgba(255, 255, 255, 0)'
									],
									'fill-opacity': 0.7
								}}
							>
								<MapTooltip
									content={hovered
										? `${metadata_map.region.lookup[hovered].name}<br/><strong>${data_map.region.indicators
												.find((d) => d.code == hovered)
												[mapKey].toLocaleString()} ${units[mapKey]}</strong>`
										: ''}
								/>
							</MapLayer>
							<MapLayer
								id="lad-line"
								type="line"
								paint={{
									'line-color': [
										'case',
										['==', ['feature-state', 'hovered'], true],
										'orange',
										['==', ['feature-state', 'selected'], true],
										'black',
										['==', ['feature-state', 'highlighted'], true],
										'black',
										'rgba(255,255,255,0)'
									],
									'line-width': 2
								}}
							/>
						</MapSource>
					</Map>
				</div>
			</figure>
		</div>

		<div slot="foreground">
			<section data-id="map01">
				<div class="col-medium">
					<p>
						This map shows <strong>population density</strong> by region. Regions are coloured from <Em
							color={getColor(1, 100, 'interpolateViridis')(1)}>least dense</Em
						> to <Em color={getColor(1, 100, 'interpolateViridis')(100)}>most dense</Em>. You can
						hover to see the region name and density.
					</p>
				</div>
			</section>
			<section data-id="map02">
				<div class="col-medium">
					<p>
						The map now shows <strong>median age</strong>, from <Em
							color={getColor(1, 100, 'interpolateInferno')(1)}>youngest</Em
						> to <Em color={getColor(1, 100, 'interpolateInferno')(100)}>oldest</Em>.
					</p>
				</div>
			</section>
			<section data-id="map03">
				<div class="col-medium">
					<!-- This gets the data object for the region with the oldest median age -->
					{#each [[...data_map.region.indicators].sort((a, b) => b.age_med - a.age_med)[0]] as region}
						<p>
							The map is now zoomed on <Em color={region.age_med_color}>{region.name}</Em>, the
							region with the oldest median age, {region.age_med} years.
						</p>
					{/each}
				</div>
			</section>
			<section data-id="map04">
				<div class="col-medium">
					<h3>Select a region</h3>
					<p>Use the selection box below or click on the map to select and zoom to a region.</p>
					{#if geojson}
						<p>
							<!-- svelte-ignore a11y-no-onchange -->
							<select bind:value={selected} on:change={() => fitById(selected)}>
								<option value={null}>Select one</option>
								{#each geojson.features as place}
									<option value={place.properties.AREACD}>
										{place.properties.AREANM}
									</option>
								{/each}
							</select>
						</p>
					{/if}
				</div>
			</section>
			<section data-id="map05">
				<div class="col-medium">
					<h3>Fläche des Bundeslandes</h3>
					<p>Use the selection box below or click on the map to select and zoom to a region.</p>
					{#if geojson}
						<p>
							<!-- svelte-ignore a11y-no-onchange -->
							<select bind:value={selected} on:change={() => fitById(selected)}>
								<option value={null}>Select one</option>
								{#each geojson.features as place}
									<option value={place.properties.AREACD}>
										{place.properties.AREANM}
									</option>
								{/each}
							</select>
						</p>
					{/if}
				</div>
			</section>
		</div>
	</Scroller>
{/if}
<Footer />

<style>
	/* Styles specific to elements within the demo */
	:global(svelte-scroller-foreground) {
		pointer-events: none !important;
	}
	:global(svelte-scroller-foreground section div) {
		pointer-events: all !important;
	}
	select {
		max-width: 350px;
	}
	.chart {
		margin-top: 45px;
		width: calc(100% - 5px);
	}
	.chart-full {
		margin: 0 20px;
	}
	.chart-sml {
		font-size: 0.85em;
	}
	/* The properties below make the media DIVs grey, for visual purposes in demo */
	.media {
		background-color: #f0f0f0;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-orient: vertical;
		-webkit-box-direction: normal;
		-ms-flex-flow: column;
		flex-flow: column;
		-webkit-box-pack: center;
		-ms-flex-pack: center;
		justify-content: center;
		text-align: center;
		color: #aaa;
	}
</style>
