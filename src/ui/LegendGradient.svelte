<script>
	import { onMount, tick } from 'svelte';
	import { themes } from '../config.js';
	import { getColor, numberWithPoints } from '../utils.js';
	import { map } from 'd3';

	export let mapKey = 'Car';
	export let indicators;
	export let cities;
	export let label;

	let onmount = false;
	let sortedIndicators = 0;

	let min = 0;
	let max = 1;

	$: if (mapKey && onmount) {
		drawCanvas();
		switch (mapKey) {
			case 'Car':
				label = 'Personenkilometer';
				break;
			case 'Oepnv':
				label = 'Personenkilometer';
				break;
			case 'Bike':
				label = 'Note';
				break;
			default:
				break;
		}
	}

	onMount(() => {
		onmount = true;
		console.log(label);
	});

	async function drawCanvas() {
		await tick();
		const canvas = document.getElementById('myCanvas');
		if (canvas) {
			const context = canvas.getContext('2d');

			let sortedIndicators;

			if (mapKey === 'Bike') {
				sortedIndicators = [...cities].sort((a, b) => a[mapKey] - b[mapKey]);
				min = sortedIndicators[0][mapKey].toLocaleString('de-DE');
				max = sortedIndicators[sortedIndicators.length - 1][mapKey].toLocaleString('de-DE');
			} else {
				sortedIndicators = [...indicators].sort((a, b) => a[mapKey] - b[mapKey]);
				min = numberWithPoints(sortedIndicators[0][mapKey].toFixed(0));
				max = numberWithPoints(sortedIndicators[sortedIndicators.length - 1][mapKey].toFixed(0));
			}

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
	}
</script>

<div class="legend">
	{#if label}
		<p class="label" style="color: {themes.neutral['text-dark'].secondary};">{label}</p>

	{/if}
	<p style="color: {themes.neutral['text-dark'].secondary};">{min}</p>
	<canvas id="myCanvas" class="bar"></canvas>
	<p style="color: {themes.neutral['text-dark'].secondary};">{max}</p>
</div>

<style>
	.legend {
		gap: 4px;
	}
	.bar {
		width: clamp(2.5rem, 4.5vw, 4rem);
		height: 12px;
		border-radius: 2px;
	}
	.label{
		margin-right: 4px;
	}
</style>
