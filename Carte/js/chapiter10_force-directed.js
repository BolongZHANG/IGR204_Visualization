var dataset = {
  nodes:[
    { name: "Adam" },
    { name: "Bob" },
    { name: "Carrie" },
    { name: "Donovan" },
    { name: "Edward" },
    { name: "Felicity" },
    { name: "George" },
    { name: "Hannah" },
    { name: "Iris" },
    { name: "Jerry" }
    ],
  edges:[
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 0, target: 3 },
    { source: 0, target: 4 },
    { source: 1, target: 5 },
    { source: 2, target: 5 },
    { source: 2, target: 5 },
    { source: 3, target: 4 },
    { source: 5, target: 8 },
    { source: 5, target: 9 },
    { source: 6, target: 7 },
    { source: 7, target: 8 },
    { source: 8, target: 9 }
  ]
}

let height = 800, width = 600
let force = d3.forceSimulation()
  .force("link", d3.forceLink().id(function(d,i) { return i; }))
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2));

let color = d3.scaleOrdinal(d3.schemeCategory10)

let svg = d3.select('body').append('svg').attr('height', height)
  .attr('width', width)

let edges = svg.selectAll("line")
  .data(dataset.edges)
  .enter()
  .append("line")
  .style("stroke", "#ccc")
  .style("stroke-width", 1);

let nodes = svg. append('g')
  .attr('class', 'nodes')
  .selectAll("circle")
  .data(dataset.nodes)
  .enter()
  .append("circle")
  .attr("r", 10)
  .style("fill", function(d, i) {
    console.log(d, i, color(i))
    return color(i);
  })
  .call(d3.drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended));


nodes.append("title")
  .text(function(d) { return d.name; });

force
  .nodes(dataset.nodes)
  .on("tick", ticked);

force.force("link")
  .links(dataset.edges);

function ticked() {
  edges
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  nodes
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
}



function dragstarted(d) {
  console.log(d3.event)
  if (!d3.event.active) force.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  console.log(d3.event)
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  console.log(d3.event)
  if (!d3.event.active) force.alphaTarget(0);
  d.fx = d3.event.x;;
  d.fy = d3.event.y;
}
