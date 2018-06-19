var countries = [];
var activities = [];
var dataset = new Map();

let activity

//exemple d'accès au dataset : dataset.get("Belgium").get("Sleep").participationTime ; dataset.get("Belgium").get("Sleep").participationRate ; dataset.get("Belgium").get("Sleep").timeSpent
let activity_selector = d3.select('body')
  .append('select')
  .attr('id', 'activities')
  .attr('onchange', 'changeAction')

d3.csv("data/label.csv")
  .then(label => {
  for (var i = 13; i < 34; i++) {
    countries.push(label[i]["DATASET: Time spent, participation time and participation rate in the main activity by sex and day of the week [tus_00week]"]);
  };
  for (var i = 46; i < 101; i++) {
    activities.push(label[i]["DATASET: Time spent, participation time and participation rate in the main activity by sex and day of the week [tus_00week]"]);
  };

  for (var i = 0; i < countries.length; i++) {
    var map = new Map();
    for (var j = 0; j < activities.length; j++) {
      var objet = { participationTime: 0, participationRate: 0, timeSpent: 0 };
      map.set(activities[j], objet);
    }
    dataset.set(countries[i], map);
  }


    d3.csv("data/TimeUseData.csv")
      .then(data => {
      for (var i = 0; i < data.length; i++) {
        var l = data[i]
        if ((l.DAYSWEEK === "All days of the week") && (l.SEX === "Total")) {
          if (l.UNIT === "Time spent (hh:mm)") {
            dataset.get(l.GEO).get(l.ACL00).timeSpent = l.Value;
          }
          if (l.UNIT === "Participation time (hh:mm)") {
            dataset.get(l.GEO).get(l.ACL00).participationTime = l.Value;
          }

          if (l.UNIT === "Participation rate (%)") {
            dataset.get(l.GEO).get(l.ACL00).participationRate = l.Value;
          }
        }
      }
        setSelector()
        loadMap(activity)

    });


});



function changeAction(){
  activity = document.getElementById("activities").value;
  updateMap(activity)
}



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
  activity = document.getElementById("activities").value;
}

let carteWidth = 800
let carteHeight = 900
let pTime

let scaleC

// Get Participation Rate for the specified activity
function getParticipationRateMap(activity) {
  let rateMap = new Map()
  for (let country of countries){
    rateMap[country] = parseFloat(dataset.get(country).get(activity).participationRate)
  }
  return rateMap
}

// Get the Participation Time map for the specified activity
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

let map_json
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


console.log('Show info')

function updateMapScale(activity) {
  pTime = getParticipationTimeMap(activity)
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
    .domain(d3.range(9).map(function(d) { return d / (maxPTime - minPTime) ; }))
    .range(d3.schemeBlues[9])
}

function getColor(d){
  if( isNaN(pTime[d.properties.NAME]))
    return "white"
  else
    return scaleC(pTime[d.properties.NAME])
}

function loadMap(activity){
  console.log('drawMap:Activity', activity)
  d3.json('data/europe.json').then(function (json) {
    map_json = json
    console.log("Loading map data:", json.features)
    updateMap(activity)
  })

  updateMapScale(activity)
}


function updateMap() {
  let countryEnter = map_content.selectAll('g')
    .data(map_json.features, d => {
      return d.properties.NAME
    })
    .enter()

  countryEnter.append('path')
    .attr('d', path)
    .attr('name', (d) => d.properties.NAME)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', d => getColor(d))
    .attr("transform", "translate(0,300)")

  map.selectAll('path')
    .data(json.features, d => d.properties.NAME)
    .transition()
    .duration(1000)
    .attr('fill', d => getColor(d))
    .attr("transform", "translate(0,300)")

  map_legend.selectAll("rect")
    .data(scaleC.range().map(function(d) {
      console.log("Legend:", d)
      d = scaleC.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

}
