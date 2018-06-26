var currentMode = 'ts';

var last_activity_pt = 'Sleep';

/* selectected activities fro time spent */
var selectedActivitiesTs = []

var time_spent_li = document.getElementById('time_spent_li')
var participation_time_li = document.getElementById('participation_time_li')

window.onload = init_index_html

time_spent_li.addEventListener('click', function () {
  time_spent_li.setAttribute('class', 'active')
	participation_time_li.classList.remove('active')
	
	document.getElementById('div-dropdown-ts')
		.setAttribute('style' , 'display:block')
	document.getElementById('div-dropdown-pt')
		.setAttribute('style' , 'display:none')
		
	createPieMap(get_checked_activities())
	currentMode = 'ts';
})


participation_time_li.addEventListener('click', function () {
  participation_time_li.setAttribute('class', 'active')
	time_spent_li.classList.remove('active')
	
	document.getElementById('div-dropdown-ts')
		.setAttribute('style','display:none')
	document.getElementById('div-dropdown-pt')
		.setAttribute('style' , 'display:block')
	on_body_resize()
  createPTMap(last_activity_pt)
	plotGraphActivity(last_activity_pt)
	currentMode = 'pt'
})

function add_activity_ts (name) {
  var colDiv = '<div style="white-space:nowrap;overflow:hidden" class="col-md-9">' + name + '</div>'
	var check = '<div class="col-md-1"><input type="checkbox" checked></div>'
	var bin = '<div class="col-md-1"><span class="fa fa-trash"></span></div>'
	
	var div = '<div class="row selected_activities_list_ts">' + colDiv + check + bin + '</div>'
	$('#div-dropdown-ts').prepend(div)
	
	var lastActivities = $('#div-dropdown-ts').children()[0]
	selectedActivitiesTs.push(lastActivities)
	
	// click on trash
	lastActivities.children[2].children[0].addEventListener('click', function (event) {
    var element = $(event.target) // cast to jquery
		
		for (var i = 0; i < selectedActivitiesTs.length; i++)
      {if( element.parent().parent().children()[0].innerHTML == selectedActivitiesTs[i].children[0].innerHTML )
				selectedActivitiesTs.splice(i,1);}

    element.parent().parent().remove()
		
		createPieMap(get_checked_activities())
    createGrapheTimeSpent(get_checked_activities())
	})
	
	// click on checkbox
	lastActivities.children[1].children[0].addEventListener('click', function (event) {
		
		createPieMap(get_checked_activities());
	})	
}

/* returns all the checked activities among the selected activities */
function get_checked_activities () {
  var checked_activities = []
  for (var i = 0; i < selectedActivitiesTs.length; i++) {
    if (selectedActivitiesTs[i].children[1].children[0].checked) { checked_activities.push(selectedActivitiesTs[i].children[0].innerText) }
  }

  return checked_activities
}

/* creates a pop-up div to zoom on a element */
function zoom_on_element (id) {

}

/* create the activities list for time spent */
function create_list_activities_ts () {
  var dropdownListTs = d3.select('#dropdown-list-ts')
  for (let i = 0; i < activities.length; ++i) {
    dropdownListTs.append('li')
      .append('a')
      .property('href', '#')
      .property('id', i + ' ts')
      .on('click', on_itemClicked_list_activities_ts)
      .text(activities[i])
  }
}

function on_itemClicked_list_activities_ts () {
  let id = d3.select(this).attr('id')
  id = id.split(' ')
  let activity = activities[id[0]]

  add_activity_to_selected_activities(activity)
}

function add_activity_to_selected_activities (activity) {
  var selectLen = selectedActivitiesTs.length

  var isInSelectedActivities = false
  for (var i = 0; i < selectLen; i++) {
    if (activity == selectedActivitiesTs[i].children[0].innerText) {
      isInSelectedActivities = true
      break
    }
  }

  if (!isInSelectedActivities)
  {
    add_activity_ts(activity)  
	createPieMap(get_checked_activities())
	createGrapheTimeSpent(get_checked_activities())	
	}
}

/* create the activities list for participation time */
function create_list_activities_pt () {
  var dropdownListPt = d3.select('#dropdown-list-pt')
  for (let i = 0; i < activities.length; ++i) {
    dropdownListPt.append('li')
      .append('a')
      .property('href', '#')
      .property('id', i + ' pt')
      .on('click', on_itemClicked_list_activities_pt)
      .text(activities[i])
  }
}

function on_itemClicked_list_activities_pt () {
  let id = d3.select(this).attr('id')
  id = id.split(' ')
  let activity = activities[id[0]]

  var button = document.getElementById('button_activity_pt')

  var divActivity = '<div style="overflow:hidden" class="col-md-9">' + activity + '</div>'
  var divCaret = '<div class="col-md-3"></span><span class="caret"></span></div>'

  button.innerHTML = '<div class="row">' + divActivity + divCaret + '</div>'
  last_activity_pt = activity
  /* graph participation time / participation rate */

  plotGraphActivity(activity)
  createPTMap(activity)
}

function init_index_html () {
  document.getElementById('div-dropdown-pt')
    .setAttribute('style', 'display:none')

  add_activity_to_selected_activities('Sleep')
  handle_map_size()
	
  var activity = 'Sleep'
  var button = document.getElementById('button_activity_pt')

  var divActivity = '<div style="overflow:hidden" class="col-md-9">' + activity + '</div>'
  var divCaret = '<div class="col-md-3"></span><span class="caret"></span></div>'

  button.innerHTML = '<div class="row">' + divActivity + divCaret + '</div>'
}

function handle_map_size () {
  var width = $('#page-content').parent().width()
	var height = $('#page-content').parent().height()

	if (Math.min(width, height) == height) {
    $('#map-container').attr('width', width)
		$('#map-container').attr('height', height)
		// $('#map-container').children().first().attr('height', height)
		// $('#map-container').children().first().attr('width', height)
		//var diff = width - height
		//$('#map-container').attr('style', 'margin-left:' + (diff / 2) + ';margin-right:' + (diff / 2))
	} else {
    $('#map-container').attr('width', width)
		$('#map-container').attr('height', width)
		// $('#map-container').children().first().attr('height', width)
		$('#map-container').children().first().attr('width', width)
		var diff = height - width
		$('#map-container').attr('style', 'margin-top:' + (diff / 2) + ';margin-bottom:' + (diff / 2))
	}
}

function on_body_resize () {

    if( currentMode == 'ts'){
        createPieMap(get_checked_activities())
    }else{
        createPTMap(last_activity_pt)
    }

  // handle_Smap_size();

  /*	$("#map-container").children().remove();
	mapContainer = svgMap
  .append('g')
  .attr('id', 'map')

	pieContainer = svgMap
  .append('g')
  .attr('id', 'pies')
  loadMap(dataset, currentMode); */
  /*handle_map_size();
  createPieMap(get_checked_activities()); */
}
