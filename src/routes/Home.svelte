<script>
	// CORE IMPORTS
	import { onMount } from 'svelte';
	import bbox from '@turf/bbox';
	import { getMotion } from '../utils.js';
	import { themes, spacings } from '../config.js';

	// COMPONENTS IMPORT
	import { Map, MapSource, MapLayer, MapTooltip } from '@onsvisual/svelte-maps';

	import Header from '../layout/Header.svelte';
	import Scroller from '../layout/Scroller.svelte';
	import Footer from '../layout/Footer.svelte';
	import Section from '../layout/Section.svelte';
	import NavIndicator from '../layout/NavIndicator.svelte';
	import Spacer from '../layout/Spacer.svelte';
	import LegendGradient from '../ui/LegendGradient.svelte';
	import LegendText from '../ui/LegendText.svelte';
	import Barcharts from '../charts/AnimatedBarChart.svelte';
	import LineChartRace from '../charts/LineChartRace.svelte';
	import Bike from '../ui/Bike.svelte';
	import Car from '../ui/Car.svelte';
	import Oepnv from '../ui/Oepnv.svelte';

	// DATA IMPORT
	import { getMapJson } from '../helpers/getMapJson.js';
	import { getUsageData } from '../helpers/getUsageData.js';
	import { getCityBikeRating } from '../helpers/getCityBikeRating.js';
	import { getPriceTrendData } from '../helpers/getPriceTrendData.js';
	import { getFineData } from '../helpers/getFineData.js';
	import { getCo2EmissionsData } from '../helpers/getCo2EmissionsData.js';

	// Config
	const threshold = 0.8;
	const mapbounds = [
		[5, 47.3],
		[15, 55.2]
	];

	// State
	let animation = getMotion(); // Set animation preference depending on browser preference true/false
	let id = {}; // Object to hold visible section IDs of Scroller components
	let idPrev = {}; // Object to keep track of previous IDs, to compare for changes

	// Data
	let usageData;
	let cityBikeRatingData;
	let geoStates;
	let geoCities;
	let priceTrendData;
	let fineData;
	let emissionsData;

	// Map
	let map = null; // Bound to mapbox 'map' instance once initialised
	let hovered; // Hovered district (chart or map)
	let cityHovered; // Hovered district (chart or map)
	let selected; // Selected district (chart or map)
	let showCities = false;
	let mapHighlighted = []; // Highlighted district (map only)
	let mapKey = 'Car'; // Key for data to be displayed on map
	let explore = false; // Allows chart/map interactivity to be toggled on/off
	let mapColor = 'interpolateInferno'; // Changes the default color of map
	let mapLoaded = false;
	const layersToCheck = ['lad-line', 'lad-fill', 'lad-fill-city', 'city-points'];

	// Linechart
	let lineChartTrigger = 0;
	let currentLineChart = '';

	// Barchart
	let currentBarChart = '';
	let fineDataFiltered = [];
	let emissionsDataFiltered = [];

	// FUNCTIONS
	$: onMount(() => {
		idPrev = { ...id };
	});

	// Function to check if the layer's style is loaded
	function areAllLayersLoaded() {
		console.log('Checking if layers are loaded'); // Debugging

		if (!map || !map.isStyleLoaded()) {
			return false;
		}

		return layersToCheck.every((layer) => map.getLayer(layer) !== undefined);
	}

	// Reactive statement to update allLayersLoaded
	$: if (id['map'] && map && !mapLoaded) mapLoaded = areAllLayersLoaded();

	// Additional logic based on allLayersLoaded
	$: if (mapLoaded) {
		console.log('All specified layers are loaded');
		// Additional actions when all layers are loaded
	}

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
		// console.log(e.detail);
	}
	function doHoverCity(e) {
		cityHovered = e.detail.id;
		// console.log(e.detail);
	}

	// Functions for map component
	function fitBounds(bounds) {
		if (map) {
			map.fitBounds(bounds, { animate: animation, padding: 30 });
		}
	}
	function fitById(id) {
		if (geoStates && id) {
			let feature = geoStates.features.find((d) => d.properties.AREACD == id);
			let bounds = bbox(feature.geometry);
			fitBounds(bounds);
		}
	}
	function onMapLoad() {
		mapLoaded = true;
		console.log('Map is loaded!');
		updateLayerVisibility();
	}

	function updateLayerVisibility() {
		if (!map || !mapLoaded) return;

		const visibility = showCities ? 'none' : 'visible';
		map.setLayoutProperty('lad-line', 'visibility', visibility);
		map.setLayoutProperty('lad-fill', 'visibility', visibility);

		const cityPointsVisibility = showCities ? 'visible' : 'none';
		if (map.getLayer('city-points')) {
			map.setLayoutProperty('lad-fill-city', 'visibility', cityPointsVisibility);
			map.setLayoutProperty('city-points', 'visibility', cityPointsVisibility);
		}
	}

	function setMapContext(mapContext) {
		if (mapContext.fitId) {
			fitById(mapContext.fitId);
		} else {
			fitBounds(mapbounds);
		}
		mapKey = mapContext.key;
		mapHighlighted = mapContext.highlighted ? mapContext.highlighted : [];
		explore = mapContext.explore ? mapContext.explore : false;
		mapColor = mapContext.color;
		showCities = mapContext.showCities;
		updateLayerVisibility();
	}

	// Actions for Scroller components
	const actions = {
		map: {
			map01: () => setMapContext({ key: 'Car', color: 'interpolateCar', showCities: false }),
			map02: () => setMapContext({ key: 'Oepnv', color: 'interpolateOepnv', showCities: false }),
			map03: () => {
				const hl = [...usageData.data.region.indicators].sort((a, b) => b['Oepnv'] - a['Oepnv'])[0];
				setMapContext({
					key: 'Oepnv',
					color: 'interpolateOepnv',
					showCities: false,
					highlighted: [hl.code],
					fitId: hl.code
				});
			},
			map04: () => setMapContext({ key: 'Oepnv', color: 'interpolateOepnv', showCities: false }),
			map05: () => setMapContext({ key: 'Bike', color: 'interpolateOepnv', showCities: true })
		}
	};

	// Linechart
	$: if (id['lineChart'] && currentLineChart !== id['lineChart']) {
		currentLineChart = id['lineChart'];
		lineChartTrigger = parseInt(id['lineChart'].slice(-2), 10);
	}

	// Barchart
	$: if (emissionsData && id['barChart'] && currentBarChart !== id['barChart']) {
		currentBarChart = id['barChart'];
		updateBarChartData(id['barChart']);
	}

	function updateBarChartData(chartId) {
		const trigger = parseInt(chartId.charAt(chartId.length - 1), 10);
		switch (trigger) {
			case 1:
				emissionsDataFiltered = emissionsData.filter((d) => d.type === 'fahrrad');
				fineDataFiltered = fineData.filter((d) => d.type === 'fahrrad');
				break;
			case 2:
				emissionsDataFiltered = emissionsData.filter((d) => ['fahrrad', 'auto'].includes(d.type));
				fineDataFiltered = fineData.filter((d) => ['fahrrad', 'auto'].includes(d.type));
				break;
			case 3:
				emissionsDataFiltered = emissionsData.filter((d) =>
					['fahrrad', 'auto', 'oepnv'].includes(d.type)
				);
				fineDataFiltered = fineData.filter((d) => ['fahrrad', 'auto', 'oepnv'].includes(d.type));
				break;
			default:
				emissionsDataFiltered = [];
				fineDataFiltered = [];
				break;
		}
		emissionsDataFiltered = emissionsDataFiltered.sort((a, b) => a.amount - b.amount);
		fineDataFiltered = fineDataFiltered.sort((a, b) => a.amount - b.amount);
	}

	// Code to run Scroller actions when new caption IDs come into view
	$: id && mapLoaded && runActions(Object.keys(actions)); // Run below code when 'id' object changes
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

	// INITIALISATION CODE - Load and Preprocess Data
	getMapJson()
		.then((geo) => {
			geoStates = geo.states;
			geoCities = geo.cities;
		})
		.catch((error) => {
			console.error('Error fetching MapJson:', error);
		});

	getUsageData()
		.then((loadedUsageData) => {
			usageData = loadedUsageData;
		})
		.catch((error) => {
			console.error('Error fetching UsageData:', error);
		});

	getCityBikeRating()
		.then((loadedCityBikeRatingData) => {
			cityBikeRatingData = loadedCityBikeRatingData;
		})
		.catch((error) => {
			console.error('Error fetching CityBikeRatingData:', error);
		});

	getPriceTrendData()
		.then((loadedVerkehrData) => {
			priceTrendData = loadedVerkehrData;
		})
		.catch((error) => {
			console.error('Error fetching verkehr data:', error);
		});

	getFineData()
		.then((loadedFineData) => {
			fineData = loadedFineData;
		})
		.catch((error) => {
			console.error('Error fetching FineData:', error);
		});

	getCo2EmissionsData()
		.then((loadedEmissionsData) => {
			emissionsData = loadedEmissionsData;
		})
		.catch((error) => {
			console.error('Error fetching Co2EmissionData:', error);
		});
