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


  onMount(() => {
    data = updateDataStructure(rawData); 

    // Aggregate all points to compute the domains
    setupScales();
    setupAxes();
    drawLines();
    mount = true;
  });

  // update chart when animationStep changes
  $: if (mount && rawData.length>0 && animationStep) {
    updateChart(animationStep);
  }

  function setupScales() {
    let minDate = d3.min(data.flatMap(series => series.ys), d => d.x);
    let maxDate = d3.max(data.flatMap(series => series.ys), d => d.x);

    xScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, width]);


    const allPoints = data.flatMap(series => series.ys);
    const minY = d3.min(allPoints, d => d.y)
    const maxY = d3.max(allPoints, d => d.y)

    yScale = d3.scaleLinear()
      .domain([minY-10, maxY+20])
      .range([height, 0]);
  }

  
    function setupAxes() {
      xAxis = d3.axisBottom(xScale).ticks(xTicks).tickSize(-height);
      yAxis = d3.axisLeft(yScale).ticks(yTicks).tickFormat(d3.format(".2s")).tickSize(-width);
  }


  function drawLines() {
    line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      
    inVisLine = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))

    d3.select("#linechartrace").attr("viewBox", `0 0 500 300`);

    svgAxis
     = d3.select("#linechartrace")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      
    
    // Add xAxis
    svgAxis.append("g")
      .attr("transform", `translate(0,${height})`) // Puts down x axis
      .call(xAxis)
      .selectAll("g text")
      .style("fill", themes.neutral['text-dark'].primary)

    svgAxis
      .selectAll("g line")
      .style("stroke", themes.neutral.chartLines);

    svgAxis.select(".domain").remove();
    
    // Add yAxis
    svgAxis.append("g")
    .call(yAxis)
    .selectAll("g line")
    .style("stroke", themes.neutral.chartLines);
    
    svgAxis.select(".domain").attr("d", "M394,250H0V0H"); // Vanishes top line on chart
    svgAxis
      .selectAll("g text")
      .style("fill", themes.neutral['text-dark'].primary)
      


    const inVisibleData = data.map(series => ({
      ...series,
      ys: series.ys
    }));

    inVisibleData.forEach(series => {
      let path = d3.select(svg).select(`path.${series.name+1}`);
      const isNewPath = path.empty();

      if (isNewPath) {
        path = d3.select("#linechartrace").append("path")
          .attr("class", series.name+"1")
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", 0)
          .attr("transform", `translate(${margin.left},${margin.top})`)
        }
        path.datum(series.ys).attr("d", line);
    });


    const visibleData = data.map(series => ({
      ...series,
      ys: series.ys
    }));

    visibleData.forEach(series => {
      let path = d3.select(svg).select(`path.${series.name}`);
      
        path = d3.select("#linechartrace").append("path")
          .attr("class", series.name)
          .attr("fill", "none")
          .attr("stroke", series.color)
          .attr("stroke-width", 2)
          .attr("transform", `translate(${margin.left},${margin.top})`)
      
        path.datum(series.ys).attr("d", line);
    });
  }


  function updateChart(step) {

    yearLimit = getYearLimit(step);
      

    const inVisibleData = data.map(series => ({
      ...series,
      ys: series.ys.filter(d => d.x <= yearLimit)
    }));
    d3.select(svg).selectAll("circle").remove();

    inVisibleData.forEach(series => {
      let inVisPath = d3.select(svg).select(`path.${series.name+1}`);
      let path = d3.select(svg).select(`path.${series.name}`);

        
      // Set the data for the path and calculate its length
      inVisPath.datum(series.ys).attr("d", line);
      let totalLength = inVisPath.node().getTotalLength();
      let maxLength = path.node().getTotalLength();
      
      // Determine the direction of animation
      let previousLength = lastLengths[series.name] || 0;
      const isForward = totalLength > previousLength;
      

      circles[series.name] = d3.select(svg).append("circle")
      .attr("r", 5)
      .attr("fill", series.color);
      
      // Position the circle at the end of the previous segment
      const previousPoint = path.node().getPointAtLength(previousLength);
      circles[series.name]
      .attr("cx", previousPoint.x)
      .attr("cy", previousPoint.y)
      .attr("transform", `translate(${margin.left},${margin.top})`);



      // Set up the initial conditions for the animation
      if (isForward) {
        
        path
          .attr("stroke-dasharray", maxLength)
          .attr("stroke-dashoffset", maxLength - previousLength)
          .transition().ease(d3.easeQuadOut).duration(500)
          .attr("stroke-dashoffset", maxLength - totalLength)
          .tween("pathTween", () => {
            return t => {
              const point = path.node().getPointAtLength(previousLength + (totalLength - previousLength) * t);
              circles[series.name].attr("cx", point.x).attr("cy", point.y);
            };
          });
        
      } else {
        path
          .attr("stroke-dasharray", maxLength)
          .attr("stroke-dashoffset", maxLength - previousLength)
          .transition().ease(d3.easeLinear).duration(500)
          .attr("stroke-dashoffset", maxLength - totalLength)
          .tween("pathTween", () => {
          return t => {

            const currentLength =  previousLength  - (previousLength - totalLength) * t;
            const point = path.node().getPointAtLength(currentLength);
            circles[series.name].attr("cx", point.x).attr("cy", point.y);
          };
          });
      }

      // Perform the transition
      lastLengths[series.name] = totalLength;
    });
  }

  function getYearLimit(step) {
    switch (step) {
      case -1: return new Date(2014, 0, 1);
      case 1: return new Date(2016, 11, 1);
      case 2: return new Date(2018, 11, 1);
      case 3: return new Date(2020, 11, 1);
      case 4: return new Date(2021, 11, 1);
      case 5: return new Date(2023, 9, 1);

      // Add more cases as needed
      default: return new Date(); // Latest date if step is not recognized
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
      .filter(d => d.code === category)
      .map(d => ({ x: new Date(d.year, d.month-1, 1), y: d.value }));
  }
</script>

<div>
  <svg 
  id="linechartrace" 
  bind:this={svg} 
  >
  </svg>
</div>

<style>
  div {
    display: flex;        /* Enables Flexbox */
    flex-direction: column; /* Stacks children vertically */
    justify-content: center; /* Centers children along the main axis (vertically in this case) */
    align-items: center;    /* Centers children along the cross axis (horizontally) */
    width: 100%;
    height: 100%;
}

</style>
