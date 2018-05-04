var historicLayout = {
    title:'History',
    width: 1400,
    height: 500,
    showlegend: true
};
var tempTrace = {
    x:[],
    y:[],
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Temperature'
};

var qualityTrace = {
    x:[],
    y:[],
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Quality'
}

var levelTrace = {
    x:[],
    y:[],
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Level'
};

function FillTemp(points)
{
    tempTrace["x"] = points.x;
    tempTrace["y"] = points.y;

}
function FillLevel(points)
{
    levelTrace["x"] = points.x;
    levelTrace["y"] = points.y;
}
function FillQuality(points)
{
    qualityTrace["x"] = points.x;
    qualityTrace["y"] = points.y;
}


function updateGraph()
{
    var data = [];
    if(chkTemp.checked)
	data.push(tempTrace);
    if(chkQuality.checked)
	data.push(qualityTrace);
    if(chkLevel.checked)
	data.push(levelTrace);

    Plotly.newPlot('historicGraph', data, historicLayout);
}

function updateTrace()
{
    var chkTemp = document.getElementById("chkTemp");
    var chkQuality = document.getElementById("chkQuality");
    var chkLevel = document.getElementById("chkLevel");
    var daySelect = document.getElementById("daySelect");
    var day = daySelect.options[daySelect.selectedIndex].value;
    var deviceSelect = document.getElementById("deviceSelect");
    var device = deviceSelect.options[deviceSelect.selectedIndex].value;

    var qParams = {
	"day": day,
	"device": device
    };

    var promises = [];
    if (chkTemp.checked)
	promises.push($.getJSON("/past/temp",qParams).then(FillTemp));
    if (chkQuality.checked)
	promises.push($.getJSON("/past/quality",qParams).then(FillQuality));
    if (chkLevel.checked)
	promises.push($.getJSON("/past/level",qParams).then(FillLevel));

    if (promises.length > 0)
	Promise.all(promises).then(updateGraph);
}

$('input[type=checkbox]').click(function () {
    if ($(this).is(":not(:checked)"))
	updateGraph();
    else
	updateTrace();
});

$('#deviceSelect').change(function () {
    updateTrace();
});

$('#daySelect').change(function () {
    updateTrace();
});
updateGraph();