</script>

<Header bgcolor={themes.neutral.background} center={false} short={true}></Header>

{#if id['map']}
	<NavIndicator />
{/if}

<Spacer size={spacings['xxxxl-96']} />
<Section>
	<div slot="animating">
		<h3 class="mb-d">Mobilität in Deutschland</h3>
		<p class="mb-d">
			Ein wichtiger Faktor, um das Mobilitätsverhalten in Deutschland zu verstehen, ist der Preis.
			Doch die Preise selbst zu vergleichen, liefert keine genauen Ergebnisse. Deshalb betrachten
			wir die Verkehrsmittel im Verhältnis zum Verbraucherpreisindex *. Betrachten wir den
			Preisindex für die verschiedenen Verkehrsmittel genauer, sehen wir, wie verschiedene
			Ereignisse diesen möglicherweise beeinflussen.
		</p>
	</div>
	<div class="erklaerungs-texte mb-d" style="color: {themes.neutral['text-dark'].secondary};">
		<p>
			* Misst monatlich die durchschnittliche Preisentwicklung aller Waren und Dienstleistungen, die
			private Haushalte in Deutschland für Konsumzwecke kaufen In Deutschland sind alle
			Verkehrsmittel unterschiedlich teuer, was von verschiedenen Ereignissen zu verschiedenen
			Zeitpunkten beeinflusst wird.
		</p>
	</div>
	<div class="sources" style="color: {themes.neutral['text-dark'].teritary};">
		<p>
			Quelle: Verbraucherpreisindex und Inflationsrate, destatis Statistisches Bundesamt | Stand
			2023
		</p>
	</div>
</Section>

<Scroller {threshold} bind:id={id['lineChart']}>
	<div slot="background">
		<LegendText
			text1={'ÖPNV'}
			text2={'Fahrrad: Anschaffung'}
			text3={'Auto: Anschaffung & Unterhalt'}
		></LegendText>
		<figure>
			<div class="col-wide height-full">
				{#if priceTrendData}
					<div class="chart">
						<LineChartRace
							rawData={priceTrendData.data.timeseries}
							animationStep={lineChartTrigger}
						/>
					</div>
				{/if}
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="lineChart00"></section>
		<section data-id="lineChart01">
			<div class="col-medium">
				<p>
					Eine auffallende Preisentwicklung der Emissionsberechtigung (EB) zeigt sich 2018: Während
					am 02.01.2018 für EB der Preis pro Tonne CO2 noch bei 7,81€ liegt, verzeichnen wir ein
					Jahr später am 02.01.2019 einen Preis von 25,31€.
				</p>
				<Spacer size={spacings['m-12']}></Spacer>
				<div class="icon-heading">
					<div class="icon-background" style="background-color: {themes.bike.teritary};">
						<Bike size="30" color={themes.bike.primary} />
					</div>
					<div class="icon-background" style="background-color: {themes.car.teritary};">
						<Car size="30" color={themes.car.primary} />
					</div>
					<div class="icon-background" style="background-color: {themes.oepnv.teritary};">
						<Oepnv size="30" color={themes.oepnv.primary} />
					</div>
				</div>
			</div>
		</section>

		<section data-id="lineChart01">
			<div class="col-medium">
				<p>
					Der Preis der Emissionsberechtigung entspricht einem Anstieg um 324%. Diese Steigerung
					markiert den Beginn eines anhaltenden Trends, der sich auf die Preise und Art der
					Fahrzeuge auswirkt. Ab diesem Zeitpunkt gewinnen Elektrofahrzeuge und Plug-in-Hybriden
					noch schneller an Beliebtheit.
				</p>
				<div class="sources">
					<p style="color: {themes.neutral['text-dark'].teritary};">
						Quelle: Preisentwicklung für Emissionsberechtigungen (EUA) seit 2008, Umweltbundesamt |
						Stand 2023 Werte für 2018 & 2019
					</p>
				</div>
			</div>
		</section>
		<section data-id="lineChart02">
			<div class="col-medium">
				<p>
					Zu Beginn der Corona Pandemie 2020 kommt es zu Produktionsstopps und Schließungen von
					Fabriken, welches die Lieferketten beeinflussen. Im Januar 2021 folgen dadurch in der
					Halbleiterproduktion Lieferengpässe und starke Preisanstiege.
				</p>
				<div class="sources">
					<p style="color: {themes.neutral['text-dark'].teritary};">
						Quelle: So wirkt sich die Corona-Krise auf die Automobilindustrie aus, Springer
						Professional | Stand 2020 <br />
						Quelle: Das müssen Sie zur Halbleiter-Krise wissen, Springer Professional | Stand 2022
					</p>
				</div>
			</div>
		</section>
		<section data-id="lineChart03">
			<div class="col-medium">
				<p>
					Im Juni, Juli und August 2022 wird kurzzeitig das 9€ Ticket eingeführt, wodurch Bus und
					Bahn erschwinglicher werden.
				</p>
			</div>
		</section>
		<section data-id="lineChart04">
			<div class="col-medium">
				<p>
					Nach dem kurzen Anstieg steht ab April 2023 das Deutschlandticket für 49€ zur Verfügung.
				</p>
			</div>
		</section>
		<section data-id="lineChart05">
			<div class="col-medium">
				<p style="text-align: center;">Generell sehen wir, dass alle Kurven ansteigen.</p>
			</div>
		</section>
		<section data-id="lineChart06">
			<div class="col-medium">
				<p>
					Der <strong style="color: {themes.oepnv.primary};">ÖPNV</strong> passt immer zum Jahreswechsel
					die Preise an. Die stärksten Anpassungen sind dabei 2016 und 2023.
				</p>
			</div>
		</section>
		<section data-id="lineChart07">
			<div class="col-medium">
				<p style="text-align: center;">
					Hingegen bleibt der <strong style="color: {themes.bike.primary};">Fahrrad-Index</strong> weitestgehend
					konstant.
				</p>
			</div>
		</section>
		<section data-id="lineChart08">
			<div class="col-medium">
				<p>
					Das generelle Ansteigen aller Kurven kann anhand der wachsenden Inflation begründet
					werden. Während diese sich normalerweise zwischen 0% und 2% bewegen, beobachten wir seit
					2021 eine <strong>signifikante Preissteigerung</strong>. Im Vergleich zu den Vorjahren
					liegt die Inflationsrate 2021 bei 3,1%, 2022 bereits bei 6,9% und sinkt 2023 auf 5,9%.
				</p>
				<div class="sources">
					<p style="color: {themes.neutral['text-dark'].teritary};">
						Quelle: Verbraucherpreisindex und Inflationsrate, destatis Statistisches Bundesamt |
						Stand 2023
					</p>
				</div>
			</div>
			<!-- add marker -->
		</section>

		<section data-id="lineChart09">
			<div class="col-medium">
				<p lang="de">
					Doch gerade der ÖPNV hat durch die besonderen Angebote 2023 eine Deflation von -22,7% im
					Vergleich zum Vorjahr. Das einzige Gut, das noch günstiger geworden ist, ist Butter mit
					-24,8%.
				</p>
				<div class="sources">
					<p style="color: {themes.neutral['text-dark'].teritary};">
						Quelle: Verbraucherpreise im November 2023 Veränderung gegenüber dem Vorjahresmonat in
						%, destatis Statistisches Bundesamt | Stand 2024
					</p>
				</div>
			</div>
		</section>

		<section data-id="lineChart10"></section>
	</div>
</Scroller>
<Section>
	<div class="sources">
		<p style="color: {themes.neutral['text-dark'].teritary};">
			Quelle: Statistisches Bundesamt | Stand 2023 | Daten --&gt; KFZ: Kraftfahrer-Preisindex; ÖPNV:
			Kombinierte Personenbeförderungsdienstleistung
		</p>
	</div>
</Section>

<Spacer size={spacings['xxxxl-96']} />

<Section>
	<div slot="animating">
		<h3 class="mb-d" style="padding-left: 0;">Erkunde Mobilität in Deutschland</h3>
		<div>
			<p class="mb">
				Der ÖPNV ist mittlerweile eine preiswerte Alternative zum Auto. Doch nicht nur der Preis ist
				ein wichtiger Faktor, der entscheidend für die Wahl des Verkehrsmittel ist. Es gibt starke
				Unterschiede in der Nutzung des ÖPNV’s in den Bundesländern, was auf eine multifaktorielle
				Erklärung hindeutet.
			</p>
		</div>
		<Spacer size={spacings['xxxxl-96']} />
	</div>
</Section>

{#if geoStates && geoCities && usageData.data.region.indicators && cityBikeRatingData.data.city.indicators}
	<Scroller {threshold} bind:id={id['map']}>
		<div slot="background">
			<LegendGradient indicators={usageData.data.region.indicators} {mapKey} hide={showCities}
			></LegendGradient>
			<figure>
				<div class="col-full height-full">
					<Map bind:map interactive={false} location={{ bounds: mapbounds }}>
						<MapSource id="lad" type="geojson" data={geoStates} promoteId="AREACD" maxzoom={13}>
							<MapLayer
								id="lad-fill"
								idKey="code"
								colorKey={mapKey + '_color'}
								data={usageData.data.region.indicators}
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
									content={hovered && !showCities
										? `${
												usageData.metadata.region.lookup[hovered].name
											}<br/><strong>${usageData.data.region.indicators
												.find((d) => d.code == hovered)
												[mapKey].toLocaleString()} Personenkilometer</strong>`
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
							<MapLayer
								id="lad-fill-city"
								idKey="code"
								colorKey={mapKey + '_color'}
								data={usageData.data.region.indicators}
								type="fill"
								paint={{
									'fill-color': [
										'case',
										['!=', ['feature-state', 'color'], null],
										['feature-state', 'color'],
										'rgba(255, 255, 255, 0)'
									],
									'fill-opacity': 0.7
								}}
							></MapLayer>
						</MapSource>
						<MapSource id="cities" type="geojson" data={geoCities} promoteId="AREANM">
							<MapLayer
								id="city-points"
								type="circle"
								hover
								hovered={cityHovered}
								on:hover={doHoverCity}
								paint={{
									'circle-radius': 7,
									'circle-color': '#007cbf'
								}}
							>
								<MapTooltip
									content={showCities && cityHovered
										? `${cityHovered}<br/><strong>${cityBikeRatingData.data.city.indicators
												.find((d) => d.name == cityHovered)
												[mapKey].toLocaleString()} something</strong>`
										: ''}
								/>
							</MapLayer>
							<!--<br/><strong>${cityBikeRatingData.data.city.indicators
													.find((d) => d.name == hovered)
													[mapKey].toLocaleString()} something</strong>-->
						</MapSource>
					</Map>
				</div>
			</figure>
		</div>

		<div slot="foreground">
			<section data-id="map01">
				<div class="col-medium">
					<p>
						Betrachtet man die gefahrenen Kilometer pro Einwohner, werden Unterschiede zwischen den
						Bundesländern sichtbar - Mache dir dein eigenes Bild der Nutzung des ÖPNV’s in den
						Bundesländern und erkunde die Deutschlandkarte:
					</p>
				</div>
			</section>
			<section data-id="map02">
				<div class="col-medium">
					<p>
						Sieht man vom Luftverkehr ab, verursachen Autos und Motorräder 2017 die höchsten
						CO2-Emissionen je Personenkilometer: Sie verbrauchen sogar 2,5-mal so viel wie der ÖPNV
						und 20-mal so viel wie Fahrräder.
					</p>
				</div>
			</section>
			<section data-id="map03">
				<div class="col-medium">
					{#each [[...usageData.data.region.indicators].sort((a, b) => b['2023'] - a['2023'])[0]] as region}
						<p>
							In Hessen kommen <strong>11 mal</strong> so viele Kilometer auf einen Einwohner wie im
							Saarland.
						</p>
					{/each}
				</div>
			</section>
			<section data-id="map04">
				<div class="col-medium">
					<p>
						In Berlin haben 99,4% der Einwohner in unmittelbarer Nähe* eine Haltestelle.
						Mecklenburg-Vorpommern ist mit 66,1% das Schlusslicht. Die Netzdichte könnte ein Grund
						für die Unterschiede zwischen den Bundesländern sein
					</p>

					<div class="erklaerungs-texte">
						<p style="color: {themes.neutral['text-dark'].secondary};">
							* Bushaltestelle max. 600m bzw. Bahnhof max. 1200m Luftlinie entfernt und Werktags
							min. 28 Abfahrten
						</p>
					</div>
					<div class="sources">
						<p style="color: {themes.neutral['text-dark'].teritary};">
							Quelle: Verbraucherpreise im November 2023 Veränderung gegenüber dem Vorjahresmonat in
							%, destatis Statistisches Bundesamt | Stand 2024
						</p>
					</div>
				</div>
			</section>
			<section data-id="map05">
				<div class="col-medium">
					<p>Test</p>
				</div>
			</section>

			<!-- <section data-id="map05">
				<div class="col-medium">
					<p style="text-align: center;">
						Mach dir dein eigenes Bild der Nutzung des ÖPNV’s in den Bundesländern und erkunde die
						Deutschlandkarte:
					</p>
					 {#if geojson}
						<p>
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
			<section data-id="map02">
				<div class="col-medium">
					<p>
						Sieht man vom Luftverkehr ab, verursachen Autos und Motorräder 2017 die höchsten
						CO2-Emissionen je Personenkilometer: Sie verbrauchen sogar 2,5-mal so viel wie der ÖPNV
						und 20-mal so viel wie Fahrräder.
					</p>
				</div>
			</section>
			<section data-id="map02">
				<div class="col-medium">
					<p>
						Aus diesem Grund entscheiden sich besonders auf Kurzstrecken viele für das Fahrrad. Doch
						die größten Städte Deutschlands schneiden, wenn es um die Fahrradfreundlichkeit geht,
						nicht besonders gut ab…
					</p>
				</div>
			</section>
			<section data-id="map02">
				<div class="col-medium">
					<p style="text-align: center;">
						Erkunde die Karte, indem du deine Maus über die einzelnen Städte bewegst.
					</p>
				</div>
			</section> -->
		</div>
	</Scroller>

	<Spacer size={spacings['xxxxl-96']} />
{/if}

<Section>
	<div class="sources" style="color: {themes.neutral['text-dark'].teritary};">
		<p>
			Quelle: Personenverkehr mit Bussen und Bahnen: Bundesländer, Quartale, Verkehrsart, DESTATIS
			Statistisches Bundesamt | Stand: 2023
		</p>
		<p>
			Quelle: Bevölkerung: Bundesländer, Stichtag 31.12.2020, DESTATIS Statistisches Bundesamt |
			Stand: 2023 Werte für: 2020
		</p>
		<p>
			Quelle: Fahrleistungen der im Bundesland zugelassenen Kraftfahrzeuge 2020, Statistische Ämter
			des Bundes und der Länder | Stand 2020
		</p>
		<p>Quelle: Fahrradklimatest 2022, adfc Fahrradklima-Test | Stand 2022</p>
	</div>
</Section>

<Spacer size={spacings['xxxxl-96']} />

<Section>
	<div slot="animating" class="mb-d">
		<h3 class="mb-d">Klimawirkung im Personenverkehr</h3>
		<p>Angegeben sind die spezifischen Emissionen in Gramm CO2eq* je Personenkilometer.</p>
		<p>
			Autos haben besonders hohe CO2*-Emissionen pro Personenkilometer. Sie verbrauchen 2,4-mal so
			viel wie der ÖPNV und 21-mal so viel wie Fahrräder in 2017.
		</p>
	</div>
	<p class="erklaerungs-texte" style="color: {themes.neutral['text-dark'].secondary};">
		* CO2-Äquivalente, auch CO2e oder CO2eq sind eine Maßeinheit, um die Klimawirkung
		unterschiedlicher Treibhausgase zu vergleichen
	</p>
	<Spacer size={spacings['xxxxl-96']}></Spacer>
</Section>

{#if geoStates && usageData.data.region.indicators}
	<Scroller {threshold} bind:id={id['barChart']}>
		<div slot="background">
			<LegendText
				text1={'Nutzung TTW'}
				text2={'Energie WTT'}
				text3={'Fahrzeug'}
				text4={'Infrastruktur'}
			></LegendText>
			<figure>
				<div class="col-wide height-full">
					<div class="chart" style="width: 100%; height: 100%;">
						{#if fineData}
							<Barcharts
								data={emissionsDataFiltered}
								xKey="amount"
								yKey="category"
								xSuffix=" €"
								title="CO2 Emissionen"
								xTicks="0"
							/>
						{/if}
					</div>
					<Section>
						<div class="sources">
							<p style="color: {themes.neutral['text-dark'].teritary};">
								Quelle: Umweltfreundlich mobil! Ein ökologischer Verkehrsartenvergleich für den
								Personen- und Güterverkehr in Deutschland, Umweltbundesamt | Stand: 2021 Werte für:
								2017
							</p>
						</div>
					</Section>
				</div>
			</figure>
		</div>

		<div slot="foreground">
			<section data-id="barChart01">
				<div class="col-medium">
					<p style="text-align: center;">
						Die Busßgelder für <strong style="color: {themes.bike.primary};">Bikes</strong> sind ziemlich
						hoch!
					</p>
				</div>
			</section>
			<section data-id="barChart02">
				<div class="col-medium">
					<p style="text-align: center;">
						This chart shows the fines for <strong style="color: {themes.car.primary};">Cars</strong
						>!
					</p>
				</div>
			</section>
			<section data-id="barChart03">
				<div class="col-medium">
					<p style="text-align: center;">
						This chart shows the fines for <strong style="color: {themes.oepnv.primary};"
							>Oepnv</strong
						>!
					</p>
				</div>
			</section>
			<section data-id="barChart04">
				<div class="col-medium">
					<p style="text-align: center;">
						This chart shows the fines for <strong style="color: {themes.oepnv.primary};"
							>Oepnv</strong
						>!
					</p>
				</div>
			</section>
			<section data-id="barChart04">
				<div class="col-medium">
					<p style="text-align: center;">
						This chart shows the fines for <strong style="color: {themes.oepnv.primary};"
							>Oepnv</strong
						>!
					</p>
				</div>
			</section>
		</div></Scroller
	>
	<Spacer size={spacings['xxxxl-96']}></Spacer>
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
		margin: 0 0 12px 0;
	}

	.icon-background {
		border-radius: 8px;
		padding: 6px;
		width: 30px;
		height: 30px;
	}

	.erklaerungs-texte {
		font-style: italic;
		font-size: 13px;
		hyphens: auto;
		list-style: none;
		padding-left: 0;
		align-self: flex-start;
	}
	.sources {
		font-style: normal;
		font-size: 11px;
		hyphens: auto;
		list-style: none;
		padding: 0;
	}
</style>
