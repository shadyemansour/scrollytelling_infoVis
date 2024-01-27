<script>
	// 	Note: Due to REPL limitations, full responsiveness may not work here. Download the example from here or from the website (https://layercake.graphics/example/ColumnStacked) and run locally to get all features.
	import { LayerCake, Svg, flatten } from 'layercake';
	import { scaleBand, scaleOrdinal } from 'd3-scale';
	import { format, precisionFixed } from 'd3-format';
	import { stack, stackOffsetNone, stackOffsetExpand } from 'd3-shape';
	import { sum } from 'd3-array';
	import { themes } from '../../config.js';

	import Bar, { getGroupExtents, getStackExtents, stackOffsetSeparated } from './Bar.svelte';
	import AxisX from './AxisX.svelte';
	import AxisY from './AxisY.svelte';

	import { pivot } from './utils';

	export let data;

	export let layout = 'stacked'; // stacked, grouped, percent, or separated
	export let showExploreButtons = false;

	$: options =
		layout === 'grouped'
			? { layout: 'grouped' }
			: layout === 'stacked'
				? { layout: 'stacked' }
				: layout === 'separated'
					? { layout: 'stacked', offset: stackOffsetSeparated }
					: layout === 'percent'
						? { layout: 'stacked', offset: stackOffsetExpand }
						: {};

	console.log(layout, options);

	const groupBy = 'year';
	const stackBy = 'fruit';
	const pivotData = pivot(data, groupBy, stackBy, (items) => sum(items, (d) => d.value));
	const stackKeys = Object.keys(pivotData[0]).filter((d) => d !== groupBy);
	const keyColors = [themes.purple.primary, themes.purple.secondary, themes.purple.teritary, themes.purple.quaternary];
	const formatTickY = (d) => format(layout === 'percent' ? `.0%` : `.${precisionFixed(d)}s`)(d);

	$: extents = {
		// 		y: isStacked ? getStackExtents(data, keys) : getGroupExtents(data, keys)
		y: getStackExtents(data, groupBy, stackBy, options.offset)
	};
</script>

<div class="stacked-bar-chart">
	<div class="chart-container">
		<LayerCake
			{data}
			{extents}
			_custom={{ groupBy, stackBy }}
			x={groupBy}
			xScale={scaleBand().paddingInner(0.1)}
			xDomain={data.map((d) => d[groupBy])}
			y={(d) => d}
			yNice
			r={(d) => d}
			rScale={scaleOrdinal()}
			rDomain={stackKeys}
			rRange={keyColors}
			padding={{}}
		>
			<Svg>
				<AxisX gridlines={false} />
				<AxisY ticks={4} gridlines={false} formatTick={formatTickY} />

				<Bar {groupBy} {stackBy} {...options} />
			</Svg>
		</LayerCake>
	</div>

	{#if showExploreButtons}
		<label>
			<input type="radio" bind:group={layout} value="grouped" />
			Grouped
		</label>

		<label>
			<input type="radio" bind:group={layout} value="stacked" />
			Stacked
		</label>

		<label>
			<input type="radio" bind:group={layout} value="separated" />
			Separated
		</label>

		<label>
			<input type="radio" bind:group={layout} value="percent" />
			Percent
		</label>
	{/if}
</div>

<style>
	/*
		The wrapper div needs to have an explicit width and height in CSS.
		It can also be a flexbox child or CSS grid element.
		The point being it needs dimensions since the <LayerCake> element will
		expand to fill it.
	*/

	.stacked-bar-chart {
		display: flex; /* Enables Flexbox */
		flex-direction: column; /* Stacks children vertically */
		justify-content: center; /* Centers children along the main axis (vertically in this case) */
		align-items: center; /* Centers children along the cross axis (horizontally) */
		width: 100%;
		height: 100%;
	}

	.chart-container {
		width: 100%;
		height: 500px;
		_background-color: rgba(0, 0, 0, 0.1);
	}
</style>
