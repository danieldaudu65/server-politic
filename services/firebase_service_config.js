const {initializeApp, cert} = require('firebase-admin/app');
const {storage} = require("firebase-admin");
const serviceAccount = require('../secure_keys/serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount),
    storageBucket: "labourmarket-76e51.appspot.com"
});

const bucket = storage().bucket();

module.exports = {bucket};