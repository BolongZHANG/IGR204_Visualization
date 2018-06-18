let graphMargin = 50, labelsMargin = 20;
let circlesRadius = 10;
let dropdownList = d3.select("#dropdown-list");
let svg;
let xScale, yScale;
let h = 600, w = 600;

function createNewSvg() {
	h = $("#activity-graph").width();
	w = h;
	circlesRadius = h / 60;
	graphMargin = h / 12;
	labelsMargin = h / 30;
    svg = d3.select("#activity-graph")
    .append("svg")
    .attr("height", h)
    .attr("width", w);
}

function setupGraph() {   
    for (let i=0; i < activities.length; ++i) {
        dropdownList.append("li")
                    .append("a")
                    .property("href", "#")
                    .property("id", i)
                    .on("click", plotGraphActivity)
                    .text(activities[i]);
    }
    createNewSvg();
}

function getParticipationRate(country, activity) {
    return parseFloat(dataset.get(country).get(activity).participationRate);
}

function getParticipationTime(country, activity) {
    let str = String(dataset.get(country).get(activity).participationTime);
    let splittedStr = str.split(':');
    let hh = parseInt(splittedStr[0]), mm = parseInt(splittedStr[1]);
    return hh + mm/60.0;
}

function clearGraph() {
    svg.remove();
    createNewSvg();
}

function plotGraphActivity() {
    clearGraph();

    let id = d3.select(this).attr("id");
    let activity = activities[id];
    let pRates = [], pTimes = [], participants = [];
    for(country of countries) {
        const pRate = getParticipationRate(country, activity);
        if((pRate != 0) && !isNaN(pRate)) {
            pRates.push(pRate);
            const pTime = getParticipationTime(country, activity);
            pTimes.push(pTime);
            participants.push(country);
        }
    }
    console.log(pRates);
    console.log(pTimes);
    xScale = d3.scaleLinear()
               .domain(d3.extent(pRates))
               .range([graphMargin, w-graphMargin]);
    yScale = d3.scaleLinear()
               .domain(d3.extent(pTimes))
               .range([h-graphMargin, graphMargin]);
    svg.selectAll("circle")
               .data(participants)
               .enter()
               .append("circle")
               .attr("id", (p) => p)
               .attr("r", circlesRadius)
               .attr("cx", (p) => xScale(getParticipationRate(p, activity)))
               .attr("cy", (p) => yScale(getParticipationTime(p, activity)));
    svg.selectAll("text")
        .data(participants)
        .enter()
        .append("text")
        .text((p) => p)
        .attr("x", (p) => xScale(getParticipationRate(p, activity)))
        .attr("y", function(p) {
            let y = yScale(getParticipationTime(p, activity));
            return y + labelsMargin;
        })
        .attr("class", () => "country-label");
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + (h-graphMargin) + ")")
        .call(d3.axisTop(xScale));
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisRight(yScale));
}