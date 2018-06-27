let resizeTime = 500
let colorTime = 1000
let scaleC

let svgMap = d3.select('#map-container')
let mapContainer = svgMap.append('g').attr('id', 'map')
let pieContainer = svgMap.append('g').attr('id', 'pies')
let legendCOntainer = svgMap.append('g').attr('id', 'legend')

let mapData
let sTimeList = []
let pieScale
let path


/*** Setting for pie***/
let pie = d3.pie().value(d => {
    return d.value
})

let arc = d3
    .arc()
    .innerRadius(0)
    .outerRadius(d => d.data.radius)


function getActivity () {
  console.log('Get activities：', document.getElementById('activities').value)

  return document.getElementById('activities').value
}

function getColor (d) {
  if (isNaN(pTime[d.properties.NAME])) {
    return '#BDBDBD'
  } else {
    return scaleC(pTime[d.properties.NAME])
  }
}

function getSTColor (d) {
  let val = 0
  let i = 0
  for (i = 0; i < sTimeList.length; i++) {
    // console.log(sTimeList[i].country, d.properties.NAME, sTimeList[i].total)
    if (sTimeList[i].country !== d) continue
    val = sTimeList[i].total
    break
  }

  if (isNaN(val) || i === sTimeList.length) {
    return '#BDBDBD'
  } else {
    return scaleC(val)
  }
}

function getParticipationRateMap (activity) {
  let rateMap = new Map()
  for (let country of countries) {
    rateMap[country] = parseFloat(
      dataset.get(country).get(activity).participationRate
    )
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

    pTimeMap[country] = hh * 60.0 + mm
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
      let str = String(
        dataset.get(country_info.country).get(activity).timeSpent
      )

      let splittedStr = str.split(':')
      let hh = parseInt(splittedStr[0])
      let mm = parseInt(splittedStr[1])
      let aTime = hh * 60 + mm
      aTime = isNaN(aTime) ? 0 : aTime
      country_info.values.push({
        activity: activity,
        value: aTime
      })

      country_info.total += aTime
    }
  }

  console.log('getsTimeListMap(): Get activities List:', sTimeList)
  return true
}

function loadMap (dataset, mode) {
  console.log('Start to load map to :', svgMap)
  d3.json('data/europe.json', function (error, map_json) {
    mapData = map_json
    initSpList()
    if (mode == 'ts') { createPieMap(get_checked_activities()) } else { createPTMap(last_activity_pt) }
  })
}

function initSpList () {
  for (let countryFeature of mapData.features) {
    // console.log(countries.includes(countryFeature.properties.NAME))
    if (countries.includes(countryFeature.properties.NAME)) {
      let countryInfo = {
        country: countryFeature.properties.NAME,
        feature: countryFeature,
        total: 0.0,
        values: []
      }
      sTimeList.push(countryInfo)
    }
  }
}

// put all logic in a nice reusable function
function createPieMap (activities) {
    if (mapData == null){
        console.log("Can not get data map!")
        return false
    }

  //   activities = ['Personal care', 'Other and/or unspecified personal care']
  let width = $('#page_content').width()
  let height = $('#page_content').height()
  svgMap = d3.select('#map-container').attr('width', width).attr('height', height)

  getSpentTimeList(activities)
  updatePieMapScale(activities)
  updateLegend()
  // use viewBox attributes instead of width + height

  console.log('Map size', width, height)

  let projection = d3
    .geoMercator()
     .fitSize([width, height], mapData)

  // this is the function that generates position data from the projection
  path = d3.geoPath().projection(projection)

  // append country outlines
  let countries_enter = mapContainer
    .selectAll('.country')
    .data(mapData.features, d => d.properties.NAME)
    .enter()
    .append('g')
    .attr('class', 'country')

  countries_enter
    .append('path')
    .attr('class', 'country_path')
    .attr('d', path)
    .attr('country', d => d.properties.NAME.replace(" ", "_"))
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', d => getSTColor(d.properties.NAME))

  countries_enter
    .append('title')
    .attr('class', 'country_title')
    .text((d) => d.properties.NAME)

  mapContainer
    .selectAll('.country_path')
    .data(mapData.features, d => d.properties.NAME)
      .on("mouseover", function(d,i){
          d3.selectAll("[country=" + d.properties.NAME.replace(/\s/g,"_") +"]").attr('fill', 'orange')
      })
      .on("mouseout", function(d,i){
          d3.selectAll("path[country=" + d.properties.NAME.replace(/\s/g,"_") +"]")
          // .select("path")
              .attr('fill', d => getSTColor(d.properties.NAME))

          d3.selectAll("rect[country=" + d.properties.NAME.replace(/\s/g,"_") +"]")
          // .select("path")
              .attr('fill', 'blue')
      })
    .transition()
    .duration(500)
    .attr('fill', d => getSTColor(d.properties.NAME))


  mapContainer
    .selectAll('.country_title')
    .data(mapData.features, d => d.properties.NAME)
    .text(d => d.properties.NAME)


  mapContainer
    .selectAll('.country')
    .data(mapData.features, d => d.properties.NAME)
    .transition()
    .duration(1000)
    .attr('fill', d => getSTColor(d.properties.NAME))

  /** ************** Draw pie   ************************/

  let points = pieContainer
    .selectAll('.pie')
    .data(sTimeList, d => d.country)
    .enter()
    .append('g')
    .attr('class', 'pie')
    .attr('country', d => d.country.replace(" ", "_"))
    .attr('transform', d => {
      const centroid = path.centroid(d.feature)
      return `translate(${centroid[0]}, ${centroid[1]})`
    })

  points = pieContainer.selectAll('.pie').data(sTimeList, d => d.country)

    points.transition().duration(500).attr('transform', d => {
        const centroid = path.centroid(d.feature)
        return `translate(${centroid[0]}, ${centroid[1]})`
    })


  let allPies = points.selectAll('.arc').data(d => {
    d.values.map(t => {
      t.radius = (0.618 * Math.sqrt(path.area(d.feature))) / 2
      return d
    })
    return pie(d.values)
  }, d => d.data.activity)

  let pieArcs = allPies
    .enter()
    .append('path')
    .attr('class', 'arc')
    .attr('opacity', 1)
    .attr('fill', d => pieScale(d.data.activity))

    pieArcs.transition()
        .duration(500)
        .attrTween('d', d => arcTween(d, arc))

    pieArcs
        .append('title')
        .text(d => {
                return pieTips(d)
            })
allPies
        .attr('fill', function (d, i) {
            return pieScale(d.data.activity)
        })
        .transition()
        .duration(500)
        .attrTween('d', d => arcTween(d, arc))

  allPies.exit().remove()

  let zoom = d3.zoom().scaleExtent([1, 10]).on('zoom', zoomed)

  d3.select('#map-container').call(zoom)
}

