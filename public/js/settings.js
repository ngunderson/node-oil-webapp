
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


function checkInputs()
{
    var SI = document.getElementById("radSI");
    var IMP = document.getElementById("radIMP");
    var units;
    //Getting Units
    if(SI.checked)
	units = SI.value;
    else
	units = IMP.value;
    //Collection Rate
    var collectionRate = document.getElementById("collectionRate").value;

    if(validInput(collectionRate) && Number(collectionRate) >= 5) {
	console.log("collection rate updated");
	localStorage.setItem("collectionRate", collectionRate);
    }

    //& Triggers
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
	    error: (err) => {
		alert("Message NOT SENT to device!")
		getCurrentSettings();
	    },
	    success: (data) => {
		alert("Message SENT to device!");
		console.log("Settings update");
		getCurrentSettings();
	    }
	});
	document.getElementById("cmd").value = "";
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
