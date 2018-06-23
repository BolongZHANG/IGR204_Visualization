let scaleC

let svg_map = d3.select('#map-container')
let mapContainer = svg_map
  .append('g')
  .attr('id', 'map')

let pieContainer = svg_map
  .append('g')
  .attr('id', 'pies')

let mapData
let sTimeList = []
let pieScale

function getActivity () {
  console.log('Get activities：', document.getElementById('activities').value)

  return document.getElementById('activities').value
}

function getColor (d) {
  if (isNaN(pTime[d.properties.NAME])) { return 'white' } else { return scaleC(pTime[d.properties.NAME]) }
}

function getSTColor (d) {
  let val = 0
  let i = 0
  for (i = 0; i < sTimeList.length; i++) {
    // console.log(sTimeList[i].country, d.properties.NAME, sTimeList[i].total)
    if (sTimeList[i].country !== d.properties.NAME) continue
    val = sTimeList[i].total
    break
  }

  if (isNaN(val) || i === sTimeList.length) {
    return 'white'
  } else {
    return scaleC(val)
  }
}

function getParticipationRateMap (activity) {
  let rateMap = new Map()
  for (let country of countries) {
    rateMap[country] = parseFloat(dataset.get(country).get(activity).participationRate)
  }
  return rateMap
}

function getParticipationTimeMap (activity) {
  console.log('getParticipationTimeMap(): activity:', activity)
  let pTimeMap = new Map()
  for (let country of countries) {
    let str = String(dataset.get(country).get(activity).participationTime)
    let splittedStr = str.split(':')
    let hh = parseInt(splittedStr[0]),
      mm = parseInt(splittedStr[1])
    pTimeMap[country] = hh + mm / 60.0
  }
  return pTimeMap
}

/**
 * This function will process the data for the spent time map.
 **/
function getSpentTimeList (activities) {
  if (!isArray(activities)) {
    console.log('getsTimeListMap(): Expected Array, but get ', activities)
    return false
  }

  console.log('getSpentTimeList(): Get activities list:', activities)

  for (let country_info of sTimeList) {
    country_info.total = 0.0
    country_info.values = []

    for (let activity of activities) {
      console.log(country_info.country)
      let str = String(dataset.get(country_info.country).get(activity).timeSpent)

      let splittedStr = str.split(':')
      let hh = parseInt(splittedStr[0])
      let mm = parseInt(splittedStr[1])
      let aTime = hh + mm / 60.0
      aTime = isNaN(aTime) ? 0 : aTime
      country_info.values.push(
        { 'activity': activity,
          'value': aTime
        }
      )

      country_info.total += aTime
    }
  }

  console.log('getsTimeListMap(): Get activities List:', sTimeList)
  return true
}

function loadMap (dataset, activity) {
  console.log('Start to load map to :', svg_map)
  d3.json('data/europe.json', function (error, map_json) {
    mapData = map_json
    initSpList()
    createPieMap(get_checked_activities())
  })
}

function initSpList () {
  for (let countryFeature of mapData.features) {
    // console.log(countries.includes(countryFeature.properties.NAME))
    if (countries.includes(countryFeature.properties.NAME)) {
      let countryInfo = {
        'country': countryFeature.properties.NAME,
        'feature': countryFeature,
        'total': 0.0,
        'values': []
      }
      sTimeList.push(countryInfo)
    }
  }
}

