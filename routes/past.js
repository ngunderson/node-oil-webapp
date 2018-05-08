const moment = require('moment-timezone');
const azure = require('azure-storage');

const storage = azure.createTableService();

exports.temp = (req, res) => {
    console.log('PARAMS: ', req.query)
    var day = Number(req.query.day);
    var device = String(req.query.device);

    if (isNaN(day) || typeof(device) !== 'string') {
        res.sendStatus(400);
        return;
    }
    var oldestDate = moment().subtract(day, 'days').toDate();;
    console.log('date: ', oldestDate);
    var query = new azure.TableQuery()
        .select('eventenqueuedutctime', 'avgtemp')
        .top(1000)
        .where('eventenqueuedutctime ge ?date?'
               + 'and deviceid eq ?string?', oldestDate, device);

    retrieveData('TemperatureRecords', query, null).then((data) => {
        console.log('Data retrieve finished');
        console.log('DATA LEN: ', data.length);
        console.log('first data:  ', data[0]);
        var minData = formatData(data, 'avgtemp');
        res.send(JSON.stringify(minData));
    }).catch((err) => {
        console.log('QUERY ERR: ', err);
        res.sendStatus(500);
    });
};

exports.level = (req, res) => {
    console.log('PARAMS: ', req.query)
    var day = Number(req.query.day);
    var device = String(req.query.device);

    if (isNaN(day) || typeof(device) !== 'string') {
        res.sendStatus(400);
        return;
    }
    var oldestDate = moment().subtract(day, 'days').toDate();;
    console.log('date: ', oldestDate);
    var query = new azure.TableQuery()
        .select('eventenqueuedutctime', 'level')
        .top(1000)
        .where('eventenqueuedutctime ge ?date?'
               + 'and deviceid eq ?string?', oldestDate, device);

    retrieveData('LevelRecords', query, null).then((data) => {
        console.log('Data retrieve finished', data[1500]);
        console.log('DATA LEN: ', data.length);
        minData = formatData(data, 'level');
        res.send(JSON.stringify(minData));
    }).catch((err) => {
        console.log('QUERY ERR: ', err);
        res.sendStatus(500);
    });
};

exports.quality = (req, res) => {
    console.log('PARAMS: ', req.query)
    var day = Number(req.query.day);
    var device = String(req.query.device);

    if (isNaN(day) || typeof(device) !== 'string') {
        res.sendStatus(400);
        return;
    }
    var oldestDate = moment().subtract(day, 'days').toDate();;
    console.log('date: ', oldestDate);
    var query = new azure.TableQuery()
        .select('eventenqueuedutctime', 'quality')
        .top(1000)
        .where('eventenqueuedutctime ge ?date?'
               + 'and deviceid eq ?string?', oldestDate, device);

    retrieveData('QualityRecords', query, null).then((data) => {
        console.log('Data retrieve finished');
        console.log('DATA LEN: ', data.length);
        minData = formatData(data, 'quality');
        res.send(JSON.stringify(minData));
    }).catch((err) => {
        console.log('QUERY ERR: ', err);
        res.sendStatus(500);
    });
};

function retrieveData(table, query, nextToken) {
    var data = [];
    console.log('retrieving data');
    return new Promise((resolve, reject) => {
        storage.queryEntities(table, query, nextToken, (error, result, response) => {
            if(error) {
                console.log('rejecting with error', error);
                reject(error);
                return;
            }
            data = data.concat(result.entries);
            if (result.continuationToken == null) {
                console.log('token null, resolving data');
                resolve(data);
                return;
            }
            console.log('data added: ', data.length);
            console.log('token: ', result.continuationToken);
            appendData(table, data, query, result.continuationToken, resolve, reject);
        });

    });
}

function appendData(table, data, query, nextToken, resolve, reject) {
    console.log('appending data');
    storage.queryEntities(table, query, nextToken, (error, result, response) => {
        if(error) {
            console.log('rejecting with error', error);
            reject(error);
            return;
        }
        data = data.concat(result.entries);
        if (result.continuationToken == null) {
            console.log('token null, resolving data');
            resolve(data);
            return;
        }
        console.log('data added: ', data.length);
        console.log('token: ', result.continuationToken);
        appendData(table, data, query, result.continuationToken, resolve, reject);
    });
}

function formatData(data, key) {
    xData = [];
    yData = [];
    data.forEach((entry, idx) => {
        if (entry[key]._ === null) {
            console.log(idx);
            console.log('NULL FOUND!!');
            console.log('DATA: ', entry);
            return;
        }

        xData.push(
            moment(entry.eventenqueuedutctime._)
                .tz('America/Chicago')
                .format('YYYY-MM-DD HH:mm:ss')
        );
        yData.push(+Number(entry[key]._).toFixed(2));
    });
    return {
        x: xData,
        y: yData
    }
}
