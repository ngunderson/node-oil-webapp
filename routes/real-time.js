const moment = require('moment-timezone');
const iotHubClient = require('../lib/iot-hub.js');

const DEFAULT = {"default": "no data received"};

var mostRecentMessage = DEFAULT;

// streaming device to cloud messages
var iotHubReader = new iotHubClient(process.env['Azure.IoT.IoTHub.ConnectionString'], process.env['Azure.IoT.IoTHub.ConsumerGroup']);
iotHubReader.startReadMessage((obj, date) => {
    try {
	if (obj.default === "empty") {
	    console.log("device paused message");
	    mostRecentMessage = DEFAULT;
	    return;
	}
	if (obj.hasOwnProperty("ALERTS")) {
	    console.log("obj: ", obj);
	    TEMP_ALERT = Number(obj.ALERTS.TEMPERATURE);
	    LEVEL_ALERT = Number(obj.ALERTS.LEVEL);
	    QUALITY_ALERT = Number(obj.ALERTS.QUALITY);
	    console.log("setting alerts", TEMP_ALERT, LEVEL_ALERT, QUALITY_ALERT);
	    return;
	}
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

exports.latestData = (req, res) => {
    res.send(JSON.stringify(mostRecentMessage));
};
