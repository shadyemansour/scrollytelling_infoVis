<script>
	import { onMount } from 'svelte';
	// @ts-ignore
	import * as d3 from 'd3';
	var data = [30, 86, 168, 281, 303, 365];
	
	// @ts-ignore
	let el;

	onMount(() => {
		// @ts-ignore
		d3.select(el)
			.selectAll("div")
			.data(data)
			.enter()
			.append("div")
			// @ts-ignore
			.style("width", function(d) {
				return d + "px";
			})
			// @ts-ignore
			.text(function(d) {
				return d;
			});
	});
</script>

<style>
	.chart :global(div) {
		font: 10px sans-serif;
		background-color: steelblue;
		text-align: right;
		padding: 3px;
		margin: 1px;
		color: white;
	}
</style>

<div bind:this={el} class="chart"></div>