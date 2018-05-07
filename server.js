const express = require('express');
const bodyParser = require('body-parser');
const iotHubClient = require('./iot-hub.js');
const moment = require('moment-timezone');
const path = require('path');
const azure = require('azure-storage');
var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;
var NoRetry = require('azure-iot-common').NoRetry;

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// Alerts
var TEMP_ALERT = 60;
var LEVEL_ALERT = .8;
var QUALITY_ALERT = 8;
var TARGET_DEVICE = 'pi';

// App
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

storage = azure.createTableService();

var mostRecentMessage = {"default": "no data received"};

// streaming device to cloud messages
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

// sending cloud to device messages
var serviceClient = Client.fromConnectionString(process.env['Azure.IoT.IoTHub.ConnectionString']);
serviceClient.setRetryPolicy(new NoRetry());
var connOpen = false;


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
    var device = String(req.query.device);

    if (isNaN(day) || typeof(device) !== "string") {
	res.sendStatus(400);
	return;
    }
    var oldestDate = moment().subtract(day, "days").toDate();;
    console.log("date: ", oldestDate);
    var query = new azure.TableQuery()
	.select('eventenqueuedutctime', 'avgtemp')
	.top(1000)
	.where('eventenqueuedutctime ge ?date?'
	       + 'and deviceid eq ?string?', oldestDate, device);

    retrieveData('TemperatureRecords', query, null).then((data) => {
	console.log("Data retrieve finished");
	console.log("DATA LEN: ", data.length);
	console.log("first data:  ", data[0]);
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
    var device = String(req.query.device);

    if (isNaN(day) || typeof(device) !== "string") {
	res.sendStatus(400);
	return;
    }
    var oldestDate = moment().subtract(day, "days").toDate();;
    console.log("date: ", oldestDate);
    var query = new azure.TableQuery()
	.select('eventenqueuedutctime', 'level')
	.top(1000)
	.where('eventenqueuedutctime ge ?date?'
	       + 'and deviceid eq ?string?', oldestDate, device);

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
    var device = String(req.query.device);

    if (isNaN(day) || typeof(device) !== "string") {
	res.sendStatus(400);
	return;
    }
    var oldestDate = moment().subtract(day, "days").toDate();;
    console.log("date: ", oldestDate);
    var query = new azure.TableQuery()
	.select('eventenqueuedutctime', 'quality')
	.top(1000)
	.where('eventenqueuedutctime ge ?date?'
	       + 'and deviceid eq ?string?', oldestDate, device);

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

app.post('/settings', (req, res) => {
    console.log("POST: ", req.body);
    var cmd = {};
    cmd.T_ALERT = Number(req.body.T_ALERT);
    cmd.L_ALERT = Number(req.body.L_ALERT);
    cmd.Q_ALERT = Number(req.body.Q_ALERT);

    if (isNaN(cmd.T_ALERT) || isNaN(cmd.L_ALERT) || isNaN(cmd.Q_ALERT) ) {
	res.sendStatus(400);
	return;
    }

    if (cmd.T_ALERT == TEMP_ALERT)
	delete cmd.T_ALERT;
    if (cmd.L_ALERT == LEVEL_ALERT)
	delete cmd.L_ALERT;
    if (cmd.Q_ALERT == QUALITY_ALERT)
	delete cmd.Q_ALERT;

    if (Object.keys(cmd).length == 0) {
	res.sendStatus(200);
	return;
    }

    serviceClient.open(function (err) {
	if (err) {
	    console.error('Could not connect: ' + err.message);
	    res.sendStatus(500);
	} else {
	    setTimeout(function() {
		endConnection(res);
	    }, 2000);
	    connOpen = true;
	    console.log('Service client connected');
	    serviceClient.getFeedbackReceiver(receiveFeedback);
	    var message = new Message(JSON.stringify(cmd));
	    message.ack = 'full';
	    message.messageId = "My Message ID";
	    console.log('Sending message: ' + message.getData());
	    serviceClient.send(TARGET_DEVICE, message, handleResult);
	}
    });
});

app.get('/prevSettings', (req, res) => {
    var settings = {
	"tAlert": TEMP_ALERT,
	"lAlert": LEVEL_ALERT,
	"qAlert": QUALITY_ALERT,
    }
    res.send(JSON.stringify(settings));
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
    data.forEach((entry, idx) => {
	if (entry.avgtemp._ == null) {
	    console.log(idx);
	    console.log("NULL FOUND!!");
	    console.log("DATA: ", entry);
	    return;
	}

	xData.push(
	    moment(entry.eventenqueuedutctime._)
		.tz('America/Chicago')
		.format("YYYY-MM-DD HH:mm:ss")
	);
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
	if (entry.level._ == null) {
	    console.log(idx);
	    console.log("NULL FOUND!!");
	    console.log("DATA: ", entry);
	    return;
	}
	xData.push(
	    moment(entry.eventenqueuedutctime._)
		.tz('America/Chicago')
		.format("YYYY-MM-DD HH:mm:ss")
	);
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
	if (entry.quality._ == null) {
	    console.log(idx);
	    console.log("NULL FOUND!!");
	    console.log("DATA: ", entry);
	    return;
	}
	xData.push(
	    moment(entry.eventenqueuedutctime._)
		.tz('America/Chicago')
		.format("YYYY-MM-DD HH:mm:ss")
	);
	yData.push(+Number(entry.quality._).toFixed(2));
    });
    return {
	x: xData,
	y: yData
    }
}

function handleResult(err, res) {
    if (err) console.log('send error: ' + err.toString());
    if (res) console.log('send status: ' + res.constructor.name);
}

function receiveFeedback(err, receiver) {
    receiver.on('message', function (msg) {
	console.log('Feedback message:')
	console.log(msg.getData().toString('utf-8'));
	connOpen = false;

	console.log("feedback received, closing connection...");
	serviceClient.close(function() {
	    console.log("feedback: connection closed");
	});
    });
}

function endConnection(res, cmd) {
    console.log("timeout: closing connection");
    if (connOpen) {
	status = 500;
	console.log("timeout close");
	serviceClient.close(function() {
	    console.log("timeout: connection closed");
	});
    } else {
	TEMP_ALERT = cmd.T_ALERT || TEMP_ALERT;
	LEVEL_ALERT = cmd.L_ALERT || LEVEL_ALERT;
	QUALITY_ALERT = cmd.Q_ALERT || QUALITY_ALERT
	console.log("VARS: ", TEMP_ALERT, LEVEL_ALERT, QUALITY_ALERT);
	status = 200;
    }
    res.sendStatus(status);
}
