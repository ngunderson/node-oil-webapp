
function validInput(value)
{
    if(value != "" && !isNaN(value))
	if(value > 0)
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

    if(validInput(collectionRate)) {
	localStorage.setItem("collectionRate", collectionRate);
    }

    //& Triggers
    var tempAlert = document.getElementById("tempAlert").value;
    var levelAlert = document.getElementById("levelAlert").value;
    var qualityAlert = document.getElementById("qualityAlert").value;

    var warnObj = {};

    if(validInput(tempAlert))
	warnObj.T_ALERT = tempAlert;
    if(validInput(levelAlert))
	warnObj.L_ALERT = levelAlert;
    if(validInput(qualityAlert))
	warnObj.Q_ALERT = qualityAlert

    if(Object.keys(warnObj).length != 0) {
	console.log("sending: ", warnObj);
	$.post("/settings", warnObj);
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

}

getCurrentSettings();
