var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv")
  .then(function(censusData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    censusData.forEach(function(data) {
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
    //   .domain([d3.max(censusData, d => d.poverty)])*0.8,
      .domain([d3.min(censusData, d => d.poverty) * 0.8,
      d3.max(censusData, d => d.poverty) * 1.2])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(censusData, d => d.healthcare)*1.2])
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll()
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "15")
    .attr("fill", "blue")
    .attr("opacity", ".3");

    // text in circles
    chartGroup.selectAll()
   .data(censusData)
   .enter()
   .append("text")
   .classed("text-circles",true)
   .text(d => d.abbr)
   .attr("x", d => xLinearScale(d.poverty))
   .attr("y", d => yLinearScale(d.healthcare))
   .attr("dy",5)
   .attr("text-anchor","middle")
   .attr("font-size","12px");
   

    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>Poverty: ${d.poverty}<br>Healthcare: ${d.healthcare}`);
      });

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("click", function(data) {
      toolTip.show(data, this);})
      .on("mouseover", function(d) {
        // Show the tooltip
        toolTip.show(d, this);
        // Highlight the state circle's border
        d3.select(this).style("stroke", "#323232");
    })
      // onmouseout event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      // Remove highlight
        d3.select(this).style("stroke", "#e3e3e3");
      });

    
    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 30 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("aText", true)
      .text("Lacks Healthcare (%)");

    chartGroup.append("text")
      .attr("y", height + margin.bottom/2 - 10)
      .attr("x", width / 2)
      .attr("dy", "1em")
      .classed("aText", true)
      .text("In Poverty (%)");
  });
