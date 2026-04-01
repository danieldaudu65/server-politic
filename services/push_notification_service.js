async function sendNotification(data, callback, apiKey) {
    let headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic " + apiKey,
    };

    let options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
    };

    const https = require('https');
    const req = https.request(options, res => {
        let body = '';

        res.on('data', chunk => {
            body += chunk;
        });

        res.on('end', () => {
            try {
                const parsed = JSON.parse(body);
                console.log(parsed);
                return callback(null, parsed);
            } catch (e) {
                console.error("JSON parsing error:", e, "Raw response:", body);
                return callback({ message: "Invalid JSON response from OneSignal", error: e.toString() });
            }
        });
    });

    req.on('error', e => {
        return callback({ message: e.toString() });
    });

    req.write(JSON.stringify(data));
    req.end();
}

module.exports = {sendNotification}