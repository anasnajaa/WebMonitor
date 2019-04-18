const Monitor = require('ping-monitor');
const isOnline = require('is-online');
const fs = require('fs');
const Moment = require('moment');
const FCM = require('fcm-node');

const endpointsList = require('./endPoints.json');
const fcmTokensList = require('./fcm-tokens.json');
const serverKey = '';
const fcmServer = new FCM(serverKey);

const consoleColorsObject = {
    Reset: "\x1b[0m",
    Red: "\x1b[31m",
    Green: "\x1b[32m",
    Yellow: "\x1b[33m",
    Blue: "\x1b[34m",
    Magenta: "\x1b[35m"
};

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

const logTimeStamp = () => {
    return Moment().format("YY/MM/DD/HH:mm:ss");
};

const appendLog = (color, message) => {
    const timeStamp = logTimeStamp();
    console.log(color, `${timeStamp} | ${message}`);
    // fs.appendFile('log.txt', `${timeStamp} | ${message}\n`, function (err) {
    //   if (err) { 
          
    //   }
    // });
};

const notify = (title, body) => {
    fcmTokensList.forEach(token => {
        const message = { 
            to: token, 
            notification: {
                title: title, 
                body: body,
                sound: 'default'
            }
        };
        
        fcmServer.send(message, function(err, response){
            if (err) {
                appendLog(consoleColorsObject.Reset, `Notification failed for token: ${token}`);
            } else {
                appendLog(consoleColorsObject.Reset, `Notification success for token: ${token}`);
            }
        });
    });
};

async function startMonitoringOnInternetConnection() {
    endpointsList.forEach(endpoint => {
        endpoint.restartPending = false;
    });
    let internetUp = false;
    while (internetUp === false) {
        internetUp = await isOnline();
        if(internetUp === false){
            const message = `No internet connection, retrying in 2 seconds..`;
            appendLog(consoleColorsObject.Red, message);
            await sleep(2000);
        } else {
            const message = `Internet up, restarting monitors`;
            appendLog(consoleColorsObject.Yellow, message);
            await sleep(2000);
            endpointsList.forEach(endpoint => {
                monitor(endpoint);
            });
        }
    };
};

const monitor =  (endpoint) => {
    const options = {};
    options.interval = endpoint.interval;

    if(endpoint.type === "website"){
        options.website = endpoint.address;
    } else if(endpoint.type === "server"){
        options.address = endpoint.address;
        options.port = endpoint.port;
    }

    const tempMonitor = new Monitor(options);
     
    tempMonitor.on('up', function (res, state) {
        endpoint.lastUpTime = Moment();
        const message = `${endpoint.type} | ${endpoint.friendlyName} | ${res.statusMessage}`;
        appendLog(consoleColorsObject.Green, message);

        if(endpoint.wasDown){
            endpoint.wasDown = false;
            notify(endpoint.friendlyName, message);
        }
    });
     
    tempMonitor.on('down', function (res) {
        endpoint.wasDown = true;
        endpoint.lastDownTime = Moment();
        const message = `${endpoint.type} | ${endpoint.friendlyName} | down: ${res.statusMessage}`;
        appendLog(consoleColorsObject.Red, message);

        if(endpoint.lastDownNotify === null || Moment().diff(endpoint.lastDownNotify, 'minutes') > 5 ) {
            endpoint.lastDownNotify = endpoint.lastDownTime;
            notify(endpoint.friendlyName, message);
        }
    });
     
    tempMonitor.on('error', function (error) {
        if(error.code.indexOf('ENOBUFS') > -1 || 
        error.code.indexOf('ENOTFOUND') > -1){
            endpoint.restartPending = true;
            this.stop();
        } else {
            endpoint.wasDown = true;
            endpoint.lastDownTime = Moment();
            const message = `${endpoint.type} | ${endpoint.friendlyName} | down, error: ${error.code}`;
            appendLog(consoleColorsObject.Magenta, message);

            if(endpoint.lastDownNotify === null || Moment().diff(endpoint.lastDownNotify, 'minutes') > 5 ) {
                endpoint.lastDownNotify = endpoint.lastDownTime;
                notify(endpoint.friendlyName, message);
            }
        }
    });

    tempMonitor.on('stop', function () {
        let restartAll = true;
        endpointsList.forEach(endpoint => {
            if(!endpoint.restartPending){
                restartAll = false;
            }
        });
        const message = `${endpoint.type} | ${endpoint.friendlyName} | monitor stopped`;
        appendLog(consoleColorsObject.Blue, message);

        if(restartAll){
            startMonitoringOnInternetConnection();
        }
    });
};

endpointsList.forEach(endpoint => {
    monitor(endpoint);
});