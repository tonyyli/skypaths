/*
 * skypaths.js
 * Copyright (C) 2015 tonyyli <tony.y.li@gmail.com>
 *
 * Distributed under terms of the MIT license.
 */

// Define constants and conversion factors
var π = Math.PI,
    τ = 2 * π,
    radians = π / 180,
    degrees = 180 / π;

// Define SVG length scales
var width = 640,
    height = 640,
    scale = width * 0.45;

// Create SVG
var svg = d3.select("#skypath")
    .append("svg")
    .attr("width", +width)
    .attr("height", +height);

// Define string formatting for various quantities
var formatTime = d3.time.format("%-I %p"),
    formatNumber = d3.format(".1f"),
    formatAngle = function(d) { return formatNumber(d) + "°"; };

// Define projection
var projection = d3.geo.projection(flippedStereographic)
    .scale(scale)
    .clipAngle(130)
    .rotate([0, -90])
    .translate([width / 2 + .5, height / 2 + .5])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

// Draw the horizon at a "radius" of 90 degrees (from zenith, i.e. center)
svg.append("path")
    .datum(d3.geo.circle().origin([0, 90]).angle(90))
    .attr("class", "horizon")
    .attr("d", path);

// Draw background grid lines
svg.append("path")
    .datum(d3.geo.graticule())
    .attr("class", "graticule")
    .attr("d", path);

// Define the azimuthal ticks element.  "g" is an SVG element that groups the objects inside.
var ticksAzimuth = svg.append("g")
    .attr("class", "ticks ticks--azimuth");

// Draw azimuthal ticks
ticksAzimuth.selectAll("line")
    .data(d3.range(360))
  .enter().append("line")
    .each(function(d) {
      var p0 = projection([d, 0]),
          p1 = projection([d, d % 10 ? -0.5 : -2]);

      d3.select(this)
          .attr("x1", p0[0])
          .attr("y1", p0[1])
          .attr("x2", p1[0])
          .attr("y2", p1[1]);
    });

// Label the azimuthal ticks
ticksAzimuth.selectAll("text")
    .data(d3.range(0, 360, 10))
  .enter().append("text")
    .each(function(d) {
      var p = projection([d, -4]);

      d3.select(this)
          .attr("x", p[0])
          .attr("y", p[1]);
    })
    .attr("dy", ".35em")
    .text(function(d) { return d === 0 ? "N" : d === 90 ? "E" : d === 180 ? "S" : d === 270 ? "W" : d + "°"; });

// Label the elevation angles, i.e. the "radii"
svg.append("g")
    .attr("class", "ticks ticks--elevation")
  .selectAll("text")
    .data(d3.range(10, 91, 10))
  .enter().append("text")
    .each(function(d) {
      var p = projection([45, d]);

      d3.select(this)
          .attr("x", p[0])
          .attr("y", p[1]);
    })
    .attr("dy", ".35em")
    .text(function(d) { return d + "°"; });


// Initialize values
var ra0 = 0,
    dec0 = 0,
    lat0 = 0,
    lon0 = 0;
d3.select("#nRA-number").property("value", ra0);
d3.select("#nDec-number").property("value", dec0);
d3.select("#nLon-number").property("value", lon0);
d3.select("#nLat-number").property("value", lat0);
d3.select("#nRA-slider").property("value", ra0);
d3.select("#nDec-slider").property("value", dec0);
d3.select("#nLon-slider").property("value", lon0);
d3.select("#nLat-slider").property("value", lat0);

//var skypath = svg.insert("path", ".sphere")
//    .attr("class", "sky-path");
var daypath = svg.insert("path", ".sphere")
    .attr("class", "sky-path-day");
var nightpath = svg.insert("path", ".sphere")
    .attr("class", "sky-path-night");

var skyPoint = initTargetDot();
var northPole = initPoleDot();
var southPole = initPoleDot();
northPole.select(".skydot-label").text("NP")
southPole.select(".skydot-label").text("SP")

updateCurve(ra0, dec0, lon0, lat0);


/////////////////////////////////////////////
// Define how plot is updated in this section

d3.select("#nRA-slider").on("input", function() { updateRA(+this.value); });
d3.select("#nDec-slider").on("input", function() { updateDec(+this.value); });
d3.select("#nLon-slider").on("input", function() { updateLongitude(+this.value); });
d3.select("#nLat-slider").on("input", function() { updateLatitude(+this.value); });

d3.select("#nRA-number").on("input", function() { updateRA(+this.value); });
d3.select("#nDec-number").on("input", function() { updateDec(+this.value); });
d3.select("#nLon-number").on("input", function() { updateLongitude(+this.value); });
d3.select("#nLat-number").on("input", function() { updateLatitude(+this.value); });

function updateRA(ra) {
  d3.select("#nRA-number").property("value", ra); // Update text box next to slider
  d3.select("#nRA-slider").property("value", ra); // Update underlying value of slider
  updateCurve(ra,
          +d3.select("#nDec-slider").property("value"),
          +d3.select("#nLon-slider").property("value"),
          +d3.select("#nLat-slider").property("value") ); // Update the curve
}

