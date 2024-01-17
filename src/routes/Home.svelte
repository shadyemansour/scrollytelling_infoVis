<script>
	// CORE IMPORTS
	import { onMount, onDestroy } from 'svelte';
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
	import Legend from '../ui/Legend.svelte';
	import Barcharts from '../layout/AnimatedBarChart.svelte';
	import LineChartRace from '../layout/LineChartRace.svelte';
	import Bike from '../ui/Bike.svelte';
	import Car from '../ui/Car.svelte';
	import Oepnv from '../ui/Oepnv.svelte';

	// DATA IMPORT
	import { getMapJson } from '../helpers/getMapJson.js';
	import { getUsageData } from '../helpers/getUsageData.js';
	import { getPriceTrendData } from '../helpers/getPriceTrendData.js';
	import { getFineData } from '../helpers/getFineData.js';

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
	let geoStates;
	let geoCities;
	let priceTrendData;
	let fineData;

	// Map
	let map = null; // Bound to mapbox 'map' instance once initialised
	let hovered; // Hovered district (chart or map)
	let selected; // Selected district (chart or map)
	let showCities;
	let mapHighlighted = []; // Highlighted district (map only)
	let mapKey = 'Car'; // Key for data to be displayed on map
	let explore = false; // Allows chart/map interactivity to be toggled on/off
	let mapColor = 'interpolateInferno'; // Changes the default color of map

	// Linechart
	let lineChartTrigger = 0;
	let currentLineChart = '';

	// Barchart
	let currentBarChart = '';
	let fineDataFiltered = [];

	// FUNCTIONS
	onMount(() => {
		idPrev = { ...id };
	});

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
		if (geoStates && id) {
			let feature = geoStates.features.find((d) => d.properties.AREACD == id);
			let bounds = bbox(feature.geometry);
			fitBounds(bounds);
		}
	}

	function checkCities() {
		if (showCities) {
			showCities = false;
			if (map.getLayer('city-points')) {
				map.removeLayer('city-points');
			}
			if (map.getSource('cities')) {
				map.removeSource('cities');
			}
		}
	}

	// Linechart
	$: if (id['lineChart'] && currentLineChart !== id['lineChart']) {
		currentLineChart = id['lineChart'];
		lineChartTrigger = parseInt(id['lineChart'].slice(-2), 10);
	}

	// Barchart
	$: if (fineData && id['barChart'] && currentBarChart !== id['barChart']) {
		currentBarChart = id['barChart'];
		updateBarChartData(id['barChart']);
	}

	function updateBarChartData(chartId) {
		const trigger = parseInt(chartId.charAt(chartId.length - 1), 10);
		switch (trigger) {
			case 1:
				fineDataFiltered = fineData.filter((d) => d.type === 'fahrrad');
				break;
			case 2:
				fineDataFiltered = fineData.filter((d) => ['fahrrad', 'auto'].includes(d.type));
				break;
			case 3:
				fineDataFiltered = fineData.filter((d) => ['fahrrad', 'auto', 'oepnv'].includes(d.type));
				break;
			default:
				fineDataFiltered = [];
				break;
		}
		fineDataFiltered = fineDataFiltered.sort((a, b) => a.amount - b.amount);
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
				mapColor = 'interpolateCar';
				checkCities();
			},
			map02: () => {
				// fitBounds(mapbounds);
				mapKey = 'Oepnv';
				mapHighlighted = [];
				explore = false;
				mapColor = 'interpolateOepnv';
				checkCities();
			},
			map03: () => {
				mapKey = 'Oepnv';
				let hl = [...usageData.data.region.indicators].sort((a, b) => b[mapKey] - a[mapKey])[0];
				fitById(hl.code);
				mapHighlighted = [hl.code];
				explore = false;
				checkCities();
			},
			map04: () => {
				fitBounds(mapbounds);
				mapKey = 'Oepnv';
				mapHighlighted = [];
				explore = false;
				mapColor = 'interpolateOepnv';
				showCities = true;
			}
		}
	};

	// Code to run Scroller actions when new caption IDs come into view
	$: id && runActions(Object.keys(actions)); // Run below code when 'id' object changes
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
		<div class="erklaerungs-texte">
			<p>
				* Misst monatlich die durchschnittliche Preisentwicklung aller Waren und Dienstleistungen,
				die private Haushalte in Deutschland für Konsumzwecke kaufen In Deutschland sind alle
				Verkehrsmittel unterschiedlich teuer, was von verschiedenen Ereignissen zu verschiedenen
				Zeitpunkten beeinflusst wird.
			</p>
		</div>
		<div class="sources">
			<p>
				Quelle: Verbraucherpreisindex und Inflationsrate, destatis Statistisches Bundesamt | Stand
				2023
			</p>
		</div>
	</div>
