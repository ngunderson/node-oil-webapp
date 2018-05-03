var historicLayout = {
    title:'History',
    width: 1400,
    height: 500,
	showlegend: true
};
var tempTrace =
{
	x:[],
	y:[],
        type: 'scatter',
        mode: 'lines+markers',
	name: 'Temperature'
};

var qualityTrace =
{
	x:[],
	y:[],
        type: 'scatter',
        mode: 'lines+markers',
	name: 'Quality'
}

var levelTrace =
{
	x:[],
	y:[],
        type: 'scatter',
        mode: 'lines+markers',
	name: 'Level'
};

var data = [];

function FillTemp(points)
{
        tempTrace["x"] = points.x;
        tempTrace["y"] = points.y;
        updateGraph();

}
function FillLevel(points)
{
	levelTrace["x"] = points.x;
	levelTrace["y"] = points.y;
	updateGraph();

}
function FillQuality(points)
{
	qualityTrace["x"] = points.x;
	qualityTrace["y"] = points.y;
	updateGraph();

}


function updateGraph()
{
        data = [];
    	if(chkTemp.checked)
		data.push(tempTrace);
	if(chkQuality.checked)
		data.push(qualityTrace);
	if(chkLevel.checked)
		data.push(levelTrace);

	Plotly.newPlot('historicGraph',data,historicLayout);
}
function updateTrace()
{
	var chkTemp = document.getElementById("chkTemp");
	var chkQuality = document.getElementById("chkQuality");
	var chkLevel = document.getElementById("chkLevel");
	var daySelect = document.getElementById("daySelect");
	var day = daySelect.options[daySelect.selectedIndex].value;

	$.getJSON("/past/temp",{"day":day}).then(FillTemp);
	$.getJSON("/past/level",{"day":day}).then(FillLevel);
	$.getJSON("/past/quality",{"day":day}).then(FillQuality);
}
updateGraph();
