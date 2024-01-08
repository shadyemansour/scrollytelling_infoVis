<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { themes } from '../config';

	export let rawData = []; // Pass the raw data as a prop
	export let animationStep;
	let svg; // Reference to the SVG element
	const margin = { top: 20, right: 26, bottom: 30, left: 80 };
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
			step: 3,
			event: 'something',
			start: new Date(2018, 11, 1),
			end: new Date(2020, 1, 1),
			color: 'blue',
			isVisible: false
		},
		{
			step: 5,
			event: 'something else',
			start: new Date(2021, 11, 1),
			end: new Date(2022, 9, 1),
			color: 'red',
			isVisible: false
		}
	];

	onMount(() => {
		data = updateDataStructure(rawData);

		// Aggregate all points to compute the domains
		setupScales();
		setupAxes();
		drawLines();
		mount = true;
	});

	// update chart when animationStep changes
	$: if (mount && rawData.length > 0 && animationStep) {
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
		yAxis = d3.axisLeft(yScale).ticks(yTicks).tickFormat(d3.format('.2s')).tickSize(-width);
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
			.call(xAxis)
			.selectAll('g text')
			.style('fill', themes.neutral['text-dark'].primary);

		svgAxis.selectAll('g line').style('stroke', themes.neutral.chartLines);

		svgAxis.select('.domain').remove();

		// Add yAxis
		svgAxis.append('g').call(yAxis).selectAll('g line').style('stroke', themes.neutral.chartLines);

		svgAxis.select('.domain').attr('d', 'M394,250H0V0H0'); // Vanishes top line on chart
		svgAxis.selectAll('g text').style('fill', themes.neutral['text-dark'].primary);

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
		console.log(step);
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
				.attr('fill', series.color);

			// Position the circle at the end of the previous segment
			const previousPoint = path.node().getPointAtLength(previousLength);
			circles[series.name]
				.attr('cx', previousPoint.x)
				.attr('cy', previousPoint.y)
				.attr('transform', `translate(${margin.left},${margin.top})`);

			// Set up the initial conditions for the animation
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

	function getYearLimit(step) {
		switch (step) {
			case -1:
				return new Date(2014, 0, 1);
			case 1:
				return new Date(2018, 1, 1);
			case 2:
				return new Date(2019, 1, 1);
			case 3:
				return new Date(2021, 0, 1);
			case 4:
				return new Date(2022, 4, 1);
			case 5:
				return new Date(2023, 3, 1);
			case 6:
				return new Date(2023, 9, 1);

			// Add more cases as needed
			default:
				return new Date(); // Latest date if step is not recognized
		}
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
		console.log('highlight', region.step);
		highlightedRegionsEl[region.step] = svgAxis
			.append('rect')
			.attr('class', `highlight-rect.step-${region.step}`)
			.attr('x', xScale(region.start))
			.attr('width', 0)
			.attr('y', 0)
			.attr('height', height)
			.style('fill', region.color)
			.style('opacity', 0.3);
		highlightedRegionsEl[region.step]
			.transition()
			.duration(transitionTime) // Duration in milliseconds
			.attr('width', xScale(region.end) - xScale(region.start));
	}

	function unhighlightRegions(step) {
		console.log('unhighlight', step);
		if (highlightedRegionsEl[step]) {
			// Select the highlighted element
			console.log(highlightedRegionsEl);
			let highlightRect = highlightedRegionsEl[step];

			// let currentWidth = parseFloat(highlightRect.attr('width'));
			// Animate the properties back to their original state
			highlightRect
				.transition()
				.duration(transitionTime) // Duration in milliseconds
				.attr('width', 0)
				// .attr('width', currentWidth) // Assuming the original width was 0
				.on('end', () => {
					highlightRect.remove(); // Optionally remove the element after animation
				});
		}
	}

	function updateHighlightedRegions(step) {
		highlightedRegions.forEach((region) => {
			if (region.step <= step + 1) {
				drawStartLine(region);
			}
			if (region.step >= step + 2) {
				undrawStartLine(region.step);
			}
			if (region.step <= step) {
				// Highlight this region as it is before or at the current step
				// Ensure this does not duplicate existing highlights
				if (!region.isVisible) {
					highlightRegions(region);
					region.isVisible = true;
				}
			} else {
				// Unhighlight this region as it is after the current step
				if (region.isVisible) {
					unhighlightRegions(region.step);
					region.isVisible = false;
				}
			}
		});
	}

	function drawStartLine(region) {
		// Check if the line is already drawn
		if (!highlightedRegionsEl[`start-line-${region.step}`]) {
			highlightedRegionsEl[`start-line-${region.step}`] = svgAxis
				.append('line')
				.attr('class', `start-line step-${region.step}`)
				.attr('x1', xScale(region.start))
				.attr('x2', xScale(region.start))
				.attr('y1', height)
				.attr('y2', height)
				.attr('stroke', region.color)
				.attr('stroke-opacity', 0.7)
				.attr('stroke-width', 2);

			// Animate the start line
			highlightedRegionsEl[`start-line-${region.step}`]
				.transition()
				.duration(transitionTime)
				.attr('y2', 0);

			highlightedRegionsEl[`start-text-${region.step}`] = svgAxis
				.append('text')
				.attr('class', `start-text step-${region.step}`)
				.attr('x', xScale(region.start))
				.attr('y', -5) // Adjust this value to position the text above the line
				.attr('text-anchor', 'middle') // Center the text over the line
				.text(region.event) // Assuming the text is stored in region.event
				.style('fill', region.color)
				.style('opacity', 0) // Start with text invisible
				.style('font-weight', 'bold')
				.style('font-size', '12px');

			// Animate the text to fade in
			highlightedRegionsEl[`start-text-${region.step}`]
				.transition()
				.duration(transitionTime)
				.style('opacity', 1);
		}
	}
	function undrawStartLine(step) {
		// Check if the line is already drawn
		if (highlightedRegionsEl[`start-line-${step}`]) {
			let startLine = highlightedRegionsEl[`start-line-${step}`];

			startLine
				.transition()
				.duration(transitionTime)
				.attr('y2', height)
				.on('end', () => {
					startLine.remove();
					delete highlightedRegionsEl[`start-line-${step}`];
				});

			// Remove the text element
			if (highlightedRegionsEl[`start-text-${step}`]) {
				let startText = highlightedRegionsEl[`start-text-${step}`];
				startText
					.transition()
					.duration(transitionTime)
					.style('opacity', 0) // Fade out the text
					.on('end', () => {
						startText.remove();
						delete highlightedRegionsEl[`start-text-${step}`];
					});
			}
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
