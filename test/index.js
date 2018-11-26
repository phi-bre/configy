
// Main test file
import express from "express";
const app = express();

// Setup
import vaultlet from "../";
const options = {
    defaults: ['./conf.default.js'],
    directory: __dirname
}
vaultlet(options);

/*
app.use('/vaultlet', );

// Start app
const port = 3000;
app.listen(port, () => {
    console.log('Server listening on: ' + port);
});
*/