<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
	import { themes } from '../config.js';
	import { getColor } from '../utils.js';

	export let color = '#fff';
	export let colorStart = '#fff';
	export let colorEnd = '#000';

    let onmount = false;

	$: if (color && onmount) {
		colorStart = getColor(1, 100, color)(1);
		colorEnd = getColor(1, 100, color)(100);
        drawCanvas();
	}

    onMount(() => {
        onmount = true;
	});

    function drawCanvas() {
        const canvas = document.getElementById('myCanvas');
        const context = canvas.getContext('2d');
    
    
        // Create an interpolator between the two colors
        const interpolate = d3.interpolateHsl(colorStart, colorEnd);
    
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
	<p style="color: {themes.neutral['text-dark'].secondary};">10k</p>
	<div class="bar" style="background: linear-gradient(0.25turn, {colorStart}, {colorEnd});"></div>
    <canvas id="myCanvas" class="bar"></canvas>
	<p style="color: {themes.neutral['text-dark'].secondary};">1.000k</p>
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
