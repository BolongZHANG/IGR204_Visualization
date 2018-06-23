let GRAPHm = 50, LABELSm = 20
let CIRCLESr = 10

let dropdownList = d3.select('#dropdown-list-pt')
let GRAPHsvg
let graphXScale, graphYScale
let GRAPHh = 600, GRAPHw = 600

function createNewGRAPHsvg () {
  GRAPHh = $('#activity-graph-pt').width()
	GRAPHw = GRAPHh
	CIRCLESr = GRAPHh / 60
	GRAPHm = GRAPHh / 12
	LABELSm = GRAPHh / 30
    GRAPHsvg = d3.select('#activity-graph-pt')
    .append('svg')
    .attr('height', GRAPHh)
    .attr('width', GRAPHw)
}

function getParticipationRate (country, activity) {
  return parseFloat(dataset.get(country).get(activity).participationRate)
}

function getParticipationTime (country, activity) {
  let str = String(dataset.get(country).get(activity).participationTime)
    let splittedStr = str.split(':')
    let hh = parseInt(splittedStr[0]), mm = parseInt(splittedStr[1])
    return hh + mm / 60.0
}

function clearGraph () {
  GRAPHsvg.remove()
    createNewGRAPHsvg()
}

function plotGraphActivity (activity) {
  clearGraph()

    let pRates = [], pTimes = [], participants = []
    for (country of countries) {
    const pRate = getParticipationRate(country, activity)
        if ((pRate != 0) && !isNaN(pRate)) {
      pRates.push(pRate)
            const pTime = getParticipationTime(country, activity)
            pTimes.push(pTime)
            participants.push(country)
        }
  }
  graphXScale = d3.scaleLinear()
    .domain(d3.extent(pRates))
    .range([GRAPHm, GRAPHw - GRAPHm])
    graphYScale = d3.scaleLinear()
    .domain(d3.extent(pTimes))
    .range([GRAPHh - GRAPHm, GRAPHm])
    GRAPHsvg.selectAll('circle')
    .data(participants)
    .enter()
    .append('circle')
    .attr('id', (p) => p)
    .attr('r', CIRCLESr)
    .attr('cx', (p) => graphXScale(getParticipationRate(p, activity)))
    .attr('cy', (p) => graphYScale(getParticipationTime(p, activity)))
    GRAPHsvg.selectAll('text')
    .data(participants)
    .enter()
    .append('text')
    .text((p) => p)
    .attr('x', (p) => graphXScale(getParticipationRate(p, activity)))
    .attr('y', function (p) {
      let y = graphYScale(getParticipationTime(p, activity))
            return y + LABELSm
        })
    .attr('class', () => 'country-label')
    GRAPHsvg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0, ' + (GRAPHh - GRAPHm) + ')')
    .call(d3.axisTop(graphXScale))
    GRAPHsvg.append('g')
    .attr('class', 'y axis')
    .call(d3.axisRight(graphYScale))
}
