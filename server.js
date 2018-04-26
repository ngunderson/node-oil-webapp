const express = require('express');
const iotHubClient = require('./iot-hub.js');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(express.static('public'));

var iotHubReader = new iotHubClient(process.env['Azure.IoT.IoTHub.ConnectionString'], process.env['Azure.IoT.IoTHub.ConsumerGroup']);
iotHubReader.startReadMessage(function (obj, date) {
    try {
        console.log(date);
        date = date || Date.now()
        //wss.broadcast(JSON.stringify(Object.assign(obj, { time: moment.utc(date).format('YYYY:MM:DD[T]hh:mm:ss') })));

    } catch (err) {
        console.log(obj);
        console.error(err);
    }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
