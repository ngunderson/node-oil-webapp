const express = require('express');
const iotHubClient = require('./iot-hub.js');
const moment = require('moment');

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

app.get('/latestData', (req, res) => {
    res.send(JSON.stringify(mostRecentMessage));
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
