process.env["AZURE_STORAGE_CONNECTION_STRING"] = "DefaultEndpointsProtocol=https;AccountName=pidatastore;AccountKey=ciBY6+oAjg5Z1CdS7yUunvpoVJBCSCAZdhzNWV9cnXwGxryOmhomnPdCgpuDC1gDd3z39rXpFWrJrYPTMzQXOw==;EndpointSuffix=core.windows.net";

var azure = require('azure-storage');

storage = azure.createTableService();
var entGen = azure.TableUtilities.entityGenerator;
console.log("Service created");


var minBehind = 60 * 60 * 1;
var msBehind = minBehind * 60 * 1000;

console.log("MS going back: ", msBehind);

var oldestDate = new Date(Date.now() - msBehind);
console.log(oldestDate);


var query = new azure.TableQuery()
    .top(1000)
    .where('eventenqueuedutctime ge ?date?', oldestDate);

storage.queryEntities('TemperatureRecords', query, null, (err, result, response) => {
    console.error("ERROR: ", err);
    console.log("RESULT: ", result.entries.length);
    if (result && result.entries.length > 2) {
	console.log("time0: ", new Date(result.entries[0].eventenqueuedutctime));
	console.log("time1: ", result.entries[1].eventenqueuedutctime);
    }
});

function reduceArrayTo(arr, num) {
    num = num || 200;
    if (arr.length < num)
	return arr;
    var n = arr.length / num; // the nth index to remove
}
