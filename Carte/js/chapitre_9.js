let dataset = []
let minX, maxX
let width = 800
let height = 600
let padding = 1
let xPadding = 1
let yPadding = 1
let scaleX, scaleC, scaleH
let n = 20
let index = 0


let svg = d3
  .select('body')
  .append('svg')
  .attr('width', width + 2 * xPadding)
  .attr('height', height + 2 * yPadding)



genData()
updateScale()
addView()
updateView()



function addView(){
  console.log('addView()')
  let new_bar = svg.selectAll('g').data(dataset, d=>d.key)
    .enter()
    .append('g')

  new_bar.append('rect')
    .attr('x', width)
    .attr('height', (d)=>scaleH(d.value))
    .attr('width', scaleX.bandwidth())
    .attr('height', (d) => scaleH(d.value))
    .attr('transform', d => 'translate(0,' + (height - scaleH(d.value)) + ')')
    .attr('fill', d => 'rgb(0,0, ' + scaleC(d.value) + ')')
    .attr('tag', 'add')
    .attr('class', 'bar')



  new_bar.append('text')
    .attr('x', width)
    // .attr('y', d => height - scaleH(d.value) + 16)
    .attr('font-size', '12')
    .attr('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('tag', 'add Text')
    .style('pointer-events', 'none')
    .text(d => d.value)



 new_bar.append('rect')
    .attr('x', (d, i) => scaleX(i))
    .attr('height', height)
    .attr('fill', 'transparent')
   .attr('width', scaleX.bandwidth())
   .attr('id', 'mask')
   .on('click', (d) => {
     index = dataset.indexOf(d)
     dataset.splice(index,1)
     console.log('remove:', d, index)
     updateScale()
     removeView()
     updateView()
   })
   .on('mouseover', function(d){
     d3.select(this.parentNode).select('.bar')
       .transition()
       .attr('fill', 'orange')
   }).on("mouseout", function(d){
   d3.select(this.parentNode).select('.bar')
     .transition()
     .attr('fill','rgb(0,0, ' + scaleC(d.value) + ')' )
 })
   .append('title').text(d=> d.value)




}

function addData() {
  var new_data = Math.ceil(Math.random() * 25)
  n_index = dataset[dataset.length - 1].key
  dataset.push({'key':n_index + 1, 'value':new_data})
  console.log("addData:" + new_data, " Data size:" + dataset.length)
}

function updateScale() {
  minX = d3.min(dataset, d => d.value)
  maxX = d3.max(dataset, d => d.value)
  console.log("updateScale():","Get new range:[", minX, maxX, "]")

  scaleX = d3.scaleBand()
    .domain(d3.range(dataset.length))
    .rangeRound([0, width])
    .paddingInner(0.05)

  scaleH = d3.scaleLinear()
    .domain([0, maxX])
    .range([0, height])

  scaleC = d3.scaleLinear()
    .domain([maxX, minX])
    .range([50, 200])
}

function genData() {
  for (let i = 0; i < 15; i++) {
    dataset.push({'key': i, 'value': Math.ceil(Math.random() * 25)})
  }
  console.log('genData:', 'Data size:' + n)
}

function refreshData(){
  console.log('before', dataset)
    for(let i = 0; i < dataset.length; i++){
      dataset[i].value = Math.ceil(Math.random() * 25)
    }
  console.log('After', dataset)
}

/** 被选择的元素必须出现在 script代码出入的地方之前， 否则d3会找不到该元素 **/
d3.select('#update').on('click', function () {
  refreshData()
  updateScale()
  updateView()
})

function updateView() {
  console.log('updateView()')
  //update view
  svg.selectAll('rect')
    .data(dataset, d => d.key)
    .transition()
    .duration(1000)
    .delay((d,i) => i*10)
    .ease(d3.easeBounce)
    .attr('width', scaleX.bandwidth())
    .attr('x', (d, i) => scaleX(i))
    .attr('height', (d) => scaleH(d.value))
    .attr('transform', d => 'translate(0,' + (height - scaleH(d.value)) + ')')
    .attr('fill', d => 'rgb(50,10, ' + scaleC(d.value) + ')')

    svg.selectAll('text')
      .data(dataset, d=> d.key)
    .transition()
    .duration(1000)
    .delay((d, i) => i * 10)
    .ease(d3.easeBounce)
    .attr('x', (d, i) => scaleX(i) + scaleX.bandwidth() / 2)
    .attr('y', d => height - scaleH(d.value) + 16)
    .attr('font-size', '12')
    .attr('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
    .attr('fill', 'red')
    .text(d => d.value)

}

function removeView(){
  remove_bar = svg.selectAll('g').data(dataset, d=>d.key).exit()
  remove_bar.selectAll('rect')
    .transition()
    .duration(500)
    .attr('x', -scaleX.bandwidth())
    .remove()


  remove_bar.selectAll('text')
    .transition()
    .duration(500)
    .attr('x', -scaleX.bandwidth())
    .remove()

  remove_bar.transition()
    .duration(500)
    .remove()
}

d3.select('#add').on('click', function () {
  addData()
  updateScale()
  addView()
  updateView()

})

d3.select('#delete').on('click', function () {
  console.log(dataset)
  dataset.shift()
  console.log(dataset)
  updateScale()
  removeView()
  updateView()
})




