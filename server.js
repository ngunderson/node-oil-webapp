const express = require('express');
const iotHubClient = require('./iot-hub.js');
const moment = require('moment');
const path = require('path');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(express.static('public'));

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

app.get('/graph', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/graph.html'));
});

// API endpoints
app.get('/latestData', (req, res) => {
    res.send(JSON.stringify(mostRecentMessage));
});

app.get('/testData', (req, res) => {
    var xdata = Array.from({length: 40000}, (v, k) => k+1);
    var ydata = Array.from({length: 40000}, (v, k) => k+1);
    var garbageData = Array(40000).fill({
	"test": "matt data",
	"matt": "test test",
	"long": "stringggggggggggggggggggggggggggggggggggggggggas;lkjd;fda"
    });
    var data = {
	x: xdata,
	y: ydata,
	garbage: garbageData
    }
    res.send(JSON.stringify(data));
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
