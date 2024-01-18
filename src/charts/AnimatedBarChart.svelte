<svelte:options accessors={true} />

<script>
	import { onMount, onDestroy } from 'svelte';
	import { themes } from '../config.js';
	import * as d3 from 'd3';

	export let data;
	export let height = 300;
	export let width = 500;
	export let xKey = 'x';
	export let yKey = 'y';
	export let xTicks = 5;
	export let animationDuration = 500; // Duration of the animation in milliseconds

	export let padding = { top: 30, right: 30, bottom: 5, left: 160 };
	export let xSuffix = ''; // Suffix for the x-axis values
	export let title = ''; // Title at the top of the chart

	let svg;
	let chart;
	let resizeObserver;

	function handleResize(entries) {
		const entry = entries[0];
		// width = entry.contentRect.width;
		// height = entry.contentRect.height;
		updateChart();
	}

	onMount(() => {
		resizeObserver = new ResizeObserver(handleResize);
		resizeObserver.observe(svg.parentNode);

		initializeChart();
		updateChart();
	});

	onDestroy(() => {
		if (resizeObserver) {
			resizeObserver.disconnect();
		}
	});

	$: if (data && chart) {
		updateChart();
	}

	function initializeChart() {
		d3.select(svg).attr('viewBox', `0 0 500 300`);
		// Create SVG container
		chart = d3
			.select(svg)
			// .attr('width', width)
			// .attr('height', height)
			.append('g')
			.attr('transform', `translate(${padding.left},${padding.top})`);

		// Initial axes setup
		chart
			.append('g')
			.attr('class', 'x-axis')
			.attr('transform', `translate(0,${height - padding.bottom})`);

		chart.append('g').attr('class', 'y-axis');

		if (data) {
			updateChart();
		}
	}

	function updateChart() {
		// Set up dimensions and scales
		const innerWidth = width - padding.left - padding.right;
		const innerHeight = height - padding.top - padding.bottom;

		const xMaxValue = d3.max(data, (d) => d[xKey]) + 20;
		const xScale = d3.scaleLinear().domain([0, xMaxValue]).range([0, innerWidth]);

		const yScale = d3
			.scaleBand()
			.domain(data.map((d) => d[yKey]))
			.range([0, innerHeight])
			.padding(0.1);
		//.attr('class', 'testi')
		
		// Bind data to groups (bars and labels)
		const barGroups = chart
		.selectAll('.bar-group')
		.data(data, (d) => d[yKey])
		.join('g')
		.attr('class', 'bar-group')
		.attr('transform', (d) => `translate(0, ${yScale(d[yKey])})`);
		
		// Update bars
		barGroups
			.selectAll('.bar')
			.data((d) => [d]) // Pass parent data to children
			.join('rect')
			.attr('class', 'bar')
			.transition()
			.duration(animationDuration)
			.attr('x', 0)
			.attr('width', (d) => xScale(d[xKey]))
			.attr('height', yScale.bandwidth())
			.attr('fill', (d) => d.color);

		// Update labels
		barGroups
			.selectAll('.label')
			.data((d) => [d]) // Pass parent data to children
			.join('text')
			.style('font-size', '13px')
			.style('fill', themes.neutral.text.primary)
			.style('text-anchor', 'end')
			.attr('class', 'label')
			.transition()
			.duration(animationDuration)
			.attr('x', (d) => xScale(d[xKey]) - 10)
			.attr('y', yScale.bandwidth() / 2)
			.attr('dy', '.35em')
			.text((d) => d[xKey] + xSuffix);

		// Update X and Y axes

		const xAxis = d3
			.axisBottom(xScale)
			.ticks(xTicks)
			.tickFormat((d) => d + xSuffix);

			chart.select('.domain').remove();

		chart
			.select('.x-axis')
			.transition()
			.duration(animationDuration)
			.attr('transform', `translate(0,${innerHeight})`)
			.call(xAxis);

		chart
			.select('.y-axis')
			.call(d3.axisLeft(yScale))
			.selectAll('.tick text')
			.call(wrap, padding.left - 20) // Adjust the wrapping width as needed
			.transition()
			.duration(animationDuration);

		// Update or add title
		let titleText = chart.selectAll('.chart-title').data([title]);
		titleText
			.enter()
			.append('text')
			.attr('class', 'chart-title')
			.merge(titleText)
			.attr('x', 0)
			.attr('y', -padding.top / 2)
			.attr('text-anchor', 'start')
			.style('font-size', '14px')
			.style('font-weight', 'bold')
			.style('fill', themes.neutral['text-dark'].secondary)
			.text(title);

		titleText.exit().remove();
	}

	function wrap(text, width) {
		text.each(function () {
			let text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.1, // ems
				y = text.attr('y'),
				dy = parseFloat(text.attr('dy')),
				tspan = text
					.text(null)
					.append('tspan')
					.attr('x', -10)
					.attr('y', y)
					.attr('dy', dy + 'em');

			while ((word = words.pop())) {
				line.push(word);
				tspan.text(line.join(' '));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(' '));
					line = [word];
					tspan = text
						.append('tspan')
						.attr('x', -10)
						.attr('y', y)
						.attr('dy', ++lineNumber * lineHeight + dy + 'em')
						.text(word);
				}
			}
		});
	}
</script>

<div>
	<svg bind:this={svg}></svg>
</div>

<style>
	div {
		display: flex; /* Enables Flexbox */
		flex-direction: column; /* Stacks children vertically */
		justify-content: center; /* Centers children along the main axis (vertically in this case) */
		align-items: center; /* Centers children along the cross axis (horizontally) */
		width: 100%;
		height: 90%;
	}
</style>