function updateDec(dec) {
  d3.select("#nDec-number").property("value", dec); // Update text box next to slider
  d3.select("#nDec-slider").property("value", dec); // Update underlying value of slider
  updateCurve(+d3.select("#nRA-slider").property("value"),
          dec,
          +d3.select("#nLon-slider").property("value"),
          +d3.select("#nLat-slider").property("value") ); // Update the curve
}

function updateLongitude(lon) {
  d3.select("#nLon-number").property("value", lon); // Update text box next to slider
  d3.select("#nLon-slider").property("value", lon); // Update underlying value of slider
  updateCurve(+d3.select("#nRA-slider").property("value"),
          +d3.select("#nDec-slider").property("value"),
          lon,
          +d3.select("#nLat-slider").property("value") ); // Update the curve
}

function updateLatitude(lat) {
  d3.select("#nLat-number").property("value", lat); // Update text box next to slider
  d3.select("#nLat-slider").property("value", lat); // Update underlying value of slider
  updateCurve(+d3.select("#nRA-slider").property("value"),
          +d3.select("#nDec-slider").property("value"),
          +d3.select("#nLon-slider").property("value"),
          lat ); // Update the curve
}

/////////////////////////////////////////////

function initTargetDot() {
  var skyPoint = svg.insert("g", ".sphere")
      .attr("class", "skydot");

  skyPoint.append("circle")
      .attr("r", 5);

  skyPoint.append("text")
      .attr("class", "skydot-label skydot-label--azimuth")
      .attr("dy", ".71em")
      .attr("y", 10);

  skyPoint.append("text")
      .attr("class", "skydot-label skydot-label--elevation")
      .attr("dy", "1.81em")
      .attr("y", 10);

  return skyPoint;
}

function initPoleDot() {
  var skyPoint = svg.insert("g", ".sphere")
      .attr("class", "skydot");

  skyPoint.append("circle")
      .attr("r", 3)
      .style("fill", "#fff");

  skyPoint.append("text")
      .attr("class", "skydot-label")
      .attr("dy", ".71em")
      .attr("y", 10);

  return skyPoint;
}

// Draw the curve for a given longitude and latitude
function updateCurve(ra, dec, longitude, latitude) {
  // Create a `skypathCalculator` object (skypath_calculator.js) from the current latitude and longitude
  var pathcalc = skypathCalculator([ra, dec], [longitude, latitude]);
  var npolecalc = skypathCalculator([ra, 90], [longitude, latitude]);
  var spolecalc = skypathCalculator([ra, -90], [longitude, latitude]);

  var tickSun = svg.insert("g", ".sphere")
      .attr("class", "ticks ticks--skydot")
      .selectAll("g");

  drawTrajectory();

  function drawTrajectory() {
    var now = new Date,
        start = d3.time.day.floor(now),
        end = d3.time.day.offset(start, 1),
        dawn0 = d3.time.hour.offset(start, 6),
        dusk0 = d3.time.hour.offset(start, 18),
        dawn1 = d3.time.hour.offset(start, 30);

    // Redraw daytime path
    daypath
        .datum({type: "LineString", coordinates: d3.time.minutes(dawn0, dusk0).map(pathcalc.position)})
        .transition()
        .attr("d", path);

    // Redraw nighttime path
    nightpath
        .datum({type: "LineString", coordinates: d3.time.minutes(dusk0, dawn1).map(pathcalc.position)})
        .transition()
        .attr("d", path);

    // Redraw current position of object on sky
    skyPoint
        .datum(pathcalc.position(now))
        .transition()
        .attr("transform", function(d) { return "translate(" + projection(d) + ")"; });

    // Redraw north and south poles
    northPole
        .datum(npolecalc.position(now))
        .transition()
        .attr("transform", function(d) { return "translate(" + projection(d) + ")"; });
    southPole
        .datum(spolecalc.position(now))
        .transition()
        .attr("transform", function(d) { return "translate(" + projection(d) + ")"; });

    skyPoint.select(".skydot-label--azimuth")
        .text(function(d) { return formatAngle(d[0]) + " φ"; });

    skyPoint.select(".skydot-label--elevation")
        .text(function(d) { return formatAngle(d[1]) + " θ"; });

    tickSun = tickSun
      .data(d3.time.hours(start, end), function(d) { return +d; });

    tickSun.exit().remove();

    //var tickSunEnter = tickSun.enter().append("g")
    //    .attr("transform", function(d) { return "translate(" + projection(pathcalc.position(d)) + ")"; });

    //tickSunEnter.append("circle")
    //    .attr("r", 2.5);

    //tickSunEnter.append("text")
    //    .attr("dy", "-.31em")
    //    .attr("y", -6)
    //    .text(formatTime);
  }
}

d3.select(self.frameElement).style("height", height + "px");

// Define the `flippedStereographic` projection function (lambda = elevation, phi = azimuth)
function flippedStereographic(λ, φ)  {
  var cosλ = Math.cos(λ),
      cosφ = Math.cos(φ),
      k = 1 / (1 + cosλ * cosφ);
  return [
    k * cosφ * Math.sin(λ),
    -k * Math.sin(φ)
  ];
}

