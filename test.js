const FCM = require('fcm-node');
const serverKey = '';
const fcmServer = new FCM(serverKey);

const message = { 
    to: "ekk4dfCcq4I:APA91bGSVy94bwMW1dzsN_yhTaj7feqrYaa7YnpKImn0s2_K2Onv7wrXe-L_ReGud6rDBlnVFOuED0tOIR7W62v-SkFuEjU67dhhOC5riFZXQFc-nn25TPGR6RNkJ6lFkdVRhfbGNWwu", 
    notification: {
        title: "test", 
        body: "body",
        sound: 'default'
    }
};

fcmServer.send(message, (err, response) => {
    if (err) {
        console.log("FCM notification failed.");
    } else {
        console.log("FCM notification sent.");
    }
});