// put all logic in a nice reusable function
function createPieMap (activities) {
//   activities = ['Personal care', 'Other and/or unspecified personal care']
  getSpentTimeList(activities)
  updatePieMapScale(activities)
  // use viewBox attributes instead of width + height

  let width = $('#map-container').width()
  let height = $('#map-container').height()

  console.log('Create map:' + activity, 'width', width, 'height', height)

  const projection = d3.geoMercator()
  // d3's 'fitSize' magically sizes and positions the map for you
    .fitSize([width, height], mapData)

  // this is the function that generates position data from the projection
  const path = d3.geoPath()
    .projection(projection)

  // append country outlines
  let countries_enter = mapContainer.selectAll('.country')
    .data(mapData.features, d => d.properties.NAME)
    .enter()
    .append('g')
    .attr('class', 'country')

  countries_enter.append('path')
    .attr('class', 'country_path')
    .attr('d', path)
    .attr('name', (d) => d.properties.NAME)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', d => getSTColor(d))

  //   countries_enter.append('title')
  //     .text((d) => pRateTips(d))

  mapContainer.selectAll('.country_path')
    .data(mapData.features, d => d.properties.NAME)
    .transition()
    .duration(1000)
    .attr('fill', d => getSTColor(d))

  //   countries_enter.append('title')
  //     .text((d) => pRateTips(d))

  mapContainer.selectAll('.country')
    .data(mapData.features, d => d.properties.NAME)
    .transition()
    .duration(1000)
    .attr('fill', d => getSTColor(d))

    /** ************** Draw pie   ************************/
  let pie = d3.pie()
    .value(d => {
      console.log('pie_layout', d)
      return d.value
    })

  let outerRadius = 50

  // Easy colors accessible via a 10-step ordinal scale

  var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(d => d.data.radius)

  let points = pieContainer.selectAll('.pie')
    .data(sTimeList, d => d.country)
    .enter()
    .append('g')
    .attr('class', 'pie')
    .attr('transform', (d) => {
      const centroid = path.centroid(d.feature)
      return `translate(${centroid[0]}, ${centroid[1]})`
    })

  let pies = points.selectAll('.pie')
    .data(d => {
      console.log('pies', d)
      return pie(d.values)
    }).enter()
    .append('g')
    .attr('class', 'arc')

  pies.append('path')
    .attr('d', arc)
    .attr('fill', function (d, i) {
      console.log('pie_color', d, d.data.activity, pieScale(d.data.activity))
      return pieScale(d.data.activity)
    })

  points = pieContainer.selectAll('.pie')
    .data(sTimeList, d => d.country)
    .attr('transform', (d) => {
      const centroid = path.centroid(d.feature)
      return `translate(${centroid[0]}, ${centroid[1]})`
    })

  pies = points.selectAll('.pie')
    .data(d => {
      let bounds = path.bounds(d.feature)
      let max1 = Math.min(Math.abs(bounds[0][0] - bounds[1][0]), Math.abs(bounds[0][1] - bounds[1][1]))
      let radius = Math.sqrt(path.area(d.feature))
      console.log('projection', radius, max1, path.area(d.feature), d.feature.properties.NAME)
      d.values.map(d => {
        d.radius = 0.618 * radius / 2
        return d
      })

      return pie(d.values)
    }).enter()
    .append('g')
    .attr('class', 'arc')

  pies.append('path')
    .attr('d', d => {
      return arc(d)
    })
    .attr('fill', function (d, i) {
      return pieScale(d.data.activity)
    })
}

//   // append labels
//   pieContainer
//     .selectAll('.pie')
//     .data(mapData.features, d =>  d.properties.NAME)
//     .enter()
//     .append('circle')
//     .attr('name', d=>{
//       console.log(d.properties.NAME)
//       return d.properties.NAME
//     })
//     .attr("r", 5)
//     .attr('class', 'pie')
//     .attr('fill', 'yellow')
//     .attr('transform', (d)=> {
//       const centroid = path.centroid(d)
//       return `translate(${centroid[0]}, ${centroid[1]})`
//     })
// }

function updateMapScale (activity) {
  pTime = getParticipationTimeMap(activity)
  pRate = getParticipationRateMap(activity)

  console.log('updateMapScale()', 'Activity', activity, 'pTime', pTime)

  let pTimeList = Object.keys(pTime).map(function (key) { return pTime[key] })
  pTimeList.filter(Boolean)

  let minPTime = d3.min(pTimeList)
  let maxPTime = d3.max(pTimeList)

  console.log('updateScale():', 'Get new range:[', minPTime, maxPTime, ']')

  scaleC = d3.scaleThreshold()
    .domain(d3.range(9).map(function (d) { return minPTime + d * (maxPTime - minPTime) / 8 }))
    .range(colorbrewer['Blues'][9])
}

