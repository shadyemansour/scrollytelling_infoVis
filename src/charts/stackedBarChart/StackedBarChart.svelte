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

	const names = ['Gruppiert', 'Gestapelt', 'Getrennt', 'Prozent'];

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
	const keyColors = [
		themes.purple.primary,
		themes.purple.secondary,
		themes.purple.teritary,
		themes.purple.quaternary
	];
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

	<div class="segmented-buttons">
		{#if showExploreButtons}
			{#each ['grouped', 'stacked', 'separated', 'percent'] as option, index}
				<label class:selected={layout === option} on:keypress={() => (layout = option)}>
					{names[index]}
					<input type="radio" bind:group={layout} value={option} />
				</label>
			{/each}
		{/if}
	</div>
</div>

<style>
	/*
		The wrapper div needs to have an explicit width and height in CSS.
		It can also be a flexbox child or CSS grid element.
		The point being it needs dimensions since the <LayerCake> element will
		expand to fill it.
	*/

	.stacked-bar-chart {
		display: flex; 
		flex-direction: column; 
		justify-content: center; 
		align-items: center; 
		width: 100%;
		height: 100%;
	}

	.chart-container {
		width: 100%;
		height: 500px;
		_background-color: rgba(0, 0, 0, 0.1);
	}
	.segmented-buttons {
		display: flex;
		width: 100%;
		height: 50px;
		flex-direction: row; /* Stacks children vertically */
		justify-content: center; /* Centers children along the main axis (vertically in this case) */
		align-items: center; /* Centers children along the cross axis (horizontally) */
		margin-top: 50px;
	}

	label {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px 8px;
		cursor: pointer;
		border: 1px solid #ccc;
		border-radius: 4px;
		margin-right: 8px;
		font-size: small;
	}

	label:hover {
		background-color: #eee;
	}

	

	.selected {
		background-color: #313131;
		color: #fff;
	}
	.selected:hover {
		background-color: #0e0e0e;
		color: #fff;
	}

	input {
		display: none;
	}
</style>
