const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const past = require('./routes/past');
const realtime = require('./routes/real-time');
const settings = require('./routes/settings');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App settings
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

// HTML endpoints
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/settings.html'));
});

app.get('/historic', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/historic.html'));
});

// API endpoints

/* Real time data endpoints */
app.get('/latestData', realtime.latestData);

/* Historical data endpoints */
app.get('/past/temp', past.temp);

app.get('/past/level', past.level);

app.get('/past/quality', past.quality);

/* Settings endpoints */
app.post('/settings', settings.setSettings);

app.get('/prevSettings', settings.getSettings);

// Init app
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
