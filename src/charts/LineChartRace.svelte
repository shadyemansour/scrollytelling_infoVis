<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { themes } from '../config';
	export let rawData = []; // Pass the raw data as a prop
	export let animationStep;
	let svg; // Reference to the SVG element
	const margin = { top: 20, right: 26, bottom: 30, left: 40 };
	export let width = 500 - margin.left - margin.right;
	export let height = 300 - margin.top - margin.bottom;
	export let xTicks = 7;
	export let yTicks = 6;

	let data; // This will hold the transformed data
	let xScale, yScale, xAxis, yAxis;
	let mount = false;
	let line;
	let inVisLine;
	let yearLimit;
	let svgAxis;
	let lastLengths = {}; // Store the last length of each line
	let circles = {}; // Store references to circle elements
	let highlightedRegionsEl = {};
	const transitionTime = 500;
	let highlightedRegions = [
		{
			step: 1,
			event: '',
			start: new Date(2018, 0, 2),
			end: new Date(2019, 1, 30),
			color: themes.car.primary,
			inactiveColor: themes.car.secondary,
			hiddenLines: ['Fahrrad', 'Oeffis'],
			isVisible: false
		},
		{
			step: 2,
			event: '',
			start: new Date(2020, 0, 30),
			end: new Date(2021, 0, 1),
			color: 'grey',
			hiddenLines: null,
			isVisible: false
		},
		{
			step: 3,
			event: '',
			start: new Date(2022, 5, 1),
			end: new Date(2022, 7, 30),
			color: themes.oepnv.primary,
			inactiveColor: themes.oepnv.secondary,
			hiddenLines: ['Fahrrad', 'Auto'],
			isVisible: false
		},
		{
			step: 4,
			event: '',
			start: new Date(2023, 3, 1),
			end: new Date(2023, 9, 1),
			color: themes.oepnv.primary,
			inactiveColor: themes.oepnv.secondary,
			hiddenLines: ['Fahrrad', 'Auto'],
			isVisible: false
		},
		{
			step: 6,
			event: '',
			start: new Date(2015, 11, 1),
			end: new Date(2016, 0, 30),
			color: themes.oepnv.primary,
			inactiveColor: themes.oepnv.secondary,
			hiddenLines: ['Fahrrad', 'Auto'],
			isVisible: false
		},
		{
			step: 6,
			event: '',
			start: new Date(2016, 11, 1),
			end: new Date(2017, 0, 30),
			color: themes.oepnv.primary,
			inactiveColor: themes.oepnv.secondary,
			hiddenLines: ['Fahrrad', 'Auto'],
			isVisible: false
		},
		{
			step: 6,
			event: '',
			start: new Date(2017, 11, 1),
			end: new Date(2018, 0, 30),
			color: themes.oepnv.primary,
			inactiveColor: themes.oepnv.secondary,
			hiddenLines: ['Fahrrad', 'Auto'],
			isVisible: false
		},
		{
			step: 6,
			event: '',
			start: new Date(2018, 11, 1),
			end: new Date(2019, 0, 30),
			color: themes.oepnv.primary,
			inactiveColor: themes.oepnv.secondary,
			hiddenLines: ['Fahrrad', 'Auto'],
			isVisible: false
		},
		{
			step: 6,
			event: '',
			start: new Date(2019, 11, 1),
			end: new Date(2020, 0, 30),
			color: themes.oepnv.primary,
			inactiveColor: themes.oepnv.secondary,
			hiddenLines: ['Fahrrad', 'Auto'],
			isVisible: false
		},
		{
			step: 6,
			event: '',
			start: new Date(2020, 11, 1),
			end: new Date(2021, 0, 30),
			color: themes.oepnv.primary,
			inactiveColor: themes.oepnv.secondary,
			hiddenLines: ['Fahrrad', 'Auto'],
			isVisible: false
		},
		{
			step: 6,
			event: '',
			start: new Date(2021, 11, 1),
			end: new Date(2022, 0, 30),
			color: themes.oepnv.primary,
			inactiveColor: themes.oepnv.secondary,
			hiddenLines: ['Fahrrad', 'Auto'],
			isVisible: false
		},
		{
			step: 6,
			event: '',
			start: new Date(2022, 11, 1),
			end: new Date(2023, 0, 30),
			color: themes.oepnv.primary,
			inactiveColor: themes.oepnv.secondary,
			hiddenLines: ['Fahrrad', 'Auto'],
			isVisible: false
		},
		{
			step: 7,
			event: '',
			start: null,
			end: null,
			color: null,
			inactiveColor: null,
			hiddenLines: ['Oeffis', 'Auto'],
			isVisible: false
		},
		{
			step: 8,
			event: '',
			start: new Date(2021, 0, 1),
			end: new Date(2023, 8, 30),
			color: 'grey',
			inactiveColor: 'grey',
			hiddenLines: null,
			isVisible: false
		},
		{
			step: 9,
			event: '',
			start: new Date(2023, 0, 1),
			end: new Date(2023, 8, 30),
			color: themes.oepnv.primary,
			inactiveColor: themes.oepnv.primary,
			hiddenLines: ['Fahrrad', 'Auto'],
			isVisible: false
		}
	];

	function getYearLimit(step) {
		switch (step) {
			case 0:
				return new Date(2015, 0, 30);
			case 1:
				return new Date(2019, 1, 30);
			case 2:
				return new Date(2021, 0, 1);
			case 3:
				return new Date(2022, 7, 30);
			case 4:
				return new Date(2023, 9, 1);

			// Add more cases as needed
			default:
				return new Date(2023, 9, 1); // Latest date if step is not recognized
		}
	}

	onMount(() => {
		data = updateDataStructure(rawData);

		// Aggregate all points to compute the domains
		setupScales();
		setupAxes();
		drawLines();
		mount = true;
	});

	// update chart when animationStep changes

	$: if (mount && rawData.length > 0 && animationStep >= 0) {
		updateChart(animationStep);
	}

	function setupScales() {
		let minDate = d3.min(
			data.flatMap((series) => series.ys),
			(d) => d.x
		);
		let maxDate = d3.max(
			data.flatMap((series) => series.ys),
			(d) => d.x
		);

		xScale = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);

		const allPoints = data.flatMap((series) => series.ys);
		const minY = d3.min(allPoints, (d) => d.y);
		const maxY = d3.max(allPoints, (d) => d.y);

		yScale = d3
			.scaleLinear()
			.domain([minY - 10, maxY + 20])
			.range([height, 0]);
	}

	function setupAxes() {
		xAxis = d3.axisBottom(xScale).ticks(xTicks).tickSize(-height);
		yAxis = d3
			.axisLeft(yScale)
			.ticks(yTicks)
			.tickFormat((d) => `${d}%`)
			.tickSize(-width);
	}

	function drawLines() {
		line = d3
			.line()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y));

		inVisLine = d3
			.line()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y));

		d3.select('#linechartrace').attr('viewBox', `0 0 500 300`);

		svgAxis = d3
			.select('#linechartrace')
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Add xAxis
		svgAxis
			.append('g')
			.attr('transform', `translate(0,${height})`) // Puts down x axis
			.call(xAxis);

		svgAxis
			.append('text')
			.attr('class', 'x label')
			.attr('text-anchor', 'end')
			.attr('x', width)
			.attr('y', height + 20)
			.text('Jahr');

		svgAxis
			.append('text')
			.attr('class', 'y label')
			.attr('text-anchor', 'start')
			.attr('y', -16)
			.attr('dy', '.75rem')
			.text('Preisindex in % (2020 = 100%)');

		svgAxis.selectAll('g line').style('stroke', themes.neutral.chartLines);

		svgAxis.select('.domain').remove();

		// Add yAxis
		svgAxis.append('g').call(yAxis).selectAll('g line').style('stroke', themes.neutral.chartLines);

		svgAxis.select('.domain').attr('d', ''); // Vanishes top line on chart
		svgAxis
			.selectAll('g text')
			.style('fill', themes.neutral['text-dark'].secondary)
			.style('font-size', 8);

		const inVisibleData = data.map((series) => ({
			...series,
			ys: series.ys
		}));

		inVisibleData.forEach((series) => {
			let path = d3.select(svg).select(`path.${series.name + 1}`);
			const isNewPath = path.empty();

			if (isNewPath) {
				path = d3
					.select('#linechartrace')
					.append('path')
					.attr('class', series.name + '1')
					.attr('fill', 'none')
					.attr('stroke', 'black')
					.attr('stroke-width', 0)
					.attr('transform', `translate(${margin.left},${margin.top})`);
			}
			path.datum(series.ys).attr('d', line);
		});

		const visibleData = data.map((series) => ({
			...series,
			ys: series.ys
		}));

		visibleData.forEach((series) => {
			let path = d3.select(svg).select(`path.${series.name}`);

			path = d3
				.select('#linechartrace')
				.append('path')
				.attr('class', series.name)
				.attr('fill', 'none')
				.attr('stroke', series.color)
				.attr('stroke-width', 2)
				.attr('transform', `translate(${margin.left},${margin.top})`);

			path.datum(series.ys).attr('d', line);
		});
	}

	function updateChart(step) {
		yearLimit = getYearLimit(step);

		const inVisibleData = data.map((series) => ({
			...series,
			ys: series.ys.filter((d) => d.x <= yearLimit)
		}));
		d3.select(svg).selectAll('circle').remove();
		let isForward;

		inVisibleData.forEach((series) => {
			let inVisPath = d3.select(svg).select(`path.${series.name + 1}`);
			let path = d3.select(svg).select(`path.${series.name}`);

			// Set the data for the path and calculate its length
			inVisPath.datum(series.ys).attr('d', line);
			let totalLength = inVisPath.node().getTotalLength();
			let maxLength = path.node().getTotalLength();

			// Determine the direction of animation
			let previousLength = lastLengths[series.name] || 0;
			isForward = totalLength > previousLength;

			circles[series.name] = d3
				.select(svg)
				.append('circle')
				.attr('r', 5)
				.attr('fill', series.color)
				.style('opacity', 1);

			// Position the circle at the end of the previous segment
			const previousPoint = path.node().getPointAtLength(previousLength);
			circles[series.name]
				.attr('cx', previousPoint.x)
				.attr('cy', previousPoint.y)
				.attr('transform', `translate(${margin.left},${margin.top})`);

			// Set up the initial conditions for the animation
			path.style('opacity', 1);
			if (isForward) {
				path
					.attr('stroke-dasharray', maxLength)
					.attr('stroke-dashoffset', maxLength - previousLength)
					.transition()
					.ease(d3.easeQuadOut)
					.duration(transitionTime)
					.attr('stroke-dashoffset', maxLength - totalLength)
					.tween('pathTween', () => {
						return (t) => {
							const point = path
								.node()
								.getPointAtLength(previousLength + (totalLength - previousLength) * t);
							circles[series.name].attr('cx', point.x).attr('cy', point.y);
						};
					});
			} else {
				path
					.attr('stroke-dasharray', maxLength)
					.attr('stroke-dashoffset', maxLength - previousLength)
					.transition()
					.ease(d3.easeLinear)
					.duration(transitionTime)
					.attr('stroke-dashoffset', maxLength - totalLength)
					.tween('pathTween', () => {
						return (t) => {
							const currentLength = previousLength - (previousLength - totalLength) * t;
							const point = path.node().getPointAtLength(currentLength);
							circles[series.name].attr('cx', point.x).attr('cy', point.y);
						};
					});
			}

			// Perform the transition
			lastLengths[series.name] = totalLength;
		});
		updateHighlightedRegions(step);
		// if (isForward) highlightRegions(step);
		// else unhighlightRegions(step + 1);
	}

	function updateDataStructure(rawData) {
		return [
			{
				name: 'Fahrrad',
				ys: transformData(rawData, 'FA'),
				color: themes.bike.primary
			},
			{
				name: 'Auto',
				ys: transformData(rawData, 'AUT'),
				color: themes.car.primary
			},
			{
				name: 'Oeffis',
				ys: transformData(rawData, 'OEF'),
				color: themes.oepnv.primary
			}
		];
	}

	function transformData(data, category) {
		return data
			.filter((d) => d.code === category)
			.map((d) => ({ x: new Date(d.year, d.month - 1, 1), y: d.value }));
	}

	function highlightRegions(region) {
		if (!highlightedRegionsEl[region.step]) {
			highlightedRegionsEl[region.step] = [];
		}

		const highlightRect = svgAxis
			.append('rect')
			.attr('class', `highlight-rect.step-${region.step}`)
			.attr('x', xScale(region.start))
			.attr('width', 0)
			.attr('y', 0)
			.attr('height', height)
			.style('fill', region.color)
			.style('opacity', 0.2);
		highlightRect
			.transition()
			.duration(transitionTime) // Duration in milliseconds
			.attr('width', xScale(region.end) - xScale(region.start));
		highlightedRegionsEl[region.step];

		highlightedRegionsEl[region.step].push(highlightRect);
	}

	function unhighlightRegions(step) {
		if (highlightedRegionsEl[step]) {
			// Iterate over all highlightRect elements in the array
			highlightedRegionsEl[step].forEach((highlightRect) => {
				// Apply transition to each element
				if (!highlightRect.empty()) {
					// Check if the element exists
					highlightRect.interrupt();
				}

				highlightRect
					.transition()
					.duration(transitionTime) // Duration in milliseconds
					.attr('width', 0) // Assuming you want to animate width to 0
					.on('end', () => {
						highlightRect.remove(); // Remove the element after animation
					});
			});

			// Clear the array after processing
			// highlightedRegionsEl[step] = [];
		}
	}

	function updateHighlightedRegions(step) {
		highlightedRegions.forEach((region) => {
			if (region.step === step) {
				// Highlight this region as it is before or at the current step
				if (!region.isVisible) {
					if (region.start && region.end) {
						drawStartLine(region);
						highlightRegions(region);
					}
					lowerPathOpacity(region);
					region.isVisible = true;
				}
			} else {
				// Unhighlight this region as it is after the current step
				if (region.isVisible) {
					undrawStartLine(region.step);
					unhighlightRegions(region.step);
					region.isVisible = false;
				}
			}
		});
	}

	function lowerPathOpacity(region) {
		if (region.hiddenLines) {
			region.hiddenLines.forEach((lineName) => {
				let path = d3.select(svg).select(`path.${lineName}`);
				circles[lineName].style('opacity', 0.2);
				path.style('opacity', 0.2);
			});
		}
	}

	function drawStartLine(region) {
		const startLineKey = `start-line-${region.step}`;
		const startTextKey = `start-text-${region.step}`;

		// Initialize as arrays if they don't exist
		if (!highlightedRegionsEl[startLineKey]) {
			highlightedRegionsEl[startLineKey] = [];
		}
		if (!highlightedRegionsEl[startTextKey]) {
			highlightedRegionsEl[startTextKey] = [];
		}

		// Create and animate the start line
		const newLine = svgAxis
			.append('line')
			.attr('class', `start-line step-${region.step}`)
			.attr('x1', xScale(region.start))
			.attr('x2', xScale(region.start))
			.attr('y1', height)
			.attr('y2', height)
			.attr('stroke', region.color)
			.attr('stroke-opacity', 0.7)
			.attr('stroke-width', 2);

		// Add the new line to the array
		highlightedRegionsEl[startLineKey].push(newLine);

		// Animate the start line
		newLine.transition().duration(transitionTime).attr('y2', 0);

		// Create and animate the text
		const newText = svgAxis
			.append('text')
			.attr('class', `start-text step-${region.step}`)
			.attr('x', xScale(region.start))
			.attr('y', -5)
			.attr('text-anchor', 'middle')
			.text(region.event)
			.style('fill', region.color)
			.style('opacity', 0)
			.style('font-weight', 'bold')
			.style('font-size', '12px');

		// Add the new text to the array
		highlightedRegionsEl[startTextKey].push(newText);

		// Animate the text
		newText.transition().duration(transitionTime).style('opacity', 1);
	}

	function undrawStartLine(step) {
		const startLineKey = `start-line-${step}`;
		const startTextKey = `start-text-${step}`;

		// Remove start lines
		if (highlightedRegionsEl[startLineKey]) {
			highlightedRegionsEl[startLineKey].forEach((startLine) => {
				startLine
					.transition()
					.duration(transitionTime)
					.attr('y2', height)
					.on('end', () => startLine.remove());
			});
			// Clear the array
			highlightedRegionsEl[startLineKey] = [];
		}

		// Remove start texts
		if (highlightedRegionsEl[startTextKey]) {
			highlightedRegionsEl[startTextKey].forEach((startText) => {
				startText
					.transition()
					.duration(transitionTime)
					.style('opacity', 0)
					.on('end', () => startText.remove());
			});
			// Clear the array
			highlightedRegionsEl[startTextKey] = [];
		}
	}
</script>

<div>
	<svg id="linechartrace" bind:this={svg}> </svg>
</div>

<style>
	div {
		display: flex; /* Enables Flexbox */
		flex-direction: column; /* Stacks children vertically */
		justify-content: center; /* Centers children along the main axis (vertically in this case) */
		align-items: center; /* Centers children along the cross axis (horizontally) */
		width: 100%;
		height: 100%;
	}
</style>
