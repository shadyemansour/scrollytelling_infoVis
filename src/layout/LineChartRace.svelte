<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let rawData = []; // Pass the raw data as a prop
  export let animationStep;
  let svg; // Reference to the SVG element
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 500 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  let data; // This will hold the transformed data
  let xScale, yScale, xAxis, yAxis;
  let mount = false;
  let line;
  let svgContainer;
  let previousLengths = {};
  let lastLengths = {}; // Store the last length of each line
  let circles = {}; // Store references to circle elements


  onMount(() => {
    console.log(rawData);

    data = updateDataStructure(rawData); 

    // Aggregate all points to compute the domains
    setupScales();
    setupAxes();
    drawLines();
    mount = true;
  });

  $: if (mount && rawData.length>0 && animationStep) {
    console.log(rawData)
    updateChart(animationStep);
  }

  function setupScales() {
    xScale = d3.scaleTime()
      .domain(d3.extent(data.flatMap(series => series.ys), d => d.x))
      .range([0, width]);

      const allPoints = data.flatMap(series => series.ys);

    yScale = d3.scaleLinear()
      .domain([0, d3.max(allPoints, d => d.y)])
      .range([height, 0]);
  }

  
    function setupAxes() {
      xAxis = d3.axisBottom(xScale).ticks(5);
      yAxis = d3.axisLeft(yScale).ticks(5);
  }

  function drawLines() {
    line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));

    svgContainer = d3.select(svg)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svgContainer.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);
    svgContainer.append("g")
      .call(yAxis);
  }

  // function updateChart(step) {
  //   const yearLimit = getYearLimit(step);
  //   const filteredData = data.map(series => ({
  //     ...series,
  //     ys: series.ys.filter(d => d.x <= yearLimit)
  //   }));

  //   // Remove the existing paths and redraw them
  //   d3.select(svg).selectAll("circle").remove();
  //   filteredData.forEach(series => {
  //     const path = d3.select(svg).append("path")
  //     .datum(series.ys)
  //     .attr("fill", "none")
  //     .attr("stroke", series.color)
  //     .attr("stroke-width", 1.5)
  //     .attr("d", line);
      
  //     const totalLength = path.node().getTotalLength();
  //     const previousLength = lastLengths[series.name] || 0;
  //     lastLengths[series.name] = totalLength;

  //       circles[series.name] = d3.select(svg).append("circle")
  //         .attr("r", 5)
  //         .attr("fill", series.color);

  //   // Position the circle at the end of the previous segment
  //   const previousPoint = path.node().getPointAtLength(previousLength);
  //     circles[series.name]
  //       .attr("cx", previousPoint.x)
  //       .attr("cy", previousPoint.y);



  //     path.attr("stroke-dasharray", totalLength + " " + totalLength)
  //         .attr("stroke-dashoffset", totalLength - previousLength)
  //         .transition()
  //         .ease(d3.easeLinear)
  //         .attr("stroke-dashoffset", 0)
  //         .duration(500)
  //         .attr("stroke-dashoffset", 0)
  //         .tween("pathTween", () => {
  //           return t => {
  //             const point = path.node().getPointAtLength(previousLength + (totalLength - previousLength) * t);
  //             circles[series.name].attr("cx", point.x).attr("cy", point.y);
  //           };
  //         });

  //         previousLengths[series.name] = totalLength;

  //   });
  // }

  function updateChart(step) {

  const yearLimit = getYearLimit(step);
  const visibleData = data.map(series => ({
    ...series,
    ys: series.ys.filter(d => d.x <= yearLimit)
  }));
  console.log(yearLimit);
    d3.select(svg).selectAll("circle").remove();

  visibleData.forEach(series => {
    let path = d3.select(svg).select(`path.${series.name}`);
    const isNewPath = path.empty();

    if (isNewPath) {
      path = d3.select(svg).append("path")
        .attr("class", series.name)
        .attr("fill", "none")
        .attr("stroke", series.color)
        .attr("stroke-width", 1.5);
    }

    // Set the data for the path and calculate its length
    path.datum(series.ys).attr("d", line);
    const totalLength = path.node().getTotalLength();

    // Determine the direction of animation
    const previousLength = lastLengths[series.name] || 0;
    console.log(lastLengths, totalLength)
    const isForward = totalLength > previousLength;

    circles[series.name] = d3.select(svg).append("circle")
          .attr("r", 5)
          .attr("fill", series.color);

    // Position the circle at the end of the previous segment
    const previousPoint = path.node().getPointAtLength(previousLength);
      circles[series.name]
        .attr("cx", previousPoint.x)
        .attr("cy", previousPoint.y);


    // console.log(`Step: ${step}, Year Limit: ${yearLimit}, Previous Length: ${previousLength}, Total Length: ${totalLength}`);

    // Set up the initial conditions for the animation
    if (isForward) {
            console.log(step, ' forward', previousLength, totalLength)

      path.attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength - previousLength)
          .transition()
      .ease(d3.easeLinear)
      .duration(500)
      .attr("stroke-dashoffset", 0)
      .tween("pathTween", () => {
            return t => {
              const point = path.node().getPointAtLength(previousLength + (totalLength - previousLength) * t);
              circles[series.name].attr("cx", point.x).attr("cy", point.y);
            };
          });

    } else {
            console.log(step, ' backwards', previousLength, totalLength)

            path.attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", 0)
    .transition()
    .ease(d3.easeLinear)
    .duration(500)
    .attr("stroke-dashoffset",  previousLength-totalLength)
          .tween("pathTween", () => {
            return t => {
              const point = path.node().getPointAtLength(totalLength - (previousLength - totalLength) * t);
              circles[series.name].attr("cx", point.x).attr("cy", point.y);
            };
          });
    }

    

    // Perform the transition
    lastLengths[series.name] = totalLength;

    // TODO: Manage the circle's position
  });
}


  // function updateChart(step) {
  //   console.log(step);
  // const yearLimit = getYearLimit(step);
  // const visibleData = data.map(series => ({
  //   ...series,
  //   ys: series.ys.filter(d => d.x <= yearLimit)
  // }));

  // visibleData.forEach(series => {
  //   let path = d3.select(svg).select(`path.${series.name}`);
  //   const isNewPath = path.empty();

  //   if (isNewPath) {
  //     path = d3.select(svg).append("path")
  //       .attr("class", series.name)
  //       .attr("fill", "none")
  //       .attr("stroke", series.color)
  //       .attr("stroke-width", 1.5);
  //   }

  //   // Set the data for the path and calculate its length
  //   path.datum(series.ys).attr("d", line);
  //   const totalLength = path.node().getTotalLength();

  //   // Determine the direction of animation
  //   const previousLength = lastLengths[series.name] || 0;
  //   const isForward = totalLength > previousLength;

  //   // Prepare the path for animation
  //   if (isForward) {
  //     // Forward or new path: reveal the line
  //     console.log('forward', previousLength, totalLength)
  //     path.attr("stroke-dasharray", totalLength + " " + totalLength)
  //         .attr("stroke-dashoffset", totalLength - previousLength)
  //         .transition()
  //         .ease(d3.easeLinear)
  //         .duration(500)
  //         .attr("stroke-dashoffset", 0)
  //   } else {
  //     // Backward: hide part of the line
  //     console.log('backwards', previousLength, totalLength)
  //     path.attr("stroke-dasharray", previousLength + " " + totalLength)
  //         .attr("stroke-dashoffset", previousLength - totalLength)
  //         .transition()
  //         .ease(d3.easeLinear)
  //         .duration(500)
  //         .attr("stroke-dasharray", totalLength);   
  //     }

  //   lastLengths[series.name] = totalLength;

  //   // TODO: Manage the circle's position
  // });
