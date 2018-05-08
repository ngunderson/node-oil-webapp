const Client = require('azure-iothub').Client;
const Message = require('azure-iot-common').Message;
const NoRetry = require('azure-iot-common').NoRetry;

// Alerts
var TEMP_ALERT = 60;
var LEVEL_ALERT = .8;
var QUALITY_ALERT = 8;
var TARGET_DEVICE = 'pi';

// sending cloud to device messages
var serviceClient = Client.fromConnectionString(process.env['Azure.IoT.IoTHub.ConnectionString']);
serviceClient.setRetryPolicy(new NoRetry());
var connOpen = false;

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

    if (cmd.T_ALERT == TEMP_ALERT)
	delete cmd.T_ALERT;
    if (cmd.L_ALERT == LEVEL_ALERT)
	delete cmd.L_ALERT;
    if (cmd.Q_ALERT == QUALITY_ALERT)
	delete cmd.Q_ALERT;

    if (req.body.CMD == "START" || req.body.CMD == "STOP") {
	cmd.CMD = req.body.CMD;
    }

    if (Object.keys(cmd).length == 0) {
	console.log("settings have not changed, returning")
	res.sendStatus(200);
	return;
    }

    serviceClient.open(function (err) {
	if (err) {
	    console.error('Could not connect: ' + err.message);
	    res.sendStatus(500);
	} else {
	    setTimeout(function() {
		endConnection(res, cmd);
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
};

exports.getSettings = (req, res) => {
    var settings = {
	"tAlert": TEMP_ALERT,
	"lAlert": LEVEL_ALERT,
	"qAlert": QUALITY_ALERT,
    }
    res.send(JSON.stringify(settings));
};

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