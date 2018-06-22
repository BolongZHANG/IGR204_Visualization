let scaleC

let svg_map = d3.select('#map-container')
let mapContainer = svg_map
  .append('g')
  .attr('id', "map")

let pieContainer = svg_map
  .append("g")
  .attr("id", "pies")

let mapData
let userData


let activities_list = ["Personal care", "Other and/or unspecified personal care"]

function changeAction(){
  createMap(mapData, userData)
}

function getActivity(){
  console.log("Get activities：",document.getElementById("activities").value)

  return document.getElementById("activities").value
}

function getColor(d){
  if( isNaN(pTime[d.properties.NAME]))
    return "white"
  else
    return scaleC(pTime[d.properties.NAME])
}


function getParticipationRateMap(activity) {
  let rateMap = new Map()
  for (let country of countries){
    rateMap[country] = parseFloat(userData.get(country).get(activity).participationRate)
  }
  return rateMap
}


function getParticipationTimeMap(activity) {
  console.log("getParticipationTimeMap(): activity:", activity)
  let pTimeMap = new Map()
  for (let country of countries){
    let str = String(userData.get(country).get(activity).participationTime)
    let splittedStr = str.split(':')
    let hh = parseInt(splittedStr[0]),
      mm = parseInt(splittedStr[1]);
    pTimeMap[country] = hh + mm/60.0
  }
  return pTimeMap
}

// Get Participation Rate for the specified activity
function getSpentTimeMap(activity) {
  let sTimeMap = new Map()
  for (let country of countries){
    let str = String(userData.get(country).get(activity).timeSpent);
    let splittedStr = str.split(':');
    let hh = parseInt(splittedStr[0]), mm = parseInt(splittedStr[1]);
    sTimeMap[country] = hh + mm/60.0;
  }
  return sTimeMap
}


// load the data, find the svg container in the dom,
// and call createMap
function setSelector(activities){
  let activity_selector = d3.select('body')
    .append('select')
    .attr('id', 'activities')
    .attr('onchange', 'changeAction')

  console.log("Set selector:" + activities)
  document.getElementById("activities").onchange = function() {changeAction()}
  activity_selector.selectAll('option')
    .data(activities)
    .enter()
    .append('option')
    .attr('value', d=>d)
    .text(d => d)
    .on('click', function(){
      console.log("selector",this)
    } )
}

function loadMap(userData){
  console.log("Start to load map to :", svg_map)
  d3.json('data/europe.json', function(error, mapData){
    createMap(mapData, userData)
  })
}

// put all logic in a nice reusable function
function createMap(_mapData, _userData){
  mapData = _mapData
  userData = _userData

  let activity = getActivity()
  updateMapScale(activity)
  // use viewBox attributes instead of width + height
  const params = svg_map.attr('viewBox').split(' ').map((n) => parseInt(n, 10))
  const width = params[2]
  const height = params[3]
  console.log("Create map:", "width", width, "height", height)

  const projection = d3.geoMercator()
  // d3's 'fitSize' magically sizes and positions the map for you
    .fitSize([width, height], mapData);

  // this is the function that generates position data from the projection
  const path = d3.geoPath()
    .projection(projection);

  // append country outlines
  let countries_enter = mapContainer.selectAll('.country')
    .data(mapData.features, d =>  d.properties.NAME)
    .enter()
    .append('g')
    .attr("class", 'country')

    countries_enter.append('path')
      .attr('class', 'country_path')
      .attr('d', path)
      .attr('name', (d) => d.properties.NAME)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('fill', d => getColor(d))

  countries_enter.append('title')
    .text((d) => pRateTips(d))



  mapContainer.selectAll('.country_path')
    .data(mapData.features, d => d.properties.NAME)
    .transition()
    .duration(1000)
    .attr('fill', d => getColor(d))



  countries_enter.append('title')
    .text((d) => pRateTips(d))


  mapContainer.selectAll('.country')
    .data(mapData.features, d => d.properties.NAME)
    .transition()
    .duration(1000)
    .attr('fill', d => getColor(d))

  updatePies()

}


function updatePies(activiesList){

  let arc = d3.svg
    .arc()
    .







  // append labels
  pieContainer
    .selectAll('.pie')
    .data(mapData.features, d =>  d.properties.NAME)
    .enter()
    .append('circle')
    .attr('name', d=>{
      console.log(d.properties.NAME)
      return d.properties.NAME
    })
    .attr("r", 5)
    .attr('class', 'pie')
    .attr('fill', 'yellow')
    .attr('transform', (d)=> {
      const centroid = path.centroid(d)
      return `translate(${centroid[0]}, ${centroid[1]})`
    })
}



function updateMapScale(activity) {
  pTime = getParticipationTimeMap(activity)
  pRate = getParticipationRateMap(activity)

  console.log('updateMapScale()', 'Activity', activity,'pTime', pTime)

  let pTimeList = Object.keys( pTime ).map(function ( key ) { return pTime[key]});
  pTimeList.filter(Boolean)


  let minPTime = d3.min(pTimeList)
  let maxPTime = d3.max(pTimeList)
  // let minpRate = d3.min(pRate)
  // let maxpRate = d3.min(pRate)

  console.log("updateScale():","Get new range:[", minPTime, maxPTime, "]")

  // scaleX = d3.scaleBand()
  //   .domain(d3.range(userData.length))
  //   .rangeRound([0, width])
  //   .paddingInner(0.05)
  //
  // scaleH = d3.scaleLinear()
  //   .domain([0, maxX])
  //   .range([0, carteHeight])

  scaleC = d3.scaleThreshold()
    .domain(d3.range(9).map(function(d) { return minPTime + d*(maxPTime - minPTime) / 8 ; }))
    .range(colorbrewer["Blues"][9])
}

function pRateTips(d){
  let country = d.properties.NAME
  console.log(country)
  if(country in pRate){
    return d.properties.NAME + "\nParticipate Rate:\n" + pRate[country] + "%"
  }else{
    return d.properties.NAME + "\nParticipate Rate:" + 0
  }
  //
}


function updatePies(activiesList){
  traitPieData(activiesList)
}

