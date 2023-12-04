<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let rawData = []; // Pass the raw data as a prop
  export let animationStep;
  let svg; // Reference to the SVG element
  const margin = { top: 20, right: 26, bottom: 30, left: 100 };
  export let width = 500 - margin.left - margin.right;
  export let height = 300 - margin.top - margin.bottom;

  let data; // This will hold the transformed data
  let xScale, yScale, xAxis, yAxis;
  let mount = false;
  let line;
  let inVisLine;
  let yearLimit;
  let svgContainer;
  let previousLengths = {};
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
      .y(d => yScale(d.y))
      
    inVisLine = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))

    svgContainer = d3.select("#linechartrace")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add xAxis
    svgContainer.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);
    // Add yAxis
    svgContainer.append("g")
      .call(yAxis);
      
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
                .attr("stroke-width", .5)
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
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .attr("transform", `translate(${margin.left},${margin.top})`)
      
        path.datum(series.ys).attr("d", line);
    });
  }


  function updateChart(step) {
    // const newYearLimit = getYearLimit(step);
    // let isForward = true;
    // if (yearLimit && newYearLimit < yearLimit){
    //   isForward = false;
    //   yearLimit = getYearLimit(step+1)
    // } else {
      //   yearLimit = getYearLimit(step);
      //   isForward = true;
      // }
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
      console.log(series.name, lastLengths, totalLength)
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


      //console.log(`Step: ${step}, Previous Length: ${previousLength}, Total Length: ${totalLength}`);

      // Set up the initial conditions for the animation
      if (isForward) {
        console.log(step +' forward, prev. length:'+ previousLength+'  totalLength: '+ totalLength)
        
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
        // console.log(step +' backwards, prev. length:'+ previousLength+'  totalLength: '+ totalLength)
        // console.log((previousLength - totalLength));
        // console.log(totalLength - (previousLength - totalLength));
        console.log(series);
        path
          .attr("stroke-dasharray", maxLength)
          .attr("stroke-dashoffset", maxLength - previousLength)
          .transition().ease(d3.easeLinear).duration(500)
          .attr("stroke-dashoffset", maxLength - totalLength)
          .tween("pathTween", () => {
          return t => {
            const point = path.node().getPointAtLength(totalLength - (previousLength - totalLength) * t);
            circles[series.name].attr("cx", point.x).attr("cy", point.y);
          };
          });
      }

      // Perform the transition
      lastLengths[series.name] = totalLength;
    });
  }

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

<svg id="linechartrace" bind:this={svg} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}></svg>
