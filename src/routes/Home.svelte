<script>
	// CORE IMPORTS
	import { setContext, onMount, onDestroy } from 'svelte';
	import bbox from '@turf/bbox';
	import { Map, MapSource, MapLayer, MapTooltip } from '@onsvisual/svelte-maps';
	import { getMotion } from '../utils.js';
	import { themes, spacings } from '../config.js';
	import LogoHeader from '../layout/LogoHeader.svelte';
	import Footer from '../layout/Footer.svelte';
	import Header from '../layout/Header.svelte';
	import Section from '../layout/Section.svelte';
	import Scroller from '../layout/Scroller.svelte';
	import Divider from '../layout/Divider.svelte';
	import Arrow from '../ui/Arrow.svelte';
	import Em from '../ui/Em.svelte';
	import { getRegionData } from '../helpers/getRegionData.js';
	import { getVerkehrData } from '../helpers/getVerkehrData.js';
	import { getBussGeldData } from '../helpers/getBussGeldData.js';

	import DataPaths from '../utils/constants.js';
	// DEMO-SPECIFIC IMPORTS
	import { getTopo, getColor } from '../utils.js';
	import { units } from '../config.js';
	import Barcharts from '../layout/AnimatedBarChart.svelte';
	import LineChartRace from '../layout/LineChartRace.svelte';
	import Bike from '../ui/Bike.svelte';
	import Car from '../ui/Car.svelte';
	import Oepnv from '../ui/Oepnv.svelte';
	import NavIndicator from '../layout/NavIndicator.svelte';
	import Filler from '../layout/Filler.svelte';
	import Spacer from '../layout/Spacer.svelte';

	// Config
	const threshold = 0.8;
	// State
	let animation = getMotion(); // Set animation preference depending on browser preference true/false
	let id = {}; // Object to hold visible section IDs of Scroller components
	let idPrev = {}; // Object to keep track of previous IDs, to compare for changes
	onMount(() => {
		idPrev = { ...id };
	});

	onDestroy(() => {
		window.removeEventListener('resize', onResize);
	});

	// Data
	let regionData;
	let geojson;
	const mapbounds = [
		[5, 47.3],
		[15, 55.2]
	];
	let verkehrData;
	let bussGeldData;

	// Element bindings
	let map = null; // Bound to mapbox 'map' instance once initialised

	// State
	let hovered; // Hovered district (chart or map)
	let selected; // Selected district (chart or map)
	let mapHighlighted = []; // Highlighted district (map only)
	let mapKey = 'Car'; // Key for data to be displayed on map
	let explore = false; // Allows chart/map interactivity to be toggled on/off
	let mapColor = 'default'; // Changes the default color of map
	let currentBarChart = '';
	let lineChartTrigger = -1;
	let currentLineChart = '';

	// FUNCTIONS (INCL. SCROLLER ACTIONS)

	// Functions for chart and map on:select and on:hover events
	function doSelect(e) {
		console.log(e);
		if (e.detail.id == selected) {
			selected = null;
			fitBounds(mapbounds);
		} else {
			selected = e.detail.id;
			if (e.detail.feature) fitById(selected); // Fit map if select event comes from map
		}
	}
	function doHover(e) {
		hovered = e.detail.id;
		//console.log(e.detail);
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

	// Actions for Scroller components
	const actions = {
		map: {
			// Actions for <Scroller/> with id="map"
			map01: () => {
				// Action for <section/> with data-id="map01"
				fitBounds(mapbounds);
				mapKey = 'Car';
				mapHighlighted = [];
				explore = false;
				//mapColor = 'interpolateBlues';
			},
			map02: () => {
				// fitBounds(mapbounds);
				mapKey = 'Oepnv';
				mapHighlighted = [];
				explore = false;
				// mapColor = 'interpolateInferno';
			}
		}
	};

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

	// INITIALISATION CODE - Load and Preprocess Data
	getRegionData()
		.then((loadedRegionData) => {
			regionData = loadedRegionData;
		})
		.catch((error) => {
			console.error('Error fetching region data:', error);
		});

	getTopo(DataPaths.TOPO_DATA, 'states').then((geo) => {
		geo.features.sort((a, b) => a.properties.AREANM.localeCompare(b.properties.AREANM));
		geojson = geo;
	});

	getVerkehrData()
		.then((loadedVerkehrData) => {
			verkehrData = loadedVerkehrData;
		})
		.catch((error) => {
			console.error('Error fetching verkehr data:', error);
		});

	getBussGeldData()
		.then((loadedBussGeldData) => {
			bussGeldData = loadedBussGeldData.data;
		})
		.catch((error) => {
			console.error('Error fetching BussGeld data:', error);
		});

	let bussDatafiltered = [];

	$: if (bussGeldData && id['barChart'] && currentBarChart !== id['barChart']) {
		currentBarChart = id['barChart'];
		updateBarChartData(id['barChart']);
	}

	function updateBarChartData(chartId) {
		const trigger = parseInt(chartId.charAt(chartId.length - 1), 10);
		switch (trigger) {
			case 1:
				bussDatafiltered = bussGeldData.filter((d) => d.type === 'fahrrad');
				break;
			case 2:
				bussDatafiltered = bussGeldData.filter((d) => ['fahrrad', 'auto'].includes(d.type));
				break;
			case 3:
				bussDatafiltered = bussGeldData.filter((d) =>
					['fahrrad', 'auto', 'oepnv'].includes(d.type)
				);
				break;
			default:
				bussDatafiltered = [];
				break;
		}
		bussDatafiltered = bussDatafiltered.sort((a, b) => a.amount - b.amount);
		console.log('Updated Bar Chart Data:', bussDatafiltered);
	}

	//linechart
	$: if (id['lineChart'] && currentLineChart !== id['lineChart']) {
		currentLineChart = id['lineChart'];
		lineChartTrigger = parseInt(id['lineChart'].charAt(id['lineChart'].length - 1), 10);
	}
</script>

<Header bgcolor={themes.neutral.background} center={false} short={true}></Header>

{#if id['map']}
	<NavIndicator />
{/if}
<Spacer size={spacings['xxxxl-96']} />

<Section>
	<div slot="animating">
		<h2>This is Deutschland</h2>
		<p class="mb">
			The map is responding on ya scroll, Thats very cool right? yes yes it is. Dont get jaloussee
			about this cool scrolly molly.
		</p>
	</div>
</Section>

{#if geojson && regionData.data.region.indicators}
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
								data={regionData.data.region.indicators}
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
										? `${
												regionData.metadata.region.lookup[hovered].name
										  }<br/><strong>${regionData.data.region.indicators
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
										'white',
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
						This map shows the average <strong>passenger-kilometres</strong> in
						<strong>2020</strong>
						by region. Regions are coloured from <Em
							color={getColor(1, 100, 'interpolateGreens')(1)}>lowest passenger-kilometres</Em
						> to <Em color={getColor(1, 100, 'interpolateGreens')(100)}
							>highest passenger-kilometres</Em
						>. You can hover to see the region name and density.
					</p>
				</div>
			</section>
			<section data-id="map02">
				<div class="col-medium">
					<p>
						This map shows the average <strong>passenger-kilometres</strong> in
						<strong>2021</strong>
						by region. Regions are coloured from <Em
							color={getColor(1, 100, 'interpolateGreens')(1)}>lowest passenger-kilometres</Em
						> to <Em color={getColor(1, 100, 'interpolateGreens')(100)}
							>highest passenger-kilometres</Em
						>
					</p>
				</div>
			</section>
			<section data-id="map04">
				<div class="col-medium">
					<p>
						This map shows the average <strong>passenger-kilometres</strong> in
						<strong>2022</strong>
						by region. Regions are coloured from <Em
							color={getColor(1, 100, 'interpolateGreens')(1)}>lowest passenger-kilometres</Em
						> to <Em color={getColor(1, 100, 'interpolateGreens')(100)}
							>highest passenger-kilometres</Em
						>
					</p>
				</div>
			</section>

			<!-- <section data-id="map03">
				<div class="col-medium">
					{#each [[...regionData.data.region.indicators].sort((a, b) => b['2023'] - a['2023'])[0]] as region}
						<p>
							The map is now zoomed on <Em color={region['2023_color']}>{region.name}</Em>, the
							region with the highest passenger-kilometer in 2023, {new Intl.NumberFormat(
								'de-DE'
							).format(region['2023'])} kilometers.
						</p>
					{/each}
				</div>
			</section> -->
		</div>
	</Scroller>
{/if}

<Section>
	<div slot="animating">
		<h2>This is a fery fancy line chart that's still not working</h2>
		<p class="mb">
			The chart is responding on ya scroll, Thats very cool right? yes yes it is (if it works).
		</p>
	</div>
</Section>

<Scroller {threshold} bind:id={id['lineChart']} splitscreen={true}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				{#if verkehrData}
					<div class="chart">
						<LineChartRace rawData={verkehrData.data.timeseries} animationStep={lineChartTrigger} />
					</div>
				{/if}
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="lineChart01">
			<div class="col-medium">
				<div class="icon-heading">
					<div class="icon-background" style="background-color: {themes.bike.teritary};">
						<Bike size="40" color={themes.bike.primary} />
					</div>
					<div class="icon-background" style="background-color: {themes.car.teritary};">
						<Car size="40" color={themes.car.primary} />
					</div>
					<div class="icon-background" style="background-color: {themes.oepnv.teritary};">
						<Oepnv size="40" color={themes.oepnv.primary} />
					</div>
					<h2>Fahrräder</h2>
				</div>
				<p>
					This chart shows the <strong>prices </strong> of the usage of the three different means of
					transportation. Each circle represents one mean of transportation.
				</p>
			</div>
		</section>
		<section data-id="lineChart02">
			<div class="col-medium">
				<p>Flying through the years</p>
			</div>
		</section>
		<section data-id="lineChart03">
			<div class="col-medium">
				<p>some more years</p>
			</div>
		</section>
		<section data-id="lineChart04">
			<div class="col-medium">
				<h3>Watch what's going to happen</h3>
			</div>
		</section>
		<section data-id="lineChart05">
			<div class="col-medium">
				<h3>Whopala! That's interesting, but let's move on</h3>
			</div>
		</section>
	</div>
</Scroller>

<Section>
	<h2>Bußgeldkatalog</h2>
	<p>
		Die Busgelder für die einzelnen Vergehen der Verkehrmittel zeigen deutliche unterschiede. This
		is a barchart that animates on your scroll. Please don't be harsh on it. IT'S FRAGILE!
	</p>
</Section>

{#if geojson && regionData.data.region.indicators}
	<Scroller {threshold} bind:id={id['barChart']} splitscreen={true}>
		<div slot="background">
			<figure>
				<div class="col-wide height-full">
					<div class="chart" style="width: 100%; height: 100%;">
						{#if bussGeldData}
							<Barcharts
								data={bussDatafiltered}
								xKey="amount"
								yKey="category"
								xSuffix=" €"
								title="Bußgeldkatalog"
								source="a nice source"
								xTicks="0"
							/>
						{/if}
					</div>
				</div>
			</figure>
		</div>

		<div slot="foreground">
			<section data-id="barChart01">
				<div class="col-medium">
					<div style="color: {themes.bike.primary};" class="icon-heading">
						<div class="icon-background" style="background-color: {themes.bike.teritary};">
							<Bike size="40" />
						</div>
						<h2>Fahrräder</h2>
					</div>
					<p>
						Die Busßgelder für <strong style="color: {themes.bike.primary};">Bikes</strong> sind ziemlich
						hoch!
					</p>
				</div>
			</section>
			<section data-id="barChart02">
				<div class="col-medium">
					<div style="color: {themes.car.primary};" class="icon-heading">
						<div class="icon-background" style="background-color: {themes.car.teritary};">
							<Car size="40" />
						</div>
						<h2 style="color: {themes.car.primary};">Autos</h2>
					</div>
					<p>
						This chart shows the fines for <strong style="color: {themes.car.primary};">Cars</strong
						>!
					</p>
				</div>
			</section>
			<section data-id="barChart03">
				<div class="col-medium">
					<div style="color: {themes.oepnv.primary};" class="icon-heading">
						<div class="icon-background" style="background-color: {themes.oepnv.teritary};">
							<Oepnv size="40" />
						</div>
						<h2 style="color: {themes.oepnv.primary};">Öffentliche Verkehrmittel</h2>
					</div>
					<p>
						This chart shows the fines for <strong style="color: {themes.oepnv.primary};"
							>Oepnv</strong
						>!
					</p>
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
		height: 100%;
	}

	.icon-heading {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-shrink: 0;
		padding: 0px;
		gap: 16px;
	}

	.icon-background {
		border-radius: 8px;
		padding: 6px;
		width: 40px;
		height: 40px;
	}
</style>
