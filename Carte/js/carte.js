let projection = d3.geoAzimuthalEquidistant()
  .translate([800/2, 600/2])
  .scale([500]);

let path = d3.geoPath(projection)

let svg = d3.select('body')
  .append('svg')
  .attr('width', 800)
  .attr('height', 600)

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
