
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
	add_activity_ts("test");
});

function add_activity_ts(name)
{
	var bin = '<div class="col-md-1"><span class="fa fa-trash"></span></div>';
	var check = '<div class="col-md-1"><input type="checkbox"></div>';
	var colDiv = '<div class="col-md-9">' + name + '</div>';
	var div = '<div class="row selected_activities_list_ts">' + colDiv + check + bin + '</div>';
	$("#div-dropdown-ts").prepend(div);
}

function init_index_html()
{
	document.getElementById("div-dropdown-pt").
		setAttribute("style" ,"display:none");
}