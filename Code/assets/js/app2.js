var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width  = svgWidth  - margin.left - margin.right;
var height = svgHeight - margin.top  - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#chart")
  .append("svg")
  .attr("width",  svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";



// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating x-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
        d3.max(censusData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  circlesGroup.selectAll("text")
    
  return circlesGroup;
}

function yrenderCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var label;
  var ylabel;

  var xDesc;
  var yDesc = "%";

  if (chosenXAxis === "poverty") {
    label = "Poverty: "; 
    xDesc = "%";
  }
  else if (chosenXAxis === "age"){
    label = "Age (Median): ";
    xDesc = " years";
  }
  else {
      label = "Household Income (Median):$"
      xDesc = "";
  }

  if(chosenYAxis === "healthcare"){
      ylabel = "Healthcare: "
  }
  else if(chosenYAxis === "smokes"){
    ylabel = "Smokes: "
  } else {
      ylabel = "Obese: "
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, 100])
    
    .html(function(d) {
      return (`${d.state}<br>${label}${d[chosenXAxis]}${xDesc} <br> ${ylabel}${d[chosenYAxis]}${yDesc}`)
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    d3.select(this).transition()
    .duration('100')
    .style("stroke", "black")
    .attr("stroke-width", 2)
    .attr("r", 17);
    
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      d3.select(this).transition()
      .duration('100')
      .attr("stroke-width", 0)
      .attr("r", 12);
      toolTip.hide(data);
    });


  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(censusData, err) {
  if (err) throw err;
  // parse data
  censusData.forEach(function(data) {
    data.poverty    = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age        = +data.age;
    data.smokes     = +data.smokes;
    data.obesity    = +data.obesity;
    data.income     = +data.income;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(censusData, d => d[chosenYAxis])])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis   = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("class", "stateCircle" )
    ;

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(0, 0)`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Median Age");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis
  var obeseLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Obese (%)")
    .attr("value", "obesity");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    //.attr("y", 0 - margin.left)
    .attr("y", 0-margin.left+20)
    .attr("x", 0 - (height / 2) )
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Smokes (%)")
    .attr("value", "smokes")
    ;


  var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left+40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("active", true)
    .text("Lack of Healthcare (%)")
    .attr("value", "healthcare")
    ;

function  go(chosenXAxis,chosenYAxis){    
  var circleLabels  = chartGroup.selectAll(null).data(censusData).enter().append("text")

  circleLabels
    .text(function(d) { return d.abbr})
    .attr("x", function(d) { return })
    .attr("y", function(d) {
      return yLinearScale(d[chosenYAxis])+4
    })    
    .transition()
    .duration(1000)
    .attr("transform", function(d) { return "translate(" + xLinearScale(d[chosenXAxis]) + ")"; })
    .attr("class", "stateText")
    .attr("font-size", "10px")

  return circleLabels;
}


// updateToolTip function above csv import
var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

var cl = go(chosenXAxis, chosenYAxis, cl)
  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  //console.log(value);
  if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        cl.remove();
        cl = go(chosenXAxis, chosenYAxis, cl);
        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);  

        }
        else if (chosenXAxis === "poverty") {
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else { //income label 
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", true)
            .classed("inactive", false);

        }
      }
    });

    ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      console.log(value);
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // console.log(chosenXAxis)

        // updates t\y scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = yrenderCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        cl.remove();
        cl = go(chosenXAxis, chosenYAxis, cl);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);  

        }
        else if (chosenYAxis === "smokes") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else { //obese label 
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
            obeseLabel
            .classed("active", true)
            .classed("inactive", false);

        }
      }
    });

}).catch(function(error) {
  console.log(error);
});

 