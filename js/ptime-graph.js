let GRAPHm = 60, LABELSm = 20
let CIRCLESr = 110
let trDuration = 500
let padding = 30

let dropdownList = d3.select('#dropdown-list-pt')
let GRAPHsvg
let graphXScale, graphYScale
let GRAPHh = 600, GRAPHw = 600

function createNewGRAPHsvg () {
  GRAPHh = $('#activity-graph-pt').width()
	GRAPHw = GRAPHh
	CIRCLESr = GRAPHh / 50
	GRAPHm = GRAPHh / 8
	LABELSm = GRAPHh / 30

    if(document.getElementById("activity-scatter-pt") == null){
        GRAPHsvg = d3.select('#activity-graph-pt')
            .append('svg')
            .attr("id", "activity-scatter-pt")
            .attr('height', GRAPHh)
            .attr('width', GRAPHw)
    }else{
        GRAPHsvg = d3.select('#activity-scatter-pt')
            .attr('height', GRAPHh)
            .attr('width', GRAPHw)
    }

}

function getParticipationRate (country, activity) {
  return parseFloat(dataset.get(country).get(activity).participationRate)
}

function getParticipationTime (country, activity) {
  let str = String(dataset.get(country).get(activity).participationTime)
    let splittedStr = str.split(':')
    let hh = parseInt(splittedStr[0]), mm = parseInt(splittedStr[1])
    return hh *60.0 + mm
}


function clearGraph () {
  GRAPHsvg.remove()
    createNewGRAPHsvg()
}

function plotGraphActivity (activity) {
    createNewGRAPHsvg()
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

  console.log("ptime", pTimes, d3.extent(pTimes))
    console.log('pRate', pRates, d3.extent((pRates)))

  graphXScale = d3.scaleLinear()
    .domain(d3.extent(pRates))
    .range([GRAPHm, GRAPHw - GRAPHm])

    graphYScale = d3.scaleLinear()
    .domain(d3.extent(pTimes))
    .range([GRAPHh - GRAPHm, GRAPHm])


    // Define X axis
    var xAxis = d3
        .axisBottom()
        .scale(graphXScale)
        .ticks(6)
        .tickFormat(d=>  d + "%")

// Define Y axis
    var yAxis = d3
        .axisLeft()
        .scale(graphYScale)
        .ticks(6)
        .tickFormat(nbToString)


    if(document.getElementById("x_axis_scatter") == null){
        GRAPHsvg.append('g')
            .attr('id', 'x_axis_scatter')
            .attr('transform', 'translate(0, ' + (GRAPHh - GRAPHm) + ')')
            .call(xAxis)

        GRAPHsvg.append('g')
            .attr('id', 'y_axis_scatter')
            .attr("transform", "translate(" + GRAPHm + ",0)")
            .call(yAxis)
    }else{
        console.log("update axis")
        GRAPHsvg.select("#x_axis_scatter")
            .transition()
            .duration(trDuration)
            .attr('transform', 'translate(0, ' + (GRAPHh - GRAPHm) + ')')
            .call(xAxis)

        GRAPHsvg.select("#y_axis_scatter")
            .transition()
            .duration(trDuration)
            .attr("transform", "translate(" + GRAPHm + ",0)")
            .call(yAxis)

    }


    /** Create new circles**/
    GRAPHsvg.selectAll('circle')
    .data(participants, d=> d)
    .enter()
    .append('circle')
    // .attr('id', (p) => p)
    .attr('r', CIRCLESr)
        .attr('opacity', "0.8")
        .attr('country', d=>d.replace(/\s/g,"_"))
    .attr('cx', (p) => graphXScale(getParticipationRate(p, activity)))
    .attr('cy', (p) => graphYScale(getParticipationTime(p, activity)))
        .on("mouseover", function(d,i){
          console.log("this", typeof(this), this[country],d,i,d3.selectAll("[country=" + d +"]"))
          d3.selectAll("[country=" + d +"]").attr('fill', 'orange')
        })
        .on("mouseout", function(d,i){
            d3.selectAll("path[country=" + d +"]")
                // .select("path")
                .attr('fill', d => scaleC(pTime[d]))

            d3.selectAll("circle[country=" + d +"]")
            // .select("path")
                .attr('fill', 'black')
        })
        .append("title")
        .text(d=>d)

    /** Update all circles**/
    GRAPHsvg.selectAll('circle')
        .data(participants, d=> d)
        .transition()
        .duration(trDuration)
        .attr("r",CIRCLESr)
        .attr('cx', (p) => graphXScale(getParticipationRate(p, activity)))
        .attr('cy', (p) => graphYScale(getParticipationTime(p, activity)))


    /** Add new labels**/
    GRAPHsvg.selectAll('text')
    .data(participants, d=>d)
    .enter()
    .append('text')
    .text((p) => p)
    .attr('x', (p) => graphXScale(getParticipationRate(p, activity)))
    .attr('y', function (p) {
      let y = graphYScale(getParticipationTime(p, activity))
            return y + LABELSm
        })
    .attr('class', () => 'country-label')


    /** Update new labels**/
    GRAPHsvg.selectAll('.country-label')
        .data(participants, d=>d)
        .transition()
        .duration(trDuration)
        .attr('x', (p) => graphXScale(getParticipationRate(p, activity)))
        .attr('y', function (p) {
            let y = graphYScale(getParticipationTime(p, activity))
            return y + LABELSm
        })


}
