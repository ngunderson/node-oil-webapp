var POLL_RATE = (Number(localStorage.getItem("collectionRate")) * 1000)
                || 5000; // 5s default poll interval
var prev_data = {};
getLatestData();
setInterval(getLatestData, POLL_RATE);

//Setting Graph traces
var avgTempTrace = {
    x:[],
    y:[],
    type: "scatter",
    mode: "lines+markers",
    name: "Avg Temperature"
};
var oilLevelTrace = {
    x:[],
    y:[],
    type: "scatter",
    mode: "lines+markers",
    name: "Oil Level"
};
var oilQualityTrace = {
    x:[],
    y:[],
    type: "scatter",
    mode: "lines+markers",
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

function setOilQuality(dialectric)
{
	var digit = document.getElementById("oilQuality");
	digit.innerHTML = dialectric;
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
    title:'Quality VS Time',
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
	console.warn("Server receiving no data.");
	return;
    }
    if (!data.time) {
	console.error("No time sent by server!");
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
	setOilLevel(oilLevel);
	oilLevelTrace["y"].push(oilLevel);
	oilLevelTrace["x"].push(time);
	updateLevelGraph();
    }
    if(avgTemp != undefined)
    {
	avgTempTrace["y"].push(avgTemp);
	avgTempTrace["x"].push(time);
	updateTempGraph();
    }
    if(oilQuality != undefined)
    {
	oilQualityTrace["y"].push(oilQuality);
	oilQualityTrace["x"].push(time);
	setOilQuality(oilQuality);
	updateQualityGraph();
    }
    prev_data = data;
}

updateTempGraph();
updateQualityGraph();
updateLevelGraph();