function zoomed () {
  d3.select('#map').attr('transform',
    'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ')scale(' + d3.event.transform.k + ')')

  d3.selectAll('path').attr('stroke-width', 1 / d3.event.transform.k)

  d3.select('#pies').attr('transform',
    'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ')scale(' + d3.event.transform.k + ')')
}

function updateLegend () {
  var legend = d3.legendColor()
    .labels(function ({
      i,
      genLength,
      generatedLabels,
      labelDelimiter
    }) {
      if (i === 0) {
        const values = generatedLabels[i].split(` ${labelDelimiter} `)
        return `Less than ${nbToString(values[1])}`
      } else if (i === genLength - 1) {
        const values = generatedLabels[i].split(` ${labelDelimiter} `)
        return `${nbToString(values[0])} or more`
      } else {
        const values = generatedLabels[i].split(` ${labelDelimiter} `)
        return `${nbToString(values[0])} to ${nbToString(values[1])}`
      }
    })
    .scale(scaleC)

  d3.select('#legend')
    .call(legend)
}

function updateMapScale (activity) {
  pTime = getParticipationTimeMap(activity)
  pRate = getParticipationRateMap(activity)

  console.log('updateMapScale()', 'Activity', activity, 'pTime', pTime)

  let pTimeList = Object.keys(pTime).map(function (key) {
    return pTime[key]
  })

  pTimeList.filter(Boolean)
  let minPTime = d3.min(pTimeList)
  let maxPTime = d3.max(pTimeList)

  console.log('updateScale():', 'Get new range:[', minPTime, maxPTime, ']')

  scaleC = d3
    .scaleThreshold()
    .domain(
      d3.range(9).map(function (d) {
        return minPTime + (d * (maxPTime - minPTime)) / 8
      })
    )
    .range(colorbrewer['Blues'][9])
}

function updatePieMapScale (activities) {
  getSpentTimeList(activities)
  let result = sTimeList.filter(t => t.total > 0.0)
  let minSTime = d3.min(result, d => d.total)
  let maxSTime = d3.max(sTimeList, d => d.total)

  console.log('updateScale():', 'Get new range:[', minSTime, maxSTime, ']')

  pieScale = d3
    .scaleOrdinal('schemeCategory20')
    .domain(activities)
    .range(d3.schemeCategory20)

  scaleC = d3
    .scaleThreshold()
    .domain(
      d3.range(9).map(function (d) {
        return minSTime + (d * (maxSTime - minSTime)) / 8
      })
    )
    .range(colorbrewer['PuRd'][9])
}

function pRateTips (d) {
    console.log("pRateTips", d, pTime[d.properties.NAME])
  let country = d.properties.NAME
  if (country in pRate) {
    return d.properties.NASME + '\nParticipate Rate:\n' + pRate[country] + '%'
  } else {
    return d.properties.NAME + '\nParticipate Rate:' + 0
  }
  //
}

// function updatePie (activites) {
//   const projection = d3.geoMercator()
//     // d3's 'fitSize' magically sizes and positions the map for you
//     .fitSize([width, height], mapData)

//   // this is the function that generates position data from the projection
//   const path = d3.geoPath()
//     .projection(projection)

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
// }

// function createTimeSpentMap (activites) {
//   getSpentTimeList(activities)
//   updatePieMapScale(activites)

