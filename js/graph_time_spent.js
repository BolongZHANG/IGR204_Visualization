function format_liste(time) {
  if (time === 0) {
    return [0,0];
  }
  if (time[0] === ":") {
    return [0,+time.slice(1)];
  }
  return time.split(":").map(d => +d);
}

function format_time(list) {
    return (new Date(0,0,0,list[0],list[1],0));
}

function add(time1, time2) {
  var m = (time1[1]+time2[1])%60;
  var h = (time1[0]+time2[0])+Math.floor((time1[1]+time2[1])/60)
  return [h,m]
}

function createGrapheTimeSpent(Checked_activities) {
	
	$("#activity-graph-ts").children().remove();
  var svgWidth = 600;
  var svgHeight = svgWidth * 0.6;

  var map = new Map();

  for (var i = 0; i < countries.length; i++) {
    map.set(countries[i], [0,0]);
  }

  for (var j = 0; j < Checked_activities.length; j++) {
    for (var i = 0; i < countries.length; i++) {
	     temp = map.get(countries[i]);
       map.set(countries[i], add(format_liste(dataset.get(countries[i]).get(Checked_activities[j]).timeSpent) , temp) );
    }
  }

  var data0=Array.from(map.entries()).sort(function f(L1,L2) {
     return (L2[1][1]+L2[1][0]*60-L1[1][1]-L1[1][0]*60);
  });

  var data = []
  for (var i = 0; i < data0.length; i++) {
    if ((data0[i][1][0] != 0)&&(data0[i][1][1] != 0)) {
      data.push([data0[i][0],format_time(data0[i][1])]);
    }
  }

  var margin = {top: 20, right: 40, bottom: 100, left: 40},
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;

  var xscale = d3.scaleBand()
    .domain(data.map(d => d[0]))
    .rangeRound([margin.left, margin.left+width]).paddingInner(0.05);
  var yscale = d3.scaleLinear()
    .domain([d3.min(data,d=>d[1]),d3.max(data,d=>d[1])])
    .range([height+margin.top, margin.top]);
  console.log(data);
  console.log(d3.min(data,d=>d[1]));

	var xAxis = d3.axisBottom(xscale).tickSize(0);

	var yAxis = d3.axisLeft(yscale).ticks(5).tickFormat(d3.timeFormat("%H:%M"));

  var svg = d3.select("#activity-graph-ts").append('svg')
    .attr("width", svgWidth)
    .attr("height", svgHeight);
  svg.append("g")
    .attr("transform", "translate(0," + (height+margin.top) + ")")
    .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
  svg.append("g")
    .attr("transform", "translate("+margin.left+", 0)")
    .call(yAxis);
  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("style", "fill:rgb(0,0,255)")
    .attr("x", d => xscale(d[0]))
    .attr("y", d => yscale(d[1]))
    .attr("width", xscale.bandwidth())
    .attr("height", d => (height+margin.top-yscale(d[1])));
}
