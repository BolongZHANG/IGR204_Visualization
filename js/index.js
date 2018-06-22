var cpt = 0;
/* selectected activities fro time spent */
var selectedActivitiesTs = [];

var time_spent_li = document.getElementById("time_spent_li");
var participation_time_li = document.getElementById("participation_time_li");

window.onload = init_index_html;

time_spent_li.addEventListener("click" , function(){
	time_spent_li.setAttribute("class" , "active");
	participation_time_li.classList.remove("active");
	
	document.getElementById("div-dropdown-ts").
		setAttribute("style" ,"display:block");
	document.getElementById("div-dropdown-pt").
		setAttribute("style" ,"display:none");
});


participation_time_li.addEventListener("click" , function(){
	participation_time_li.setAttribute("class" , "active");
	time_spent_li.classList.remove("active");
	
	document.getElementById("div-dropdown-ts").
		setAttribute("style" ,"display:none");
	document.getElementById("div-dropdown-pt").
		setAttribute("style" ,"display:block");
});

document.getElementById("dropdown-activities-ts").
addEventListener("click",function(){
	add_activity_ts("test " + cpt);
	cpt++;
});

function add_activity_ts(name)
{
	var colDiv = '<div class="col-md-9">' + name + '</div>';
	var check = '<div class="col-md-1"><input type="checkbox"></div>';
	var bin = '<div class="col-md-1"><span class="fa fa-trash"></span></div>';
	
	var div = '<div class="row selected_activities_list_ts">' + colDiv + check + bin + '</div>';
	$("#div-dropdown-ts").prepend(div);
	
	var lastActivities = $("#div-dropdown-ts").children()[0];
	selectedActivitiesTs.push( lastActivities );
	
	// click on trash
	lastActivities.children[2].children[0].addEventListener("click" , function(event){
		var element = $(event.target); // cast to jquery
		
		for( var i=0 ; i < selectedActivitiesTs.length ; i++ )
			if( element.parent().parent().children()[0].innerHTML == selectedActivitiesTs[i].children[0].innerHTML )
				selectedActivitiesTs.splice(i,1);
			
		element.parent().parent().remove();
	});
	
	
}

/* returns all the checked activities among the selected activities */
function get_checked_activities()
{
	var checked_activities = [];
	for( var i=0 ; i < selectedActivitiesTs.length ; i++ )
		if( selectedActivitiesTs[i].children[1].children[0].checked )
			checked_activities.push( selectedActivitiesTs[i] );
	
	return checked_activities;
}

/* creates a pop-up div to zoom on a element */
function zoom_on_element(id)
{
	
}

function init_index_html()
{
	document.getElementById("div-dropdown-pt").
		setAttribute("style" ,"display:none");
}