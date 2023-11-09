<script>
// @ts-nocheck

    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    // Assuming the CSV has been processed and normalized as per previous steps
    // and the data is in the same format as 'normalized_pivot_data' we used earlier.
    async function processCSVData(csvFilePath) {
  const data = await d3.csv(csvFilePath, (d) => {
    // Convert the quarter data to numbers and remove spaces
    d['Beförderte Personen 1000 1. Quartal'] = +d['Beförderte Personen 1000 1. Quartal'].replace(/ /g, '');
    d['Beförderte Personen 1000 2. Quartal'] = +d['Beförderte Personen 1000 2. Quartal'].replace(/ /g, '');
    d['Beförderte Personen 1000 3. Quartal'] = +d['Beförderte Personen 1000 3. Quartal'].replace(/ /g, '');
    d['Beförderte Personen 1000 4. Quartal'] = +d['Beförderte Personen 1000 4. Quartal'].replace(/ /g, '');
    // Sum up the quarters to get a yearly total for each Bundesland
    d['Yearly Total'] = d['Beförderte Personen 1000 1. Quartal'] +
                        d['Beförderte Personen 1000 2. Quartal'] +
                        d['Beförderte Personen 1000 3. Quartal'] +
                        d['Beförderte Personen 1000 4. Quartal'];
    return d;
  });

  // Log the first few rows to verify the structure and fields
  console.log(data.slice(0, 5));

  return data;
}

  
    // This function will create the heatmap
    function createHeatmap(data) {
      // Define the dimensions and margins of the graph
      const margin = {top: 30, right: 30, bottom: 70, left: 60},
            width = 450 - margin.left - margin.right,
            height = 450 - margin.top - margin.bottom;
  
      // Append the svg object to the body of the page
      const svg = d3.select('#heatmap')
        .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);
  
      // Read the data
      // Since we are using a normalized 2D array, we will directly use 'data' to create the heatmap
  
      // Build X scales and axis:
      const x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(d => d.Bundesland))
        .padding(0.05);
      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
          .attr('transform', 'translate(-10,0)rotate(-45)')
          .style('text-anchor', 'end');
  
      // Build Y scales and axis:
      const y = d3.scaleBand()
        .range([ height, 0 ])
        .domain(data.map(d => d.Jahr))
        .padding(0.05);

      svg.append('g')
        .call(d3.axisLeft(y));
  
      // Build color scale
      const maxValue = d3.max(data, function(d) { return +d['Yearly Total']; });
      const minValue = d3.min(data, function(d) { return +d['Yearly Total']; });
      console.log(maxValue+', Min:'+minValue);


      const myColor = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([0,maxValue/2]) // This domain would need to be adjusted based on your data's range

      svg.selectAll()
        .data(data, function(d) {return d.Bundesland+':'+d.Jahr;})
        .enter()
        .append('rect')
          .attr('x', function(d) { return x(d.Bundesland) })
          .attr('y', function(d) { return y(d.Jahr) })
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('width', x.bandwidth() )
          .attr('height', y.bandwidth() )
          .style('fill', function(d) { return myColor(d['Yearly Total'])})
          
    }
  
    onMount(async () => {
      const csvFilePath = '../assets/data/DE_Personenverkehr.csv';
      const data = await processCSVData(csvFilePath);
      createHeatmap(data);
    });
  </script>
  
  <div id="heatmap"></div>
  