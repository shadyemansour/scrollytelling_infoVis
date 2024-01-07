<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { themes } from '../config.js';
	import { getColor, numberWithPoints } from '../utils.js';

	export let mapKey = 'Car';
	export let indicators;

	let onmount = false;
	let sortedIndicators = 0;

    let min = 0;
    let max = 1;

	$: if (mapKey && onmount) {
		drawCanvas();
	}

	onMount(() => {
		onmount = true;
	});

	function drawCanvas() {
		const canvas = document.getElementById('myCanvas');
		const context = canvas.getContext('2d');

		sortedIndicators = [...indicators].sort((a, b) => a[mapKey] - b[mapKey]);
		min = numberWithPoints(sortedIndicators[0][mapKey].toFixed(0));
		max = numberWithPoints(sortedIndicators[sortedIndicators.length-1][mapKey].toFixed(0));

		// Create an interpolator between the two colors
		const interpolate = getColor(0, 1, 'interpolate' + mapKey);

		// Get the width of the canvas
		const width = canvas.width;

		// Loop over the width of the canvas
		for (let i = 0; i < width; i++) {
			// Use the interpolator to get the color at each point
			const color = interpolate(i / width);

			// Set the fill style and draw a rectangle
			context.fillStyle = color;
			context.fillRect(i, 0, 1, canvas.height);
		}
	}


</script>

<div class="legend">
	<p style="color: {themes.neutral['text-dark'].secondary};">{min}</p>
	<canvas id="myCanvas" class="bar"></canvas>
	<p style="color: {themes.neutral['text-dark'].secondary};">{max}</p>
</div>

<style>
	.legend {
		position: absolute;
		z-index: 20;
		display: flex;
		flex-direction: row;
		align-items: center;
		top: auto;
		left: auto;
		right: 0;
		bottom: 0;
		gap: 4px;
		padding: 8px 16px;
		font-size: small;
	}
	.bar {
		width: clamp(2rem, 3vw, 3rem);
		height: 12px;
		border-radius: 2px;
	}
</style>
