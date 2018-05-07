
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
    var tempRate = document.getElementById("tempRate").value;
    var levelRate = document.getElementById("levelRate").value;
    var qualityRate = document.getElementById("qualityRate").value;
    //& Triggers
    var tempAlert = document.getElementById("tempAlert").value;
    var levelAlert = document.getElementById("levelAlert").value;
    var qualityAlert = document.getElementById("qualityAlert").value;

    var obj = new Object();
    if(validInput(tempRate))
	obj.tempRate = tempRate;
    if(validInput(levelRate))
	obj.levelRate = levelRate;
    if(validInput(qualityAlert))
	obj.qualityRate = qualityRate;

    if(validInput(tempAlert))
	obj.T_ALERT = tempAlert;
    if(validInput(levelAlert))
	obj.L_ALERT = levelAlert;
    if(validInput(qualityAlert))
	obj.Q_ALERT = qualityAlert

    if(!isEmpty(obj))
    {
	console.log("sending: ", obj);
	$.post("/settings", obj);
    }
}
