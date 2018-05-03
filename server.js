const express = require('express');
const iotHubClient = require('./iot-hub.js');
const moment = require('moment-timezone');
const path = require('path');
const azure = require('azure-storage');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(express.static('public'));

storage = azure.createTableService();

var mostRecentMessage = {"default": "no data received"};

var iotHubReader = new iotHubClient(process.env['Azure.IoT.IoTHub.ConnectionString'], process.env['Azure.IoT.IoTHub.ConsumerGroup']);
iotHubReader.startReadMessage((obj, date) => {
    try {
        console.log("Message: ", obj);
        date = date || Date.now()
	Object.assign(obj, { time: moment.utc(date).format('hh:mm:ss')});
	obj.temp1 = obj.temp1.toFixed(2);
	obj.temp2 = obj.temp2.toFixed(2);
	obj.temp3 = obj.temp3.toFixed(2);
	obj.temp4 = obj.temp4.toFixed(2);
	obj.avgTemp = obj.avgTemp.toFixed(2);
	obj.level = obj.level.toFixed(2);
	obj.quality = obj.quality.toFixed(2);
	mostRecentMessage = obj;
    } catch (err) {
        console.log(obj);
        console.error(err);
    }
});

// HTML endpoints
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/settings.html'));
});

app.get('/historic', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/historic.html'));
});

// API endpoints
app.get('/latestData', (req, res) => {
    res.send(JSON.stringify(mostRecentMessage));
});

app.get('/past/temp', (req, res) => {
    console.log("PARAMS: ", req.query)
    var day = Number(req.query.day);
    if (isNaN(day)) {
	res.sendStatus(400);
	return;
    }
    var oldestDate = moment().subtract(day, "days").toDate();;
    console.log("date: ", oldestDate);
    var query = new azure.TableQuery()
	.select('eventenqueuedutctime', 'avgtemp')
	.top(1000)
	.where('eventenqueuedutctime ge ?date?', oldestDate);

    retrieveData('TemperatureRecords', query, null).then((data) => {
	console.log("Data retrieve finished");
	console.log("DATA LEN: ", data.length);
	minData = formatTempData(data);
	res.send(JSON.stringify(minData));
    }).catch((err) => {
	console.log("QUERY ERR: ", err);
	res.sendStatus(500);
    });
});

app.get('/past/level', (req, res) => {
    console.log("PARAMS: ", req.query)
    var day = Number(req.query.day);
    if (isNaN(day)) {
	res.sendStatus(400);
	return;
    }
    var oldestDate = moment().subtract(day, "days").toDate();;
    console.log("date: ", oldestDate);
    var query = new azure.TableQuery()
	.select('eventenqueuedutctime', 'level')
	.top(1000)
	.where('eventenqueuedutctime ge ?date?', oldestDate);

    retrieveData('LevelRecords', query, null).then((data) => {
	console.log("Data retrieve finished", data[1500]);
	console.log("DATA LEN: ", data.length);
	minData = formatLevelData(data);
	res.send(JSON.stringify(minData));
    }).catch((err) => {
	console.log("QUERY ERR: ", err);
	res.sendStatus(500);
    });
});

app.get('/past/quality', (req, res) => {
    console.log("PARAMS: ", req.query)
    var day = Number(req.query.day);
    if (isNaN(day)) {
	res.sendStatus(400);
	return;
    }
    var oldestDate = moment().subtract(day, "days").toDate();;
    console.log("date: ", oldestDate);
    var query = new azure.TableQuery()
	.select('eventenqueuedutctime', 'quality')
	.top(1000)
	.where('eventenqueuedutctime ge ?date?', oldestDate);

    retrieveData('QualityRecords', query, null).then((data) => {
	console.log("Data retrieve finished");
	console.log("DATA LEN: ", data.length);
	minData = formatQualityData(data);
	res.send(JSON.stringify(minData));
    }).catch((err) => {
	console.log("QUERY ERR: ", err);
	res.sendStatus(500);
    });
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

function retrieveData(table, query, nextToken) {
    var data = [];
    console.log("retrieving data");
    return new Promise((resolve, reject) => {
        storage.queryEntities(table, query, nextToken, (error, result, response) => {
            if(error) {
	    	console.log("rejecting with error", error);
                reject(error);
		return;
                // check if need to return data
            }
	    data = data.concat(result.entries);
	    //console.log("entry length: ", result.entries.length);
	    if (result.continuationToken == null) {
	    	console.log("token null, resolving data");
	    	resolve(data);
		return;
	    }
	    console.log("data added: ", data.length);
	    console.log("token: ", result.continuationToken);
            appendData(table, data, query, result.continuationToken, resolve, reject);
        });

    });
}

function appendData(table, data, query, nextToken, resolve, reject) {
    console.log("appending data");
    storage.queryEntities(table, query, nextToken, (error, result, response) => {
        if(error) {
	    console.log("rejecting with error", error);
            reject(error);
	    return;
            // check if need to return data
        }
	data = data.concat(result.entries);
	//console.log(data.slice(data.length - 700));
	if (result.continuationToken == null) {
	    console.log("token null, resolving data");
	    resolve(data);
	    return;
	}
	console.log("data added: ", data.length);
	console.log("token: ", result.continuationToken);
        appendData(table, data, query, result.continuationToken, resolve, reject);
    });

}

function formatTempData(data) {
    xData = [];
    yData = [];
    data.forEach((entry) => {
	xData.push(
	    moment(entry.eventenqueuedutctime._)
		.tz('America/Chicago')
		.format("YYYY-MM-DD HH:mm:ss")
	);
	//console.log("ENTRY: ", entry);
	yData.push(+Number(entry.avgtemp._).toFixed(2));
    });
    return {
	x: xData,
	y: yData
    }
}

function formatLevelData(data) {
    xData = [];
    yData = [];
    data.forEach((entry) => {
	xData.push(
	    moment(entry.eventenqueuedutctime._)
		.tz('America/Chicago')
		.format("YYYY-MM-DD HH:mm:ss")
	);
	//console.log("ENTRY: ", entry);
	yData.push(+Number(entry.level._).toFixed(2));
    });
    return {
	x: xData,
	y: yData
    }
}

function formatQualityData(data) {
    xData = [];
    yData = [];
    data.forEach((entry) => {
	xData.push(
	    moment(entry.eventenqueuedutctime._)
		.tz('America/Chicago')
		.format("YYYY-MM-DD HH:mm:ss")
	);
	//console.log("ENTRY: ", entry);
	yData.push(+Number(entry.quality._).toFixed(2));
    });
    return {
	x: xData,
	y: yData
    }
}
