const FCM = require('fcm-node');
const serverKey = 'AAAAjiEIU4Y:APA91bG4TfGDfxXpT6_EjBwHAU6z1Cz_mn5mvflcJlAgDgFmhLtP48IGv9ZT5P8M10dLaKUto0mH5G9mWdO4QzLf0IN-pgIWBVCKLj9zaqbv9cam4S-1VBpN5UzUZQoapHVUmvPrf1P4';
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