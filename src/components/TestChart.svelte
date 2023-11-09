<script>
// @ts-nocheck

	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	var data = [30, 86, 168, 281, 303, 365, -23];
	let maxData = Math.max(...data);

	
	let el;

	onMount(() => {
		d3.select(el)
			.selectAll("div")
			.data(data)
			.enter()
			.append("div")
			.style("width", function(d) {
				return Math.abs(d)/maxData*100 + "%";
			})
			.style("color", function (d) {
				if (d < 0) {
					return "rgb(255,130,130)";
				}
				else return "rgb(130,255,130)"
				
			})
			.text(function(d) {
				return d;
			});
	});
</script>

<style>
	.chart :global(div) {
		font: 10px sans-serif;
		background-color: rgb(57, 56, 56);
		text-align: right;
		border-radius: 4px;
		padding: 10px;
		margin: 1px;
		color: white;
		
	}
	.chart {
		width: 80%;
		margin: auto;
		
	}
</style>

<div bind:this={el} class="chart"></div>