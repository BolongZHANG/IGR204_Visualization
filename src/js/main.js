let map_width = 1900
let map_height = 1800
let projection = d3.geoAzimuthalEquidistant()
  .translate([map_width/2, map_height/2])
  .scale([700]);

let path = d3.geoPath(projection)

let svg = d3.select('body')
  .append('svg')
  .attr('width', map_width)
  .attr('height', map_height)

console.log('Show info')

d3.json('data/europe.json').then(function (json) {

  console.log(json.features[0])
  svg.selectAll('path')
    .data(json.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('name', (d) => d.properties.name)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'white')
    .attr("transform", "translate(0,300)")


})