//   let pie = d3.pie()
//     .value(d => d.values.value)

//   let outerRadius = 50
//   // Easy colors accessible via a 10-step ordinal scale
//   var color = d3.scaleOrdinal(d3.schemeCategory10)

//   var arc = d3.arc()
//     .innerRadius(0)
//     .outerRadius(d => d.data.radius)

//   console.log(pie(sTimeList['Greece']))

//   let pie_set = pieContainer.selectAll('.pie')
//     .data(sTimeList, d => d.country)
//     .enter()
//     .append('g')
//     .attr('class', 'pie')

//   let arcs = pieContainer.selectAll('.arc')
//     .data(pie(sTimeList['Belgium']), d => d.data.values.activitiy)
//     .enter()
//     .append('g')
//     .attr('class', 'arc')
//     .attr('transform', 'translate(' + outerRadius + ', ' + outerRadius +
//         ')')

//   arcs.append('path')
//     .attr('fill', function (d, i) {
//       return color(i)
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
// }

function arcTween (d, arc) {
  d.innerRadius = 0
  var i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
  return function (t) { return arc(i(t)) }
}

function isArray (value) {
  return value && typeof value === 'object' && value.constructor === Array
}

function nbToString (min) {
  return d3.format('02d')(Math.floor(min / 60)) + 'H' + d3.format('02d')(min % 60)
}

// put all logic in a nice reusable function
function createPTMap (activity) {
    let width = $('#page_content').width()
    let height = $('#page_content').height()
    svgMap = d3.select('#map-container').attr('width', width).attr('height', height)

  /** Remove all pie chart***/
  d3.selectAll('.arc')
    .transition()
    .duration(colorTime)
    .attr('opacity', 0)
    .remove()

  updateMapScale(activity)
  // use viewBox attributes instead of width + height

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
    .attr('country', (d) => d.properties.NAME.replace(" ", "_"))
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', d => getColor(d))



  countries_enter.append('title')
    .attr('class', 'country_title')
    .text((d) => pRateTips(d))

  mapContainer.selectAll('.country_path')
    .data(mapData.features, d => d.properties.NAME)
      .on("mouseover", function(d,i){
          d3.selectAll("[country=" + d.properties.NAME.replace(/\s/g,"_") +"]").attr('fill', 'orange')
      })
      .on("mouseout", function(d,i){
          d3.selectAll("path[country=" + d.properties.NAME.replace(/\s/g,"_") +"]")
          // .select("path")
              .attr('fill', d => scaleC(pTime[d.properties.NAME.replace(/\s/g,"_")]))

          d3.selectAll("circle[country=" + d.properties.NAME.replace(/\s/g,"_") +"]")
          // .select("path")
              .attr('fill', 'black')
      }).transition()
    .duration(500)
    .attr('fill', d => getColor(d))

  mapContainer.selectAll('.country_title')
    .data(mapData.features, d => d.properties.NAME)
    .text(d => pRateTips(d))

  mapContainer.selectAll('.country')
    .data(mapData.features, d => d.properties.NAME)
    .transition()
    .duration(1000)
    .attr('fill', d => getColor(d))

  updateLegend()


    let zoom = d3.zoom().scaleExtent([1, 10]).on('zoom', zoomed)

    d3.select('#map-container').call(zoom)
}

function pRateTips(d) {
  let country = d.properties.NAME
  if (country in pRate) {
    return d.properties.NAME + '\nParticipate Rate:' + pRate[country] + '%' + '\nParticipate Time:' + nbToString(pTime[country])
  } else {
    return d.properties.NAME + '\nParticipate Rate:' + 0
  }
  //
}

function pieTips (d) {
  return d.data.activity + '\n' + nbToString(d.value)
}


function resizeCate(){
    let width = $('#page_content').width()
    let height = $('#page_content').height()

    svgMap = d3.select('#map-container').attr('width', width).attr('height', height)

    let projection = d3
        .geoMercator()
        // d3's 'fitSize' magically sizes and positions the map for you
        .fitSize([width, height], mapData)
    // this is the function that generates position data from the projection
    path = d3.geoPath().projection(projection)

    mapContainer
        .selectAll('.country_path')
        .data(mapData.features, d => d.properties.NAME)
        .transition()
        .duration(500)
        .attr('d', path)
}


function resizePieMap(){
    let pie = d3.pie().value(d => {
        return d.value
    })

    var arc = d3
        .arc()
        .innerRadius(0)
        .outerRadius(d => d.data.radius)

    let points = pieContainer
        .selectAll('.pie')
        .data(sTimeList, d => d.country)

        points.transition().duration(resizeTime)
        .attr('transform', d => {
            const centroid = path.centroid(d.feature)
            return `translate(${centroid[0]}, ${centroid[1]})`
        })


   points.selectAll('.arc').data(d => {
        d.values.map(t => {
            t.radius = (0.618 * Math.sqrt(path.area(d.feature))) / 2
            return d
        })
        return pie(d.values)
    }, d => d.data.activity)
        .transition()
        .duration(resizeTime)
        .attr('d', arc)

}