// }
  function getYearLimit(step) {
    // Define how the step translates to a year
    const yearRanges = {
    chart01: { start: 2001, end: 2004 },
    chart02: { start: 2005, end: 2008 },
    chart03: { start: 2009, end: 2012 },
    chart04: { start: 2013, end: 2016 },
    chart05: { start: 2017, end: 2020 }
};

    switch (step) {
      case 1: return new Date(2004, 0, 1);
      case 2: return new Date(2008, 0, 1);
      case 3: return new Date(2012, 0, 1);
      case 4: return new Date(2016, 0, 1);
      case 5: return new Date(2020, 0, 1);

      // Add more cases as needed
      default: return new Date(); // Latest date if step is not recognized
    }
  }

  function updateDataStructure(rawData) {
    console.log(rawData);

    return [
      {
        name: 'Fahrrad',
        ys: transformData(rawData, 'FA'),
        color: 'blue'
      },
      {
        name: 'Auto',
        ys: transformData(rawData, 'AUT'),
        color: 'red'
      },
      {
        name: 'Oeffis',
        ys: transformData(rawData, 'OEF'),
        color: 'green'
      }
    ];
  }

  function transformData(data, category) {
    return data
      .filter(d => d.code === category)
      .map(d => ({ x: new Date(d.year, 0, 1), y: d.value })); // Ensure x is a number
  }
</script>

<svg bind:this={svg} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}></svg>