</Section>

<Scroller {threshold} bind:id={id['lineChart']}>
	<div slot="background">
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
					<!--<h2>Autos</h2>-->
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
				<br />
				<div class="sources">
					<p>
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
				<br />
				<div class="sources">
					<p>
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
				<br />
				<div class="sources">
					<p>
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
				<br />
				<div class="sources">
					<p>
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
		<p>
			Quelle: Statistisches Bundesamt | Stand 2023 | Daten --> KFZ: Kraftfahrer-Preisindex; ÖPNV:
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

{#if geoStates && geoCities && usageData.data.region.indicators}
	<Scroller {threshold} bind:id={id['map']}>
		<div slot="background">
			<Legend indicators={usageData.data.region.indicators} {mapKey}></Legend>
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
									content={hovered
										? `${
												usageData.metadata.region.lookup[hovered].name
											}<br/><strong>${usageData.data.region.indicators
												.find((d) => d.code == hovered)
												[mapKey].toLocaleString()} personenkilometer</strong>`
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
						{#if showCities}
							<MapSource id="cities" type="geojson" data={geoCities} promoteId="AREANM">
								<MapLayer
									id="city-points"
									type="circle"
									paint={{
										'circle-radius': 5,
										'circle-color': '#007cbf'
									}}
								/>
							</MapSource>
						{/if}
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
					<p style="font-size: 13px; font-style: italic ;">
						* Bushaltestelle max. 600m bzw. Bahnhof max. 1200m Luftlinie entfernt und Werktags min.
						28 Abfahrten
					</p>
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
<!--  <Section>
	<div class="erklaerungs-texte">
		<p>
			Quelle: Unternehmen, Beförderte Personen, Personenkilometer (Personenverkehr mit Bussen und
			Bahnen): Bundesländer, Quartale, Verkehrsart, DESTATIS Statistisches Bundesamt | Stand: 2023
			Quelle: Bevölkerung: Bundesländer, Stichtag 31.12.2020, DESTATIS Statistisches Bundesamt |
			Stand: 2023 Werte für: 2020
		</p>
	</div>
</Section> -->
<Section>
	<div class="sources">
		<p>
			Quelle: Personenverkehr mit Bussen und Bahnen: Bundesländer, Quartale, Verkehrsart, DESTATIS
			Statistisches Bundesamt | Stand: 2023 <br />
			Quelle: Bevölkerung: Bundesländer, Stichtag 31.12.2020, DESTATIS Statistisches Bundesamt | Stand:
			2023 Werte für: 2020
		</p>
		<br />
		<p>
			Quelle: Fahrleistungen der im Bundesland zugelassenen Kraftfahrzeuge 2020, Statistische Ämter
			des Bundes und der Länder | Stand 2020
		</p>
		<br />
		<p>Quelle: Fahrradklimatest 2022, adfc Fahrradklima-Test | Stand 2022</p>
	</div>
</Section>

<Spacer size={spacings['xxxxl-96']} />

<Section>
	<div slot="animating">
		<h3 class="mb-d">Klimawirkung im Personenverkehr</h3>
		<p>Angegeben sind die spezifischen Emissionen in Gramm CO2eq* je Personenkilometer.</p>
		<p style="text-align: justify;">
			Autos haben besonders hohe CO2*-Emissionen pro Personenkilometer. Sie verbrauchen 2,4-mal so
			viel wie der ÖPNV und 21-mal so viel wie Fahrräder in 2017.
		</p>
	</div>
	<p style="font-size: 14px; font-style: italic ;">
		* CO2-Äquivalente, auch CO2e oder CO2eq sind eine Maßeinheit, um die Klimawirkung
		unterschiedlicher Treibhausgase zu vergleichen
	</p>
</Section>

{#if geoStates && usageData.data.region.indicators}
	<Scroller {threshold} bind:id={id['barChart']}>
		<div slot="background">
			<figure>
				<div class="col-wide height-full">
					<div class="chart" style="width: 100%; height: 100%;">
						{#if fineData}
							<Barcharts
								data={fineDataFiltered}
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
							<p>
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
		</div></Scroller
	>
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
	}
	.sources {
		font-style: normal;
		font-size: 13px;
		hyphens: auto;
		list-style: none;
		padding-left: 0;
	}
</style>
