const Client = require('azure-iothub').Client;
const Message = require('azure-iot-common').Message;
const NoRetry = require('azure-iot-common').NoRetry;

// Alerts
exports.TEMP_ALERT = 100;
exports.LEVEL_ALERT = .01;
exports.QUALITY_ALERT = .01;
exports.TARGET_DEVICE = 'pi';

// sending cloud to device messages
var serviceClient = Client.fromConnectionString(process.env['Azure.IoT.IoTHub.ConnectionString']);
serviceClient.setRetryPolicy(new NoRetry());
var sendFailed = false;

exports.setSettings = (req, res) => {
    console.log("POST: ", req.body);
    var cmd = {};
    cmd.T_ALERT = Number(req.body.T_ALERT);
    cmd.L_ALERT = Number(req.body.L_ALERT);
    cmd.Q_ALERT = Number(req.body.Q_ALERT);

    if (isNaN(cmd.T_ALERT) && isNaN(cmd.L_ALERT) && isNaN(cmd.Q_ALERT) ) {
	console.log("invalid");
	res.sendStatus(400);
	return;
    }

    if (cmd.T_ALERT == exports.TEMP_ALERT)
	delete cmd.T_ALERT;
    if (cmd.L_ALERT == exports.LEVEL_ALERT)
	delete cmd.L_ALERT;
    if (cmd.Q_ALERT == exports.QUALITY_ALERT)
	delete cmd.Q_ALERT;

    if (req.body.CMD == "START" || req.body.CMD == "STOP") {
	cmd.CMD = req.body.CMD;
    }

    if (Object.keys(cmd).length == 0) {
	console.log("settings have not changed, returning")
	res.sendStatus(204);
	return;
    }

    serviceClient.open(function (err) {
	if (err) {
	    console.error('Could not connect: ' + err.message);
	    res.sendStatus(503);
	} else {
	    setTimeout(function() {
		endConnection(res, cmd);
	    }, 2000);
	    sendFailed = true;
	    console.log('Service client connected');
	    serviceClient.getFeedbackReceiver(receiveFeedback);
	    var message = new Message(JSON.stringify(cmd));
	    message.ack = 'full';
	    message.messageId = "My Message ID";
	    console.log('Sending message: ' + message.getData());
	    serviceClient.send(TARGET_DEVICE, message, handleResult);
	}
    });
};

exports.getSettings = (req, res) => {
    var settings = {
	"tAlert": exports.TEMP_ALERT,
	"lAlert": exports.LEVEL_ALERT,
	"qAlert": exports.QUALITY_ALERT,
    }
    res.send(JSON.stringify(settings));
};

function handleResult(err, res) {
    if (err) console.log('send error: ' + err.toString());
    if (res) console.log('send status: ' + res.constructor.name);
}

function receiveFeedback(err, receiver) {
    receiver.on('message', function (msg) {
	jsonMsg = msg.getData().toString('utf-8');
	msgObj = JSON.parse(jsonMsg);;
	console.log('Feedback message:')
	console.log(jsonMsg);
	if (msgObj[0].statusCode !== 'Expired') {
	    sendFailed = false;
	    console.log("feedback received, closing connection...");
	    serviceClient.close(function() {
		console.log("feedback: connection closed");
	    });
	}
    });
}

function endConnection(res, cmd) {
    console.log("timeout: closing connection");
    if (sendFailed) {
	status = 503;
	console.log("timeout close");
	serviceClient.close(function() {
	    console.log("timeout: connection closed");
	});
    } else {
	exports.TEMP_ALERT = cmd.T_ALERT || exports.TEMP_ALERT;
	exports.LEVEL_ALERT = cmd.L_ALERT || exports.LEVEL_ALERT;
	exports.QUALITY_ALERT = cmd.Q_ALERT || exports.QUALITY_ALERT;
	console.log("VARS: ", exports.TEMP_ALERT, exports.LEVEL_ALERT, exports.QUALITY_ALERT);
	status = 200;
    }
    res.sendStatus(status);
}
