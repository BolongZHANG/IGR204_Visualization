dataset = [1,7,2,3,5,5,6,9,8,9]
let h = 866
let w = 600
let pie = d3.pie()

let outerRadius = w / 2
let innerRadius = w / 3

let arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)
let color = d3.scaleOrdinal(d3.schemeCategory10)

let svg = d3.select('body').append('svg').attr('width', w).attr('height', h)



let arcs = svg.selectAll('g.arc')
  .data(pie(dataset))
  .enter()
  .append('g')
  .attr('class', 'arc')
  .attr('transform',  'translate(' + outerRadius + ',' + outerRadius + ')')


arcs.append('path').attr('fill', (d,i) => color(i)).attr('d', arc)
arcs.append('text').attr('text-anchor', 'middle').text( d=> d.value)
  .attr('transform', d => 'translate(' + arc.centroid(d) + ')' )
  .attr('class', 'label')
console.log( pie(dataset))

d3.select('#add').on('click', ()=> {
  dataset.push(6)
  let arcs = svg.selectAll('g.arc')
    .data(pie(dataset))
    .enter()
    .append('g')
    .attr('class', 'arc')
    .attr('transform',  'translate(' + outerRadius + ',' + outerRadius + ')')

  arcs.append('path').attr('fill', (d,i) => color(i))
    .attr('fill', (d,i) => color(i))

  d3.selectAll('path').data( pie(dataset)).transition().attr('d', arc)

})
