let indicateur = "time spent"


let activity_selector = d3.select('body')
  .append('select')
  .attr('id', 'activities')
  .attr('onchange', 'changeAction')

function setSelector(){
  document.getElementById("activities").onchange = function() {changeAction()};
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

let carte_width = 800
let carte_height = 900

let projection = d3.geoAzimuthalEquidistant()
    .translate([800/2, 600/2])
    .scale([500]);

let path = d3.geoPath(projection)

let svg_map = d3.select('body')
    .append('svg')
    .attr('width', 800)
    .attr('height', 600)
    .attr('id', 'map')


let map_legend = svg_map.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(0,40)");

let map_content= svg_map.append("g")
    .attr("id", "map")

let pTime
let pRate

let scaleC

function changeAction(){
      activity = document.getElementById("activities").value;
      updateMap(activity)
}

function getActivity(){
    return document.getElementById("activities").value;
}

function getParticipationRateMap(activity) {
    let rateMap = new Map()
    for (let country of countries){
      rateMap[country] = parseFloat(dataset.get(country).get(activity).participationRate)
    }
    return rateMap
}


function getParticipationTimeMap(activity) {
    console.log("getParticipationTimeMap(): activity:", activity)
    let pTimeMap = new Map()
    for (let country of countries){
      let str = String(dataset.get(country).get(activity).participationTime)
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
      let str = String(dataset.get(country).get(activity).timeSpent);
      let splittedStr = str.split(':');
      let hh = parseInt(splittedStr[0]), mm = parseInt(splittedStr[1]);
      sTimeMap[country] = hh + mm/60.0;
    }
    return sTimeMap
  }


  console.log('Show info')

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
    //   .domain(d3.range(dataset.length))
    //   .rangeRound([0, width])
    //   .paddingInner(0.05)
    //
    // scaleH = d3.scaleLinear()
    //   .domain([0, maxX])
    //   .range([0, carteHeight])

    scaleC = d3.scaleThreshold()
      .domain(d3.range(9).map(function(d) { return minPTime + d*(maxPTime - minPTime) / 8 ; }))
      .range(d3.schemeBlues[9])
  }

  function getColor(d){
    if( isNaN(pTime[d.properties.NAME]))
      return "white"
    else
      return scaleC(pTime[d.properties.NAME])
  }

  function updateMap(activity) {
    updateMapScale(activity)
    let countryEnter = map_content.selectAll('g')
      .data(map_json.features, d => {
        return d.properties.NAME
      })
      .enter()
      .append('g')

    countryEnter.append('path')
      .attr('d', path)
      .attr('name', (d) => d.properties.NAME)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('fill', d => getColor(d))
      .attr("transform", "translate(0,300)")

    countryEnter.append('title')
      .text((d) => pRateTips(d))

    map_content.selectAll('path')
      .data(map_json.features, d => d.properties.NAME)
      .transition()
      .duration(1000)
      .attr('fill', d => getColor(d))
      .attr("transform", "translate(0,300)")

    map_content.selectAll('title')
      .text((d) => pRateTips(d))
    // map_legend.selectAll("rect")
    //   .data(scaleC.range().map(function(d) {
    //     console.log("Legend:", d)
    //     d = scaleC.invertExtent(d);
    //     if (d[0] == null) d[0] = x.domain()[0];
    //     if (d[1] == null) d[1] = x.domain()[1];
    //     return d;
    //   }))
    //   .enter().append("rect")
    //   .attr("height", 8)
    //   .attr("x", function(d) { return x(d[0]); })
    //   .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    //   .attr("fill", function(d) { return color(d[0]); });

  }

    function loadMap() {
    let activity = getActivity()
    console.log('drawMap:Activity', activity)
    d3.json('data/europe.json').then(function (json) {
      map_json = json
      console.log("Loading map data:", json.features)
      updateMap(activity)
    })
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