function updatePieMapScale (activities) {
  getSpentTimeList(activities)
  let minSTime = d3.min(sTimeList, d => d.total)
  let maxSTime = d3.max(sTimeList, d => d.total)

  console.log('updateScale():', 'Get new range:[', minSTime, maxSTime, ']')

  pieScale = d3.scaleOrdinal('schemeCategory20')
    .domain(activities)
    .range(d3.schemeCategory20)

  scaleC = d3.scaleThreshold()
    .domain(d3.range(9).map(function (d) {
      return minSTime + d * (maxSTime - minSTime) / 8
    }))
    .range(colorbrewer['YlGn'][9])
}

function pRateTips (d) {
  let country = d.properties.NAME
  if (country in pRate) {
    return d.properties.NASME + '\nParticipate Rate:\n' + pRate[country] + '%'
  } else {
    return d.properties.NAME + '\nParticipate Rate:' + 0
  }
  //
}

function updatePie (activites) {
  const projection = d3.geoMercator()
    // d3's 'fitSize' magically sizes and positions the map for you
    .fitSize([width, height], mapData)

  // this is the function that generates position data from the projection
  const path = d3.geoPath()
    .projection(projection)

//   pieContainer.selectAll('.pie_path')
//     .data(pie(sTimeList['Belgium']), d => {
//       console.log(d.data.values.activitiy)
//       return d.data.activitiy
//     })
//     .exit()
//     .transition()
//     .duration(2000)
//     .attr('fill', function (d, i) {
//       return color(i)
//     })
//     .attrTween('d', arcTween)
//     .remove()

//   arcs.append('path')

//     })
//     .attr('d', arc)
//     .attr('class', 'pie_path')

//   pieContainer.selectAll('.pie_path')
//     .data(pie(sTimeList['Belgium']), d => {
//       console.log(d.data.values.activitiy)
//       return d.data.values.activitiy
//     })
//     .transition()
//     .duration(2000)
//     .attr('fill', function (d, i) {
//       return color(i)
//     })
//     .attrTween('d', arcTween)
}

function createTimeSpentMap (activites) {
  getSpentTimeList(activities)
  updatePieMapScale(activites)

  let pie = d3.pie()
    .value(d => d.values.value)

  let outerRadius = 50
  // Easy colors accessible via a 10-step ordinal scale
  var color = d3.scaleOrdinal(d3.schemeCategory10)

  var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(d => d.data.radius)

  console.log(pie(sTimeList['Greece']))

  let pie_set = pieContainer.selectAll('.pie')
    .data(sTimeList, d => d.country)
    .enter()
    .append('g')
    .attr('class', 'pie')

  let arcs = pieContainer.selectAll('.arc')
    .data(pie(sTimeList['Belgium']), d => d.data.values.activitiy)
    .enter()
    .append('g')
    .attr('class', 'arc')
    .attr('transform', 'translate(' + outerRadius + ', ' + outerRadius +
        ')')

  arcs.append('path')
    .attr('fill', function (d, i) {
      return color(i)
    })
    .attr('d', arc)
    .attr('class', 'pie_path')

  pieContainer.selectAll('.pie_path')
    .data(pie(sTimeList['Belgium']), d => {
      console.log(d.data.values.activitiy)
      return d.data.values.activitiy
    })
    .transition()
    .duration(2000)
    .attr('fill', function (d, i) {
      return color(i)
    })
    .attrTween('d', arcTween)
}

function arcTween (a) {
  let arc = d3.arc()
    .innerRadius(25)
    .outerRadius(50)
  var i = d3.interpolate(this._current, a)
  this._current = i(0)
  return function (t) {
    return arc(i(t))
  }
}

function isArray (value) {
  return value && typeof value === 'object' && value.constructor === Array
}
