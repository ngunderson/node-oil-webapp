
function validInput(value)
{
    if(value != "" && !isNaN(value))
	if(value >= 0)
	    return true;
    return false;
}

function isEmpty(obj)
{
    for(var key in obj)
	return false;
    return true;
}


function sendChanges()
{
    // Triggers
    var tempAlert = document.getElementById("tempAlert").value;
    var levelAlert = document.getElementById("levelAlert").value;
    var qualityAlert = document.getElementById("qualityAlert").value;
    var cmd = document.getElementById("cmd").value;

    var warnObj = {};

    if(validInput(tempAlert))
	warnObj.T_ALERT = tempAlert;
    if(validInput(levelAlert))
	warnObj.L_ALERT = levelAlert;
    if(validInput(qualityAlert))
	warnObj.Q_ALERT = qualityAlert;

    if(cmd === "STOP" || cmd === "START")
	warnObj.CMD = cmd;

    if(Object.keys(warnObj).length != 0) {
	console.log("sending: ", warnObj);
	$.ajax("/settings", {
	    data: warnObj,
	    type: "POST",
	    error: (err, txtStatus, xhr) => {
		alert("Sending message to device FAILED!")
		getCurrentSettings();
	    },
	    success: (data, txtStatus, xhr) => {
		if (xhr.status === 204) {
		    alert("No changes detected, updates not sent!");
		} else {
		    alert("Message SENT to device!");
		}
		getCurrentSettings();
	    }
	});
	document.getElementById("cmd").value = "";
    }
}

function changeRate()
{
    //Collection Rate
    var collectionRate = document.getElementById("collectionRate").value;

    if(validInput(collectionRate) && Number(collectionRate) >= 5) {
	console.log("collection rate updated");
	localStorage.setItem("collectionRate", collectionRate);
    }
}

function getCurrentSettings()
{
    $.getJSON("/prevSettings", (settings) => {
	document.getElementById("tempAlert").value = settings.tAlert;
	document.getElementById("levelAlert").value = settings.lAlert;
	document.getElementById("qualityAlert").value = settings.qAlert;
    });

    document.getElementById("collectionRate").value = localStorage.getItem("collectionRate");
    if (localStorage.getItem("units") === "IMP") {
	$("#radIMP").prop("checked", true);
    }
}

$('input[type=radio][name=units]').change(function() {
    if (this.value == 'IMP') {
	localStorage.setItem("units", "IMP");
    } else {
	localStorage.removeItem("units");
    }
});

getCurrentSettings();
