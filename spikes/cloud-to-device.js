var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;
var NoRetry = require('azure-iot-common').NoRetry;

var connectionString = '';
var targetDevice = 'pi';

var serviceClient = Client.fromConnectionString(connectionString);
serviceClient.setRetryPolicy(new NoRetry());
var connOpen = false;

function handleResult(err, res) {
    setTimeout(endConnection, 1000)
    if (err) console.log('send error: ' + err.toString());
    if (res) console.log('send status: ' + res.constructor.name);
}

function receiveFeedback(err, receiver, res) {
    receiver.on('message', function (msg) {
	console.log('Feedback message:')
	console.log(msg.getData().toString('utf-8'));
	connOpen = false;
	console.log("feedback received, closing connection...");
	//res.sendStatus(200);
	serviceClient.close(function() {
	    console.log("connection closed");
	});
    });
}

serviceClient.open(function (err) {
    if (err) {
	console.error('Could not connect: ' + err.message);
    } else {
	connOpen = true;
	console.log('Service client connected');
	serviceClient.getFeedbackReceiver(receiveFeedback);
	// CMD is start/stop
	// T_ALERT is int
	// L_ALERT is int
	var cmd = "START";
	var tAlert = 50;
	var lAlert = 50;
	var cmd = {
	    "CMD": cmd,
	    "T_ALERT": tAlert,
	    "L_ALERT": lAlert,
	};
	var message = new Message(JSON.stringify(cmd));
	message.ack = 'full';
	message.messageId = "My Message ID";
	console.log('Sending message: ' + message.getData());
	serviceClient.send(targetDevice, message, handleResult);
    }
});

function endConnection(res) {
    console.log("closing connection");
    if (connOpen) {
	console.log("timeout close");
	//res.sendStatus(200);
	serviceClient.close();
    }
}
