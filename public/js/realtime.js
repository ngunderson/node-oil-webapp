//TODO: (1) Have the data from the array erase the oldest data past a number
// of logs Ex.Circular Queue


//var socket = new WebSocket("ws://" + location.host);
var POLL_RATE = 5000; // 5s poll interval
var prev_data = {};
//getLatestData();
//setInterval(getLatestData, POLL_RATE);

//Setting Graph traces
var avgTempTrace = {
    x:[],
    y:[],
    type: "scatter",
    name: "Avg Temperature"
};
var oilLevelTrace = {
    x:[],
    y:[],
    type: "scatter",
    name: "Oil Level"
};
var oilQualityTrace = {
    x:[],
    y:[],
    type: "scatter",
    name: "Oil Quality"
};


//Update UI components
function updateSensors(s1,s2,s3,s4)
{
    var sensor1 = document.getElementById("tempSensor1");

    var sensor2 = document.getElementById("tempSensor2");

    var sensor3 = document.getElementById("tempSensor3");

    var sensor4 = document.getElementById("tempSensor4");

    if(s1 != undefined)
	sensor1.innerHTML = s1 + "C";

    if(s2 != undefined)
	sensor2.innerHTML = s2 + "C";

    if(s3 != undefined)
	sensor3.innerHTML = s3 + "C";

    if(s4 != undefined)
	sensor4.innerHTML = s4 + "C";

}

// level should be a percent
function setOilLevel(level)
{
    var oBar = document.getElementById("myProgress");
    var bar = document.getElementById("oilLevelBar");
    var pLabel = document.getElementById("percentLabel");
    var amount = level * oBar.clientHeight;
    pLabel.innerHTML =  (amount / oBar.clientHeight * 100).toFixed(0) + "%";
    bar.style.height = amount;
}



//Graph Update functions & STUFF
var tempLayout = {
    title:'Temperature VS Time',
    width: 600,
    height: 250
};
var levelLayout = {
    title:'Oil Level VS Time',
    width: 600,
    height: 250
};
var qualityLayout = {
    title:'Temperature VS Time',
    width: 600,
    height: 250
};
function updateTempGraph()
{
    var data = [avgTempTrace];
    Plotly.newPlot('oilTempGraph', data,tempLayout);
}
function updateLevelGraph()
{
    var data = [oilLevelTrace];
    Plotly.newPlot('oilLevelGraph', data,levelLayout);
}
function updateQualityGraph()
{
    var data = [oilQualityTrace];
    Plotly.newPlot('oilQualityGraph', data,qualityLayout);
}

function getLatestData() {
    console.log("Retreiving data...");
    $.getJSON("/latestData").then(displayData);
}

function displayData(data) {
    console.log("INFO: Message Received: ", data);
    if (data.hasOwnProperty('default') || data.time === prev_data.time) {
	console.log("WARNING: Server receiving no data.");
	return;
    }
    if (!data.time) {
	console.log("ERROR: No time sent by server!");
	return;
    }


    //USE These JSON TAGS position is optional tags are optional//
    //'{"temp1":"#","temp2":"#","temp3":"#","temp4":"#","avgTemp":"#","level":"#","quality":"#"}
    var temp1 = data.temp1;
    var temp2 = data.temp2;
    var	temp3 = data.temp3;
    var temp4 = data.temp4;
    var avgTemp = data.avgTemp;
    var oilLevel = data.level;
    var oilQuality = data.quality;
    var time = data.time;
    console.log("INFO: Time is ", time);


    //Does not matter if the values are undefined as they wont be updated
    updateSensors(temp1,temp2,temp3,temp4);
    //Setting OilLevel
    if(oilLevel != undefined)
    {
	//var pLevel = (oilLevel / TOTALOIL) * 100
	//or depending on what value is being sent *delete one*
	//var pLevel = (TOTALOIL - oilLevel) / TOTALOIL * 100
	setOilLevel(oilLevel);
	oilLevelTrace["y"].push(oilLevel);
	oilLevelTrace["x"].push(time);//Time Here Now time or send time over socket?
	updateLevelGraph();
    }
    if(avgTemp != undefined)
    {
	avgTempTrace["y"].push(avgTemp);
	avgTempTrace["x"].push(time);//Time Here Now time or send time over socket?
	updateTempGraph();
    }
    if(oilQuality != undefined)
    {
	oilQualityTrace["y"].push(oilQuality);
	oilQualityTrace["x"].push(time);//Time Here Now time or send time over socket?
	updateQualityGraph();
    }
    prev_data = data;
}

$.getJSON("/testData").then(data => {
    console.log("DATA RECEIVED: ", data);
    avgTempTrace.x = data.x;
    avgTempTrace.y = data.y;
    updateTempGraph();
});
