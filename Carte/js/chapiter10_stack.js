let dataset = [
  {apples:5, oranges:10, grapes:22},
  {apples:4, oranges:12, grapes:28},
  {apples:2, oranges:12, grapes:28},
  {apples:7, oranges:12, grapes:28},
  {apples:23, oranges:12, grapes:28}
]

let max = 0

for(let i in dataset){
  let total = Object.values(dataset[i]).reduce( (a,b) => a+b)
  console.log(total, dataset[i])
  max = max < total ? total: max
}

let stack = d3.stack()
  .keys(Object.keys(dataset[0]))
  .order(d3.stackOrderNone)
  .offset(d3.stackOffsetNone);

let width = 800, height = 600


let scaleX = d3.scaleBand().rangeRound([0,width]).domain(d3.range(dataset.length)).paddingInner(0.05)
let scaleY = d3.scaleLinear().rangeRound([height, 0]).domain([0, max])
let color =  d3.scaleOrdinal(d3.schemeCategory10).domain(stack.keys())


let svg = d3.select('body').append('svg').attr('height', height)
  .attr('width', width)

svg.selectAll('g')
  .data(stack(dataset))
  .enter().append('g')
  .attr('fill', d => color(d.key))
  .selectAll('rect')
  .data(d => d)
  .enter()
  .append('rect')
  .attr('x', (d,i) => scaleX(i))
  .attr('y', (d) => scaleY(d[1]))
  .attr('height', d => scaleY(d[0]) - scaleY(d[1]))
  .attr('width', scaleX.bandwidth())

svg.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(scaleX))

svg.append("g")
  .attr("class", "axis")
  .call(d3.axisLeft(scaleY).ticks(null, "s"))
  .append("text")
  .attr("x", 2)
  .attr("y", y(y.ticks().pop()) + 0.5)
  .attr("dy", "0.32em")
  .attr("fill", "#000")
  .attr("font-weight", "bold")
  .attr("text-anchor", "start")
  .text("Population");


