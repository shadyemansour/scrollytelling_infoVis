<script>
	// CORE IMPORTS
	import { setContext, onMount } from 'svelte';
	import { getMotion } from '../utils.js';
	import { themes } from '../config.js';
	import LogoHeader from '../layout/LogoHeader.svelte';
	import Footer from '../layout/Footer.svelte';
	import Header from '../layout/Header.svelte';
	import Section from '../layout/Section.svelte';
	import Scroller from '../layout/Scroller.svelte';
	import Divider from '../layout/Divider.svelte';
	import Arrow from '../ui/Arrow.svelte';
	import Em from '../ui/Em.svelte';
	import { getRegionData } from '../helpers/getRegionData.js';
	import DataPaths from '../utils/constants.js';

	// DEMO-SPECIFIC IMPORTS
	import bbox from '@turf/bbox';
	import { getTopo, getColor } from '../utils.js';
	import { units } from '../config.js';
	import { Map, MapSource, MapLayer, MapTooltip } from '@onsvisual/svelte-maps';
	import ScrollingChart from '../layout/ScrollingChart.svelte';
	import HorizontalBarChart from '../layout/HorizontalBarChart.svelte';
	import Media from '../layout/Media.svelte';

	import { ScatterChart, LineChart, BarChart } from '@onsvisual/svelte-charts';

	// Config
	const threshold = 0.8;
	// State
	let animation = getMotion(); // Set animation preference depending on browser preference true/false
	let id = {}; // Object to hold visible section IDs of Scroller components
	let idPrev = {}; // Object to keep track of previous IDs, to compare for changes
	onMount(() => {
		idPrev = { ...id };
	});

	// Data
	let regionData;
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
	let mapKey = 'density'; // Key for data to be displayed on map
	let explore = false; // Allows chart/map interactivity to be toggled on/off
	let mapColor = 'inferno'; // Changes the color of map

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
				let hl = [...regionData.data.region.indicators].sort((a, b) => b.age_med - a.age_med)[0];
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
			// map06: () => {
			// 	fitBounds(mapbounds);
			// 	mapKey = 'area';
			// 	mapHighlighted = [];
			// 	explore = true;
			// }
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

	// Assume you have loaded your CSV data here
	let busgeldData = [
		{ type: 'fahrrad', category: 'verbotswidrig Gehweg befahren', amount: 55, color: 'blue' },
		{ type: 'fahrrad', category: 'Fahren über eine rote Ampel', amount: 60, color: 'blue' },
		{ type: 'öpnv', category: 'Schwarzfahren', amount: 60, color: 'green' },
		{
			type: 'auto',
			category: 'Einbahn­straße in falscher Rich­tung befahren',
			amount: 20,
			color: 'red'
		},
		{ type: 'auto', category: 'Ampel bei "Rot" überfahren', amount: 118.5, color: 'red' }
	];
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
	<h2>This is Deutschland</h2>
	<p class="mb">
		The map is responding on ya scroll, Thats very cool right? yes yes it is. Dont get jaloussee
		about this cool scrolly molly.
	</p>
</Section>
<Divider />

<Media col="medium" caption="Source: ONS mid-year population estimates.">
	<div class="chart-sml">
		<BarChart
			data={[...busgeldData].sort((a, b) => a.amount - b.amount)}
			xKey="amount"
			yKey="category"
			snapTicks={false}
			xSuffix="€"
			height={350}
			padding={{ top: 0, bottom: 15, left: 140, right: 0 }}
			area={false}
			title="Bußgeldkatalog"
		/>
	</div>
</Media>
<Divider />

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
					{#each [[...regionData.data.region.indicators].sort((a, b) => b.age_med - a.age_med)[0]] as region}
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
			<section data-id="test">
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

{#if geojson && regionData.data.region.indicators}
	<Scroller {threshold} bind:id={id['chart']} splitscreen={true}>
		<div slot="background">
			<figure>
				<div class="col-wide height-full">
					<div class="chart">
						<!-- <ScatterChart
								height="calc(100vh - 150px)"
								data={data.district.indicators.map(d => ({...d, parent_name: metadata.region.lookup[d.parent].name}))}
								colors={explore ? ['lightgrey'] : colors.cat}
								{xKey} {yKey} {zKey} {rKey} idKey="code" labelKey="name"
								r={[3,10]}
								xScale="log"
								xTicks={[10, 100, 1000, 10000]} xFormatTick={d => d.toLocaleString()}
								xSuffix=" sq.km"
								yFormatTick={d => d.toLocaleString()}
								legend={zKey != null} labels
								select={explore} selected={explore ? selected : null} on:select={doSelect}
								hover {hovered} on:hover={doHover}
								highlighted={explore ? chartHighlighted : []}
								colorSelect="#206095" colorHighlight="#999" overlayFill
								{animation}/> -->
						<ScrollingChart
							data={regionData.data.region.timeseries}
							xKey="year"
							yKey="value"
							zKey="code"
							color="lightgrey"
							lineWidth={1}
							xTicks={2}
							snapTicks={false}
							yFormatTick={(d) => d / 1e6}
							ySuffix="m"
							height={200}
							padding={{ top: 0, bottom: 20, left: 30, right: 15 }}
							selected={regionData.data.region.code}
							area={false}
							title={regionData.data.region.name}
						/>
					</div>
				</div>
			</figure>
		</div>

		<div slot="foreground">
			<section data-id="chart01">
				<div class="col-medium">
					<p>
						This chart shows the <strong>area in square kilometres</strong> of each local authority district
						in the UK. Each circle represents one district. The scale is logarithmic.
					</p>
				</div>
			</section>
			<section data-id="chart02">
				<div class="col-medium">
					<p>
						The radius of each circle shows the <strong>total population</strong> of the district.
					</p>
				</div>
			</section>
			<section data-id="chart03">
				<div class="col-medium">
					<p>
						The vertical axis shows the <strong>density</strong> of the district in people per hectare.
					</p>
				</div>
			</section>
			<section data-id="chart04">
				<div class="col-medium">
					<p>
						The colour of each circle shows the <strong>part of the country</strong> that the district
						is within.
					</p>
				</div>
			</section>
			<section data-id="chart05">
				<div class="col-medium">
					<h3>Select a district</h3>
					<p>
						Use the selection box below or click on the chart to select a district. The chart will
						also highlight the other districts in the same part of the country.
					</p>
					{#if geojson}
						<p>
							<!-- svelte-ignore a11y-no-onchange -->
							<select bind:value={selected}>
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
</style>
